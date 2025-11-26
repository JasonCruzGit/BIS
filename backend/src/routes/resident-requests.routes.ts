import express from 'express';
import {
  getAllDocumentRequests,
  getAllResidentComplaints,
  updateDocumentRequest,
} from '../controllers/resident-requests.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all document requests (accessible to admin and secretary)
router.get('/document-requests', authorize('ADMIN', 'SECRETARY', 'BARANGAY_CHAIRMAN'), getAllDocumentRequests);

// Get all resident complaints
router.get('/complaints', authorize('ADMIN', 'SECRETARY', 'BARANGAY_CHAIRMAN'), getAllResidentComplaints);

// Update document request status
router.put('/document-requests/:id', authorize('ADMIN', 'SECRETARY', 'BARANGAY_CHAIRMAN'), updateDocumentRequest);

export default router;

