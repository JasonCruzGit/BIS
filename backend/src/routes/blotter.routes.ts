import express from 'express';
import {
  getBlotterEntries,
  getBlotterEntry,
  createBlotterEntry,
  updateBlotterEntry,
  updateBlotterStatus,
  exportBlotterReport
} from '../controllers/blotter.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getBlotterEntries);
router.get('/export', authenticate, exportBlotterReport);
router.get('/:id', authenticate, getBlotterEntry);
router.post('/', authenticate, createBlotterEntry);
router.put('/:id', authenticate, updateBlotterEntry);
router.patch('/:id/status', authenticate, updateBlotterStatus);

export default router;



