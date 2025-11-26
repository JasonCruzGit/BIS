import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import { generateBlotterNumber } from '../utils/generateDocumentNumber';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

export const getBlotterEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', category, status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { entryNumber: { contains: search as string, mode: 'insensitive' } },
        { narrative: { contains: search as string, mode: 'insensitive' } },
        { resident: { 
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } }
          ]
        } }
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.blotterEntry.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          resident: {
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
      prisma.blotterEntry.count({ where })
    ]);

    res.json({
      entries,
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

export const getBlotterEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await prisma.blotterEntry.findUnique({
      where: { id },
      include: {
        resident: true,
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Blotter entry not found' });
    }

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBlotterEntry = async (req: AuthRequest, res: Response) => {
  try {
    const {
      residentId,
      category,
      narrative,
      incidentDate,
      actionsTaken,
      status
    } = req.body;

    const entryNumber = generateBlotterNumber();

    const entry = await prisma.blotterEntry.create({
      data: {
        entryNumber,
        residentId,
        category,
        narrative,
        incidentDate: new Date(incidentDate),
        actionsTaken: actionsTaken || null,
        status: status || 'OPEN',
        createdBy: req.user!.id
      },
      include: {
        resident: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'BLOTTER',
      entry.id,
      { action: 'Created blotter entry', entryNumber },
      req
    );

    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlotterEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.incidentDate) {
      updateData.incidentDate = new Date(updateData.incidentDate);
    }

    const oldEntry = await prisma.blotterEntry.findUnique({ where: { id } });
    
    if (!oldEntry) {
      return res.status(404).json({ message: 'Blotter entry not found' });
    }

    const entry = await prisma.blotterEntry.update({
      where: { id },
      data: updateData,
      include: {
        resident: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'BLOTTER',
      entry.id,
      { 
        action: 'Updated blotter entry',
        changes: { old: oldEntry, new: entry }
      },
      req
    );

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlotterStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const entry = await prisma.blotterEntry.update({
      where: { id },
      data: { status }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE_STATUS',
      'BLOTTER',
      entry.id,
      { action: 'Updated blotter status', status },
      req
    );

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportBlotterReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, format = 'xlsx' } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.incidentDate = {};
      if (startDate) where.incidentDate.gte = new Date(startDate as string);
      if (endDate) where.incidentDate.lte = new Date(endDate as string);
    }

    const entries = await prisma.blotterEntry.findMany({
      where,
      include: {
        resident: true
      },
      orderBy: { incidentDate: 'desc' }
    });

    if (format === 'xlsx') {
      const data = entries.map(entry => ({
        'Entry Number': entry.entryNumber,
        'Date': entry.incidentDate.toLocaleDateString(),
        'Resident': `${entry.resident.firstName} ${entry.resident.lastName}`,
        'Category': entry.category.replace(/_/g, ' '),
        'Status': entry.status,
        'Narrative': entry.narrative,
        'Actions Taken': entry.actionsTaken || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Blotter Entries');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=blotter-report-${Date.now()}.xlsx`);
      res.send(buffer);
    } else {
      res.json(entries);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

