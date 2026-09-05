import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { fail } from '../utils/http.js';
import { profileSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticateToken);
router.get('/', asyncHandler(async (req, res) => { const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, address: true, role: true, createdAt: true } }); if (!user) throw fail('User not found', 404); res.json({ success: true, data: user }); }));
router.put('/', asyncHandler(async (req, res) => { const result = profileSchema.safeParse(req.body); if (!result.success) throw fail(result.error.issues[0]?.message ?? 'Invalid profile details', 422); const user = await prisma.user.update({ where: { id: req.user.id }, data: result.data, select: { id: true, name: true, email: true, address: true, role: true } }); res.json({ success: true, message: 'Profile updated successfully', data: user }); }));
export default router;
