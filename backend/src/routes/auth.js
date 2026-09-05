import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middleware/error.js';
import { authenticateToken } from '../middleware/auth.js';
import { fail } from '../utils/http.js';
import { publicUser } from '../utils/serializers.js';
import { loginSchema, passwordSchema, registerSchema } from '../validators/schemas.js';

const router = Router();

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) throw fail(result.error.issues[0]?.message ?? 'Invalid request', 422);
  return result.data;
}

router.post('/register', asyncHandler(async (req, res) => {
  const data = parse(registerSchema, req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw fail('An account with this email already exists', 409);
  if (data.accountType === 'ADMIN' && data.adminCode !== process.env.ADMIN_REGISTRATION_KEY) throw fail('Invalid administrator invite code', 403);
  if (data.accountType === 'OWNER' && await prisma.store.findUnique({ where: { email: data.storeEmail } })) throw fail('A store with this email already exists', 409);
  const user = await prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({ data: { name: data.name, email: data.email, address: data.address, password: await bcrypt.hash(data.password, 12), role: data.accountType } });
    if (data.accountType === 'OWNER') await transaction.store.create({ data: { name: data.storeName, email: data.storeEmail, address: data.storeAddress, category: data.storeCategory, description: data.storeDescription ?? 'A local store serving its community.', ownerId: createdUser.id } });
    return createdUser;
  });
  res.status(201).json({ success: true, message: 'Registration successful', data: { user: publicUser(user), token: tokenFor(user) } });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const data = parse(loginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.password))) throw fail('Invalid email or password', 401);
  res.json({ success: true, message: 'Login successful', data: { user: publicUser(user), token: tokenFor(user) } });
}));

router.post('/logout', (_req, res) => res.json({ success: true, message: 'Logged out successfully' }));

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { ownedStores: true } });
  if (!user) throw fail('User not found', 404);
  res.json({ success: true, data: publicUser(user) });
}));

router.put('/password', authenticateToken, asyncHandler(async (req, res) => {
  const data = parse(passwordSchema, req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !(await bcrypt.compare(data.currentPassword, user.password))) throw fail('Current password is incorrect', 400);
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(data.password, 12) } });
  res.json({ success: true, message: 'Password updated successfully' });
}));

export default router;
