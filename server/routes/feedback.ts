import { Router, Response } from 'express';
import { db } from '../db.js';
import {
  authenticateJWT,
  requireIndustryRole,
  requireStudentRole,
  requireAdminRole,
  AuthenticatedRequest
} from '../auth.js';

const router = Router();

// All feedback endpoints require valid authentication
router.use(authenticateJWT);

// Ensure req.student is resolved for student roles
router.use((req: AuthenticatedRequest, _res: Response, next) => {
  if (!req.student && req.dbUser && (req.dbUser.role === 'student' || req.user?.role === 'student')) {
    req.student = db.findStudentByUserId(req.dbUser.id) || db.ensureStudentProfileForUser(req.dbUser.id);
  }
  next();
});

// ==========================================
// 1. INDUSTRY FEEDBACK SUBMISSION & MANAGEMENT
// ==========================================

// POST /api/feedback - Create or update mentor feedback (Industry only)
router.post('/', requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const {
      id,
      student_id,
      opportunity_id,
      opportunity_type,
      mentor_name,
      mentor_title,
      mentor_email,
      evaluation_period,
      technical_competence,
      problem_solving,
      communication,
      teamwork_collaboration,
      professionalism_work_ethic,
      learning_ability,
      overall_performance,
      strengths,
      areas_for_improvement,
      mentor_comments,
      hire_recommendation
    } = req.body;

    // Validation
    if (!student_id || !opportunity_id) {
      return res.status(400).json({ error: 'Student ID and Opportunity ID are required.' });
    }

    if (!mentor_name || typeof mentor_name !== 'string' || mentor_name.trim().length === 0) {
      return res.status(400).json({ error: 'Mentor name is required.' });
    }

    if (!evaluation_period || typeof evaluation_period !== 'string' || evaluation_period.trim().length === 0) {
      return res.status(400).json({ error: 'Evaluation period is required (e.g. Summer 2026 Internship).' });
    }

    // Required Rubrics & fields validation
    const numFields = [
      { name: 'Technical Competence', val: technical_competence },
      { name: 'Problem Solving', val: problem_solving },
      { name: 'Communication', val: communication },
      { name: 'Teamwork & Collaboration', val: teamwork_collaboration },
      { name: 'Professionalism / Work Ethic', val: professionalism_work_ethic },
      { name: 'Learning Ability', val: learning_ability },
      { name: 'Overall Performance', val: overall_performance }
    ];

    for (const field of numFields) {
      const val = Number(field.val);
      if (isNaN(val) || val < 1 || val > 5) {
        return res.status(400).json({
          error: `${field.name} rating must be a valid number between 1 and 5.`
        });
      }
    }

    if (!strengths || typeof strengths !== 'string' || strengths.trim().length < 3) {
      return res.status(400).json({ error: 'Key student strengths description is required.' });
    }

    if (!areas_for_improvement || typeof areas_for_improvement !== 'string' || areas_for_improvement.trim().length < 3) {
      return res.status(400).json({ error: 'Areas for student improvement description is required.' });
    }

    const validRecommendations = ['Recommended', 'Consider', 'Not Recommended'];
    if (hire_recommendation && !validRecommendations.includes(hire_recommendation)) {
      return res.status(400).json({
        error: `Hire recommendation must be one of: ${validRecommendations.join(', ')}`
      });
    }

    const result = db.createOrUpdateMentorFeedback(companyId, {
      id,
      student_id,
      opportunity_id,
      opportunity_type,
      mentor_name,
      mentor_title,
      mentor_email,
      evaluation_period,
      technical_competence: Number(technical_competence),
      problem_solving: Number(problem_solving),
      communication: Number(communication),
      teamwork_collaboration: Number(teamwork_collaboration),
      professionalism_work_ethic: Number(professionalism_work_ethic),
      learning_ability: Number(learning_ability),
      overall_performance: Number(overall_performance),
      strengths,
      areas_for_improvement,
      mentor_comments: mentor_comments || '',
      hire_recommendation: hire_recommendation || 'Recommended'
    });

    return res.status(result.isNew ? 201 : 200).json({
      message: result.isNew ? 'Mentor evaluation successfully submitted' : 'Mentor evaluation updated',
      feedback: result.feedback,
      isNew: result.isNew
    });
  } catch (err: any) {
    console.error('Error submitting mentor feedback:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit mentor evaluation' });
  }
});

// GET /api/feedback/pending - List candidates pending evaluation for company (Industry only)
router.get('/pending', requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const data = db.getCompanyPendingEvaluations(companyId);
    return res.json(data);
  } catch (err: any) {
    console.error('Error fetching company pending evaluations:', err);
    return res.status(500).json({ error: 'Failed to load pending evaluations' });
  }
});

