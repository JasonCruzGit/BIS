import express from 'express';
import {
  getFinancialRecords,
  getFinancialRecord,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialSummary,
  exportFinancialReport
} from '../controllers/financial.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', authenticate, getFinancialRecords);
router.get('/summary', authenticate, getFinancialSummary);
router.get('/export', authenticate, exportFinancialReport);
router.get('/:id', authenticate, getFinancialRecord);
router.post('/', authenticate, uploadSingle('receipt'), createFinancialRecord);
router.put('/:id', authenticate, uploadSingle('receipt'), updateFinancialRecord);
router.delete('/:id', authenticate, deleteFinancialRecord);

export default router;



