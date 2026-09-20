import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../auth.js';
import { AnalyticsEngine } from '../analyticsEngine.js';
import { CollegeAdminEngine } from '../collegeAdminEngine.js';

const router = Router();

// All student routes require JWT authentication
router.use(authenticateJWT);

// Ensure req.student is resolved or auto-created for authenticated student accounts
router.use((req: AuthenticatedRequest, _res: Response, next) => {
  if (!req.student && req.dbUser && (req.dbUser.role === 'student' || req.user?.role === 'student')) {
    req.student = db.findStudentByUserId(req.dbUser.id) || db.ensureStudentProfileForUser(req.dbUser.id);
  }
  next();
});

// GET /api/student/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const skills = db.getStudentSkills(student.id);
    const projects = db.getStudentProjects(student.id);
    const certifications = db.getStudentCertifications(student.id);
    const completion = db.calculateProfileCompletion(student.id);
    const readiness = CollegeAdminEngine.calculateStudentReadiness(student.id);

    const technicalSkills = skills.filter(s => s.skill.category === 'technical');
    const softSkills = skills.filter(s => s.skill.category === 'soft');

    return res.json({
      student: {
        id: student.id,
        user_id: student.user_id,
        full_name: student.full_name,
        email: req.user?.email,
        phone: student.phone,
        college_name: student.college_name,
        department: student.department,
        year_of_study: student.year_of_study,
        cgpa: student.cgpa,
        profile_photo: student.profile_photo,
        bio: student.bio,
        created_at: student.created_at,
        updated_at: student.updated_at
      },
      stats: {
        profile_completion_percentage: completion.percentage,
        missing_fields: completion.missingFields,
        total_skills_count: skills.length,
        technical_skills_count: technicalSkills.length,
        soft_skills_count: softSkills.length,
        projects_count: projects.length,
        certifications_count: certifications.length,
        placement_readiness_percentage: readiness.total_score,
        placement_readiness_tier: readiness.tier
      },
      placement_readiness: readiness,
      recent_skills: skills.slice(-6).reverse(),
      recent_projects: projects.slice(0, 3),
      recent_certifications: certifications.slice(0, 3)
    });
  } catch (err: any) {
    console.error('Error fetching dashboard:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/student/placement-readiness
router.get('/placement-readiness', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }
    const readiness = CollegeAdminEngine.calculateStudentReadiness(student.id);
    return res.json({ success: true, readiness });
  } catch (err: any) {
    console.error('Error calculating student placement readiness:', err);
    return res.status(500).json({ error: 'Failed to calculate placement readiness score' });
  }
});

