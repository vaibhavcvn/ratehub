import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { fail, paged, pagination } from '../utils/http.js';
import { storeSummary } from '../utils/serializers.js';
import { ratingSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticateToken, requireRole('USER', 'ADMIN'));
const parse = (schema, body) => { const result = schema.safeParse(body); if (!result.success) throw fail(result.error.issues[0]?.message ?? 'Invalid request', 422); return result.data; };
const average = (ratings) => ratings.length ? Number((ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1)) : null;
const cityFromAddress = (address) => address.includes(',') ? address.split(',').map((part) => part.trim()).at(-2) ?? address.trim() : address.trim();

router.get('/dashboard', asyncHandler(async (req, res) => {
  const profile = await prisma.user.findUnique({ where: { id: req.user.id }, select: { address: true } });
  const city = cityFromAddress(profile?.address ?? '');
  const [stores, ratings, favorites, recent, topRated, popular, recommended] = await Promise.all([
    prisma.store.count(),
    prisma.rating.findMany({ where: { userId: req.user.id }, include: { store: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.favorite.count({ where: { userId: req.user.id } }),
    prisma.rating.findMany({ where: { userId: req.user.id }, include: { store: { include: { ratings: true } } }, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.store.findMany({ include: { ratings: true }, orderBy: { ratings: { _count: 'desc' } }, take: 3 }),
    prisma.store.findMany({ include: { ratings: true }, orderBy: { ratings: { _count: 'desc' } }, take: 3 }),
    prisma.store.findMany({ where: { address: { contains: city, mode: 'insensitive' } }, include: { ratings: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
  ]);
  res.json({ success: true, data: { stores, city, rated: ratings.length, favorites, averageRating: average(ratings), recent, topRated: topRated.map((store) => storeSummary(store)), popular: popular.map((store) => storeSummary(store)), recommended: recommended.map((store) => storeSummary(store)) } });
}));

router.get('/stores', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query); const search = req.query.search?.trim(); const category = req.query.category?.trim(); const city = req.query.city?.trim(); const hasRated = req.query.hasRated;
  const where = { ...(category ? { category } : {}), ...(city ? { address: { contains: city, mode: 'insensitive' } } : {}), ...(hasRated === 'yes' ? { ratings: { some: { userId: req.user.id } } } : {}), ...(hasRated === 'no' ? { ratings: { none: { userId: req.user.id } } } : {}), ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }] } : {}) };
  const sort = req.query.sort; const order = req.query.order === 'desc' ? 'desc' : 'asc'; const orderBy = sort === 'rating' ? { ratings: { _count: order } } : sort === 'popular' ? { ratings: { _count: 'desc' } } : sort === 'newest' ? { createdAt: 'desc' } : { name: order };
  const [stores, total] = await Promise.all([prisma.store.findMany({ where, skip, take: limit, orderBy, include: { ratings: true, owner: true, favorites: { where: { userId: req.user.id } } } }), prisma.store.count({ where })]);
  const ids = stores.map((store) => store.id); const mine = await prisma.rating.findMany({ where: { userId: req.user.id, storeId: { in: ids } } }); const ratings = new Map(mine.map((rating) => [rating.storeId, rating.rating]));
  res.json({ success: true, data: paged(stores.map((store) => storeSummary({ ...store, myRating: ratings.get(store.id), isFavorite: store.favorites.length > 0 })), total, page, limit) });
}));

router.get('/stores/:id', asyncHandler(async (req, res) => {
  const storeId = Number(req.params.id); const store = await prisma.store.findUnique({ where: { id: storeId }, include: { ratings: { include: { user: { select: { name: true } } }, orderBy: { updatedAt: 'desc' } }, owner: true, favorites: { where: { userId: req.user.id } } } }); if (!store) throw fail('Store not found', 404);
  const mine = store.ratings.find((rating) => rating.userId === req.user.id); const distribution = [5, 4, 3, 2, 1].map((value) => ({ rating: value, count: store.ratings.filter((item) => item.rating === value).length }));
  res.json({ success: true, data: { ...storeSummary({ ...store, myRating: mine?.rating, isFavorite: store.favorites.length > 0 }), distribution, reviews: store.ratings.map(({ id, rating, comment, createdAt, user }) => ({ id, rating, comment, createdAt, user })) } });
}));

router.get('/ratings', asyncHandler(async (req, res) => { const ratings = await prisma.rating.findMany({ where: { userId: req.user.id, ...(req.query.rating ? { rating: Number(req.query.rating) } : {}) }, include: { store: true }, orderBy: { updatedAt: req.query.order === 'asc' ? 'asc' : 'desc' } }); res.json({ success: true, data: ratings }); }));
router.post('/ratings', asyncHandler(async (req, res) => { const data = parse(ratingSchema, req.body); if (!await prisma.store.findUnique({ where: { id: data.storeId } })) throw fail('Store not found', 404); const rating = await prisma.rating.create({ data: { ...data, userId: req.user.id } }); res.status(201).json({ success: true, message: 'Rating submitted successfully', data: rating }); }));
router.put('/ratings/:id', asyncHandler(async (req, res) => { const data = parse(ratingSchema.omit({ storeId: true }), req.body); const current = await prisma.rating.findUnique({ where: { id: Number(req.params.id) } }); if (!current || current.userId !== req.user.id) throw fail('Rating not found', 404); const rating = await prisma.rating.update({ where: { id: current.id }, data }); res.json({ success: true, message: 'Rating updated successfully', data: rating }); }));
router.delete('/ratings/:id', asyncHandler(async (req, res) => { const current = await prisma.rating.findUnique({ where: { id: Number(req.params.id) } }); if (!current || current.userId !== req.user.id) throw fail('Rating not found', 404); await prisma.rating.delete({ where: { id: current.id } }); res.json({ success: true, message: 'Rating deleted successfully' }); }));
router.get('/favorites', asyncHandler(async (req, res) => { const favorites = await prisma.favorite.findMany({ where: { userId: req.user.id }, include: { store: { include: { ratings: true } } }, orderBy: { createdAt: 'desc' } }); res.json({ success: true, data: favorites.map((item) => storeSummary({ ...item.store, isFavorite: true })) }); }));
router.post('/favorites/:storeId', asyncHandler(async (req, res) => { const storeId = Number(req.params.storeId); if (!await prisma.store.findUnique({ where: { id: storeId } })) throw fail('Store not found', 404); await prisma.favorite.upsert({ where: { userId_storeId: { userId: req.user.id, storeId } }, update: {}, create: { userId: req.user.id, storeId } }); res.status(201).json({ success: true, message: 'Store saved to favorites' }); }));
router.delete('/favorites/:storeId', asyncHandler(async (req, res) => { await prisma.favorite.deleteMany({ where: { userId: req.user.id, storeId: Number(req.params.storeId) } }); res.json({ success: true, message: 'Store removed from favorites' }); }));

export default router;
