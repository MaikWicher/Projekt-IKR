import { Router } from 'express';
import { RoomsController } from '../controllers/rooms.controller.js';
import { validateBody } from '../middleware/validate.js';
import { createRoomSchema, updateRoomSchema } from '../validators/room.schema.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', RoomsController.getAll);
router.get('/:id', RoomsController.getById);

router.post('/', authenticateToken, requireAdmin, validateBody(createRoomSchema), RoomsController.create);
router.put('/:id', authenticateToken, requireAdmin, validateBody(updateRoomSchema), RoomsController.update);
router.delete('/:id', authenticateToken, requireAdmin, RoomsController.delete);

export default router;
