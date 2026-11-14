import { z } from 'zod';

export const createBookingSchema = z
  .object({
    title: z.string().min(3, 'Tytuł spotkania musi mieć co najmniej 3 znaki'),
    roomId: z.string().min(1, 'Identyfikator sali jest wymagany'),
    customerName: z.string().min(2, 'Imię i nazwisko rezerwującego jest wymagane'),
    customerEmail: z.string().email('Niepoprawny format adresu e-mail'),
    customerPhone: z.string().min(6, 'Numer telefonu musi mieć co najmniej 6 znaków'),
    companyName: z.string().optional(),
    start: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Niepoprawny format daty początkowej (oczekiwano ISO)'
    }),
    end: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Niepoprawny format daty końcowej (oczekiwano ISO)'
    }),
    attendeesCount: z.number().int().positive('Liczba uczestników musi być większa od zera').default(1),
    notes: z.string().optional(),
    adminNotes: z.string().optional(),
    selectedEquipment: z.array(z.string()).default([]),
    paymentMethod: z.string().optional(),
    paymentStatus: z.string().optional(),
    transactionId: z.string().optional()
  })
  .refine(data => new Date(data.end) > new Date(data.start), {
    message: 'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia',
    path: ['end']
  });

export const updateBookingSchema = z
  .object({
    title: z.string().min(3).optional(),
    roomId: z.string().min(1).optional(),
    customerName: z.string().min(2).optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().min(6).optional(),
    companyName: z.string().optional(),
    start: z.string().refine(val => !isNaN(Date.parse(val))).optional(),
    end: z.string().refine(val => !isNaN(Date.parse(val))).optional(),
    attendeesCount: z.number().int().positive().optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
    notes: z.string().optional(),
    adminNotes: z.string().optional(),
    selectedEquipment: z.array(z.string()).optional()
  })
  .refine(
    data => {
      if (data.start && data.end) {
        return new Date(data.end) > new Date(data.start);
      }
      return true;
    },
    {
      message: 'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia',
      path: ['end']
    }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Dozwolone statusy to CONFIRMED lub CANCELLED' })
  })
});

export const bookingQuerySchema = z.object({
  roomId: z.string().optional(),
  status: z.enum(['all', 'CONFIRMED', 'CANCELLED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional()
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
