import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { contractor: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      budget,
      contractor,
      startDate,
      endDate,
      status
    } = req.body;

    const files = req.files ? (req.files as Express.Multer.File[]) : [];
    
    // Separate documents and photos based on file type
    const documents: string[] = [];
    const progressPhotos: string[] = [];
    
    files.forEach(file => {
      const filePath = `/uploads/projects/${file.filename}`;
      if (file.mimetype.startsWith('image/')) {
        progressPhotos.push(filePath);
      } else {
        documents.push(filePath);
      }
    });

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        contractor: contractor || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'PLANNING',
        documents,
        progressPhotos,
        createdBy: req.user!.id
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'PROJECT',
      project.id,
      { action: 'Created project', title },
      req
    );

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.budget) updateData.budget = parseFloat(updateData.budget);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const existingProject = await prisma.project.findUnique({ where: { id } });
    
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const files = req.files as Express.Multer.File[];
      
      // Separate new documents and photos based on file type
      const newDocuments: string[] = [];
      const newPhotos: string[] = [];
      
      files.forEach(file => {
        const filePath = `/uploads/projects/${file.filename}`;
        if (file.mimetype.startsWith('image/')) {
          newPhotos.push(filePath);
        } else {
          newDocuments.push(filePath);
        }
      });

      // Merge with existing files
      updateData.documents = [...(existingProject.documents || []), ...newDocuments];
      updateData.progressPhotos = [...(existingProject.progressPhotos || []), ...newPhotos];
    }

    const oldProject = existingProject;

    const project = await prisma.project.update({
      where: { id },
      data: updateData
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'PROJECT',
      project.id,
      { 
        action: 'Updated project',
        changes: { old: oldProject, new: project }
      },
      req
    );

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { status }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE_STATUS',
      'PROJECT',
      project.id,
      { action: 'Updated project status', status },
      req
    );

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

