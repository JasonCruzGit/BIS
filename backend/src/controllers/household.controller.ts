import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import { generateHouseholdNumber } from '../utils/generateDocumentNumber';

const prisma = new PrismaClient();

export const getHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [households, total] = await Promise.all([
      prisma.household.findMany({
        skip,
        take: parseInt(limit as string),
        include: {
          residents: {
            where: { isArchived: false }
          },
          _count: {
            select: { residents: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.household.count()
    ]);

    res.json({
      households,
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

export const getHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const household = await prisma.household.findUnique({
      where: { id },
      include: {
        residents: {
          where: { isArchived: false }
        }
      }
    });

    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }

    res.json(household);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const {
      headName,
      address,
      latitude,
      longitude,
      income,
      livingConditions,
      householdSize
    } = req.body;

    const householdNumber = generateHouseholdNumber();

    const household = await prisma.household.create({
      data: {
        householdNumber,
        headName,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        income: income ? parseFloat(income) : null,
        livingConditions: livingConditions || null,
        householdSize: householdSize || 1
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'HOUSEHOLD',
      household.id,
      { action: 'Created household', householdNumber },
      req
    );

    res.status(201).json(household);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.income) updateData.income = parseFloat(updateData.income);

    const oldHousehold = await prisma.household.findUnique({ where: { id } });
    
    if (!oldHousehold) {
      return res.status(404).json({ message: 'Household not found' });
    }

    const household = await prisma.household.update({
      where: { id },
      data: updateData,
      include: {
        residents: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'HOUSEHOLD',
      household.id,
      { 
        action: 'Updated household',
        changes: { old: oldHousehold, new: household }
      },
      req
    );

    res.json(household);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.household.delete({
      where: { id }
    });

    await createAuditLog(
      req.user!.id,
      'DELETE',
      'HOUSEHOLD',
      id,
      { action: 'Deleted household' },
      req
    );

    res.json({ message: 'Household deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



