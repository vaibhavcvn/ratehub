import bcrypt from 'bcrypt';
import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { fail, paged, pagination } from '../utils/http.js';
import { publicUser, storeSummary } from '../utils/serializers.js';
import { storeSchema, userSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticateToken, requireRole('ADMIN'));
const parse = (schema, body) => { const result = schema.safeParse(body); if (!result.success) throw fail(result.error.issues[0]?.message ?? 'Invalid request', 422); return result.data; };

router.get('/dashboard', asyncHandler(async (_req, res) => {
  const [users, stores, ratings, owners, recentUsers, recentStores, recentRatings, average] = await Promise.all([
    prisma.user.count(), prisma.store.count(), prisma.rating.count(), prisma.user.count({ where: { role: 'OWNER' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.store.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { ratings: true, owner: true } }),
    prisma.rating.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { name: true } }, store: { select: { name: true } } } }),
    prisma.rating.aggregate({ _avg: { rating: true } }),
  ]);
  res.json({ success: true, data: { stats: { users, stores, ratings, owners, averageRating: average._avg.rating ? Number(average._avg.rating.toFixed(1)) : null }, recentUsers, recentStores: recentStores.map(storeSummary), recentRatings } });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query); const search = req.query.search?.trim(); const role = req.query.role;
  const where = { ...(role ? { role } : {}), ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }] } : {}) };
  const sort = ['name', 'email', 'address', 'role', 'createdAt'].includes(req.query.sort) ? req.query.sort : 'createdAt'; const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const [users, total] = await Promise.all([prisma.user.findMany({ where, skip, take: limit, orderBy: { [sort]: order }, include: { ownedStores: true } }), prisma.user.count({ where })]);
  res.json({ success: true, data: paged(users.map(publicUser), total, page, limit) });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const data = parse(userSchema, req.body); const exists = await prisma.user.findUnique({ where: { email: data.email } }); if (exists) throw fail('Email is already in use', 409);
  const user = await prisma.user.create({ data: { ...data, password: await bcrypt.hash(data.password, 12) } });
  res.status(201).json({ success: true, message: 'User created successfully', data: publicUser(user) });
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, include: { ownedStores: { include: { ratings: true } } } });
  if (!user) throw fail('User not found', 404);
  res.json({ success: true, data: publicUser(user) });
}));

router.get('/stores', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query); const search = req.query.search?.trim();
  const minRating = Number(req.query.minRating);
  const where = { ...(req.query.category ? { category: req.query.category } : {}), ...(req.query.ownerId ? { ownerId: Number(req.query.ownerId) } : {}), ...(Number.isInteger(minRating) && minRating >= 1 && minRating <= 5 ? { ratings: { some: { rating: { gte: minRating } } } } : {}), ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }] } : {}) };
  const sort = ['name', 'email', 'address', 'category', 'createdAt'].includes(req.query.sort) ? req.query.sort : 'createdAt'; const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const orderBy = req.query.sort === 'rating' ? { ratings: { _count: order } } : { [sort]: order };
  const [stores, total] = await Promise.all([prisma.store.findMany({ where, skip, take: limit, orderBy, include: { ratings: true, owner: true } }), prisma.store.count({ where })]);
  res.json({ success: true, data: paged(stores.map(storeSummary), total, page, limit) });
}));

router.get('/ratings', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const search = req.query.search?.trim();
  const where = search ? { OR: [{ comment: { contains: search, mode: 'insensitive' } }, { user: { name: { contains: search, mode: 'insensitive' } } }, { store: { name: { contains: search, mode: 'insensitive' } } }] } : {};
  const sort = ['rating', 'createdAt', 'updatedAt'].includes(req.query.sort) ? req.query.sort : 'createdAt';
  const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({ where, skip, take: limit, orderBy: { [sort]: order }, include: { user: { select: { name: true, email: true } }, store: { select: { id: true, name: true } } } }),
    prisma.rating.count({ where }),
  ]);
  res.json({ success: true, data: paged(ratings, total, page, limit) });
}));

router.post('/stores', asyncHandler(async (req, res) => {
  const data = parse(storeSchema, req.body); const store = await prisma.store.create({ data });
  res.status(201).json({ success: true, message: 'Store created successfully', data: storeSummary(store) });
}));

router.put('/stores/:id', asyncHandler(async (req, res) => { const data = parse(storeSchema, req.body); const store = await prisma.store.update({ where: { id: Number(req.params.id) }, data, include: { ratings: true, owner: true } }); res.json({ success: true, message: 'Store updated successfully', data: storeSummary(store) }); }));
router.delete('/stores/:id', asyncHandler(async (req, res) => { await prisma.store.delete({ where: { id: Number(req.params.id) } }); res.json({ success: true, message: 'Store deleted successfully' }); }));
router.put('/users/:id', asyncHandler(async (req, res) => { const data = parse(userSchema.omit({ password: true }).extend({ password: userSchema.shape.password.optional() }), req.body); const update = { name: data.name, email: data.email, address: data.address, role: data.role, ...(data.password ? { password: await bcrypt.hash(data.password, 12) } : {}) }; const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: update }); res.json({ success: true, message: 'User updated successfully', data: publicUser(user) }); }));
router.delete('/users/:id', asyncHandler(async (req, res) => { if (Number(req.params.id) === req.user.id) throw fail('You cannot delete your own admin account', 400); await prisma.user.delete({ where: { id: Number(req.params.id) } }); res.json({ success: true, message: 'User deleted successfully' }); }));

export default router;
