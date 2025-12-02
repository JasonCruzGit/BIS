import express from 'express';
import {
  getResidents,
  getResident,
  createResident,
  updateResident,
  archiveResident,
  searchResidents,
  getResidentQRCode,
  getResidentByQRCode
} from '../controllers/resident.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = express.Router();

// Public route (no auth required)
router.get('/qr/:qrCode', getResidentByQRCode);

// Protected routes
router.get('/', authenticate, getResidents);
router.get('/search', authenticate, searchResidents);
router.get('/:id', authenticate, getResident);
router.get('/:id/qrcode', authenticate, getResidentQRCode);
router.post('/', authenticate, uploadSingle('idPhoto'), createResident);
router.put('/:id', authenticate, uploadSingle('idPhoto'), updateResident);
router.patch('/:id/archive', authenticate, archiveResident);

export default router;



