import express from 'express';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addInventoryLog,
  getInventoryLogs,
  generateQRCode
} from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getInventoryItems);
router.get('/:id', authenticate, getInventoryItem);
router.get('/:id/logs', authenticate, getInventoryLogs);
router.get('/:id/qrcode', authenticate, generateQRCode);
router.post('/', authenticate, createInventoryItem);
router.post('/:id/logs', authenticate, addInventoryLog);
router.put('/:id', authenticate, updateInventoryItem);
router.delete('/:id', authenticate, deleteInventoryItem);

export default router;



