import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { CreateRoomInput, UpdateRoomInput } from '../validators/room.schema.js';
import { MOCK_ROOMS } from '../data/mockData.js';
import { getLocalNow, formatBookingDates } from '../utils/date.js';

export class RoomsController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { category } = req.query;
    try {
      const whereClause = category ? { category: String(category) } : {};

      const rooms = await prisma.room.findMany({
        where: whereClause,
        orderBy: { capacity: 'asc' }
      });

      res.json({
        success: true,
        count: rooms.length,
        rooms
      });
    } catch (error) {
      console.warn('⚠️ Database query failed for rooms, returning fallback mock rooms:', (error as Error).message);
      let rooms = MOCK_ROOMS;
      if (category) {
        rooms = rooms.filter(r => r.category === String(category));
      }
      res.json({
        success: true,
        count: rooms.length,
        rooms
      });
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          bookings: {
            where: {
              status: 'CONFIRMED',
              end: { gte: getLocalNow() }
            },
            select: {
              id: true,
              code: true,
              title: true,
              start: true,
              end: true
            },
            orderBy: { start: 'asc' }
          }
        }
      });

      if (!room) {
        res.status(404).json({
          success: false,
          message: `Sala o identyfikatorze '${id}' nie została znaleziona`
        });
        return;
      }

      res.json({
        success: true,
        room: {
          ...room,
          bookings: room.bookings.map(formatBookingDates)
        }
      });
    } catch (error) {
      console.warn(`⚠️ Database query failed for room ${id}, returning fallback mock:`, (error as Error).message);
      const room = MOCK_ROOMS.find(r => r.id === id);
      if (!room) {
        res.status(404).json({
          success: false,
          message: `Sala o identyfikatorze '${id}' nie została znaleziona`
        });
        return;
      }
      res.json({
        success: true,
        room: { ...room, bookings: [] }
      });
    }
  }

  static async create(req: Request<{}, {}, CreateRoomInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;

      const existing = await prisma.room.findUnique({
        where: { id: data.id }
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: `Sala z identyfikatorem '${data.id}' już istnieje w systemie`
        });
        return;
      }

      const room = await prisma.room.create({
        data
      });

      res.status(201).json({
        success: true,
        message: 'Sala została pomyślnie dodana',
        room
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request<{ id: string }, {}, UpdateRoomInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const room = await prisma.room.update({
        where: { id },
        data
      });

      res.json({
        success: true,
        message: 'Sala zaktualizowana pomyślnie',
        room
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const activeBookingsCount = await prisma.booking.count({
        where: {
          roomId: id,
          status: 'CONFIRMED',
          end: { gte: getLocalNow() }
        }
      });

      if (activeBookingsCount > 0) {
        res.status(400).json({
          success: false,
          message: `Nie można usunąć sali, ponieważ posiada ${activeBookingsCount} aktywnych nadchodzących rezerwacji.`
        });
        return;
      }

      await prisma.room.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Sala została usunięta z systemu'
      });
    } catch (error) {
      next(error);
    }
  }
}
