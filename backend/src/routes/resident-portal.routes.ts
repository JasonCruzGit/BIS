import express from 'express';
import {
  residentLogin,
  getMyDocuments,
  getMyRequests,
  createDocumentRequest,
  getRequestDetails,
  submitComplaint,
  getPublicAnnouncements,
  getDocumentTypes,
  paymentCallback,
} from '../controllers/resident-portal.controller';
import { authenticateResident } from '../middleware/resident-auth.middleware';

const router = express.Router();

// Public routes
router.post('/login', residentLogin);
router.get('/announcements', getPublicAnnouncements);
router.get('/document-types', getDocumentTypes);

// Protected routes (require resident authentication)
router.use(authenticateResident);

router.get('/documents', getMyDocuments);
router.get('/requests', getMyRequests);
router.get('/requests/:id', getRequestDetails);
router.post('/requests', createDocumentRequest);
router.post('/complaints', submitComplaint);
router.post('/payment/callback', paymentCallback);

export default router;

