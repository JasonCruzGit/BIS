import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getResidents = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', archived = 'false' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      isArchived: archived === 'true'
    };

    const [residents, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          household: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.resident.count({ where })
    ]);

    res.json({
      residents,
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

export const getResident = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        household: true,
        documents: {
          orderBy: { issuedDate: 'desc' },
          take: 10
        }
      }
    });

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.json(resident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createResident = async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      dateOfBirth,
      sex,
      civilStatus,
      address,
      contactNo,
      occupation,
      education,
      householdId,
      residencyStatus
    } = req.body;

    const idPhoto = req.file ? `/uploads/residents/${req.file.filename}` : null;

    const resident = await prisma.resident.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        suffix: suffix || null,
        dateOfBirth: new Date(dateOfBirth),
        sex,
        civilStatus,
        address,
        contactNo,
        occupation: occupation || null,
        education: education || null,
        householdId: householdId || null,
        residencyStatus: residencyStatus || 'NEW',
        idPhoto
      },
      include: {
        household: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'RESIDENT',
      resident.id,
      { action: 'Created resident', residentName: `${firstName} ${lastName}` },
      req
    );

    res.status(201).json(resident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateResident = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (req.file) {
      updateData.idPhoto = `/uploads/residents/${req.file.filename}`;
    }

    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const oldResident = await prisma.resident.findUnique({ where: { id } });
    
    if (!oldResident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    const resident = await prisma.resident.update({
      where: { id },
      data: updateData,
      include: {
        household: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'RESIDENT',
      resident.id,
      { 
        action: 'Updated resident',
        changes: { old: oldResident, new: resident }
      },
      req
    );

    res.json(resident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const archiveResident = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resident = await prisma.resident.update({
      where: { id },
      data: { isArchived: true }
    });

    await createAuditLog(
      req.user!.id,
      'ARCHIVE',
      'RESIDENT',
      resident.id,
      { action: 'Archived resident' },
      req
    );

    res.json({ message: 'Resident archived successfully', resident });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchResidents = async (req: AuthRequest, res: Response) => {
  try {
    const { q, householdNumber } = req.query;

    if (!q && !householdNumber) {
      return res.status(400).json({ message: 'Search query or household number is required' });
    }

    const where: any = {
      isArchived: false
    };

    if (q) {
      where.OR = [
        { firstName: { contains: q as string, mode: 'insensitive' } },
        { lastName: { contains: q as string, mode: 'insensitive' } },
        { middleName: { contains: q as string, mode: 'insensitive' } },
        { address: { contains: q as string, mode: 'insensitive' } }
      ];
    }

    if (householdNumber) {
      where.household = {
        householdNumber: householdNumber as string
      };
    }

    const residents = await prisma.resident.findMany({
      where,
      include: {
        household: true
      },
      take: 50
    });

    res.json(residents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



