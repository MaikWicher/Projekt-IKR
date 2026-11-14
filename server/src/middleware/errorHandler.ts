import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Unhandled Server Error:', err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'pole';
      res.status(409).json({
        success: false,
        message: `Konflikt unikalności: Wartość dla pola [${target}] już istnieje w bazie danych.`,
        errorCode: err.code
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Nie znaleziono żądanego rekordu w bazie danych.',
        errorCode: err.code
      });
      return;
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Wystąpił wewnętrzny błąd serwera';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Nie znaleziono ścieżki: [${req.method}] ${req.originalUrl}`
  });
};
