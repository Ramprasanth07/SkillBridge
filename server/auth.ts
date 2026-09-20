import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db, UserRecord, StudentRecord, CompanyRecord } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_jwt_super_secret_key_2026';
const SALT_ROUNDS = 10;

export interface TokenPayload {
  userId: string;
  studentId?: string;
  companyId?: string;
  email: string;
  role: 'student' | 'admin' | 'faculty' | 'industry';
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  student?: StudentRecord;
  company?: CompanyRecord;
  dbUser?: UserRecord;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;

    const dbUser = db.findUserById(decoded.userId);
    if (!dbUser) {
      return res.status(401).json({ error: 'User account no longer exists' });
    }
    req.dbUser = dbUser;

    if (dbUser.role === 'student' || decoded.role === 'student') {
      let student = db.findStudentByUserId(decoded.userId);
      if (!student && decoded.studentId) {
        student = db.findStudentById(decoded.studentId);
        if (student && !student.user_id) {
          student.user_id = decoded.userId;
          db.saveDatabase();
        }
      }
      if (!student) {
        student = db.ensureStudentProfileForUser(decoded.userId);
      }
      if (student) {
        req.student = student;
      }
    }

    if (dbUser.role === 'industry' || decoded.role === 'industry') {
      const company = db.findCompanyByUserId(decoded.userId);
      if (company) {
        req.company = company;
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

export function requireIndustryRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'industry' && req.dbUser?.role !== 'industry') {
    return res.status(403).json({ error: 'Access denied: Industry / Employer role required.' });
  }
  if (!req.company) {
    return res.status(404).json({ error: 'Company profile not found for this account.' });
  }
  next();
}

export function requireStudentRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'student' && req.dbUser?.role !== 'student') {
    return res.status(403).json({ error: 'Access denied: Student role required.' });
  }
  if (!req.student) {
    if (req.dbUser?.id) {
      req.student = db.ensureStudentProfileForUser(req.dbUser.id);
    } else if (req.user?.userId) {
      req.student = db.ensureStudentProfileForUser(req.user.userId);
    }
  }
  if (!req.student) {
    return res.status(404).json({ error: 'Student profile associated with this account was not found' });
  }
  next();
}

export function requireAdminRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin' && req.dbUser?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: College Administration role required.' });
  }
  next();
}
