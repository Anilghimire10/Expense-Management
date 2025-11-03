// src/services/pythonOCR.service.ts
import fetch from 'node-fetch';
import FormData from 'form-data';
import { createReadStream } from 'fs';
const PYTHON_API = process.env.PYTHON_OCR_URL;

export interface OCRResponse {
  success: boolean;
  message: string;
  receipt_data: any;
  processing_time: number;
  confidence_score: number;
}

export class ocrService {
  static async OCR(filePath: string, saveResult: boolean): Promise<OCRResponse> {
    const form = new FormData();
    form.append('file', createReadStream(filePath));
    form.append('save_result', saveResult.toString());

    const res = await fetch(`${PYTHON_API}/api/v1/ocr/process`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Python API error ${res.status}: ${txt}`);
    }

    const data = (await res.json()) as OCRResponse;

    return data;
  }
}
