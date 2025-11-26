import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

export const getDisasters = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;

    const [disasters, total] = await Promise.all([
      prisma.disaster.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          _count: {
            select: { beneficiaries: true }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.disaster.count({ where })
    ]);

    res.json({
      disasters,
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

export const getDisaster = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const disaster = await prisma.disaster.findUnique({
      where: { id },
      include: {
        beneficiaries: {
          include: {
            resident: true,
            household: true
          }
        }
      }
    });

    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    res.json(disaster);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDisaster = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      type,
      date,
      description,
      affectedAreas,
      status
    } = req.body;

    const disaster = await prisma.disaster.create({
      data: {
        name,
        type,
        date: new Date(date),
        description,
        affectedAreas: affectedAreas ? JSON.parse(affectedAreas) : [],
        status: status || 'ACTIVE'
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'DISASTER',
      disaster.id,
      { action: 'Created disaster record', name },
      req
    );

    res.status(201).json(disaster);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDisaster = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.affectedAreas) {
      updateData.affectedAreas = typeof updateData.affectedAreas === 'string'
        ? JSON.parse(updateData.affectedAreas)
        : updateData.affectedAreas;
    }

    const oldDisaster = await prisma.disaster.findUnique({ where: { id } });
    
    if (!oldDisaster) {
      return res.status(404).json({ message: 'Disaster not found' });
    }

    const disaster = await prisma.disaster.update({
      where: { id },
      data: updateData
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'DISASTER',
      disaster.id,
      { 
        action: 'Updated disaster',
        changes: { old: oldDisaster, new: disaster }
      },
      req
    );

    res.json(disaster);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDisasterStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const disaster = await prisma.disaster.update({
      where: { id },
      data: { status }
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE_STATUS',
      'DISASTER',
      disaster.id,
      { action: 'Updated disaster status', status },
      req
    );

    res.json(disaster);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addBeneficiary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      residentId,
      householdId,
      reliefType,
      quantity,
      notes
    } = req.body;

    if (!residentId && !householdId) {
      return res.status(400).json({ message: 'Either residentId or householdId is required' });
    }

    const beneficiary = await prisma.disasterBeneficiary.create({
      data: {
        disasterId: id,
        residentId: residentId || null,
        householdId: householdId || null,
        reliefType,
        quantity: parseInt(quantity),
        notes: notes || null
      },
      include: {
        resident: true,
        household: true
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'DISASTER_BENEFICIARY',
      beneficiary.id,
      { action: 'Added disaster beneficiary', disasterId: id },
      req
    );

    res.status(201).json(beneficiary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBeneficiaries = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const beneficiaries = await prisma.disasterBeneficiary.findMany({
      where: { disasterId: id },
      include: {
        resident: true,
        household: true
      },
      orderBy: { dateDistributed: 'desc' }
    });

    res.json(beneficiaries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportBeneficiaryList = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { format = 'xlsx' } = req.query;

    const beneficiaries = await prisma.disasterBeneficiary.findMany({
      where: { disasterId: id },
      include: {
        resident: true,
        household: true,
        disaster: true
      },
      orderBy: { dateDistributed: 'desc' }
    });

    if (format === 'xlsx') {
      const data = beneficiaries.map((ben: typeof beneficiaries[number]) => ({
        'Date Distributed': ben.dateDistributed.toLocaleDateString(),
        'Resident': ben.resident ? `${ben.resident.firstName} ${ben.resident.lastName}` : '',
        'Household': ben.household ? ben.household.headName : '',
        'Relief Type': ben.reliefType,
        'Quantity': ben.quantity,
        'Notes': ben.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficiaries');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=beneficiaries-${Date.now()}.xlsx`);
      res.send(buffer);
    } else {
      res.json(beneficiaries);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



