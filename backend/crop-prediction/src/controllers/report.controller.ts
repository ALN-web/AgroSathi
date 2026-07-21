/**
 * controllers/report.controller.ts
 *
 * Handles POST /api/crop-prediction/report
 *
 * Flow:
 *   1. Receive & validate inputs (same 7 features as /predict)
 *   2. Call responseBuilderService.build() to get full prediction
 *   3. Call reportService.generatePDF() to create the PDF buffer
 *   4. Stream PDF back to the client as a downloadable file
 */

import { Request, Response, NextFunction } from 'express';
import { responseBuilderService } from '../services/responseBuilder.service';
import { reportService } from '../services/report.service';
import { PredictionRequestDTO } from '../schemas/prediction.schema';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';
import { buildErrorResponse } from '../helpers/response.helper';

export const reportController = {
  /**
   * POST /api/crop-prediction/report
   * Accepts 7 ML features, runs prediction, returns downloadable PDF report.
   */
  generate: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inputs = req.body as PredictionRequestDTO;

      // 1. Run full prediction pipeline (ML + Gemini + metadata)
      const prediction = await responseBuilderService.build(inputs);

      // 2. Generate PDF buffer
      const pdfBuffer = await reportService.generatePDF(prediction, inputs);

      // 3. Build a safe filename
      const cropName  = prediction.prediction.crop.replace(/\s+/g, '_');
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename  = `AgroSathi_Crop_Report_${cropName}_${timestamp}.pdf`;

      // 4. Stream PDF to client
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.status(HTTP_STATUS.OK).send(pdfBuffer);

    } catch (err) {
      console.error('[ReportController] Error generating report:', err);
      res.status(HTTP_STATUS.INTERNAL).json(buildErrorResponse(
        ERROR_CODES.PREDICTION_FAILED,
        'Failed to generate crop report',
        err instanceof Error ? err.message : err
      ));
    }
  },
};
