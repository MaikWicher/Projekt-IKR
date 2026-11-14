import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  bookingQuerySchema
} from '../validators/booking.schema.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', validateQuery(bookingQuerySchema), BookingsController.getAll);
router.get('/:id', BookingsController.getById);
router.get('/:id/ical', BookingsController.exportIcal);

router.post('/', authenticateToken, validateBody(createBookingSchema), BookingsController.create);
router.post('/send-reminders', authenticateToken, BookingsController.sendBatchReminders);
router.post('/:id/reminder', authenticateToken, BookingsController.sendReminder);
router.patch('/:id/status', authenticateToken, validateBody(updateBookingStatusSchema), BookingsController.updateStatus);
router.put('/:id', authenticateToken, validateBody(updateBookingSchema), BookingsController.update);
router.delete('/:id', authenticateToken, requireAdmin, BookingsController.delete);

export default router;
