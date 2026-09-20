import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, requireIndustryRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Apply auth & industry role guard to all /api/industry routes
router.use(authenticateJWT);
router.use(requireIndustryRole);

// ==========================================
// 1. DASHBOARD & STATS
// ==========================================

// GET /api/industry/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const stats = db.getCompanyDashboardStats(companyId);

    if (!stats) {
      return res.status(404).json({ error: 'Company statistics could not be loaded' });
    }

    return res.json(stats);
  } catch (err: any) {
    console.error('Error fetching industry dashboard:', err);
    return res.status(500).json({ error: 'Failed to load industry dashboard data' });
  }
});

// ==========================================
// 2. COMPANY PROFILE
// ==========================================

// GET /api/industry/profile
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    const company = db.findCompanyById(req.company!.id);
    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    return res.json({ company });
  } catch (err: any) {
    console.error('Error fetching company profile:', err);
    return res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// PUT /api/industry/profile
router.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const {
      company_name,
      description,
      industry,
      website,
      location,
      company_size,
      contact_email,
      contact_phone,
      logo
    } = req.body;

    if (company_name !== undefined && !company_name.trim()) {
      return res.status(400).json({ error: 'Company Name cannot be empty' });
    }
    if (industry !== undefined && !industry.trim()) {
      return res.status(400).json({ error: 'Industry domain cannot be empty' });
    }
    if (location !== undefined && !location.trim()) {
      return res.status(400).json({ error: 'Location cannot be empty' });
    }

    const updated = db.updateCompany(companyId, {
      ...(company_name && { company_name: company_name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(industry && { industry: industry.trim() }),
      ...(website !== undefined && { website: website.trim() }),
      ...(location && { location: location.trim() }),
      ...(company_size && { company_size: company_size.trim() }),
      ...(contact_email && { contact_email: contact_email.trim() }),
      ...(contact_phone !== undefined && { contact_phone: contact_phone.trim() }),
      ...(logo !== undefined && { logo: logo.trim() })
    });

    if (!updated) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({
      message: 'Company profile updated successfully',
      company: updated
    });
  } catch (err: any) {
    console.error('Error updating company profile:', err);
    return res.status(500).json({ error: 'Failed to update company profile' });
  }
});

// ==========================================
// 3. JOB POSTINGS (CRUD)
// ==========================================

// GET /api/industry/jobs
router.get('/jobs', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const jobs = db.getCompanyJobs(companyId);
    return res.json({ jobs });
  } catch (err: any) {
    console.error('Error fetching jobs:', err);
    return res.status(500).json({ error: 'Failed to fetch job postings' });
  }
});

// POST /api/industry/jobs
router.post('/jobs', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const {
      title,
      description,
      employment_type,
      location,
      work_arrangement,
      required_skills,
      min_qualification,
      experience_level,
      application_deadline,
      number_of_openings,
      responsibilities,
      preferred_skills
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Job Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Job Description is required' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Job Location is required' });
    }
    if (!Array.isArray(required_skills) || required_skills.length === 0) {
      return res.status(400).json({ error: 'At least one required skill must be specified' });
    }

    const cleanSkills = required_skills
      .map(s => String(s).trim())
      .filter(s => s.length > 0);

    const cleanResponsibilities = Array.isArray(responsibilities)
      ? responsibilities.map(r => String(r).trim()).filter(r => r.length > 0)
      : [];

    const cleanPreferredSkills = Array.isArray(preferred_skills)
      ? preferred_skills.map(s => String(s).trim()).filter(s => s.length > 0)
      : [];

    const newJob = db.createJob(companyId, {
      title: title.trim(),
      description: description.trim(),
      employment_type: employment_type || 'Full-time',
      location: location.trim(),
      work_arrangement: work_arrangement || 'Hybrid',
      required_skills: cleanSkills,
      min_qualification: min_qualification?.trim() || 'Bachelor’s in Engineering / CS / IT or related',
      experience_level: experience_level?.trim() || '0-1 Years (Entry Level)',
      application_deadline: application_deadline?.trim() || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      number_of_openings: Number(number_of_openings) || 1,
      responsibilities: cleanResponsibilities,
      preferred_skills: cleanPreferredSkills,
      status: 'active'
    });

    return res.status(201).json({
      message: 'Job posting created successfully',
      job: newJob
    });
  } catch (err: any) {
    console.error('Error creating job posting:', err);
    return res.status(500).json({ error: 'Failed to create job posting' });
  }
});