// GET /api/feedback/company - Get all completed evaluations for company (Industry only)
router.get('/company', requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const feedbacks = db.getCompanyMentorFeedbacks(companyId);
    const data = db.getCompanyPendingEvaluations(companyId);
    return res.json({
      feedbacks,
      stats: data.stats
    });
  } catch (err: any) {
    console.error('Error fetching company evaluations:', err);
    return res.status(500).json({ error: 'Failed to load company evaluations' });
  }
});

// ==========================================
// 2. STUDENT FEEDBACK VIEW
// ==========================================

// GET /api/feedback/student - Get evaluations for authenticated student (Student only)
router.get('/student', requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const summary = db.getStudentFeedbackSummary(studentId);
    return res.json(summary);
  } catch (err: any) {
    console.error('Error fetching student evaluations:', err);
    return res.status(500).json({ error: 'Failed to load student evaluations' });
  }
});

// GET /api/feedback/student/:studentId - Get evaluations for specific student (Student itself, College Admin, or Industry Recruiter)
router.get('/student/:studentId', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetStudentId = req.params.studentId;
    const isOwner = req.student?.id === targetStudentId || req.dbUser?.id === targetStudentId;
    const isAdmin = req.dbUser?.role === 'admin' || req.user?.role === 'admin';
    const isIndustry = req.dbUser?.role === 'industry' || req.user?.role === 'industry';

    if (!isOwner && !isAdmin && !isIndustry) {
      return res.status(403).json({ error: 'Unauthorized to view feedback for this candidate.' });
    }

    const summary = db.getStudentFeedbackSummary(targetStudentId);
    return res.json(summary);
  } catch (err: any) {
    console.error('Error fetching student feedback by ID:', err);
    return res.status(500).json({ error: 'Failed to load student feedback' });
  }
});

// ==========================================
// 3. COLLEGE ADMIN ANALYTICS
// ==========================================

// GET /api/feedback/college/analytics - Institutional mentor feedback analytics (College Admin only)
router.get('/college/analytics', requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = db.getCollegeMentorFeedbackAnalytics();
    return res.json({
      success: true,
      data: analytics
    });
  } catch (err: any) {
    console.error('Error fetching college mentor feedback analytics:', err);
    return res.status(500).json({ error: 'Failed to load college mentor feedback analytics' });
  }
});

// ==========================================
// 4. INDIVIDUAL FEEDBACK RECORD ACTIONS
// ==========================================

// GET /api/feedback/:id - Get single evaluation record
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const feedback = db.getMentorFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Mentor evaluation record not found' });
    }

    const isStudentRecipient = req.student?.id === feedback.student_id;
    const isCompanyAuthor = req.company?.id === feedback.company_id;
    const isAdmin = req.dbUser?.role === 'admin' || req.user?.role === 'admin';

    if (!isStudentRecipient && !isCompanyAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to access this evaluation record' });
    }

    return res.json(feedback);
  } catch (err: any) {
    console.error('Error fetching evaluation record:', err);
    return res.status(500).json({ error: 'Failed to load evaluation details' });
  }
});

// PUT /api/feedback/:id - Update existing evaluation (Industry author only)
router.put('/:id', requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const feedbackId = req.params.id;

    const existing = db.getMentorFeedbackById(feedbackId);
    if (!existing) {
      return res.status(404).json({ error: 'Mentor evaluation not found' });
    }

    if (existing.company_id !== companyId) {
      return res.status(403).json({ error: 'Unauthorized: You can only edit evaluations created by your company' });
    }

    const result = db.createOrUpdateMentorFeedback(companyId, {
      ...req.body,
      id: feedbackId,
      student_id: existing.student_id,
      opportunity_id: existing.opportunity_id,
      opportunity_type: existing.opportunity_type
    });

    return res.json({
      message: 'Mentor evaluation updated successfully',
      feedback: result.feedback
    });
  } catch (err: any) {
    console.error('Error updating evaluation:', err);
    return res.status(400).json({ error: err.message || 'Failed to update evaluation' });
  }
});

// DELETE /api/feedback/:id - Delete evaluation (Industry author only)
router.delete('/:id', requireIndustryRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const feedbackId = req.params.id;

    const deleted = db.deleteMentorFeedback(feedbackId, companyId);
    if (!deleted) {
      return res.status(404).json({ error: 'Mentor evaluation not found or unauthorized to delete' });
    }

    return res.json({ message: 'Mentor evaluation removed successfully' });
  } catch (err: any) {
    console.error('Error deleting evaluation:', err);
    return res.status(500).json({ error: 'Failed to delete evaluation' });
  }
});

export default router;
