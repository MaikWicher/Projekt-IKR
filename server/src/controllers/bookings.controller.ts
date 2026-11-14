import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { CreateBookingInput, UpdateBookingInput } from '../validators/booking.schema.js';
import { EmailService } from '../services/email.service.js';
import { IcalService } from '../services/ical.service.js';
import { BookingStatus, Prisma } from '@prisma/client';
import { MOCK_BOOKINGS, MOCK_ROOMS, MockBooking } from '../data/mockData.js';
import { getLocalNow, parseLocalDate, formatBookingDates } from '../utils/date.js';

let inMemoryBookings: MockBooking[] = [...MOCK_BOOKINGS];

function checkBookingOwnership(
  booking: { userId?: string | null; customerEmail: string },
  user?: { id: string; email: string; role: string } | null
): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (booking.userId && booking.userId === user.id) return true;
  if (booking.customerEmail && user.email && booking.customerEmail.toLowerCase() === user.email.toLowerCase()) return true;
  return false;
}

export class BookingsController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { roomId, status, dateFrom, dateTo, search } = req.query;
    try {
      const where: Prisma.BookingWhereInput = {};

      if (roomId && roomId !== 'all') {
        where.roomId = String(roomId);
      }

      if (status && status !== 'all') {
        where.status = status as BookingStatus;
      }

      if (dateFrom || dateTo) {
        where.start = {};
        if (dateFrom) {
          where.start.gte = parseLocalDate(String(dateFrom));
        }
        if (dateTo) {
          where.start.lte = parseLocalDate(String(dateTo));
        }
      }

      if (search && String(search).trim() !== '') {
        const query = String(search).trim();
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { customerName: { contains: query, mode: 'insensitive' } },
          { customerEmail: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { companyName: { contains: query, mode: 'insensitive' } }
        ];
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          room: {
            select: {
              id: true,
              name: true,
              category: true,
              categoryLabel: true,
              color: true,
              bgColor: true,
              borderColor: true,
              floor: true
            }
          }
        },
        orderBy: { start: 'asc' }
      });

      const formattedBookings = bookings.map(formatBookingDates);

      res.json({
        success: true,
        count: formattedBookings.length,
        bookings: formattedBookings
      });
    } catch (error) {
      console.warn('⚠️ Database query failed for bookings, returning fallback mock bookings:', (error as Error).message);
      let list = inMemoryBookings.map(b => {
        const room = MOCK_ROOMS.find(r => r.id === b.roomId);
        return {
          ...b,
          room: room ? {
            id: room.id,
            name: room.name,
            category: room.category,
            categoryLabel: room.categoryLabel,
            color: room.color,
            bgColor: room.bgColor,
            borderColor: room.borderColor,
            floor: room.floor
          } : undefined
        };
      });

      if (roomId && roomId !== 'all') {
        list = list.filter(b => b.roomId === String(roomId));
      }
      if (status && status !== 'all') {
        list = list.filter(b => b.status === String(status).toUpperCase());
      }

      res.json({
        success: true,
        count: list.length,
        bookings: list.map(formatBookingDates)
      });
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findFirst({
        where: {
          OR: [{ id }, { code: id }]
        },
        include: { room: true }
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: `Rezerwacja o identyfikatorze '${id}' nie została znaleziona`
        });
        return;
      }

      res.json({
        success: true,
        booking: formatBookingDates(booking)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request<{}, {}, CreateBookingInput>, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Wymagane logowanie: Aby zarezerwować salę, musisz być zalogowany.'
      });
      return;
    }

    try {
      const data = req.body;
      const startDate = parseLocalDate(data.start);
      const endDate = parseLocalDate(data.end);

      const nowWarsawIso = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Warsaw' }).replace(' ', 'T');
      const startIso = typeof data.start === 'string' ? data.start.replace(/Z$/, '').slice(0, 19) : startDate.toISOString().replace(/Z$/, '').slice(0, 19);
      if (startIso < nowWarsawIso.slice(0, 16)) {
        res.status(400).json({
          success: false,
          message: 'Nie można rezerwować terminów z przeszłości'
        });
        return;
      }

      const room = await prisma.room.findUnique({
        where: { id: data.roomId }
      });

      if (!room) {
        res.status(404).json({
          success: false,
          message: `Sala '${data.roomId}' nie istnieje w systemie`
        });
        return;
      }

      if (data.attendeesCount > room.capacity) {
        res.status(400).json({
          success: false,
          message: `Liczba uczestników (${data.attendeesCount}) przekracza maksymalną pojemność sali '${room.name}' (${room.capacity} osób)`
        });
        return;
      }

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          roomId: data.roomId,
          status: BookingStatus.CONFIRMED,
          start: { lt: endDate },
          end: { gt: startDate }
        }
      });

      if (conflictingBooking) {
        const conflictStart = conflictingBooking.start.toISOString().slice(11, 16);
        const conflictEnd = conflictingBooking.end.toISOString().slice(11, 16);
        res.status(409).json({
          success: false,
          message: `Wybrany termin koliduje z inną rezerwacją (${conflictStart} - ${conflictEnd}, kod: ${conflictingBooking.code}). Wybierz inną godzinę.`
        });
        return;
      }

      const durationHours = Math.max(0.5, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const totalCost = Math.round(durationHours * room.hourlyRate);

      const randomCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

      const customerName = req.user.role !== 'ADMIN' && req.user.name ? req.user.name : data.customerName;
      const customerEmail = req.user.role !== 'ADMIN' && req.user.email ? req.user.email : data.customerEmail;

      const booking = await prisma.booking.create({
        data: {
          code: randomCode,
          title: data.title,
          roomId: data.roomId,
          userId: req.user.id,
          customerName,
          customerEmail,
          customerPhone: data.customerPhone,
          companyName: data.companyName,
          start: startDate,
          end: endDate,
          attendeesCount: data.attendeesCount,
          status: BookingStatus.CONFIRMED,
          notes: data.notes,
          adminNotes: data.adminNotes,
          selectedEquipment: data.selectedEquipment,
          totalCost,
          paymentMethod: data.paymentMethod || 'card',
          paymentStatus: data.paymentStatus || 'paid',
          transactionId: data.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          paidAt: new Date()
        },
        include: { room: true }
      });

      EmailService.sendBookingConfirmation(booking, {
        name: room.name,
        categoryLabel: room.categoryLabel,
        floor: room.floor
      });

      res.status(201).json({
        success: true,
        message: 'Rezerwacja została pomyślnie utworzona. Wysłano potwierdzenie na e-mail.',
        booking: formatBookingDates(booking)
      });
    } catch (error) {
      console.warn('⚠️ Database query failed for create, using inMemoryBookings fallback:', (error as Error).message);
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Wymagane logowanie' });
        return;
      }
      const data = req.body;
      const startDate = parseLocalDate(data.start);
      const endDate = parseLocalDate(data.end);
      const randomCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
      const durationHours = Math.max(0.5, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const room = MOCK_ROOMS.find(r => r.id === data.roomId);
      const totalCost = Math.round(durationHours * (room ? room.hourlyRate : 100));
      const newMock: MockBooking = {
        id: `book-${Date.now()}`,
        code: randomCode,
        title: data.title,
        roomId: data.roomId,
        userId: req.user.id,
        customerName: req.user.role !== 'ADMIN' && req.user.name ? req.user.name : data.customerName,
        customerEmail: req.user.role !== 'ADMIN' && req.user.email ? req.user.email : data.customerEmail,
        customerPhone: data.customerPhone,
        companyName: data.companyName || null,
        start: startDate,
        end: endDate,
        attendeesCount: data.attendeesCount,
        status: 'CONFIRMED',
        notes: data.notes || null,
        adminNotes: data.adminNotes || null,
        selectedEquipment: data.selectedEquipment || [],
        totalCost,
        paymentMethod: data.paymentMethod || 'blik',
        paymentStatus: data.paymentStatus || 'paid',
        transactionId: data.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        room
      };
      inMemoryBookings.push(newMock);
      res.status(201).json({
        success: true,
        message: 'Rezerwacja została pomyślnie utworzona.',
        booking: formatBookingDates(newMock)
      });
    }
  }

  static async update(req: Request<{ id: string }, {}, UpdateBookingInput>, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Wymagane logowanie: Aby edytować rezerwację, musisz być zalogowany.' });
      return;
    }

    try {
      const { id } = req.params;
      const data = req.body;

      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: { room: true }
      });

      if (!existingBooking) {
        const memBooking = inMemoryBookings.find(b => b.id === id || b.code === id);
        if (memBooking) {
          if (!checkBookingOwnership(memBooking, req.user)) {
            res.status(403).json({
              success: false,
              message: 'Brak uprawnień: Możesz modyfikować wyłącznie własne rezerwacje.'
            });
            return;
          }
          if (data.title) memBooking.title = data.title;
          if (data.notes !== undefined) memBooking.notes = data.notes || null;
          res.json({ success: true, message: 'Rezerwacja zaktualizowana pomyślnie', booking: memBooking });
          return;
        }
        res.status(404).json({ success: false, message: 'Rezerwacja nie istnieje' });
        return;
      }

      if (!checkBookingOwnership(existingBooking, req.user)) {
        res.status(403).json({
          success: false,
          message: 'Brak uprawnień: Możesz modyfikować wyłącznie własne rezerwacje.'
        });
        return;
      }

      const targetRoomId = data.roomId || existingBooking.roomId;
      const targetStart = data.start ? parseLocalDate(data.start) : existingBooking.start;
      const targetEnd = data.end ? parseLocalDate(data.end) : existingBooking.end;

      if (data.roomId || data.start || data.end) {
        const conflict = await prisma.booking.findFirst({
          where: {
            id: { not: id },
            roomId: targetRoomId,
            status: BookingStatus.CONFIRMED,
            start: { lt: targetEnd },
            end: { gt: targetStart }
          }
        });

        if (conflict) {
          res.status(409).json({
            success: false,
            message: 'Nowy termin koliduje z inną zarezerwowaną sesją.'
          });
          return;
        }
      }

      let totalCost = existingBooking.totalCost;
      if (data.start || data.end || data.roomId) {
        const room = await prisma.room.findUnique({ where: { id: targetRoomId } });
        if (room) {
          const durationHours = Math.max(0.5, (targetEnd.getTime() - targetStart.getTime()) / (1000 * 60 * 60));
          totalCost = Math.round(durationHours * room.hourlyRate);
        }
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          ...data,
          start: data.start ? parseLocalDate(data.start) : undefined,
          end: data.end ? parseLocalDate(data.end) : undefined,
          totalCost
        },
        include: { room: true }
      });

      res.json({
        success: true,
        message: 'Rezerwacja zaktualizowana pomyślnie',
        booking: formatBookingDates(updated)
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request<{ id: string }, {}, { status: BookingStatus }>, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Wymagane logowanie: Aby zmienić status rezerwacji, musisz być zalogowany.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [{ id }, { code: id }]
        },
        include: { room: true }
      });

      if (!booking) {
        const idx = inMemoryBookings.findIndex(b => b.id === id || b.code === id);
        if (idx !== -1) {
          if (!checkBookingOwnership(inMemoryBookings[idx], req.user)) {
            res.status(403).json({
              success: false,
              message: 'Brak uprawnień: Możesz anulować wyłącznie własne rezerwacje.'
            });
            return;
          }
          inMemoryBookings[idx].status = status as 'CONFIRMED' | 'CANCELLED';
          res.json({
            success: true,
            message: `Status rezerwacji zmieniony na: ${status}`,
            booking: inMemoryBookings[idx]
          });
          return;
        }
        res.status(404).json({ success: false, message: 'Rezerwacja nie została odnaleziona' });
        return;
      }

      if (!checkBookingOwnership(booking, req.user)) {
        res.status(403).json({
          success: false,
          message: 'Brak uprawnień: Możesz anulować wyłącznie własne rezerwacje.'
        });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: { status },
        include: { room: true }
      });

      if (status === BookingStatus.CANCELLED) {
        EmailService.sendBookingCancellation(updated, {
          name: booking.room.name,
          categoryLabel: booking.room.categoryLabel,
          floor: booking.room.floor
        });
      }

      res.json({
        success: true,
        message: `Status rezerwacji zmieniony na: ${status}`,
        booking: formatBookingDates(updated)
      });
    } catch (error) {
      console.warn('⚠️ Database query failed for updateStatus, applying to inMemoryBookings:', (error as Error).message);
      const idx = inMemoryBookings.findIndex(b => b.id === id || b.code === id);
      if (idx !== -1) {
        if (!checkBookingOwnership(inMemoryBookings[idx], req.user)) {
          res.status(403).json({
            success: false,
            message: 'Brak uprawnień: Możesz anulować wyłącznie własne rezerwacje.'
          });
          return;
        }
        inMemoryBookings[idx].status = status as 'CONFIRMED' | 'CANCELLED';
        res.json({
          success: true,
          message: `Status rezerwacji zmieniony na: ${status}`,
          booking: inMemoryBookings[idx]
        });
        return;
      }
      next(error);
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Brak uprawnień: Tylko administrator systemu może trwale usuwać rezerwacje.' });
      return;
    }

    const { id } = req.params;
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [{ id }, { code: id }]
        }
      });

      if (booking) {
        if (!checkBookingOwnership(booking, req.user)) {
          res.status(403).json({
            success: false,
            message: 'Brak uprawnień: Możesz usuwać wyłącznie własne rezerwacje.'
          });
          return;
        }

        await prisma.booking.delete({
          where: { id: booking.id }
        });
      } else {
        const memBooking = inMemoryBookings.find(b => b.id === id || b.code === id);
        if (memBooking && !checkBookingOwnership(memBooking, req.user)) {
          res.status(403).json({
            success: false,
            message: 'Brak uprawnień: Możesz usuwać wyłącznie własne rezerwacje.'
          });
          return;
        }
      }

      inMemoryBookings = inMemoryBookings.filter(b => b.id !== id && b.code !== id);

      res.json({
        success: true,
        message: 'Rezerwacja została trwale usunięta z bazy danych'
      });
    } catch (error) {
      console.warn('⚠️ Database query failed for delete, applying to inMemoryBookings:', (error as Error).message);
      const memBooking = inMemoryBookings.find(b => b.id === id || b.code === id);
      if (memBooking && !checkBookingOwnership(memBooking, req.user)) {
        res.status(403).json({
          success: false,
          message: 'Brak uprawnień: Możesz usuwać wyłącznie własne rezerwacje.'
        });
        return;
      }

      inMemoryBookings = inMemoryBookings.filter(b => b.id !== id && b.code !== id);
      res.json({
        success: true,
        message: 'Rezerwacja została usunięta z systemu'
      });
    }
  }

  static async exportIcal(req: Request<{ id: string }>, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    let booking: any = null;

    try {
      booking = await prisma.booking.findFirst({
        where: { OR: [{ id }, { code: id }] },
        include: { room: true }
      });
    } catch (err) {
      console.warn('⚠️ Database query failed for exportIcal, checking inMemoryBookings:', (err as Error).message);
    }

    if (!booking) {
      const mem = inMemoryBookings.find(b => b.id === id || b.code === id);
      if (mem) {
        const room = MOCK_ROOMS.find(r => r.id === mem.roomId);
        booking = {
          ...mem,
          room: room ? {
            id: room.id,
            name: room.name,
            floor: room.floor,
            category: room.category,
            categoryLabel: room.categoryLabel,
            hourlyRate: room.hourlyRate,
            capacity: room.capacity,
            color: room.color,
            bgColor: room.bgColor,
            borderColor: room.borderColor,
            equipment: room.equipment,
            description: room.description,
            imageUrl: room.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date()
          } : undefined
        };
      }
    }

    if (!booking) {
      res.status(404).json({ success: false, message: 'Rezerwacja nie istnieje' });
      return;
    }

    const roomName = booking.room ? booking.room.name : 'Sala konferencyjna';
    const roomFloor = booking.room ? booking.room.floor : 'Gdańsk Business Hub';

    const icsData = IcalService.generateIcs({
      uid: booking.id,
      summary: `${booking.title} (${roomName})`,
      description: `Rezerwacja w Gdańsk Hub Coworking. Kod: ${booking.code}. Uczestników: ${booking.attendeesCount}. ${booking.notes || ''}`,
      location: `${roomName}, ${roomFloor}`,
      start: booking.start,
      end: booking.end,
      organizerName: 'Gdańsk Hub Coworking',
      organizerEmail: 'rezerwacje@gdanskhub.pl'
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${booking.code}.ics"`);
    res.send(icsData);
  }

  static async sendReminder(req: Request<{ id: string }>, res: Response, _next: NextFunction): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Wymagane logowanie' });
      return;
    }

    const { id } = req.params;
    let booking: any = null;

    try {
      booking = await prisma.booking.findFirst({
        where: { OR: [{ id }, { code: id }] },
        include: { room: true }
      });
    } catch (err) {
      console.warn('⚠️ Database query failed for sendReminder, checking inMemoryBookings:', (err as Error).message);
    }

    if (!booking) {
      const mem = inMemoryBookings.find(b => b.id === id || b.code === id);
      if (mem) {
        const room = MOCK_ROOMS.find(r => r.id === mem.roomId);
        booking = {
          ...mem,
          room: room ? {
            name: room.name,
            categoryLabel: room.categoryLabel,
            floor: room.floor
          } : undefined
        };
      }
    }

    if (!booking) {
      res.status(404).json({ success: false, message: 'Rezerwacja nie istnieje' });
      return;
    }

    if (!checkBookingOwnership(booking, req.user)) {
      res.status(403).json({ success: false, message: 'Brak uprawnień do tej rezerwacji' });
      return;
    }

    const room = booking.room || {
      name: 'Sala konferencyjna',
      categoryLabel: 'Przestrzeń biznesowa',
      floor: 'Gdańsk Business Hub'
    };

    const emailResult = await EmailService.sendBookingReminder(booking, room);

    res.json({
      success: true,
      message: `Przypomnienie zostało pomyślnie wysłane na adres ${booking.customerEmail}`,
      customerEmail: booking.customerEmail,
      emailSent: !!emailResult
    });
  }

  static async sendBatchReminders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const now = getLocalNow();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let upcomingBookings: any[] = [];

    try {
      upcomingBookings = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          start: {
            gte: now,
            lte: in24h
          }
        },
        include: { room: true }
      });
    } catch (err) {
      console.warn('⚠️ Database query failed for batch reminders, using inMemoryBookings:', (err as Error).message);
    }

    if (upcomingBookings.length === 0) {
      upcomingBookings = inMemoryBookings
        .filter(b => b.status === 'CONFIRMED')
        .filter(b => {
          const t = new Date(b.start).getTime();
          return t >= now.getTime() && t <= in24h.getTime();
        })
        .map(mem => {
          const room = MOCK_ROOMS.find(r => r.id === mem.roomId);
          return {
            ...mem,
            room: room ? {
              name: room.name,
              categoryLabel: room.categoryLabel,
              floor: room.floor
            } : undefined
          };
        });
    }

    let sentCount = 0;
    const sentList: string[] = [];

    for (const b of upcomingBookings) {
      const room = b.room || {
        name: 'Sala spotkań',
        categoryLabel: 'Przestrzeń Hubu',
        floor: 'Gdańsk Business Hub'
      };
      await EmailService.sendBookingReminder(b, room);
      sentCount++;
      sentList.push(`${b.code} (${b.customerEmail})`);
    }

    res.json({
      success: true,
      count: sentCount,
      message: sentCount > 0
        ? `Wysłano ${sentCount} przypomnień o nadchodzących wydarzeniach.`
        : 'Brak zbliżających się wydarzeń wymagających przypomnienia w ciągu najbliższych 24h.',
      recipients: sentList
    });
  }
}
