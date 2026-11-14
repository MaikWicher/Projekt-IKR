import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { BookingStatus } from '@prisma/client';
import { getLocalNow } from '../utils/date.js';

export class AnalyticsController {
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalBookings = await prisma.booking.count();
      const confirmedBookings = await prisma.booking.count({
        where: { status: BookingStatus.CONFIRMED }
      });
      const cancelledBookings = await prisma.booking.count({
        where: { status: BookingStatus.CANCELLED }
      });

      const revenueAggregate = await prisma.booking.aggregate({
        _sum: { totalCost: true },
        where: { status: BookingStatus.CONFIRMED }
      });
      const totalRevenue = revenueAggregate._sum.totalCost || 0;

      const upcomingBookingsCount = await prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
          start: { gte: getLocalNow() }
        }
      });

      const rooms = await prisma.room.findMany({
        include: {
          _count: {
            select: { bookings: true }
          },
          bookings: {
            where: { status: BookingStatus.CONFIRMED },
            select: { totalCost: true, start: true, end: true }
          }
        }
      });

      const roomsAnalytics = rooms.map((room: any) => {
        const roomRevenue = room.bookings.reduce((sum: number, b: { totalCost: number }) => sum + b.totalCost, 0);
        const totalHours = room.bookings.reduce((sum: number, b: { start: Date; end: Date }) => {
          const hours = (new Date(b.end).getTime() - new Date(b.start).getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);

        return {
          id: room.id,
          name: room.name,
          category: room.category,
          totalBookings: room._count.bookings,
          revenue: roomRevenue,
          totalHours: Math.round(totalHours * 10) / 10
        };
      });

      roomsAnalytics.sort((a: any, b: any) => b.totalBookings - a.totalBookings);

      res.json({
        success: true,
        stats: {
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          totalRevenue,
          upcomingBookingsCount,
          roomsCount: rooms.length,
          popularRooms: roomsAnalytics
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
