import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface ResidentRequest extends Request {
  residentId?: string;
}

export const authenticateResident = async (
  req: ResidentRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'resident') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    req.residentId = decoded.residentId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

