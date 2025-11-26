import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getOfficials = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', isActive, search, position } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (position) {
      where.position = { contains: position as string, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { contactNo: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [officials, total] = await Promise.all([
      prisma.official.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          _count: {
            select: { attendance: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.official.count({ where })
    ]);

    res.json({
      officials,
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

export const getOfficial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const official = await prisma.official.findUnique({
      where: { id },
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!official) {
      return res.status(404).json({ message: 'Official not found' });
    }

    res.json(official);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createOfficial = async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      position,
      termStart,
      termEnd,
      contactNo,
      email
    } = req.body;

    // Handle photo and document uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.photo?.[0];
    const photo = photoFile ? `/uploads/officials/${photoFile.filename}` : null;
    
    const documentFiles = files?.documents
      ? files.documents.map(file => `/uploads/officials/${file.filename}`)
      : [];

    const official = await prisma.official.create({
      data: {
        firstName,
        lastName,
        position,
        termStart: new Date(termStart),
        termEnd: termEnd ? new Date(termEnd) : null,
        contactNo,
        email: email || null,
        photo,
        documents: documentFiles
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'OFFICIAL',
      official.id,
      { action: 'Created official', name: `${firstName} ${lastName}` },
      req
    );

    res.status(201).json(official);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOfficial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    const existingOfficial = await prisma.official.findUnique({ where: { id } });
    
    if (!existingOfficial) {
      return res.status(404).json({ message: 'Official not found' });
    }

    // Handle photo and document uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.photo?.[0];
    if (photoFile) {
      updateData.photo = `/uploads/officials/${photoFile.filename}`;
    }

    const newDocuments = files?.documents
      ? files.documents.map(file => `/uploads/officials/${file.filename}`)
      : [];
    
    if (newDocuments.length > 0) {
      updateData.documents = [...(existingOfficial.documents || []), ...newDocuments];
    }

    if (updateData.termStart) updateData.termStart = new Date(updateData.termStart);
    if (updateData.termEnd) updateData.termEnd = new Date(updateData.termEnd);

    const oldOfficial = existingOfficial;

    const official = await prisma.official.update({
      where: { id },
      data: updateData
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'OFFICIAL',
      official.id,
      { 
        action: 'Updated official',
        changes: { old: oldOfficial, new: official }
      },
      req
    );

    res.json(official);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOfficial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.official.delete({
      where: { id }
    });

    await createAuditLog(
      req.user!.id,
      'DELETE',
      'OFFICIAL',
      id,
      { action: 'Deleted official' },
      req
    );

    res.json({ message: 'Official deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const recordAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, timeIn, timeOut, remarks } = req.body;

    const attendance = await prisma.attendance.create({
      data: {
        officialId: id,
        date: new Date(date),
        timeIn: timeIn ? new Date(timeIn) : null,
        timeOut: timeOut ? new Date(timeOut) : null,
        remarks: remarks || null
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'ATTENDANCE',
      attendance.id,
      { action: 'Recorded attendance', officialId: id },
      req
    );

    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { officialId: id };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

