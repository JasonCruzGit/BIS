import express from 'express';
import {
  getResidents,
  getResident,
  createResident,
  updateResident,
  archiveResident,
  searchResidents
} from '../controllers/resident.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', authenticate, getResidents);
router.get('/search', authenticate, searchResidents);
router.get('/:id', authenticate, getResident);
router.post('/', authenticate, uploadSingle('idPhoto'), createResident);
router.put('/:id', authenticate, uploadSingle('idPhoto'), updateResident);
router.patch('/:id/archive', authenticate, archiveResident);

export default router;