// GET /api/student/profile
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const completion = db.calculateProfileCompletion(student.id);
    const skills = db.getStudentSkills(student.id);
    const readiness = CollegeAdminEngine.calculateStudentReadiness(student.id);

    return res.json({
      student: {
        ...student,
        email: req.user?.email
      },
      skills_count: skills.length,
      profile_completion: completion.percentage,
      missing_fields: completion.missingFields,
      placement_readiness: readiness
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/student/profile
router.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const {
      full_name,
      phone,
      college_name,
      department,
      year_of_study,
      cgpa,
      profile_photo,
      bio
    } = req.body;

    const targetFullName = full_name !== undefined ? full_name : req.body.fullName;
    const targetPhone = phone !== undefined ? phone : req.body.phone;
    const targetCollege = college_name !== undefined ? college_name : req.body.collegeName;
    const targetDepartment = department !== undefined ? department : req.body.department;
    const targetYear = year_of_study !== undefined ? year_of_study : req.body.yearOfStudy;

    const finalFullName = targetFullName !== undefined ? targetFullName.trim() : student.full_name;
    const finalPhone = targetPhone !== undefined ? targetPhone.trim() : student.phone;
    const finalCollegeName = targetCollege !== undefined ? targetCollege.trim() : student.college_name;
    const finalDepartment = targetDepartment !== undefined ? targetDepartment.trim() : student.department;
    const finalYearOfStudy = targetYear !== undefined ? targetYear.trim() : student.year_of_study;

    if (!finalFullName) {
      return res.status(400).json({ error: 'Full Name is required' });
    }
    if (!finalPhone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!finalCollegeName) {
      return res.status(400).json({ error: 'College name is required' });
    }
    if (!finalDepartment) {
      return res.status(400).json({ error: 'Department is required' });
    }
    if (!finalYearOfStudy) {
      return res.status(400).json({ error: 'Year of study is required' });
    }

    let parsedCgpa: number | null = student.cgpa;
    if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
      const num = parseFloat(cgpa);
      if (isNaN(num) || num < 0 || num > 10) {
        return res.status(400).json({ error: 'CGPA must be a valid number between 0.0 and 10.0' });
      }
      parsedCgpa = parseFloat(num.toFixed(2));
    }

    const updated = db.updateStudent(student.id, {
      full_name: finalFullName,
      phone: finalPhone,
      college_name: finalCollegeName,
      department: finalDepartment,
      year_of_study: finalYearOfStudy,
      cgpa: parsedCgpa,
      profile_photo: profile_photo ? profile_photo.trim() : student.profile_photo,
      bio: bio !== undefined ? bio.trim() : student.bio
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update student profile' });
    }

    const completion = db.calculateProfileCompletion(student.id);

    return res.json({
      message: 'Profile updated successfully',
      student: {
        ...updated,
        email: req.user?.email
      },
      profile_completion: completion.percentage,
      missing_fields: completion.missingFields
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ======================= SKILLS ROUTES =======================

// GET /api/student/skills
router.get('/skills', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const studentSkills = db.getStudentSkills(student.id);
    const technical = studentSkills.filter(s => s.skill.category === 'technical');
    const soft = studentSkills.filter(s => s.skill.category === 'soft');

    return res.json({
      all: studentSkills,
      technical,
      soft,
      total_count: studentSkills.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve skills' });
  }
});

// POST /api/student/skills
router.post('/skills', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const targetSkillName = (req.body.skill_name || req.body.skillName || '').trim();
    const category = req.body.category;
    const targetProficiency = req.body.proficiency_level || req.body.proficiency || 'Intermediate';

    if (!targetSkillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    if (!category || !['technical', 'soft'].includes(category)) {
      return res.status(400).json({ error: 'Category must be either "technical" or "soft"' });
    }

    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const level = validLevels.includes(targetProficiency) ? targetProficiency : 'Intermediate';

    const result = db.addStudentSkill(student.id, targetSkillName, category, level);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    const updatedSkills = db.getStudentSkills(student.id);
    const completion = db.calculateProfileCompletion(student.id);

    return res.status(201).json({
      message: 'Skill added successfully',
      added: result,
      all: updatedSkills,
      profile_completion: completion.percentage
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add skill' });
  }
});

// DELETE /api/student/skills/:id
router.delete('/skills/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const studentSkillId = req.params.id;
    const removed = db.removeStudentSkill(student.id, studentSkillId);

    if (!removed) {
      return res.status(404).json({ error: 'Skill mapping not found or already deleted' });
    }

    const updatedSkills = db.getStudentSkills(student.id);
    const completion = db.calculateProfileCompletion(student.id);

    return res.json({
      message: 'Skill removed successfully',
      all: updatedSkills,
      profile_completion: completion.percentage
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to remove skill' });
  }
});

// ======================= PROJECTS ROUTES =======================

// GET /api/student/projects
router.get('/projects', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const projects = db.getStudentProjects(student.id);
    return res.json({ projects, count: projects.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/student/projects
router.post('/projects', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { title, description, technologies, project_link } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Project description is required' });
    }

    const techArray: string[] = Array.isArray(technologies)
      ? technologies
      : typeof technologies === 'string'
      ? technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const newProject = db.createProject(student.id, {
      title: title.trim(),
      description: description.trim(),
      technologies: techArray,
      project_link: project_link ? project_link.trim() : ''
    });

    const completion = db.calculateProfileCompletion(student.id);

    return res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
      profile_completion: completion.percentage
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/student/projects/:id
router.put('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { title, description, technologies, project_link } = req.body;
    const projectId = req.params.id;

    const techArray: string[] | undefined = Array.isArray(technologies)
      ? technologies
      : typeof technologies === 'string'
      ? technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
      : undefined;

    const updated = db.updateProject(student.id, projectId, {
      ...(title ? { title: title.trim() } : {}),
      ...(description ? { description: description.trim() } : {}),
      ...(techArray !== undefined ? { technologies: techArray } : {}),
      ...(project_link !== undefined ? { project_link: project_link.trim() } : {})
    });

    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ message: 'Project updated successfully', project: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/student/projects/:id
router.delete('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const projectId = req.params.id;
    const removed = db.deleteProject(student.id, projectId);

    if (!removed) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const completion = db.calculateProfileCompletion(student.id);

    return res.json({
      message: 'Project deleted successfully',
      profile_completion: completion.percentage
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ======================= CERTIFICATIONS ROUTES =======================

// GET /api/student/certifications
router.get('/certifications', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const certs = db.getStudentCertifications(student.id);
    return res.json({ certifications: certs, count: certs.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// POST /api/student/certifications
router.post('/certifications', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { certificate_name, issuing_organization, issue_date, certificate_link } = req.body;

    if (!certificate_name || !certificate_name.trim()) {
      return res.status(400).json({ error: 'Certificate name is required' });
    }
    if (!issuing_organization || !issuing_organization.trim()) {
      return res.status(400).json({ error: 'Issuing organization is required' });
    }

    const newCert = db.createCertification(student.id, {
      certificate_name: certificate_name.trim(),
      issuing_organization: issuing_organization.trim(),
      issue_date: issue_date ? issue_date.trim() : new Date().toISOString().split('T')[0],
      certificate_link: certificate_link ? certificate_link.trim() : ''
    });

    const completion = db.calculateProfileCompletion(student.id);

    return res.status(201).json({
      message: 'Certification added successfully',
      certification: newCert,
      profile_completion: completion.percentage
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create certification' });
  }
});

// PUT /api/student/certifications/:id
router.put('/certifications/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { certificate_name, issuing_organization, issue_date, certificate_link } = req.body;
    const certId = req.params.id;

    const updated = db.updateCertification(student.id, certId, {
      ...(certificate_name ? { certificate_name: certificate_name.trim() } : {}),
      ...(issuing_organization ? { issuing_organization: issuing_organization.trim() } : {}),
      ...(issue_date !== undefined ? { issue_date: issue_date.trim() } : {}),
      ...(certificate_link !== undefined ? { certificate_link: certificate_link.trim() } : {})
    });

    if (!updated) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    return res.json({ message: 'Certification updated successfully', certification: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update certification' });
  }
});

// DELETE /api/student/certifications/:id
router.delete('/certifications/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const certId = req.params.id;
    const removed = db.deleteCertification(student.id, certId);

    if (!removed) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    const completion = db.calculateProfileCompletion(student.id);

    return res.json({
      message: 'Certification deleted successfully',
      profile_completion: completion.percentage
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete certification' });
  }
});

// GET /api/student/roadmap
// Phase 4: Personalized Learning Roadmap with 4 milestone stages, edge-case safety, and actionable recommendations
router.get('/roadmap', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    const studentId = student.id;
    const skills = db.getStudentSkills(studentId) || [];
    const projects = db.getStudentProjects(studentId) || [];
    const certs = db.getStudentCertifications(studentId) || [];
    const asmtStats = db.getStudentAssessmentStats(studentId) || {
      total_attempts: 0,
      passed_count: 0,
      highest_score: 0,
      average_score: 0,
      verified_badges_count: 0
    };
    const applications = db.getStudentApplications(studentId) || [];
    const completion = db.calculateProfileCompletion(studentId);
    const attemptedCount = (asmtStats as any).total_attempts || (asmtStats as any).attempted_count || 0;

    // Calculate core progress safely
    const roadmapProgress = AnalyticsEngine.calculateStudentRoadmapProgress(studentId);

    const technicalSkills = skills.filter(s => s?.skill?.category === 'technical');
    const advancedSkills = technicalSkills.filter(s => s.proficiency_level === 'Advanced' || s.proficiency_level === 'Expert');
    const intermediateOrHigher = technicalSkills.filter(s => s.proficiency_level !== 'Beginner');

    const hasCapstone = projects.some(p =>
      (p?.technologies && p.technologies.length >= 3) ||
      (p?.title && p.title.toLowerCase().includes('capstone')) ||
      (p?.title && p.title.toLowerCase().includes('smart')) ||
      (p?.title && p.title.toLowerCase().includes('network'))
    );

    // Stage 1: Foundational Literacy & Skill Baseline (Target: 4 tech skills)
    const stage1Pct = Math.min(100, Math.round((technicalSkills.length / 4) * 100));
    const stage1Status = stage1Pct >= 100 ? 'completed' : 'in_progress';

    // Stage 2: Core Engineering & Applied Projects (Target: 2 intermediate/advanced skills + 1 project)
    const stage2SkillPart = Math.min(50, (intermediateOrHigher.length / 2) * 50);
    const stage2ProjectPart = Math.min(50, (projects.length / 1) * 50);
    const stage2Pct = Math.min(100, Math.round(stage2SkillPart + stage2ProjectPart));
    const stage2Status = stage1Status !== 'completed' ? (stage2Pct > 0 ? 'in_progress' : 'locked') : (stage2Pct >= 100 ? 'completed' : 'in_progress');

    // Stage 3: Standardized Assessments & Industry Benchmarks (Target: 2 passed assessments with 70%+)
    const stage3PassedPart = Math.min(60, (asmtStats.passed_count / 2) * 60);
    const stage3ScorePart = Math.min(40, (asmtStats.average_score / 100) * 40);
    const stage3Pct = Math.min(100, Math.round(stage3PassedPart + stage3ScorePart));
    const stage3Status = stage2Status !== 'completed' ? (stage3Pct > 0 ? 'in_progress' : 'locked') : (stage3Pct >= 100 ? 'completed' : 'in_progress');

    // Stage 4: Capstone Portfolio & Market Readiness (Target: 1 capstone project + 1 certification + applications)
    const stage4CapstonePart = hasCapstone ? 50 : (projects.length > 0 ? 25 : 0);
    const stage4CertPart = Math.min(30, certs.length * 30);
    const stage4AppPart = applications.length > 0 ? 20 : 0;
    const stage4Pct = Math.min(100, Math.round(stage4CapstonePart + stage4CertPart + stage4AppPart));
    const stage4Status = stage3Status !== 'completed' ? (stage4Pct > 0 ? 'in_progress' : 'locked') : (stage4Pct >= 100 ? 'completed' : 'in_progress');

    const stages = [
      {
        stage_number: 1,
        title: 'Stage 1: Foundational Literacy & Skill Baseline',
        description: 'Establish foundational proficiency across core programming, data structures, and computer science essentials.',
        progress_percentage: stage1Pct,
        status: stage1Status,
        target_summary: 'Declare at least 4 core technical skills',
        current_summary: `${technicalSkills.length} of 4 skills registered`,
        milestones: [
          { label: 'Register and initialize student profile', completed: true },
          { label: 'Specify academic department & graduation cohort', completed: !!student.department },
          { label: 'Add 4+ Core Technical Skills to your inventory', completed: technicalSkills.length >= 4 },
          { label: 'Verify profile completion reaches 70%+', completed: completion.percentage >= 70 }
        ],
        action: {
          label: technicalSkills.length >= 4 ? 'Review Skills' : 'Add Technical Skills',
          tab: 'skills'
        }
      },
      {
        stage_number: 2,
        title: 'Stage 2: Core Engineering & Applied Projects',
        description: 'Demonstrate applied engineering by building repository-backed software projects and advancing proficiency levels.',
        progress_percentage: stage2Pct,
        status: stage2Status,
        target_summary: '2+ Intermediate skills and 1+ GitHub-backed project',
        current_summary: `${intermediateOrHigher.length} Intermediate skills, ${projects.length} projects`,
        milestones: [
          { label: 'Level up 2+ technical skills to Intermediate or higher', completed: intermediateOrHigher.length >= 2 },
          { label: 'Showcase at least 1 repository-backed engineering project', completed: projects.length >= 1 },
          { label: 'Tag architectural technologies & repository link on projects', completed: projects.some(p => p.project_link || (p.technologies && p.technologies.length > 0)) }
        ],
        action: {
          label: projects.length >= 1 ? 'Manage Projects' : 'Showcase First Project',
          tab: 'projects'
        }
      },
      {
        stage_number: 3,
        title: 'Stage 3: Standardized Assessments & Industry Benchmarks',
        description: 'Validate your problem solving and domain expertise through standardized Phase 2 technical assessments.',
        progress_percentage: stage3Pct,
        status: stage3Status,
        target_summary: 'Pass 2 standardized technical assessments (70%+)',
        current_summary: `${asmtStats.passed_count} of 2 assessments verified`,
        milestones: [
          { label: 'Attempt at least 1 standardized technical assessment', completed: attemptedCount >= 1 },
          { label: 'Pass at least 2 standardized tests with 70%+ score', completed: asmtStats.passed_count >= 2 },
          { label: 'Run Phase 3 Skill Gap Analysis against target role', completed: true }
        ],
        action: {
          label: asmtStats.passed_count >= 2 ? 'View Assessments' : 'Take Standardized Assessment',
          tab: 'assessments'
        }
      },
      {
        stage_number: 4,
        title: 'Stage 4: Capstone Portfolio & Market Readiness',
        description: 'Deliver an end-to-end full-stack capstone project, earn industry credentials, and connect with corporate hiring pipelines.',
        progress_percentage: stage4Pct,
        status: stage4Status,
        target_summary: '1 Capstone project, 1 Certification, and Opportunity Matching',
        current_summary: `${hasCapstone ? 'Capstone built' : 'Capstone needed'}, ${certs.length} certifications, ${applications.length} applications`,
        milestones: [
          { label: 'Deploy a multi-tier capstone system (3+ integrated tech)', completed: hasCapstone },
          { label: 'Upload verified cloud or industry certification', completed: certs.length >= 1 },
          { label: 'Apply to matched employer opportunities (75%+ score)', completed: applications.length >= 1 }
        ],
        action: {
          label: hasCapstone ? 'Explore Opportunities' : 'Build Capstone',
          tab: hasCapstone ? 'opportunities' : 'projects'
        }
      }
    ];

    // Build role alignment array
    const roleAlignment = [
      { id: 'full-stack-engineer', name: 'Full-Stack Software Engineer', match: roadmapProgress.role_progress['full-stack-engineer'] || 0, icon: 'code' },
      { id: 'cloud-devops-engineer', name: 'Cloud & DevOps Engineer', match: roadmapProgress.role_progress['cloud-devops-engineer'] || 0, icon: 'cloud' },
      { id: 'ai-ml-engineer', name: 'AI / Machine Learning Engineer', match: roadmapProgress.role_progress['ai-ml-engineer'] || 0, icon: 'brain' },
      { id: 'data-systems-engineer', name: 'Data Systems & Enterprise Engineer', match: roadmapProgress.role_progress['data-systems-engineer'] || 0, icon: 'database' }
    ];

    // Build personalized recommendations based on real state
    const recommendations: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low'; tab: string; actionText: string }> = [];

    if (technicalSkills.length < 4) {
      recommendations.push({
        title: 'Expand Technical Skill Inventory',
        description: `You currently have ${technicalSkills.length} technical skills recorded. Add at least 4 to complete Stage 1 and unlock deeper role matching.`,
        priority: 'high',
        tab: 'skills',
        actionText: 'Add Skills'
      });
    }

    if (projects.length === 0) {
      recommendations.push({
        title: 'Showcase an Applied Project',
        description: 'Employers value practical code artifacts. Add a project with repository links and technical tags to progress through Stage 2.',
        priority: 'high',
        tab: 'projects',
        actionText: 'Add Project'
      });
    }

    if (asmtStats.passed_count < 2) {
      recommendations.push({
        title: 'Validate with Standardized Assessments',
        description: 'Earn verified credentials by passing 2 domain tests with 70%+ score to demonstrate technical mastery.',
        priority: 'medium',
        tab: 'assessments',
        actionText: 'Take Assessment'
      });
    }

    if (certs.length === 0) {
      recommendations.push({
        title: 'Upload Industry Certifications',
        description: 'Add AWS, Azure, GCP, or official credentials to strengthen Stage 4 placement readiness.',
        priority: 'medium',
        tab: 'certifications',
        actionText: 'Add Certification'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Ready for Industry Opportunities',
        description: 'Your roadmap progress is exceptional. Explore matched internships and jobs from partner companies.',
        priority: 'low',
        tab: 'opportunities',
        actionText: 'View Opportunities'
      });
    }

    return res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          full_name: student.full_name,
          email: req.user?.email,
          college_name: student.college_name,
          department: student.department,
          year_of_study: student.year_of_study,
          profile_photo: student.profile_photo,
          profile_completion: completion.percentage
        },
        overall_progress: roadmapProgress.overall_progress,
        current_stage: roadmapProgress.current_stage,
        stage_title: roadmapProgress.stage_title,
        completed_capstone: hasCapstone,
        is_new_student: skills.length === 0 && projects.length === 0,
        stages,
        role_alignment: roleAlignment,
        recommendations
      }
    });
  } catch (err: any) {
    console.error('[Student Roadmap API Error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to compute learning roadmap progress' });
  }
});

export default router;
