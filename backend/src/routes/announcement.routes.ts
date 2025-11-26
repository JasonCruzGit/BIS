import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements
} from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/active', getActiveAnnouncements);
router.get('/', authenticate, getAnnouncements);
router.get('/:id', authenticate, getAnnouncement);
router.post('/', authenticate, uploadMultiple('attachments', 10), createAnnouncement);
router.put('/:id', authenticate, uploadMultiple('attachments', 10), updateAnnouncement);
router.delete('/:id', authenticate, deleteAnnouncement);

export default router;



