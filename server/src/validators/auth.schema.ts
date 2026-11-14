import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Niepoprawny format adresu e-mail'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  name: z.string().min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki'),
  phone: z.string().optional(),
  companyName: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Niepoprawny format adresu e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
