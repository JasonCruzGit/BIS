import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectStatus
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProject);
router.post('/', authenticate, uploadMultiple('files', 20), createProject);
router.put('/:id', authenticate, uploadMultiple('files', 20), updateProject);
router.patch('/:id/status', authenticate, updateProjectStatus);

export default router;



