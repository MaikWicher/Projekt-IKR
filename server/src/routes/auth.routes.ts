import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.schema.js';
import { authenticateToken } from '../middleware/auth.js';

import { prisma } from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        companyName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      module: 'Authentication & Authorization API',
      totalUsersCount: users.length,
      registeredUsers: users,
      endpoints: {
        login: 'POST /api/auth/login (wymaga email i password w formacie JSON)',
        register: 'POST /api/auth/register (wymaga email, password, name w formacie JSON)',
        me: 'GET /api/auth/me (wymaga nagłówka Authorization: Bearer <token>)'
      },
      demoCredentials: {
        admin: { email: 'admin@gdanskhub.pl', password: 'admin123', role: 'ADMIN' },
        client: { email: 'klient@gdanskhub.pl', password: 'user123', role: 'CLIENT' }
      }
    });
  } catch (error) {
    res.json({
      success: true,
      module: 'Authentication & Authorization API',
      registeredUsers: [
        { email: 'admin@gdanskhub.pl', name: 'Administrator Hubu', role: 'ADMIN' },
        { email: 'klient@gdanskhub.pl', name: 'Jan Kowalski', role: 'CLIENT' }
      ],
      endpoints: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me'
      }
    });
  }
});

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

export default router;
