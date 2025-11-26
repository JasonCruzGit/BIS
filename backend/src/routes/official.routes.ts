import express from 'express';
import {
  getOfficials,
  getOfficial,
  createOfficial,
  updateOfficial,
  deleteOfficial,
  recordAttendance,
  getAttendance
} from '../controllers/official.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadFields } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', authenticate, getOfficials);
router.get('/:id', authenticate, getOfficial);
router.get('/:id/attendance', authenticate, getAttendance);
router.post('/', authenticate, uploadFields([{ name: 'photo', maxCount: 1 }, { name: 'documents', maxCount: 10 }]), createOfficial);
router.post('/:id/attendance', authenticate, recordAttendance);
router.put('/:id', authenticate, uploadFields([{ name: 'photo', maxCount: 1 }, { name: 'documents', maxCount: 10 }]), updateOfficial);
router.delete('/:id', authenticate, deleteOfficial);

export default router;

