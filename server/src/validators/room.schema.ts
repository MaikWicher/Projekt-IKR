import { z } from 'zod';

export const createRoomSchema = z.object({
  id: z.string().min(2, 'Identyfikator sali jest wymagany'),
  name: z.string().min(2, 'Nazwa sali jest wymagana'),
  category: z.enum(['conference', 'meeting', 'studio', 'desk', 'workshop']),
  categoryLabel: z.string().min(2),
  capacity: z.number().int().positive('Pojemność musi być większa od zera'),
  hourlyRate: z.number().positive('Stawka godzinowa musi być większa od zera'),
  color: z.string().min(3),
  bgColor: z.string().min(3),
  borderColor: z.string().min(3),
  equipment: z.array(z.string()).default([]),
  description: z.string().min(5),
  floor: z.string().min(2),
  imageUrl: z.string().optional()
});

export const updateRoomSchema = createRoomSchema.partial().omit({ id: true });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
