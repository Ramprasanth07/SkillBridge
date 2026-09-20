import { Router, Response } from 'express';
import { authenticateJWT, requireAdminRole, AuthenticatedRequest } from '../auth.js';
import { CollegeAdminEngine } from '../collegeAdminEngine.js';

const router = Router();

// Protect all college routes with JWT and Admin Role check
router.use(authenticateJWT);
router.use(requireAdminRole);

/**
 * GET /api/college/dashboard
 * Institutional overview KPI metrics, department and batch summaries, placement funnel
 */
router.get('/dashboard', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = CollegeAdminEngine.getDashboardStats();
    return res.json({ success: true, data: stats });
  } catch (err: any) {
    console.error('Error fetching college dashboard stats:', err);
    return res.status(500).json({ error: 'Failed to retrieve institutional dashboard statistics.' });
  }
});

/**
 * GET /api/college/students
 * Enriched student readiness roster with multi-filter and search support
 */
router.get('/students', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const roster = CollegeAdminEngine.getEnrichedStudentRoster();
    return res.json({ success: true, count: roster.length, data: roster });
  } catch (err: any) {
    console.error('Error fetching student roster:', err);
    return res.status(500).json({ error: 'Failed to retrieve student readiness roster.' });
  }
});

/**
 * GET /api/college/students/:id
 * Complete student academic, assessment, skill gap, roadmap, project & placement dossier
 */
router.get('/students/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const dossier = CollegeAdminEngine.getStudentDossier(req.params.id);
    if (!dossier) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    return res.json({ success: true, data: dossier });
  } catch (err: any) {
    console.error('Error fetching student dossier:', err);
    return res.status(500).json({ error: 'Failed to retrieve student dossier.' });
  }
});

/**
 * GET /api/college/departments
 * Department-level analytics, CGPA, assessment rates, placement rates
 */
router.get('/departments', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = CollegeAdminEngine.getDepartmentAnalytics();
    return res.json({ success: true, data: departments });
  } catch (err: any) {
    console.error('Error fetching department analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve department analytics.' });
  }
});

/**
 * GET /api/college/batches
 * Batch / Year-level analytics and student distribution
 */
router.get('/batches', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const batches = CollegeAdminEngine.getBatchAnalytics();
    return res.json({ success: true, data: batches });
  } catch (err: any) {
    console.error('Error fetching batch analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve batch analytics.' });
  }
});

/**
 * GET /api/college/assessments
 * Institutional assessment analytics, test breakdown, score distributions
 */
router.get('/assessments', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const assessments = CollegeAdminEngine.getAssessmentAnalytics();
    return res.json({ success: true, data: assessments });
  } catch (err: any) {
    console.error('Error fetching assessment analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve assessment analytics.' });
  }
});

/**
 * GET /api/college/readiness
 * Institutional skill readiness, market demand, and skill gap comparison
 */
router.get('/readiness', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const readiness = CollegeAdminEngine.getSkillReadinessAnalytics();
    return res.json({ success: true, data: readiness });
  } catch (err: any) {
    console.error('Error fetching skill readiness analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve skill readiness analytics.' });
  }
});

/**
 * GET /api/college/placements
 * Placement conversion, funnel, applications, and recruiter hiring metrics
 */
router.get('/placements', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const placements = CollegeAdminEngine.getPlacementAnalytics();
    return res.json({ success: true, data: placements });
  } catch (err: any) {
    console.error('Error fetching placement analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve placement analytics.' });
  }
});

/**
 * GET /api/college/industry
 * Corporate partners directory, active postings, and recruiter engagement
 */
router.get('/industry', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const industry = CollegeAdminEngine.getIndustryEngagementAnalytics();
    return res.json({ success: true, data: industry });
  } catch (err: any) {
    console.error('Error fetching industry engagement analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve industry engagement analytics.' });
  }
});

/**
 * GET /api/college/reports/:reportType
 * Exportable institutional summary and tabular report data
 */
router.get('/reports/:reportType', (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = CollegeAdminEngine.generateInstitutionalReport(req.params.reportType);
    return res.json({ success: true, data: report });
  } catch (err: any) {
    console.error('Error generating institutional report:', err);
    return res.status(500).json({ error: 'Failed to generate institutional report.' });
  }
});

export default router;
