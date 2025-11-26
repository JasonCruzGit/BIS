import express from 'express';
import {
  getAuditLogs,
  getAuditLog,
  getAuditLogsByEntity
} from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN', 'BARANGAY_CHAIRMAN', 'SECRETARY'), getAuditLogs);
router.get('/:id', authenticate, authorize('ADMIN', 'BARANGAY_CHAIRMAN', 'SECRETARY'), getAuditLog);
router.get('/entity/:entityType/:entityId', authenticate, authorize('ADMIN', 'BARANGAY_CHAIRMAN', 'SECRETARY'), getAuditLogsByEntity);

export default router;



