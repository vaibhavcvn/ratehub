import { z } from 'zod';

const password = z.string().min(8).max(16).regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
const email = z.string().email('Please enter a valid email address.');
const name = z.string().trim().max(60, 'Name must be 60 characters or fewer.');

export const registerSchema = z.object({
	name,
	email,
	address: z.string().trim().min(1, 'City is required.').max(80, 'City must be 80 characters or fewer.').regex(/^[A-Za-z][A-Za-z .'-]*$/, 'City must contain letters and spaces only.'),
	password,
	confirmPassword: password,
	accountType: z.enum(['USER', 'OWNER', 'ADMIN']).default('USER'),
	adminCode: z.string().optional(),
	storeName: z.string().min(2).max(120).optional().or(z.literal('')),
	storeEmail: email.optional().or(z.literal('')),
	storeAddress: z.string().max(400).optional().or(z.literal('')),
	storeCategory: z.string().min(2).max(60).optional().or(z.literal('')),
	storeDescription: z.string().max(1000).optional().or(z.literal('')),
}).superRefine((data, context) => {
	if (data.accountType === 'ADMIN' && !data.adminCode) context.addIssue({ code: 'custom', path: ['adminCode'], message: 'Administrator invite code is required.' });
	if (data.accountType === 'OWNER') {
		for (const [key, label] of [['storeName', 'Store name'], ['storeEmail', 'Store email'], ['storeAddress', 'Store address'], ['storeCategory', 'Store category']]) {
			if (!data[key]) context.addIssue({ code: 'custom', path: [key], message: `${label} is required for shopkeeper registration.` });
		}
	}
	if (data.password !== data.confirmPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
});
export const loginSchema = z.object({ email, password: z.string().min(1) });
export const passwordSchema = z.object({ currentPassword: z.string().min(1), password, confirmPassword: password }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export const userSchema = z.object({ name, email, address: z.string().max(400), password, role: z.enum(['ADMIN', 'USER', 'OWNER']) });
export const storeSchema = z.object({ name: z.string().min(2).max(120), email, address: z.string().max(400), category: z.string().min(2).max(60), description: z.string().max(1000), ownerId: z.coerce.number().int().positive().nullable().optional() });
export const ratingSchema = z.object({ storeId: z.coerce.number().int().positive(), rating: z.coerce.number().int().min(1).max(5), comment: z.string().max(500, 'Review must be 500 characters or fewer.').optional().or(z.literal('')) });
export const profileSchema = z.object({ name, address: z.string().max(400) });
