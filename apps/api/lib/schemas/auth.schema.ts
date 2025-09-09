import z from "zod";

export const EmailSchema = z.email();
export const PasswordSchema = z.string().min(12);

export const API_KEY_LENGTH = 32;
export const ApiKeySchema = z.string().length(API_KEY_LENGTH * 2);
