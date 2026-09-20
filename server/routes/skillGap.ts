import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../auth.js';
import { SkillGapEngine } from '../skillGapEngine.js';

const router = Router();

// All skill gap routes require student authentication
router.use(authenticateJWT);

// Ensure req.student is resolved or auto-created for authenticated student accounts
router.use((req: AuthenticatedRequest, _res: Response, next) => {
  if (!req.student && req.dbUser && (req.dbUser.role === 'student' || req.user?.role === 'student')) {
    req.student = db.findStudentByUserId(req.dbUser.id) || db.ensureStudentProfileForUser(req.dbUser.id);
  }
  next();
});

// GET /api/skill-gap/roles - List all supported industry job roles
router.get('/roles', (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = SkillGapEngine.getAllRoles();
    return res.json({ roles });
  } catch (err: any) {
    console.error('Error fetching job roles:', err);
    return res.status(500).json({ error: 'Failed to retrieve industry job roles' });
  }
});

// GET /api/skill-gap/overview - Compatibility summary across all supported roles for current student
router.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const overview = SkillGapEngine.analyzeAllRolesOverview(student.id);
    return res.json({ overview });
  } catch (err: any) {
    console.error('Error computing skill gap overview:', err);
    return res.status(500).json({ error: 'Failed to compute skill gap overview' });
  }
});

// GET /api/skill-gap/role/:roleId - Detailed skill gap analysis report for a specific job role
router.get('/role/:roleId', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const { roleId } = req.params;
    if (!roleId) {
      return res.status(400).json({ error: 'Job role ID is required' });
    }

    const report = SkillGapEngine.analyzeStudentRoleGap(student.id, roleId);
    if ('error' in report) {
      return res.status(404).json({ error: report.error });
    }

    return res.json({ report });
  } catch (err: any) {
    console.error('Error evaluating role skill gap report:', err);
    return res.status(500).json({ error: 'Failed to generate skill gap report' });
  }
});

export default router;
