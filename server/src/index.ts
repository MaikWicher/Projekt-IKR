import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import roomsRoutes from './routes/rooms.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

app.set('trust proxy', true);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === ENV.CORS_ORIGIN) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: 'Zbyt wiele żądań z tego adresu IP, spróbuj ponownie za 15 minut.'
  }
});
app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Gdańsk Business Hub Coworking – RESTful API',
    status: 'online',
    cloud: 'Google Cloud Platform (Cloud Run, europe-central2 Warszawa)',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      auth: '/api/auth'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gdansk-hub-backend',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = ENV.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 Gdańsk Hub Backend API running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📦 Database: PostgreSQL (Prisma ORM)`);
  console.log(`⏰ Auto-Reminder Worker: Active (Interval: 30 min)`);
  console.log(`=================================================`);
});

const sentReminderCache = new Set<string>();

const runAutoReminderCheck = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { prisma } = await import('./config/db.js');
    const { EmailService } = await import('./services/email.service.js');

    const upcoming = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        start: { gte: now, lte: in24h }
      },
      include: { room: true }
    });

    for (const b of upcoming) {
      if (!sentReminderCache.has(b.id)) {
        await EmailService.sendBookingReminder(b, b.room);
        sentReminderCache.add(b.id);
        console.log(`⏰ [Auto-Scheduler] Wysłano automatyczne przypomnienie o rezerwacji ${b.code} do ${b.customerEmail}`);
      }
    }
  } catch (_err) {
    // Database or network offline - safe fallback
  }
};

setTimeout(runAutoReminderCheck, 10000);
setInterval(runAutoReminderCheck, 30 * 60 * 1000);

export default app;