// PUT /api/industry/jobs/:id
router.put('/jobs/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const jobId = req.params.id;
    const {
      title,
      description,
      employment_type,
      location,
      work_arrangement,
      required_skills,
      min_qualification,
      experience_level,
      application_deadline,
      number_of_openings,
      responsibilities,
      preferred_skills,
      status
    } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'Job Title cannot be empty' });
    }

    const updates: any = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (employment_type) updates.employment_type = employment_type;
    if (location) updates.location = location.trim();
    if (work_arrangement) updates.work_arrangement = work_arrangement;
    if (Array.isArray(required_skills)) {
      updates.required_skills = required_skills.map(s => String(s).trim()).filter(s => s.length > 0);
    }
    if (min_qualification !== undefined) updates.min_qualification = min_qualification.trim();
    if (experience_level !== undefined) updates.experience_level = experience_level.trim();
    if (application_deadline !== undefined) updates.application_deadline = application_deadline.trim();
    if (number_of_openings !== undefined) updates.number_of_openings = Number(number_of_openings) || 1;
    if (Array.isArray(responsibilities)) {
      updates.responsibilities = responsibilities.map(r => String(r).trim()).filter(r => r.length > 0);
    }
    if (Array.isArray(preferred_skills)) {
      updates.preferred_skills = preferred_skills.map(s => String(s).trim()).filter(s => s.length > 0);
    }
    if (status && (status === 'active' || status === 'closed')) {
      updates.status = status;
    }

    const updatedJob = db.updateJob(jobId, companyId, updates);
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job posting not found or you do not have permission to edit it' });
    }

    return res.json({
      message: 'Job posting updated successfully',
      job: updatedJob
    });
  } catch (err: any) {
    console.error('Error updating job posting:', err);
    return res.status(500).json({ error: 'Failed to update job posting' });
  }
});

// PATCH /api/industry/jobs/:id/status
router.patch('/jobs/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const jobId = req.params.id;

    const toggled = db.toggleJobStatus(jobId, companyId);
    if (!toggled) {
      return res.status(404).json({ error: 'Job posting not found or unauthorized' });
    }

    return res.json({
      message: `Job status changed to ${toggled.status}`,
      job: toggled
    });
  } catch (err: any) {
    console.error('Error toggling job status:', err);
    return res.status(500).json({ error: 'Failed to toggle job status' });
  }
});

// DELETE /api/industry/jobs/:id
router.delete('/jobs/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const jobId = req.params.id;

    const deleted = db.deleteJob(jobId, companyId);
    if (!deleted) {
      return res.status(404).json({ error: 'Job posting not found or unauthorized' });
    }

    return res.json({ message: 'Job posting and associated applications removed successfully' });
  } catch (err: any) {
    console.error('Error deleting job posting:', err);
    return res.status(500).json({ error: 'Failed to delete job posting' });
  }
});

// ==========================================
// 4. INTERNSHIP POSTINGS (CRUD)
// ==========================================

// GET /api/industry/internships
router.get('/internships', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const internships = db.getCompanyInternships(companyId);
    return res.json({ internships });
  } catch (err: any) {
    console.error('Error fetching internships:', err);
    return res.status(500).json({ error: 'Failed to fetch internship postings' });
  }
});

// POST /api/industry/internships
router.post('/internships', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const {
      title,
      description,
      required_skills,
      duration,
      stipend,
      location,
      work_arrangement,
      eligibility,
      application_deadline,
      number_of_openings,
      responsibilities,
      learning_outcomes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Internship Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Internship Description is required' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Internship Location is required' });
    }
    if (!Array.isArray(required_skills) || required_skills.length === 0) {
      return res.status(400).json({ error: 'At least one required skill must be specified' });
    }

    const cleanSkills = required_skills
      .map(s => String(s).trim())
      .filter(s => s.length > 0);

    const cleanResponsibilities = Array.isArray(responsibilities)
      ? responsibilities.map(r => String(r).trim()).filter(r => r.length > 0)
      : [];

    const cleanOutcomes = Array.isArray(learning_outcomes)
      ? learning_outcomes.map(o => String(o).trim()).filter(o => o.length > 0)
      : [];

    const newInternship = db.createInternship(companyId, {
      title: title.trim(),
      description: description.trim(),
      required_skills: cleanSkills,
      duration: duration?.trim() || '3 Months',
      stipend: stipend?.trim() || '₹20,000 / month',
      location: location.trim(),
      work_arrangement: work_arrangement || 'Remote',
      eligibility: eligibility?.trim() || '2nd, 3rd or Final Year Engineering Students',
      application_deadline: application_deadline?.trim() || new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      number_of_openings: Number(number_of_openings) || 2,
      responsibilities: cleanResponsibilities,
      learning_outcomes: cleanOutcomes,
      status: 'active'
    });

    return res.status(201).json({
      message: 'Internship posting created successfully',
      internship: newInternship
    });
  } catch (err: any) {
    console.error('Error creating internship posting:', err);
    return res.status(500).json({ error: 'Failed to create internship posting' });
  }
});

