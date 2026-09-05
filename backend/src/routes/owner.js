import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { fail } from '../utils/http.js';

const router = Router();
router.use(authenticateToken, requireRole('OWNER'));

async function ownedStore(userId) {
  const store = await prisma.store.findFirst({ where: { ownerId: userId }, include: { ratings: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { updatedAt: 'desc' } } } });
  if (!store) throw fail('No store is assigned to this owner', 404);
  return store;
}

router.get('/store', asyncHandler(async (req, res) => {
  const store = await ownedStore(req.user.id);
  res.json({ success: true, data: { id: store.id, name: store.name, email: store.email, address: store.address, category: store.category, description: store.description } });
}));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const store = await ownedStore(req.user.id); const total = store.ratings.length; const average = total ? store.ratings.reduce((sum, item) => sum + item.rating, 0) / total : null;
  const uniqueUsers = new Set(store.ratings.map((item) => item.userId)).size;
  const distribution = [5, 4, 3, 2, 1].map((value) => ({ rating: value, count: store.ratings.filter((item) => item.rating === value).length }));
  res.json({ success: true, data: { store: { id: store.id, name: store.name, address: store.address, category: store.category }, stats: { averageRating: average === null ? null : Number(average.toFixed(1)), totalRatings: total, uniqueUsers }, distribution, ratings: store.ratings } });
}));

router.get('/ratings', asyncHandler(async (req, res) => { const store = await ownedStore(req.user.id); res.json({ success: true, data: store.ratings }); }));

export default router;
