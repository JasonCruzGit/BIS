import express from 'express';
import {
  getHouseholds,
  getHousehold,
  createHousehold,
  updateHousehold,
  deleteHousehold
} from '../controllers/household.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getHouseholds);
router.get('/:id', authenticate, getHousehold);
router.post('/', authenticate, createHousehold);
router.put('/:id', authenticate, updateHousehold);
router.delete('/:id', authenticate, deleteHousehold);

export default router;



