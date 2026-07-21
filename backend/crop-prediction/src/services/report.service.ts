/**
 * services/report.service.ts
 *
 * PDF Report Generator — Crop Recommendation Report
 *
 * Responsibilities:
 *  - Accept the full PredictionResult + input features
 *  - Generate a professional, AgroSathi-branded PDF report
 *  - Stream/return the PDF buffer
 *
 * Layout Sections:
 *   1. Header (Logo / Brand / Timestamp)
 *   2. Farmer Inputs Summary
 *   3. Prediction Result (Crop + Accuracy)
 *   4. Alternative Crops Table
 *   5. AI Analysis (Why, Practices, Soil, Fertilizer)
 *   6. Crop Statistics (Yield, Profit, Water, Duration)
 *   7. Footer
 */

import PDFDocument from 'pdfkit';
import { PredictionResult } from '../schemas/response.schema';
import { PredictionRequestDTO } from '../schemas/prediction.schema';

// ── Brand Colours ────────────────────────────────────────────────────────────
const COLOR = {
  brand:      '#1a5f3a',
  brandLight: '#e8f5e9',
  accent:     '#65b23d',
  dark:       '#1a1a1a',
  mid:        '#555555',
  light:      '#888888',
  border:     '#d4edda',
  white:      '#ffffff',
  row:        '#f7fcf4',
};

const FONT = {
  bold:    'Helvetica-Bold',
  normal:  'Helvetica',
};

