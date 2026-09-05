import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import ownerRoutes from './routes/owner.js';
import profileRoutes from './routes/profile.js';
import { errorHandler, notFound } from './middleware/error.js';

dotenv.config();

const app = express();

app.use(helmet());
const allowedOrigins = new Set([
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)) }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'RateHub API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
