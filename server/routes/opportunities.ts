import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, requireStudentRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/opportunities/jobs - List all active jobs with company info
router.get('/jobs', (_req: Request, res: Response) => {
  try {
    const jobs = db.getAllActiveJobs();
    return res.json({ jobs });
  } catch (err: any) {
    console.error('Error fetching public jobs:', err);
    return res.status(500).json({ error: 'Failed to fetch job opportunities' });
  }
});

// GET /api/opportunities/internships - List all active internships with company info
router.get('/internships', (_req: Request, res: Response) => {
  try {
    const internships = db.getAllActiveInternships();
    return res.json({ internships });
  } catch (err: any) {
    console.error('Error fetching public internships:', err);
    return res.status(500).json({ error: 'Failed to fetch internship opportunities' });
  }
});

// GET /api/opportunities/:type/:id - Details of job or internship
router.get('/:type/:id', (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    if (type === 'job') {
      const job = db.getJobById(id);
      if (!job) return res.status(404).json({ error: 'Job opportunity not found' });
      return res.json({ opportunity: job, type: 'job' });
    } else if (type === 'internship') {
      const internship = db.getInternshipById(id);
      if (!internship) return res.status(404).json({ error: 'Internship opportunity not found' });
      return res.json({ opportunity: internship, type: 'internship' });
    } else {
      return res.status(400).json({ error: 'Invalid opportunity type' });
    }
  } catch (err: any) {
    console.error('Error fetching opportunity detail:', err);
    return res.status(500).json({ error: 'Failed to fetch opportunity details' });
  }
});

// POST /api/opportunities/:type/:id/apply - Apply as student
router.post('/:type/:id/apply', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const { type, id } = req.params;
    const { cover_note } = req.body;

    if (type !== 'job' && type !== 'internship') {
      return res.status(400).json({ error: 'Invalid opportunity type' });
    }

    const result = db.createApplication(studentId, id, type, cover_note);

    return res.status(result.isNew ? 201 : 200).json({
      message: result.isNew ? 'Application submitted successfully!' : 'You have already applied for this position.',
      application: result.application,
      isNew: result.isNew
    });
  } catch (err: any) {
    console.error('Error applying for opportunity:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit application' });
  }
});

// GET /api/opportunities/my-applications - Student's application history
router.get('/student/my-applications', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const applications = db.getStudentApplications(studentId);
    return res.json({ applications });
  } catch (err: any) {
    console.error('Error fetching student applications:', err);
    return res.status(500).json({ error: 'Failed to fetch your applications' });
  }
});

// PATCH /api/opportunities/student/applications/:id/evidence - Submit or update completion evidence
router.patch('/student/applications/:id/evidence', authenticateJWT, requireStudentRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const applicationId = req.params.id;
    const {
      completion_date,
      certificate_reference,
      certificate_url,
      portfolio_link,
      completion_notes
    } = req.body;

    const updated = db.updateStudentApplicationEvidence(applicationId, studentId, {
      completion_date,
      certificate_reference,
      certificate_url,
      portfolio_link,
      completion_notes
    });

    if (!updated) {
      return res.status(404).json({ error: 'Application record not found or unauthorized' });
    }

    return res.json({
      message: 'Internship completion evidence saved successfully',
      application: updated
    });
  } catch (err: any) {
    console.error('Error updating application evidence:', err);
    return res.status(500).json({ error: 'Failed to update internship completion evidence' });
  }
});

export default router;
