import { Router, Response } from 'express';
import {
  authenticateJWT,
  requireAdminRole,
  requireIndustryRole,
  requireStudentRole,
  AuthenticatedRequest
} from '../auth.js';
import { AnalyticsEngine, AnalyticsFilterOptions } from '../analyticsEngine.js';
import { db } from '../db.js';

const router = Router();

/**
 * Helper to extract query filter options
 */
function extractFilters(req: AuthenticatedRequest): AnalyticsFilterOptions {
  return {
    dateRange: req.query.dateRange as string | undefined,
    department: req.query.department as string | undefined,
    batch: req.query.batch as string | undefined,
    search: req.query.search as string | undefined
  };
}

// ==========================================
// COLLEGE ADMIN ENDPOINTS
// ==========================================

/**
 * 1. GET /api/analytics/executive
 * High-level institutional KPIs, conversion rates, readiness distribution, highlights
 */
router.get('/executive', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getExecutiveKpis(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute executive KPIs.' });
  }
});

/**
 * 2. GET /api/analytics/skills
 * Industry demand vs student skill supply comparison
 */
router.get('/skills', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getSkillDemandSupplyAnalytics(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute skill demand/supply analytics.' });
  }
});

/**
 * 3. GET /api/analytics/assessments
 * Standardized Phase 2 technical test pass rates, score distribution, and tracks
 */
router.get('/assessments', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getAssessmentAnalytics(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute assessment analytics.' });
  }
});

/**
 * 4. GET /api/analytics/skill-gaps
 * Phase 3 Skill Gap analytics across 4 key roles
 */
router.get('/skill-gaps', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getSkillGapAnalytics(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute skill gap analytics.' });
  }
});

/**
 * 5. GET /api/analytics/roadmap
 * Phase 4 Learning Roadmap progression & capstone completion metrics
 */
router.get('/roadmap', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getRoadmapAnalytics(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute roadmap analytics.' });
  }
});

/**
 * 6. GET /api/analytics/placements
 * Recruitment and placement funnel throughput
 */
router.get('/placements', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getPlacementAnalytics(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute placement analytics.' });
  }
});

/**
 * 7. GET /api/analytics/industry
 * Industry engagement and partner directory
 */
router.get('/industry', authenticateJWT, requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = AnalyticsEngine.getIndustryEngagementAnalytics();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute industry engagement analytics.' });
  }
});

/**
 * 8. GET /api/analytics/feedback
 * Phase 8 Industry Mentor Feedback Rubric & ratings
 */
router.get('/feedback', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = extractFilters(req);
    const data = AnalyticsEngine.getMentorFeedbackAnalytics(filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute mentor feedback analytics.' });
  }
});

/**
 * 9. GET /api/analytics/departments
 * Department benchmark matrix
 */
router.get('/departments', authenticateJWT, requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = AnalyticsEngine.getDepartmentBenchmarkMatrix();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute department benchmarks.' });
  }
});

/**
 * 10. GET /api/analytics/batches
 * Batch benchmark matrix
 */
router.get('/batches', authenticateJWT, requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = AnalyticsEngine.getBatchBenchmarkMatrix();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute batch benchmarks.' });
  }
});

/**
 * 11. GET /api/analytics/top-performers
 * College Admin Leaderboard ranked by Composite Index
 */
router.get('/top-performers', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const department = req.query.department as string | undefined;
    const batch = req.query.batch as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as any;

    const data = AnalyticsEngine.getTopPerformersLeaderboard({ department, batch, search, sortBy });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch top performers leaderboard.' });
  }
});

/**
 * 12. GET /api/analytics/reports/:reportType
 * Formal executive reports generation (institutional, student_readiness, skill_demand_gap, etc.)
 */
router.get('/reports/:reportType', authenticateJWT, requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportType = req.params.reportType;
    const filters = extractFilters(req);
    const data = AnalyticsEngine.generateExecutiveReport(reportType, filters);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to generate executive report.' });
  }
});

// ==========================================
// ROLE-PROTECTED RADAR & PERSONAL ANALYTICS
// ==========================================

/**
 * GET /api/analytics/student/me
 * Student accessing their own competency radar and roadmap status
 */
router.get('/student/me', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.student) {
      return res.status(404).json({ success: false, error: 'Student record not found.' });
    }

    const radar = AnalyticsEngine.getStudentCompetencyRadar(req.student.id);
    const roadmap = AnalyticsEngine.calculateStudentRoadmapProgress(req.student.id);

    res.json({
      success: true,
      data: {
        radar,
        roadmap
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch personal analytics.' });
  }
});

/**
 * 13. GET /api/analytics/student/:id
 * Student competency radar & 5-axis dimensional breakdown
 * Role Protection:
 * - Admin: Allowed for any student.
 * - Student: Allowed only if :id matches their student record id.
 * - Industry: Allowed only if candidate has applied to their company.
 */
router.get('/student/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.id;
    const userRole = req.dbUser?.role || req.user?.role;

    if (userRole === 'admin') {
      // Allowed
    } else if (userRole === 'student') {
      if (req.student?.id !== studentId) {
        return res.status(403).json({ success: false, error: 'Access denied: Students may only view their own competency analytics.' });
      }
    } else if (userRole === 'industry') {
      if (!req.company) {
        return res.status(403).json({ success: false, error: 'Access denied: Company profile required.' });
      }
      // Check if candidate has applied to this company
      const rawApps = db.getRawData().applications;
      const hasApplication = rawApps.some(a => a.company_id === req.company?.id && a.student_id === studentId);
      if (!hasApplication) {
        return res.status(403).json({
          success: false,
          error: 'Access restricted: Student competency data is only accessible for candidates with an active application to your company.'
        });
      }
    } else {
      return res.status(403).json({ success: false, error: 'Access denied: Unauthorized role.' });
    }

    const radar = AnalyticsEngine.getStudentCompetencyRadar(studentId);
    if (!radar) {
      return res.status(404).json({ success: false, error: 'Student record not found.' });
    }

    const roadmap = AnalyticsEngine.calculateStudentRoadmapProgress(studentId);

    res.json({
      success: true,
      data: {
        radar,
        roadmap
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute student competency radar.' });
  }
});

// ==========================================
// INDUSTRY / EMPLOYER ANALYTICS
// ==========================================

/**
 * 14. GET /api/analytics/company
 * Company-specific recruitment analytics & funnel
 */
router.get('/company', authenticateJWT, requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.company) {
      return res.status(404).json({ success: false, error: 'Company record not found.' });
    }

    const data = AnalyticsEngine.getCompanyAnalytics(req.company.id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Company analytics unavailable.' });
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to compute company analytics.' });
  }
});

export default router;
