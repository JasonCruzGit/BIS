import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, createAuditLog } from '../middleware/auth.middleware';
import { generateDocumentNumber } from '../utils/generateDocumentNumber';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Get all document requests (for admin)
export const getAllDocumentRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { requestNumber: { contains: search as string, mode: 'insensitive' } },
        { resident: {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } }
          ]
        } }
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.documentRequest.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address: true,
              contactNo: true,
            },
          },
          processor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          document: {
            select: {
              id: true,
              documentNumber: true,
              filePath: true,
            },
          },
        },
      }),
      prisma.documentRequest.count({ where }),
    ]);

    res.json({
      requests,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error('Error in getAllDocumentRequests:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Get all resident complaints (incidents submitted via portal)
export const getAllResidentComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      // Filter incidents that contain [COMPLAINT/REQUEST] in narrative
      narrative: { contains: '[COMPLAINT/REQUEST]', mode: 'insensitive' },
    };
    
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { incidentNumber: { contains: search as string, mode: 'insensitive' } },
        { narrative: { contains: search as string, mode: 'insensitive' } },
        { complainant: {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } }
          ]
        } }
      ];
    }

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
              address: true,
              contactNo: true,
            },
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { incidentDate: 'desc' },
      }),
      prisma.incident.count({ where }),
    ]);

    res.json({
      complaints: incidents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error('Error in getAllResidentComplaints:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Update document request status
export const updateDocumentRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, rejectedReason, fee } = req.body;
    const userId = req.user?.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Get the request first to check if document already exists
    const existingRequest = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        document: true,
        resident: true,
      },
    });

    if (!existingRequest) {
      return res.status(404).json({ message: 'Document request not found' });
    }

    const updateData: any = {
      status,
      processedBy: userId,
      processedAt: new Date(),
    };

    if (notes) updateData.notes = notes;
    if (rejectedReason) updateData.rejectedReason = rejectedReason;
    if (fee !== undefined) updateData.fee = fee;

    // If status is APPROVED or COMPLETED, ensure document exists and has PDF
    if (status === 'APPROVED' || status === 'COMPLETED') {
      let document = existingRequest.document;
      let issuer: { firstName: string; lastName: string } | null = null;
      
      // Create document if it doesn't exist
      if (!document) {
        const documentNumber = generateDocumentNumber(existingRequest.documentType);
        
        // Get issuer information for PDF
        issuer = await prisma.user.findUnique({
          where: { id: userId! },
          select: {
            firstName: true,
            lastName: true,
          },
        });

        if (!issuer) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Create document record
        document = await prisma.document.create({
          data: {
            documentNumber,
            documentType: existingRequest.documentType,
            residentId: existingRequest.residentId,
            issuedBy: userId!,
            issuedDate: new Date(),
            purpose: existingRequest.purpose || null,
            requestId: id, // Link document to request
          },
          include: {
            resident: true,
          },
        });
      }

      // Generate PDF if document doesn't have a filePath
      if (!document.filePath) {
        try {
          // Get issuer information if not already available
          if (!issuer) {
            issuer = await prisma.user.findUnique({
              where: { id: userId! },
              select: {
                firstName: true,
                lastName: true,
              },
            });
            if (!issuer) {
              throw new Error('User not found');
            }
          }

          const outputDir = path.join(__dirname, '../../uploads/documents');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          const outputPath = path.join(outputDir, `${document.documentNumber}.pdf`);

          await generateCertificatePDF({
            documentNumber: document.documentNumber,
            documentType: document.documentType,
            residentName: `${existingRequest.resident.firstName} ${existingRequest.resident.lastName}`,
            residentAddress: existingRequest.resident.address,
            purpose: existingRequest.purpose || undefined,
            issuedDate: document.issuedDate,
            issuedBy: `${issuer.firstName} ${issuer.lastName}`,
            template: undefined,
          }, outputPath);

          // Update document with file path
          document = await prisma.document.update({
            where: { id: document.id },
            data: { filePath: `/uploads/documents/${document.documentNumber}.pdf` },
          });
          
          console.log(`✅ PDF generated successfully: /uploads/documents/${document.documentNumber}.pdf`);
        } catch (pdfError: any) {
          console.error('Error generating PDF:', pdfError);
          // Continue even if PDF generation fails - document is still created
        }
      }

      // Create audit log (only if document was just created)
      if (!existingRequest.document) {
        await createAuditLog(
          userId!,
          'CREATE',
          'DOCUMENT',
          document.id,
          { 
            action: 'Document created from request', 
            documentType: existingRequest.documentType, 
            documentNumber: document.documentNumber,
            requestNumber: existingRequest.requestNumber 
          },
          req
        );
      }
    }

    // Update the request
    const request = await prisma.documentRequest.update({
      where: { id },
      data: updateData,
      include: {
        resident: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            contactNo: true,
          },
        },
        processor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        document: {
          select: {
            id: true,
            documentNumber: true,
            filePath: true,
          },
        },
      },
    });

    // Create audit log for request update
    await createAuditLog(
      userId!,
      'UPDATE',
      'DOCUMENT_REQUEST',
      id,
      { 
        action: 'Document request updated', 
        status,
        requestNumber: request.requestNumber 
      },
      req
    );

    res.json({
      message: 'Document request updated successfully',
      request,
    });
  } catch (error: any) {
    console.error('Error in updateDocumentRequest:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

