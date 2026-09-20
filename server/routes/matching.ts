import { Router, Request, Response } from 'express';
import { db, JobRecord, InternshipRecord } from '../db.js';
import { authenticateJWT, requireStudentRole, requireIndustryRole, AuthenticatedRequest } from '../auth.js';
import { MatchingEngine, OpportunityMatchResult } from '../matchingEngine.js';

const router = Router();

// GET /api/matching/opportunities - Get active opportunities with real calculated match scores
router.get('/opportunities', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const activeJobs = db.getAllActiveJobs();
    const activeInternships = db.getAllActiveInternships();
    const studentApps = db.getStudentApplications(studentId);

    const appliedMap = new Map<string, { id: string; status: string; applied_at: string; match_score?: number }>();
    for (const app of studentApps) {
      appliedMap.set(app.opportunity_id, {
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        match_score: app.match_score
      });
    }

    // Process jobs
    const matchedJobs = activeJobs.map(job => {
      const matchResult = MatchingEngine.evaluateStudentFit(studentId, {
        ...job,
        type: 'job' as const
      });

      const appInfo = appliedMap.get(job.id);

      return {
        id: job.id,
        type: 'job' as const,
        opportunity: job,
        match: matchResult,
        match_score: matchResult?.overall_match_percentage ?? 0,
        match_tier: matchResult?.match_tier ?? 'Developing Match',
        has_applied: !!appInfo,
        application: appInfo || null
      };
    });

    // Process internships
    const matchedInternships = activeInternships.map(internship => {
      const matchResult = MatchingEngine.evaluateStudentFit(studentId, {
        ...internship,
        type: 'internship' as const
      });

      const appInfo = appliedMap.get(internship.id);

      return {
        id: internship.id,
        type: 'internship' as const,
        opportunity: internship,
        match: matchResult,
        match_score: matchResult?.overall_match_percentage ?? 0,
        match_tier: matchResult?.match_tier ?? 'Developing Match',
        has_applied: !!appInfo,
        application: appInfo || null
      };
    });

    const allOpportunities = [...matchedJobs, ...matchedInternships];

    return res.json({
      opportunities: allOpportunities,
      total_count: allOpportunities.length,
      jobs_count: matchedJobs.length,
      internships_count: matchedInternships.length,
      applied_count: studentApps.length
    });
  } catch (err: any) {
    console.error('Error fetching matched opportunities:', err);
    return res.status(500).json({ error: 'Failed to evaluate matched opportunities' });
  }
});

// GET /api/matching/recommended - Top 3 recommended opportunities for Student Dashboard
router.get('/recommended', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const activeJobs = db.getAllActiveJobs();
    const activeInternships = db.getAllActiveInternships();
    const studentApps = db.getStudentApplications(studentId);
    const appliedIds = new Set(studentApps.map(a => a.opportunity_id));

    const combined: Array<{
      id: string;
      type: 'job' | 'internship';
      opportunity: any;
      match: OpportunityMatchResult | null;
      match_score: number;
      has_applied: boolean;
    }> = [];

    for (const job of activeJobs) {
      const match = MatchingEngine.evaluateStudentFit(studentId, { ...job, type: 'job' });
      combined.push({
        id: job.id,
        type: 'job',
        opportunity: job,
        match,
        match_score: match?.overall_match_percentage || 0,
        has_applied: appliedIds.has(job.id)
      });
    }

    for (const intern of activeInternships) {
      const match = MatchingEngine.evaluateStudentFit(studentId, { ...intern, type: 'internship' });
      combined.push({
        id: intern.id,
        type: 'internship',
        opportunity: intern,
        match,
        match_score: match?.overall_match_percentage || 0,
        has_applied: appliedIds.has(intern.id)
      });
    }

    // Sort by match_score descending
    const recommended = combined
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 3);

    return res.json({
      recommended,
      stats: {
        total_applied: studentApps.length,
        shortlisted: studentApps.filter(a => a.status === 'Shortlisted').length,
        selected: studentApps.filter(a => a.status === 'Selected').length
      }
    });
  } catch (err: any) {
    console.error('Error fetching recommended opportunities:', err);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// GET /api/matching/opportunities/:type/:id - Opportunity Detail + In-depth Match Analysis
router.get('/opportunities/:type/:id', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const { type, id } = req.params;

    let oppRecord: any = null;
    if (type === 'job') {
      oppRecord = db.getJobById(id);
    } else if (type === 'internship') {
      oppRecord = db.getInternshipById(id);
    } else {
      return res.status(400).json({ error: 'Invalid opportunity type' });
    }

    if (!oppRecord) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const matchAnalysis = MatchingEngine.evaluateStudentFit(studentId, {
      ...oppRecord,
      type: type as 'job' | 'internship'
    });

    const studentApps = db.getStudentApplications(studentId);
    const existingApp = studentApps.find(a => a.opportunity_id === id);

    return res.json({
      opportunity: oppRecord,
      type,
      match: matchAnalysis,
      application: existingApp || null,
      has_applied: !!existingApp
    });
  } catch (err: any) {
    console.error('Error fetching opportunity match analysis:', err);
    return res.status(500).json({ error: 'Failed to fetch opportunity match analysis' });
  }
});

