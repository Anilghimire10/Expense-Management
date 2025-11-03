// src/controllers/ocr.controller.ts
import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { ocrService } from '../services/ocrService';

export const ocrController = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError('No file uploaded', 400);
  }

  const saveResult = req.body.save_result === 'true' || req.body.save_result === true;

  const filePath = req.file.path;

  const result = await ocrService.OCR(filePath, saveResult);

  return ApiResponse.success(res, 'File uploaded successfully', result);
};