export const reportService = {
  /**
   * Generate the PDF report and return a Buffer.
   */
  async generatePDF(
    prediction: PredictionResult,
    inputs: PredictionRequestDTO
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'AgroSathi Crop Report' } });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end',  () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = doc.page.width - 96; // usable width

      // ── HEADER ─────────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 88).fill(COLOR.brand);

      doc.fillColor(COLOR.white)
         .font(FONT.bold).fontSize(22)
         .text('AgroSathi', 48, 24);

      doc.fillColor('#a8d5b5')
         .font(FONT.normal).fontSize(10)
         .text('AI-Powered Crop Recommendation Report', 48, 50);

      // Timestamp (right-aligned)
      const ts = new Date(prediction.metadata.generatedAt);
      const dateStr = ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      doc.fillColor(COLOR.white).font(FONT.normal).fontSize(9)
         .text(`${dateStr}  ${timeStr}`, 0, 38, { align: 'right' });

      doc.y = 108;

      // ── SECTION HELPER ─────────────────────────────────────────────────────
      const sectionTitle = (title: string) => {
        const y = doc.y + 14;
        doc.rect(48, y, W, 26).fill(COLOR.brandLight);
        doc.fillColor(COLOR.brand).font(FONT.bold).fontSize(11)
           .text(title, 56, y + 7);
        doc.y = y + 34;
        doc.fillColor(COLOR.dark);
      };

      const labelValue = (label: string, value: string, indent = 0) => {
        const x = 48 + indent;
        doc.font(FONT.bold).fontSize(9).fillColor(COLOR.mid)
           .text(label, x, doc.y, { continued: true });
        doc.font(FONT.normal).fontSize(9).fillColor(COLOR.dark)
           .text('  ' + value);
        doc.moveDown(0.3);
      };

      const divider = () => {
        doc.moveDown(0.5);
        doc.moveTo(48, doc.y).lineTo(48 + W, doc.y).strokeColor(COLOR.border).lineWidth(0.5).stroke();
        doc.moveDown(0.5);
      };

      const bullet = (text: string, indent = 64) => {
        const y = doc.y;
        doc.fillColor(COLOR.accent).circle(indent - 10, y + 4, 2.5).fill();
        doc.fillColor(COLOR.dark).font(FONT.normal).fontSize(9)
           .text(text, indent, y, { width: W - (indent - 48) });
        doc.moveDown(0.3);
      };

      // ── 1. FARMER INPUTS ───────────────────────────────────────────────────
      sectionTitle('📋  Farmer Input Parameters');

      const inputPairs = [
        ['Nitrogen (N)', `${inputs.N} kg/ha`],
        ['Phosphorus (P)', `${inputs.P} kg/ha`],
        ['Potassium (K)', `${inputs.K} kg/ha`],
        ['Temperature', `${inputs.temperature} °C`],
        ['Humidity', `${inputs.humidity} %`],
        ['pH Level', `${inputs.ph}`],
        ['Rainfall', `${inputs.rainfall} mm`],
      ];

      // Two-column grid
      const colW = W / 2 - 8;
      let col = 0;
      let rowY = doc.y;
      inputPairs.forEach(([lbl, val], i) => {
        const x = 48 + col * (colW + 16);
        doc.font(FONT.bold).fontSize(8).fillColor(COLOR.light).text(lbl, x, rowY);
        doc.font(FONT.bold).fontSize(11).fillColor(COLOR.dark).text(val, x, rowY + 11);
        col++;
        if (col === 2) { col = 0; rowY += 38; }
      });
      doc.y = rowY + 38;

      // ── 2. PREDICTED CROP ──────────────────────────────────────────────────
      sectionTitle('🌾  ML Prediction Result');

      // Big crop name box
      doc.rect(48, doc.y, W, 58).fill(COLOR.brand);
      doc.fillColor(COLOR.white)
         .font(FONT.bold).fontSize(20)
         .text(prediction.prediction.crop, 64, doc.y + 10);
      doc.fillColor('#a8d5b5').font(FONT.normal).fontSize(10)
         .text(`Model Accuracy: ${prediction.prediction.accuracy}%   ·   Model: ${prediction.metadata.modelVersion}   ·   AI: ${prediction.metadata.geminiVersion}`, 64, doc.y + 34);
      doc.y += 68;

      divider();

      // ── 3. CROP STATISTICS ─────────────────────────────────────────────────
      sectionTitle('📊  Crop Statistics');

      const stats = [
        ['Growth Duration',  `${prediction.metadata.growthDuration.minDays} - ${prediction.metadata.growthDuration.maxDays} Days`],
        ['Water Requirement',`${prediction.metadata.waterRequirement.min} - ${prediction.metadata.waterRequirement.max} ${prediction.metadata.waterRequirement.unit}`],
      ];

      // 2-column stat bar
      const statW = W / 2 - 6;
      stats.forEach(([lbl, val], i) => {
        const x = 48 + i * (statW + 8);
        doc.rect(x, doc.y, statW, 50).fill(COLOR.row);
        doc.font(FONT.bold).fontSize(8).fillColor(COLOR.light).text(lbl, x + 6, doc.y + 8, { width: statW - 12 });
        doc.font(FONT.bold).fontSize(10).fillColor(COLOR.brand).text(val, x + 6, doc.y + 22, { width: statW - 12 });
      });
      doc.y += 62;

      // ── 4. WHY THIS CROP ───────────────────────────────────────────────────
      sectionTitle('💡  Why This Crop?');
      doc.font(FONT.normal).fontSize(9).fillColor(COLOR.dark)
         .text(prediction.analysis.whyThisCrop || '—', 48, doc.y, { width: W, lineGap: 3 });
      doc.moveDown(0.8);

      // ── 5. RECOMMENDED PRACTICES ───────────────────────────────────────────
      sectionTitle('✅  Recommended Farming Practices');
      (prediction.analysis.recommendedPractices || []).forEach(p => bullet(p));
      doc.moveDown(0.4);

      // ── 6. SOIL SUMMARY ────────────────────────────────────────────────────
      sectionTitle('🌱  Soil Suitability Summary');
      doc.font(FONT.normal).fontSize(9).fillColor(COLOR.dark)
         .text(prediction.analysis.soilSuitability || '—', 48, doc.y, { width: W, lineGap: 3 });
      doc.moveDown(0.4);

      labelValue('Fertilizer Recommendation:', typeof prediction.analysis.fertilizerRecommendation === 'string'
        ? prediction.analysis.fertilizerRecommendation
        : (prediction.analysis.fertilizerRecommendation as string[])?.join(', ') || '—');

      // ── 7. ALTERNATIVE CROPS ───────────────────────────────────────────────
      // Add page if close to bottom
      if (doc.y > 650) doc.addPage();

      sectionTitle('🔄  Alternative Crop Suggestions');

      // Table header — 2 columns (crop name + score)
      const cols = [340, 130];
      const headers = ['Crop Name', 'Suitability Score'];
      let tx = 48;
      doc.rect(48, doc.y, W, 20).fill(COLOR.brand);
      headers.forEach((h, i) => {
        doc.fillColor(COLOR.white).font(FONT.bold).fontSize(8).text(h, tx + 4, doc.y + 6, { width: cols[i] - 8 });
        tx += cols[i];
      });
      doc.y += 22;

      (prediction.alternativeCrops || []).forEach((alt, idx) => {
        const rowFill = idx % 2 === 0 ? COLOR.row : COLOR.white;
        doc.rect(48, doc.y, W, 18).fill(rowFill);
        let cx = 48;
        const cells = [
          alt.crop,
          `${alt.score}%`,
        ];
        cells.forEach((cell, i) => {
          doc.fillColor(COLOR.dark).font(FONT.normal).fontSize(8)
             .text(cell, cx + 4, doc.y + 5, { width: cols[i] - 8 });
          cx += cols[i];
        });
        doc.y += 20;
      });

      doc.moveDown(0.8);

      // ── 8. AI RECOMMENDATIONS ──────────────────────────────────────────────
      if (doc.y > 620) doc.addPage();

      sectionTitle('🤖  AI Recommendations');

      const diseases = prediction.analysis.commonDiseases || [];
      if (diseases.length) {
        doc.font(FONT.bold).fontSize(9).fillColor(COLOR.mid).text('Common Diseases to Watch:', 48, doc.y);
        doc.moveDown(0.3);
        diseases.forEach(d => bullet(d));
      }

      const harvestTips = prediction.analysis.harvestTips;
      if (harvestTips) {
        doc.moveDown(0.3);
        doc.font(FONT.bold).fontSize(9).fillColor(COLOR.mid).text('Harvest Tips:', 48, doc.y);
        doc.moveDown(0.3);
        if (Array.isArray(harvestTips)) {
          harvestTips.forEach(t => bullet(t));
        } else {
          bullet(harvestTips as string);
        }
      }

      // ── FOOTER ─────────────────────────────────────────────────────────────
      const footerY = doc.page.height - 40;
      doc.rect(0, footerY - 6, doc.page.width, 46).fill(COLOR.brand);
      doc.fillColor(COLOR.white).font(FONT.normal).fontSize(8)
         .text(
           `AgroSathi · AI-Powered Agriculture Platform · Report ID: ${Date.now()} · Generated: ${ts.toLocaleString('en-IN')}`,
           48, footerY + 4, { align: 'center', width: doc.page.width - 96 }
         );

      doc.end();
    });
  },
};