// POST /api/matching/apply - Smart Apply with snapshot match calculation and verified data locking
router.post('/apply', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const { opportunity_id, opportunity_type, cover_note } = req.body;

    if (!opportunity_id || !opportunity_type) {
      return res.status(400).json({ error: 'Opportunity ID and type are required' });
    }

    let opportunity: any = null;
    if (opportunity_type === 'job') {
      opportunity = db.getJobById(opportunity_id);
    } else if (opportunity_type === 'internship') {
      opportunity = db.getInternshipById(opportunity_id);
    } else {
      return res.status(400).json({ error: 'Invalid opportunity type' });
    }

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Calculate frozen match score at application time
    const matchResult = MatchingEngine.evaluateStudentFit(studentId, {
      ...opportunity,
      type: opportunity_type as 'job' | 'internship'
    });

    const matchScore = matchResult ? matchResult.overall_match_percentage : 0;

    const result = db.createApplication(
      studentId,
      opportunity_id,
      opportunity_type,
      cover_note,
      matchScore,
      matchResult
    );

    return res.status(result.isNew ? 201 : 200).json({
      message: result.isNew ? 'Application successfully submitted!' : 'You have already submitted an application for this position.',
      application: result.application,
      match: matchResult,
      isNew: result.isNew
    });
  } catch (err: any) {
    console.error('Error in smart apply:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit application' });
  }
});

// GET /api/matching/applications - Student application tracker with historical match score and timeline
router.get('/applications', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const applications = db.getStudentApplications(studentId);
    return res.json({ applications });
  } catch (err: any) {
    console.error('Error fetching student applications:', err);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/matching/industry/applicant-dossier/:applicationId - Recruiter full match dossier
router.get('/industry/applicant-dossier/:applicationId', authenticateJWT, requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const app = db.getApplicationById(applicationId);

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (app.company_id !== req.company!.id) {
      return res.status(403).json({ error: 'Unauthorized to view this application' });
    }

    const studentProfile = db.getStudentFullProfileForEmployer(app.student_id);
    let oppRecord: any = null;
    if (app.opportunity_type === 'job') {
      oppRecord = db.getJobById(app.opportunity_id);
    } else {
      oppRecord = db.getInternshipById(app.opportunity_id);
    }

    let matchAnalysis = app.match_breakdown;
    if (!matchAnalysis && oppRecord) {
      matchAnalysis = MatchingEngine.evaluateStudentFit(app.student_id, {
        ...oppRecord,
        type: app.opportunity_type
      });
    }

    return res.json({
      application: app,
      student: studentProfile,
      opportunity: oppRecord,
      match_analysis: matchAnalysis
    });
  } catch (err: any) {
    console.error('Error fetching applicant dossier for industry:', err);
    return res.status(500).json({ error: 'Failed to fetch candidate dossier' });
  }
});

export default router;
