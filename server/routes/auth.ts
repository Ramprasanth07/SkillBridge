import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { hashPassword, comparePassword, generateToken, authenticateJWT, AuthenticatedRequest } from '../auth.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      collegeName,
      department,
      yearOfStudy
    } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full Name is required' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!collegeName || !collegeName.trim()) {
      return res.status(400).json({ error: 'College Name is required' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ error: 'Department is required' });
    }
    if (!yearOfStudy || !yearOfStudy.trim()) {
      return res.status(400).json({ error: 'Year of Study is required' });
    }

    // Check if user already exists
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    // Hash password securely
    const password_hash = await hashPassword(password);

    // Create User record
    const user = db.createUser({
      email: email.trim().toLowerCase(),
      password_hash,
      role: 'student'
    });

    // Create Student record
    // Pick an attractive default avatar or initial
    const avatarUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(fullName.trim())}`;

    const student = db.createStudent({
      user_id: user.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      college_name: collegeName.trim(),
      department: department.trim(),
      year_of_study: yearOfStudy.trim(),
      cgpa: null,
      profile_photo: avatarUrl,
      bio: `Student at ${collegeName.trim()}, studying ${department.trim()}.`
    });

    // Automatically seed a couple of starter skills for a great first-time onboarding experience
    db.addStudentSkill(student.id, 'Communication', 'soft', 'Intermediate');

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      studentId: student.id,
      email: user.email,
      role: user.role
    });

    const completion = db.calculateProfileCompletion(student.id);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      student: {
        ...student,
        profile_completion: completion.percentage,
        missing_fields: completion.missingFields
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// POST /api/auth/register-company (Phase 5: Company Registration)
router.post('/register-company', async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      email,
      password,
      industry,
      website,
      location,
      companySize,
      contactPhone,
      description
    } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: 'Company Name is required' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid corporate or contact email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!industry || !industry.trim()) {
      return res.status(400).json({ error: 'Industry domain is required' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Company headquarters / location is required' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const password_hash = await hashPassword(password);

    const user = db.createUser({
      email: email.trim().toLowerCase(),
      password_hash,
      role: 'industry'
    });

    const defaultLogo = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80`;

    const company = db.createCompany({
      user_id: user.id,
      company_name: companyName.trim(),
      description: description?.trim() || `${companyName.trim()} is an innovative leader in ${industry.trim()}.`,
      industry: industry.trim(),
      website: website?.trim() || '',
      location: location.trim(),
      company_size: companySize?.trim() || '11-50 employees',
      contact_email: email.trim().toLowerCase(),
      contact_phone: contactPhone?.trim() || '',
      logo: defaultLogo
    });

    const token = generateToken({
      userId: user.id,
      companyId: company.id,
      email: user.email,
      role: 'industry'
    });

    return res.status(201).json({
      message: 'Company registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: 'industry'
      },
      company
    });
  } catch (err: any) {
    console.error('Company registration error:', err);
    return res.status(500).json({ error: 'Server error during company registration. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.role === 'admin') {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: 'admin'
      });

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: 'admin'
        }
      });
    }

    if (user.role === 'industry') {
      const company = db.findCompanyByUserId(user.id);
      if (!company) {
        return res.status(404).json({ error: 'Company profile associated with this account was not found' });
      }

      const token = generateToken({
        userId: user.id,
        companyId: company.id,
        email: user.email,
        role: 'industry'
      });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: 'industry'
        },
        company
      });
    }

    // Default to student role
    let student = db.findStudentByUserId(user.id);
    if (!student) {
      student = db.findStudentById(user.id);
      if (student && !student.user_id) {
        student.user_id = user.id;
        db.saveDatabase();
      }
    }
    if (!student) {
      student = db.ensureStudentProfileForUser(user.id);
    }
    if (!student) {
      return res.status(404).json({ error: 'Student profile associated with this account was not found' });
    }

    const token = generateToken({
      userId: user.id,
      studentId: student.id,
      email: user.email,
      role: user.role
    });

    const completion = db.calculateProfileCompletion(student.id);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      student: {
        ...student,
        profile_completion: completion.percentage,
        missing_fields: completion.missingFields
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  if (!req.dbUser) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  if (req.dbUser.role === 'admin') {
    return res.json({
      user: {
        id: req.dbUser.id,
        email: req.dbUser.email,
        role: 'admin'
      }
    });
  }

  if (req.dbUser.role === 'industry' && req.company) {
    return res.json({
      user: {
        id: req.dbUser.id,
        email: req.dbUser.email,
        role: 'industry'
      },
      company: req.company
    });
  }

  let student = req.student || db.findStudentByUserId(req.dbUser.id);
  if (!student) {
    student = db.ensureStudentProfileForUser(req.dbUser.id);
  }

  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const completion = db.calculateProfileCompletion(student.id);
  const skills = db.getStudentSkills(student.id);
  const projects = db.getStudentProjects(student.id);
  const certifications = db.getStudentCertifications(student.id);

  return res.json({
    user: {
      id: req.dbUser.id,
      email: req.dbUser.email,
      role: req.dbUser.role
    },
    student: {
      ...student,
      profile_completion: completion.percentage,
      missing_fields: completion.missingFields,
      stats: {
        skills_count: skills.length,
        technical_skills_count: skills.filter(s => s.skill.category === 'technical').length,
        soft_skills_count: skills.filter(s => s.skill.category === 'soft').length,
        projects_count: projects.length,
        certifications_count: certifications.length
      }
    }
  });
});

export default router;
