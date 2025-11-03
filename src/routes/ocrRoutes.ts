// src/routes/ocr.route.ts
import { Router } from 'express';
import { ocrController } from '../controller/ocrController';
import upload from '../utils/multer';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware(['admin', 'user']), upload.single('file'), ocrController);

export default router;
