import { z } from 'zod';

export const emailSchema = z.email('Please enter a valid email address');
export const passwordSchema = z.string().min(12, 'Password must be at least 12 characters');
export const fullNameSchema = z.string().min(1, 'Full name is required').trim();

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema
});

export const registerSchema = z.object({
	fullName: fullNameSchema,
	email: emailSchema,
	password: passwordSchema
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
