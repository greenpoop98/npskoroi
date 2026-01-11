import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.post('/', UserController.create);
router.get('/search', UserController.search);
router.get('/', UserController.getAll);

export default router;

