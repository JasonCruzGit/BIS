import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import { generateIncidentNumber } from '../utils/generateDocumentNumber';

const prisma = new PrismaClient();

export const getIncidents = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          complainant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address: true
            }
          },
          respondent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address: true
            }
          },
          creator: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { incidentDate: 'desc' }
      }),
      prisma.incident.count({ where })
    ]);

    res.json({
      incidents,
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

export const getIncident = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        complainant: true,
        respondent: true,
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createIncident = async (req: AuthRequest, res: Response) => {
  try {
    const {
      complainantId,
      respondentId,
      narrative,
      incidentDate,
      actionsTaken,
      status,
      hearingDate
    } = req.body;

    const attachments = req.files
      ? (req.files as Express.Multer.File[]).map(file => `/uploads/incidents/${file.filename}`)
      : [];

    const incidentNumber = generateIncidentNumber();

    const incident = await prisma.incident.create({
      data: {
        incidentNumber,
        complainantId,
        respondentId: respondentId || null,
        narrative,
        incidentDate: new Date(incidentDate),
        actionsTaken: actionsTaken || null,
        status: status || 'PENDING',
        hearingDate: hearingDate ? new Date(hearingDate) : null,
        attachments,
        createdBy: req.user!.id
      },
      include: {
        complainant: true,
        respondent: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'INCIDENT',
      incident.id,
      { action: 'Created incident', incidentNumber },
      req
    );

    res.status(201).json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIncident = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.incidentDate) {
      updateData.incidentDate = new Date(updateData.incidentDate);
    }
    if (updateData.hearingDate) {
      updateData.hearingDate = new Date(updateData.hearingDate);
    }

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const newAttachments = (req.files as Express.Multer.File[]).map(
        file => `/uploads/incidents/${file.filename}`
      );
      const existingIncident = await prisma.incident.findUnique({ where: { id } });
      updateData.attachments = [...(existingIncident?.attachments || []), ...newAttachments];
    }

    const oldIncident = await prisma.incident.findUnique({ where: { id } });
    
    if (!oldIncident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        complainant: true,
        respondent: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'INCIDENT',
      incident.id,
      { 
        action: 'Updated incident',
        changes: { old: oldIncident, new: incident }
      },
      req
    );

    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIncidentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const incident = await prisma.incident.update({
      where: { id },
      data: { status }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE_STATUS',
      'INCIDENT',
      incident.id,
      { action: 'Updated incident status', status },
      req
    );

    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



