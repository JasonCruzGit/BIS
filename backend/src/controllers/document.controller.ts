import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import { generateDocumentNumber } from '../utils/generateDocumentNumber';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const getDocumentTypes = async (req: AuthRequest, res: Response) => {
  res.json({
    types: [
      { value: 'INDIGENCY', label: 'Certificate of Indigency' },
      { value: 'RESIDENCY', label: 'Certificate of Residency' },
      { value: 'CLEARANCE', label: 'Barangay Clearance' },
      { value: 'SOLO_PARENT', label: 'Solo Parent Certificate' },
      { value: 'GOOD_MORAL', label: 'Certificate of Good Moral Character' }
    ]
  });
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', type, residentId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (type) where.documentType = type;
    if (residentId) where.residentId = residentId;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
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
          issuer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { issuedDate: 'desc' }
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      documents,
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

export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        resident: true,
        issuer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const {
      documentType,
      residentId,
      purpose,
      template
    } = req.body;

    const resident = await prisma.resident.findUnique({
      where: { id: residentId }
    });

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    const documentNumber = generateDocumentNumber(documentType);
    const issuedDate = new Date();

    const document = await prisma.document.create({
      data: {
        documentNumber,
        documentType,
        residentId,
        issuedBy: req.user!.id,
        issuedDate,
        purpose: purpose || null,
        template: template || null
      },
      include: {
        resident: true,
        issuer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    await createAuditLog(
      req.user!.id,
      'CREATE',
      'DOCUMENT',
      document.id,
      { action: 'Issued document', documentType, documentNumber },
      req
    );

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateDocumentPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        resident: true,
        issuer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const outputDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${document.documentNumber}.pdf`);

    await generateCertificatePDF({
      documentNumber: document.documentNumber,
      documentType: document.documentType,
      residentName: `${document.resident.firstName} ${document.resident.lastName}`,
      residentAddress: document.resident.address,
      purpose: document.purpose || undefined,
      issuedDate: document.issuedDate,
      issuedBy: `${document.issuer.firstName} ${document.issuer.lastName}`,
      template: document.template || undefined
    }, outputPath);

    // Update document with file path
    await prisma.document.update({
      where: { id },
      data: { filePath: `/uploads/documents/${document.documentNumber}.pdf` }
    });

    res.download(outputPath, `${document.documentNumber}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



