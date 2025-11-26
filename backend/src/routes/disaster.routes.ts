import express from 'express';
import {
  getDisasters,
  getDisaster,
  createDisaster,
  updateDisaster,
  updateDisasterStatus,
  addBeneficiary,
  getBeneficiaries,
  exportBeneficiaryList
} from '../controllers/disaster.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getDisasters);
router.get('/:id', authenticate, getDisaster);
router.get('/:id/beneficiaries', authenticate, getBeneficiaries);
router.get('/:id/beneficiaries/export', authenticate, exportBeneficiaryList);
router.post('/', authenticate, createDisaster);
router.post('/:id/beneficiaries', authenticate, addBeneficiary);
router.put('/:id', authenticate, updateDisaster);
router.patch('/:id/status', authenticate, updateDisasterStatus);

export default router;