// PUT /api/industry/internships/:id
router.put('/internships/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const internshipId = req.params.id;
    const {
      title,
      description,
      required_skills,
      duration,
      stipend,
      location,
      work_arrangement,
      eligibility,
      application_deadline,
      number_of_openings,
      responsibilities,
      learning_outcomes,
      status
    } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'Internship Title cannot be empty' });
    }

    const updates: any = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (Array.isArray(required_skills)) {
      updates.required_skills = required_skills.map(s => String(s).trim()).filter(s => s.length > 0);
    }
    if (duration !== undefined) updates.duration = duration.trim();
    if (stipend !== undefined) updates.stipend = stipend.trim();
    if (location) updates.location = location.trim();
    if (work_arrangement) updates.work_arrangement = work_arrangement;
    if (eligibility !== undefined) updates.eligibility = eligibility.trim();
    if (application_deadline !== undefined) updates.application_deadline = application_deadline.trim();
    if (number_of_openings !== undefined) updates.number_of_openings = Number(number_of_openings) || 1;
    if (Array.isArray(responsibilities)) {
      updates.responsibilities = responsibilities.map(r => String(r).trim()).filter(r => r.length > 0);
    }
    if (Array.isArray(learning_outcomes)) {
      updates.learning_outcomes = learning_outcomes.map(o => String(o).trim()).filter(o => o.length > 0);
    }
    if (status && (status === 'active' || status === 'closed')) {
      updates.status = status;
    }

    const updated = db.updateInternship(internshipId, companyId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Internship posting not found or unauthorized' });
    }

    return res.json({
      message: 'Internship posting updated successfully',
      internship: updated
    });
  } catch (err: any) {
    console.error('Error updating internship posting:', err);
    return res.status(500).json({ error: 'Failed to update internship posting' });
  }
});

// PATCH /api/industry/internships/:id/status
router.patch('/internships/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const internshipId = req.params.id;

    const toggled = db.toggleInternshipStatus(internshipId, companyId);
    if (!toggled) {
      return res.status(404).json({ error: 'Internship posting not found or unauthorized' });
    }

    return res.json({
      message: `Internship status changed to ${toggled.status}`,
      internship: toggled
    });
  } catch (err: any) {
    console.error('Error toggling internship status:', err);
    return res.status(500).json({ error: 'Failed to toggle internship status' });
  }
});

// DELETE /api/industry/internships/:id
router.delete('/internships/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const internshipId = req.params.id;

    const deleted = db.deleteInternship(internshipId, companyId);
    if (!deleted) {
      return res.status(404).json({ error: 'Internship posting not found or unauthorized' });
    }

    return res.json({ message: 'Internship posting and applications removed successfully' });
  } catch (err: any) {
    console.error('Error deleting internship posting:', err);
    return res.status(500).json({ error: 'Failed to delete internship posting' });
  }
});

// ==========================================
// 5. APPLICATIONS PIPELINE & CANDIDATES
// ==========================================

// GET /api/industry/applications
router.get('/applications', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const applications = db.getCompanyApplications(companyId);
    return res.json({ applications });
  } catch (err: any) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({ error: 'Failed to fetch application pipeline' });
  }
});

// PATCH /api/industry/applications/:id/status
router.patch('/applications/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const applicationId = req.params.id;
    const {
      status,
      notes,
      completion_date,
      certificate_reference,
      certificate_url,
      portfolio_link,
      mentor_feedback_id,
      completion_notes
    } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected', 'In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const evidence = {
      completion_date,
      certificate_reference,
      certificate_url,
      portfolio_link,
      mentor_feedback_id,
      completion_notes
    };

    const updated = db.updateApplicationStatus(applicationId, companyId, status, notes, evidence);
    if (!updated) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    return res.json({
      message: `Candidate status updated to '${status}'`,
      application: updated
    });
  } catch (err: any) {
    console.error('Error updating application status:', err);
    return res.status(500).json({ error: 'Failed to update application status' });
  }
});

// GET /api/industry/students/:studentId
router.get('/students/:studentId', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const candidateProfile = db.getStudentFullProfileForEmployer(studentId);

    if (!candidateProfile) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    return res.json({ candidate: candidateProfile });
  } catch (err: any) {
    console.error('Error fetching student profile for employer:', err);
    return res.status(500).json({ error: 'Failed to fetch candidate profile' });
  }
});

export default router;
