import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2, max: 50 }),
    body('username').isString().trim().isLength({ min: 2, max: 30 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8, max: 72 }),
    validate,
  ],
  register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 1, max: 72 }), validate],
  login
);

router.get('/me', authMiddleware, getMe);
router.patch(
  '/me',
  authMiddleware,
  upload.single('profilePicture'),
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 50 }),
    body('username').optional().isString().trim().isLength({ min: 2, max: 30 }),
    validate,
  ],
  updateMe
);

export default router;

