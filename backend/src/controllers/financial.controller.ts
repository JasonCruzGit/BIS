import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import { generateRecordNumber } from '../utils/generateDocumentNumber';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

export const getFinancialRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', type, startDate, endDate, search, category } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }
    
    if (search) {
      where.OR = [
        { recordNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
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
        orderBy: { date: 'desc' }
      }),
      prisma.financialRecord.count({ where })
    ]);

    res.json({
      records,
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

export const getFinancialRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const record = await prisma.financialRecord.findUnique({
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

    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createFinancialRecord = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      category,
      description,
      amount,
      date
    } = req.body;

    const receiptPath = req.file ? `/uploads/financial/${req.file.filename}` : null;
    const recordNumber = generateRecordNumber(type);

    const record = await prisma.financialRecord.create({
      data: {
        recordNumber,
        type,
        category,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        receiptPath,
        createdBy: req.user!.id
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'FINANCIAL',
      record.id,
      { action: 'Created financial record', recordNumber, type },
      req
    );

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFinancialRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (req.file) {
      updateData.receiptPath = `/uploads/financial/${req.file.filename}`;
    }

    if (updateData.amount) updateData.amount = parseFloat(updateData.amount);
    if (updateData.date) updateData.date = new Date(updateData.date);

    const oldRecord = await prisma.financialRecord.findUnique({ where: { id } });
    
    if (!oldRecord) {
      return res.status(404).json({ message: 'Financial record not found' });
    }

    const record = await prisma.financialRecord.update({
      where: { id },
      data: updateData
    });

    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'FINANCIAL',
      record.id,
      { 
        action: 'Updated financial record',
        changes: { old: oldRecord, new: record }
      },
      req
    );

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFinancialRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.financialRecord.delete({
      where: { id }
    });

    await createAuditLog(
      req.user!.id,
      'DELETE',
      'FINANCIAL',
      id,
      { action: 'Deleted financial record' },
      req
    );

    res.json({ message: 'Financial record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;

    const where: any = {};
    if (year || month) {
      where.date = {};
      if (year) {
        const startDate = new Date(parseInt(year as string), 0, 1);
        const endDate = new Date(parseInt(year as string), 11, 31);
        where.date.gte = startDate;
        where.date.lte = endDate;
      }
      if (month) {
        const [y, m] = (month as string).split('-');
        const startDate = new Date(parseInt(y), parseInt(m) - 1, 1);
        const endDate = new Date(parseInt(y), parseInt(m), 0);
        where.date.gte = startDate;
        where.date.lte = endDate;
      }
    }

    const records = await prisma.financialRecord.findMany({
      where,
      select: {
        type: true,
        amount: true
      }
    });

    const summary = {
      totalBudget: 0,
      totalExpenses: 0,
      totalIncome: 0,
      totalAllocations: 0,
      byCategory: {} as Record<string, number>
    };

    records.forEach(record => {
      const amount = Number(record.amount);
      if (record.type === 'BUDGET') summary.totalBudget += amount;
      if (record.type === 'EXPENSE') summary.totalExpenses += amount;
      if (record.type === 'INCOME') summary.totalIncome += amount;
      if (record.type === 'ALLOCATION') summary.totalAllocations += amount;
    });

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportFinancialReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, format = 'xlsx' } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const records = await prisma.financialRecord.findMany({
      where,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    if (format === 'xlsx') {
      const data = records.map(record => ({
        'Record Number': record.recordNumber,
        'Date': record.date.toLocaleDateString(),
        'Type': record.type,
        'Category': record.category,
        'Description': record.description,
        'Amount': Number(record.amount),
        'Created By': `${record.creator.firstName} ${record.creator.lastName}`
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Records');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=financial-report-${Date.now()}.xlsx`);
      res.send(buffer);
    } else {
      res.json(records);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

