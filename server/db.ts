import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { SEED_ASSESSMENTS, SEED_QUESTIONS } from './assessmentData.js';

// Canonical Project Root Discovery to guarantee ONE single source of truth across all execution contexts
function resolveProjectRoot(): string {
  if (process.env.SKILLBRIDGE_DATA_DIR) {
    return path.resolve(process.env.SKILLBRIDGE_DATA_DIR, '..');
  }

  // 1. Try to find package.json walking up from __dirname or import.meta.url
  let startDir = '';
  try {
    if (typeof __dirname !== 'undefined') {
      startDir = __dirname;
    } else if (import.meta && import.meta.url) {
      startDir = path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (_) {}

  if (startDir) {
    let curr = path.resolve(startDir);
    for (let i = 0; i < 5; i++) {
      if (fs.existsSync(path.join(curr, 'package.json'))) {
        return curr;
      }
      const parent = path.dirname(curr);
      if (parent === curr) break;
      curr = parent;
    }
  }

  // 2. Try to find package.json walking up from process.cwd()
  let cwdCandidate = path.resolve(process.cwd());
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(cwdCandidate, 'package.json'))) {
      return cwdCandidate;
    }
    const parent = path.dirname(cwdCandidate);
    if (parent === cwdCandidate) break;
    cwdCandidate = parent;
  }

  return path.resolve(process.cwd());
}

export const PROJECT_ROOT = resolveProjectRoot();
export const DB_DIR = process.env.SKILLBRIDGE_DATA_DIR
  ? path.resolve(process.env.SKILLBRIDGE_DATA_DIR)
  : path.join(PROJECT_ROOT, 'data');
export const DB_FILE = path.join(DB_DIR, 'skillbridge_db.json');
export const DB_BACKUP_FILE = path.join(DB_DIR, 'skillbridge_db.backup.json');

console.log(`[DB] Single Source of Truth DB location: ${DB_FILE}`);

// Database Interfaces
export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin' | 'faculty' | 'industry';
  created_at: string;
  updated_at: string;
}

export interface StudentRecord {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  college_name: string;
  department: string;
  year_of_study: string; // e.g. '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'
  cgpa: number | null;
  profile_photo: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillRecord {
  id: string;
  name: string;
  category: 'technical' | 'soft';
  created_at: string;
}

export interface StudentSkillRecord {
  id: string;
  student_id: string;
  skill_id: string;
  proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  created_at: string;
}

export interface ProjectRecord {
  id: string;
  student_id: string;
  title: string;
  description: string;
  technologies: string[]; // array of strings
  project_link: string;
  created_at: string;
  updated_at: string;
}

export interface CertificationRecord {
  id: string;
  student_id: string;
  certificate_name: string;
  issuing_organization: string;
  issue_date: string;
  certificate_link: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentRecord {
  id: string;
  title: string;
  category: 'Frontend' | 'Backend' | 'Full Stack' | 'Cloud';
  description: string;
  total_questions: number;
  time_limit_minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  passing_percentage: number;
  icon?: string;
  created_at: string;
}

export interface AssessmentQuestionRecord {
  id: string;
  assessment_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  created_at: string;
}

export interface AssessmentAttemptAnswer {
  question_id: string;
  question_text: string;
  options: string[];
  selected_option_index: number;
  correct_option_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface AssessmentAttemptRecord {
  id: string;
  student_id: string;
  assessment_id: string;
  assessment_title: string;
  category: 'Frontend' | 'Backend' | 'Full Stack' | 'Cloud';
  total_questions: number;
  correct_answers_count: number;
  score_percentage: number;
  passed: boolean;
  skill_level_awarded: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  time_taken_seconds: number;
  completed_at: string;
  answers: AssessmentAttemptAnswer[];
}

// Phase 5: Industry Portal Interfaces
export interface CompanyRecord {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  industry: string; // e.g. "Cloud & SaaS", "Fintech", "Artificial Intelligence", "EdTech", "Healthcare Technology", "E-Commerce"
  website: string;
  location: string;
  company_size: string; // e.g. "1-10", "11-50", "51-200", "201-500", "500+"
  contact_email: string;
  contact_phone: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

export interface JobRecord {
  id: string;
  company_id: string;
  title: string;
  description: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  work_arrangement: 'On-site' | 'Hybrid' | 'Remote';
  required_skills: string[];
  min_qualification: string;
  experience_level: string; // e.g. '0-1 Years (Entry Level)', '1-3 Years', '3-5 Years'
  application_deadline: string;
  number_of_openings: number;
  responsibilities: string[];
  preferred_skills: string[];
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface InternshipRecord {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  duration: string; // e.g. '3 Months', '6 Months', 'Summer 2026'
  stipend: string; // e.g. '₹25,000 / month', '$1,500 / month', 'Competitive'
  location: string;
  work_arrangement: 'On-site' | 'Hybrid' | 'Remote';
  eligibility: string; // e.g. '3rd & 4th Year B.Tech / MCA'
  application_deadline: string;
  number_of_openings: number;
  responsibilities: string[];
  learning_outcomes: string[];
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected' | 'In Progress' | 'Completed';

export interface ApplicationRecord {
  id: string;
  opportunity_id: string;
  opportunity_type: 'job' | 'internship';
  student_id: string;
  company_id: string;
  status: ApplicationStatus;
  cover_note?: string;
  notes?: string;
  match_score?: number;
  match_breakdown?: any;
  applied_at: string;
  updated_at: string;
  // Internship completion evidence / certificate / portfolio fields
  completion_date?: string;
  certificate_reference?: string;
  certificate_url?: string;
  portfolio_link?: string;
  mentor_feedback_id?: string;
  completion_notes?: string;
}

// Phase 8: Industry Mentor Feedback Interfaces
export interface MentorFeedbackRecord {
  id: string;
  student_id: string;
  company_id: string;
  opportunity_id: string;
  opportunity_type: 'job' | 'internship';
  mentor_name: string;
  mentor_title?: string;
  mentor_email?: string;
  evaluation_period: string; // e.g. 'Summer 2026 Internship', 'Q2 2026', 'Fall 2025'
  
  // Rubric scores (1 to 5)
  technical_competence: number;
  problem_solving: number;
  communication: number;
  teamwork_collaboration: number;
  professionalism_work_ethic: number;
  learning_ability: number;
  overall_performance: number;
  
  average_score: number; // Computed 1.0 to 5.0
  
  strengths: string;
  areas_for_improvement: string;
  mentor_comments: string;
  hire_recommendation: 'Recommended' | 'Consider' | 'Not Recommended';
  
  created_at: string;
  updated_at: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  students: StudentRecord[];
  companies: CompanyRecord[];
  jobs: JobRecord[];
  internships: InternshipRecord[];
  applications: ApplicationRecord[];
  mentor_feedbacks: MentorFeedbackRecord[];
  skills: SkillRecord[];
  student_skills: StudentSkillRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  assessments: AssessmentRecord[];
  assessment_questions: AssessmentQuestionRecord[];
  assessment_attempts: AssessmentAttemptRecord[];
}

const INITIAL_SKILLS: Array<{ name: string; category: 'technical' | 'soft' }> = [
  // Technical Skills
  { name: 'Python', category: 'technical' },
  { name: 'Java', category: 'technical' },
  { name: 'SQL', category: 'technical' },
  { name: 'React', category: 'technical' },
  { name: 'JavaScript', category: 'technical' },
  { name: 'TypeScript', category: 'technical' },
  { name: 'Node.js', category: 'technical' },
  { name: 'C++', category: 'technical' },
  { name: 'Git & GitHub', category: 'technical' },
  { name: 'Machine Learning', category: 'technical' },
  { name: 'Data Structures & Algorithms', category: 'technical' },
  { name: 'Cloud Computing (AWS/GCP)', category: 'technical' },
  { name: 'Tailwind CSS', category: 'technical' },
  { name: 'REST APIs', category: 'technical' },
  { name: 'Docker', category: 'technical' },
  // Soft Skills
  { name: 'Communication', category: 'soft' },
  { name: 'Teamwork & Collaboration', category: 'soft' },
  { name: 'Problem Solving', category: 'soft' },
  { name: 'Critical Thinking', category: 'soft' },
  { name: 'Time Management', category: 'soft' },
  { name: 'Leadership', category: 'soft' },
  { name: 'Adaptability', category: 'soft' },
  { name: 'Presentation Skills', category: 'soft' },
  { name: 'Agile & Scrum', category: 'soft' }
];

export class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
    this.reconcileReferences();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private reconcileReferences() {
    let changed = false;

    // 1. Reconcile student -> user
    for (const student of this.data.students) {
      if (!student.user_id) {
        const candidateUser = this.data.users.find(u => {
          if (u.role !== 'student') return false;
          const emailPrefix = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          const nameClean = student.full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return emailPrefix === nameClean;
        });
        if (candidateUser) {
          student.user_id = candidateUser.id;
          changed = true;
        }
      }
    }

    // 2. Reconcile company -> user
    for (const company of this.data.companies) {
      if (!company.user_id && company.contact_email) {
        const candidateUser = this.findUserByEmail(company.contact_email);
        if (candidateUser) {
          company.user_id = candidateUser.id;
          changed = true;
        }
      }
    }

    if (changed) {
      console.log('[DB] Reconciled student/company user references');
      this.saveDatabase();
    }
  }

  private loadDatabase(): DatabaseSchema {
    let loadedData: DatabaseSchema | null = null;
    let loadedFromBackup = false;

    // 1. Try reading primary database file
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw && raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.users)) {
            loadedData = parsed;
            console.log(`[DB] Successfully loaded primary DB from ${DB_FILE} (${loadedData!.users.length} users, ${loadedData!.students?.length || 0} students)`);
          } else {
            console.warn('[DB] Primary DB file content is not a valid schema structure. Checking backup...');
          }
        }
      } catch (err) {
        console.error('[DB] Error parsing primary DB file, attempting backup recovery...', err);
        loadedData = null;
      }
    }

    // 2. ONLY if primary failed, was missing, or genuinely corrupted, try reading from backup file
    if (!loadedData && fs.existsSync(DB_BACKUP_FILE)) {
      try {
        const rawBackup = fs.readFileSync(DB_BACKUP_FILE, 'utf-8');
        if (rawBackup && rawBackup.trim().length > 0) {
          const parsedBackup = JSON.parse(rawBackup);
          if (parsedBackup && typeof parsedBackup === 'object' && Array.isArray(parsedBackup.users)) {
            loadedData = parsedBackup;
            loadedFromBackup = true;
            console.warn(`[DB] RESTORED database from valid backup file: ${DB_BACKUP_FILE} (${loadedData!.users.length} users, ${loadedData!.students?.length || 0} students)`);
          }
        }
      } catch (bErr) {
        console.error('[DB] Backup file also unreadable:', bErr);
        loadedData = null;
      }
    }

    // 3. Only if both primary and backup are missing or unreadable, initialize fresh schema
    if (!loadedData) {
      console.log('[DB] Initializing default database schema...');
      loadedData = {
        users: [],
        students: [],
        companies: [],
        jobs: [],
        internships: [],
        applications: [],
        skills: INITIAL_SKILLS.map(s => ({
          id: crypto.randomUUID(),
          name: s.name,
          category: s.category,
          created_at: new Date().toISOString()
        })),
        student_skills: [],
        projects: [],
        certifications: [],
        assessments: [],
        assessment_questions: [],
        assessment_attempts: [],
        mentor_feedbacks: []
      };
    }

    // Ensure all collections exist and are arrays
    if (!Array.isArray(loadedData.users)) loadedData.users = [];
    if (!Array.isArray(loadedData.students)) loadedData.students = [];
    if (!Array.isArray(loadedData.companies)) loadedData.companies = [];
    if (!Array.isArray(loadedData.jobs)) loadedData.jobs = [];
    if (!Array.isArray(loadedData.internships)) loadedData.internships = [];
    if (!Array.isArray(loadedData.applications)) loadedData.applications = [];
    if (!Array.isArray(loadedData.skills)) loadedData.skills = [];
    if (!Array.isArray(loadedData.student_skills)) loadedData.student_skills = [];
    if (!Array.isArray(loadedData.projects)) loadedData.projects = [];
    if (!Array.isArray(loadedData.certifications)) loadedData.certifications = [];
    if (!Array.isArray(loadedData.mentor_feedbacks)) loadedData.mentor_feedbacks = [];
    if (!Array.isArray(loadedData.assessments)) loadedData.assessments = [];
    if (!Array.isArray(loadedData.assessment_questions)) loadedData.assessment_questions = [];
    if (!Array.isArray(loadedData.assessment_attempts)) loadedData.assessment_attempts = [];

    // Ensure baseline skills exist without duplicating or deleting custom skills
    for (const initSkill of INITIAL_SKILLS) {
      const exists = loadedData.skills.some(s => s.name.toLowerCase() === initSkill.name.toLowerCase());
      if (!exists) {
        loadedData.skills.push({
          id: crypto.randomUUID(),
          name: initSkill.name,
          category: initSkill.category,
          created_at: new Date().toISOString()
        });
      }
    }

    // Seed Assessments & Questions if missing or empty
    let needsSave = loadedFromBackup;
    if (loadedData.assessments.length === 0) {
      console.log('[DB] Seeding 4 standard technical assessments...');
      loadedData.assessments = SEED_ASSESSMENTS.map(a => ({
        ...a,
        created_at: new Date().toISOString()
      }));
      needsSave = true;
    }

    if (loadedData.assessment_questions.length === 0) {
      console.log('[DB] Seeding 40 MCQ assessment questions...');
      loadedData.assessment_questions = SEED_QUESTIONS.map(q => ({
        ...q,
        created_at: new Date().toISOString()
      }));
      needsSave = true;
    }

    if (needsSave) {
      this.data = loadedData;
      this.saveDatabase(loadedData);
    }

    return loadedData;
  }

  public saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const payload = dataToSave || this.data;
      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.users)) {
        console.error('[DB] Refusing to save invalid database schema payload!');
        return;
      }

      const jsonStr = JSON.stringify(payload, null, 2);

      // Atomic write using a unique temporary file, flush to OS disk, and renameSync
      const tempFile = path.join(DB_DIR, `skillbridge_db.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`);
      const fd = fs.openSync(tempFile, 'w');
      fs.writeSync(fd, jsonStr, 0, 'utf-8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);
      fs.renameSync(tempFile, DB_FILE);

      // Keep backup updated atomically
      try {
        const backupTemp = path.join(DB_DIR, `skillbridge_backup.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`);
        const bFd = fs.openSync(backupTemp, 'w');
        fs.writeSync(bFd, jsonStr, 0, 'utf-8');
        fs.fsyncSync(bFd);
        fs.closeSync(bFd);
        fs.renameSync(backupTemp, DB_BACKUP_FILE);
      } catch (bErr) {
        // non-fatal
        console.warn('[DB] Non-fatal backup write warning:', bErr);
      }

      // Clean up stale .tmp files older than 30s
      try {
        const files = fs.readdirSync(DB_DIR);
        const now = Date.now();
        for (const file of files) {
          if (file.endsWith('.tmp')) {
            const filePath = path.join(DB_DIR, file);
            try {
              const stat = fs.statSync(filePath);
              if (now - stat.mtimeMs > 30000) {
                fs.unlinkSync(filePath);
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
    } catch (err) {
      console.error('[DB] Failed atomic write, falling back to direct write with fsync:', err);
      try {
        const payload = dataToSave || this.data;
        const jsonStr = JSON.stringify(payload, null, 2);
        const fd = fs.openSync(DB_FILE, 'w');
        fs.writeSync(fd, jsonStr, 0, 'utf-8');
        fs.fsyncSync(fd);
        fs.closeSync(fd);
      } catch (directErr) {
        console.error('[DB] CRITICAL: Direct write to database also failed:', directErr);
      }
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // User Operations
  public findUserByEmail(email: string): UserRecord | undefined {
    if (!email) return undefined;
    const target = email.trim().toLowerCase();
    return this.data.users.find(u => u.email && u.email.trim().toLowerCase() === target);
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): UserRecord {
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      ...user,
      id: crypto.randomUUID(),
      email: user.email.toLowerCase().trim(),
      created_at: now,
      updated_at: now
    };
    this.data.users.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  // Student Operations
  public resolveStudentId(studentOrUserId: string): string {
    if (!studentOrUserId) return studentOrUserId;
    const direct = this.data.students.find(s => s.id === studentOrUserId);
    if (direct) return direct.id;
    const byUser = this.data.students.find(s => s.user_id === studentOrUserId);
    if (byUser) return byUser.id;
    return studentOrUserId;
  }

  public findStudentByUserId(userId: string): StudentRecord | undefined {
    if (!userId) return undefined;
    // 1. Direct user_id match
    let student = this.data.students.find(s => s.user_id === userId);
    if (student) return student;

    // 2. What if student.id equals userId?
    student = this.data.students.find(s => s.id === userId);
    if (student) {
      student.user_id = userId;
      this.saveDatabase();
      return student;
    }

    // 3. Check if user exists with student role
    const user = this.findUserById(userId);
    if (user && user.role === 'student') {
      const emailPrefix = user.email.split('@')[0].toLowerCase();
      const byName = this.data.students.find(s => {
        const studentNameClean = s.full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const emailClean = emailPrefix.replace(/[^a-z0-9]/g, '');
        return studentNameClean === emailClean && (!s.user_id || s.user_id === userId);
      });
      if (byName) {
        byName.user_id = userId;
        this.saveDatabase();
        return byName;
      }
    }

    return undefined;
  }

  public findStudentById(id: string): StudentRecord | undefined {
    if (!id) return undefined;
    // 1. Direct student.id match
    let student = this.data.students.find(s => s.id === id);
    if (student) return student;

    // 2. Check if id is user_id
    student = this.data.students.find(s => s.user_id === id);
    if (student) return student;

    // 3. Check if id belongs to an authenticated student user
    const user = this.findUserById(id);
    if (user && user.role === 'student') {
      return this.ensureStudentProfileForUser(id);
    }

    return undefined;
  }

  public findStudentByEmail(email: string): StudentRecord | undefined {
    if (!email) return undefined;
    const user = this.findUserByEmail(email);
    if (user) {
      return this.findStudentByUserId(user.id);
    }
    return undefined;
  }

  public ensureStudentProfileForUser(userId: string, defaults?: Partial<StudentRecord>): StudentRecord {
    const existing = this.findStudentByUserId(userId);
    if (existing) {
      return existing;
    }

    const user = this.findUserById(userId);
    const email = user?.email || 'student@university.edu';
    const emailName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = emailName
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Student User';

    const finalName = defaults?.full_name?.trim() || formattedName;
    const avatarUrl = defaults?.profile_photo?.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(finalName)}`;

    const newStudent = this.createStudent({
      user_id: userId,
      full_name: finalName,
      phone: defaults?.phone?.trim() || '+1 (555) 234-5678',
      college_name: defaults?.college_name?.trim() || 'Institute of Technology & Science',
      department: defaults?.department?.trim() || 'Computer Science and Engineering',
      year_of_study: defaults?.year_of_study?.trim() || '3rd Year',
      cgpa: defaults?.cgpa !== undefined ? defaults.cgpa : 8.5,
      profile_photo: avatarUrl,
      bio: defaults?.bio?.trim() || `Undergraduate student at Institute of Technology & Science, studying ${defaults?.department?.trim() || 'Computer Science and Engineering'}.`
    });

    // Seed starter soft skill if none exist
    const skills = this.getStudentSkills(newStudent.id);
    if (skills.length === 0) {
      this.addStudentSkill(newStudent.id, 'Communication', 'soft', 'Intermediate');
      this.addStudentSkill(newStudent.id, 'Problem Solving', 'soft', 'Intermediate');
    }

    return newStudent;
  }

  public createStudent(student: Omit<StudentRecord, 'id' | 'created_at' | 'updated_at'>): StudentRecord {
    const now = new Date().toISOString();
    const newStudent: StudentRecord = {
      ...student,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    this.data.students.push(newStudent);
    this.saveDatabase();
    return newStudent;
  }

  public updateStudent(studentId: string, updates: Partial<Omit<StudentRecord, 'id' | 'user_id' | 'created_at'>>): StudentRecord | null {
    const idx = this.data.students.findIndex(s => s.id === studentId);
    if (idx === -1) return null;

    this.data.students[idx] = {
      ...this.data.students[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.students[idx];
  }

  // Skills Operations
  public getAllSkills(): SkillRecord[] {
    return this.data.skills;
  }

  public findSkillByNameAndCategory(name: string, category: 'technical' | 'soft'): SkillRecord | undefined {
    return this.data.skills.find(
      s => s.name.toLowerCase() === name.trim().toLowerCase() && s.category === category
    );
  }

  public createSkill(name: string, category: 'technical' | 'soft'): SkillRecord {
    const existing = this.findSkillByNameAndCategory(name, category);
    if (existing) return existing;

    const newSkill: SkillRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      created_at: new Date().toISOString()
    };
    this.data.skills.push(newSkill);
    this.saveDatabase();
    return newSkill;
  }

  // Student Skills Operations
  public getStudentSkills(studentId: string): Array<StudentSkillRecord & { skill: SkillRecord }> {
    const records = this.data.student_skills.filter(ss => ss.student_id === studentId);
    return records.map(ss => {
      const skill = this.data.skills.find(s => s.id === ss.skill_id) || {
        id: ss.skill_id,
        name: 'Unknown Skill',
        category: 'technical' as const,
        created_at: new Date().toISOString()
      };
      return {
        ...ss,
        skill
      };
    });
  }

  public addStudentSkill(
    studentId: string,
    skillName: string,
    category: 'technical' | 'soft',
    proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = 'Intermediate'
  ): { studentSkill: StudentSkillRecord; skill: SkillRecord } | { error: string } {
    let skill = this.findSkillByNameAndCategory(skillName, category);
    if (!skill) {
      skill = this.createSkill(skillName, category);
    }

    const alreadyLinked = this.data.student_skills.find(
      ss => ss.student_id === studentId && ss.skill_id === skill!.id
    );

    if (alreadyLinked) {
      return { error: 'Skill is already added to your profile' };
    }

    const newLink: StudentSkillRecord = {
      id: crypto.randomUUID(),
      student_id: studentId,
      skill_id: skill.id,
      proficiency_level: proficiencyLevel,
      created_at: new Date().toISOString()
    };

    this.data.student_skills.push(newLink);
    this.saveDatabase();

    return { studentSkill: newLink, skill };
  }

  public removeStudentSkill(studentId: string, studentSkillId: string): boolean {
    const initialLen = this.data.student_skills.length;
    this.data.student_skills = this.data.student_skills.filter(
      ss => !(ss.id === studentSkillId && ss.student_id === studentId)
    );
    const removed = this.data.student_skills.length < initialLen;
    if (removed) this.saveDatabase();
    return removed;
  }

  // Projects Operations
  public getStudentProjects(studentId: string): ProjectRecord[] {
    return this.data.projects
      .filter(p => p.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createProject(
    studentId: string,
    data: { title: string; description: string; technologies: string[]; project_link: string }
  ): ProjectRecord {
    const now = new Date().toISOString();
    const newProject: ProjectRecord = {
      id: crypto.randomUUID(),
      student_id: studentId,
      title: data.title.trim(),
      description: data.description.trim(),
      technologies: data.technologies.map(t => t.trim()).filter(Boolean),
      project_link: data.project_link.trim(),
      created_at: now,
      updated_at: now
    };
    this.data.projects.push(newProject);
    this.saveDatabase();
    return newProject;
  }

  public updateProject(
    studentId: string,
    projectId: string,
    data: Partial<{ title: string; description: string; technologies: string[]; project_link: string }>
  ): ProjectRecord | null {
    const idx = this.data.projects.findIndex(p => p.id === projectId && p.student_id === studentId);
    if (idx === -1) return null;

    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...data,
      technologies: data.technologies ? data.technologies.map(t => t.trim()).filter(Boolean) : this.data.projects[idx].technologies,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.projects[idx];
  }

  public deleteProject(studentId: string, projectId: string): boolean {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(
      p => !(p.id === projectId && p.student_id === studentId)
    );
    const removed = this.data.projects.length < initialLen;
    if (removed) this.saveDatabase();
    return removed;
  }

  // Certifications Operations
  public getStudentCertifications(studentId: string): CertificationRecord[] {
    return this.data.certifications
      .filter(c => c.student_id === studentId)
      .sort((a, b) => new Date(b.issue_date || b.created_at).getTime() - new Date(a.issue_date || a.created_at).getTime());
  }

  public createCertification(
    studentId: string,
    data: { certificate_name: string; issuing_organization: string; issue_date: string; certificate_link: string }
  ): CertificationRecord {
    const now = new Date().toISOString();
    const newCert: CertificationRecord = {
      id: crypto.randomUUID(),
      student_id: studentId,
      certificate_name: data.certificate_name.trim(),
      issuing_organization: data.issuing_organization.trim(),
      issue_date: data.issue_date.trim(),
      certificate_link: data.certificate_link.trim(),
      created_at: now,
      updated_at: now
    };
    this.data.certifications.push(newCert);
    this.saveDatabase();
    return newCert;
  }

  public updateCertification(
    studentId: string,
    certId: string,
    data: Partial<{ certificate_name: string; issuing_organization: string; issue_date: string; certificate_link: string }>
  ): CertificationRecord | null {
    const idx = this.data.certifications.findIndex(c => c.id === certId && c.student_id === studentId);
    if (idx === -1) return null;

    this.data.certifications[idx] = {
      ...this.data.certifications[idx],
      ...data,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.certifications[idx];
  }

  public deleteCertification(studentId: string, certId: string): boolean {
    const initialLen = this.data.certifications.length;
    this.data.certifications = this.data.certifications.filter(
      c => !(c.id === certId && c.student_id === studentId)
    );
    const removed = this.data.certifications.length < initialLen;
    if (removed) this.saveDatabase();
    return removed;
  }

  // Profile Completion Calculator
  public calculateProfileCompletion(studentId: string): { percentage: number; missingFields: string[] } {
    const student = this.findStudentById(studentId);
    if (!student) return { percentage: 0, missingFields: ['Student Profile Not Found'] };

    const skills = this.getStudentSkills(studentId);
    const projects = this.getStudentProjects(studentId);
    const certs = this.getStudentCertifications(studentId);

    const weights = [
      { name: 'Full Name', valid: Boolean(student.full_name?.trim()), weight: 10 },
      { name: 'Contact Phone', valid: Boolean(student.phone?.trim()), weight: 10 },
      { name: 'College Name', valid: Boolean(student.college_name?.trim()), weight: 10 },
      { name: 'Department', valid: Boolean(student.department?.trim()), weight: 10 },
      { name: 'Year of Study', valid: Boolean(student.year_of_study?.trim()), weight: 10 },
      { name: 'CGPA', valid: student.cgpa !== null && student.cgpa !== undefined && student.cgpa > 0, weight: 10 },
      { name: 'Profile Photo', valid: Boolean(student.profile_photo?.trim()), weight: 10 },
      { name: 'Technical Skills (at least 2)', valid: skills.filter(s => s.skill.category === 'technical').length >= 2, weight: 10 },
      { name: 'Soft Skills (at least 1)', valid: skills.filter(s => s.skill.category === 'soft').length >= 1, weight: 10 },
      { name: 'Projects (at least 1)', valid: projects.length >= 1, weight: 5 },
      { name: 'Certifications (at least 1)', valid: certs.length >= 1, weight: 5 },
    ];

    let totalEarned = 0;
    const missing: string[] = [];

    weights.forEach(w => {
      if (w.valid) {
        totalEarned += w.weight;
      } else {
        missing.push(w.name);
      }
    });

    return {
      percentage: Math.min(100, Math.round(totalEarned)),
      missingFields: missing
    };
  }

  // ==========================================
  // Assessment Operations (Phase 2)
  // ==========================================
  public getAllAssessments(studentId?: string): Array<AssessmentRecord & {
    attempts_count: number;
    best_score: number | null;
    best_skill_level: string | null;
    last_attempt_date: string | null;
    passed: boolean;
  }> {
    return this.data.assessments.map(asmt => {
      let attemptsCount = 0;
      let bestScore: number | null = null;
      let bestSkillLevel: string | null = null;
      let lastAttemptDate: string | null = null;
      let passed = false;

      if (studentId) {
        const studentAttempts = this.data.assessment_attempts
          .filter(att => att.student_id === studentId && att.assessment_id === asmt.id)
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

        attemptsCount = studentAttempts.length;
        if (studentAttempts.length > 0) {
          lastAttemptDate = studentAttempts[0].completed_at;
          const highestAttempt = [...studentAttempts].sort((a, b) => b.score_percentage - a.score_percentage)[0];
          bestScore = highestAttempt.score_percentage;
          bestSkillLevel = highestAttempt.skill_level_awarded;
          passed = studentAttempts.some(a => a.passed);
        }
      }

      return {
        ...asmt,
        attempts_count: attemptsCount,
        best_score: bestScore,
        best_skill_level: bestSkillLevel,
        last_attempt_date: lastAttemptDate,
        passed
      };
    });
  }

  public getAssessmentById(id: string): AssessmentRecord | undefined {
    return this.data.assessments.find(a => a.id === id);
  }

  public getAssessmentQuestions(assessmentId: string): Array<{
    id: string;
    assessment_id: string;
    question_text: string;
    options: string[];
  }> {
    const questions = this.data.assessment_questions.filter(q => q.assessment_id === assessmentId);
    // Return questions without the correct_option_index or explanation to client test view
    return questions.map(q => ({
      id: q.id,
      assessment_id: q.assessment_id,
      question_text: q.question_text,
      options: q.options
    }));
  }

  public submitAssessmentAttempt(
    studentId: string,
    assessmentId: string,
    timeTakenSeconds: number,
    candidateAnswers: Array<{ question_id: string; selected_option_index: number }>
  ): { attempt: AssessmentAttemptRecord; assessment: AssessmentRecord } | { error: string } {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) {
      return { error: 'Assessment not found' };
    }

    const student = this.findStudentById(studentId);
    if (!student) {
      return { error: 'Student profile not found' };
    }

    const questions = this.data.assessment_questions.filter(q => q.assessment_id === assessmentId);
    if (questions.length === 0) {
      return { error: 'No questions available for this assessment' };
    }

    let correctCount = 0;
    const evaluatedAnswers: AssessmentAttemptAnswer[] = questions.map(q => {
      const candidateAns = candidateAnswers.find(a => a.question_id === q.id);
      const selectedIndex = candidateAns !== undefined ? candidateAns.selected_option_index : -1;
      const isCorrect = selectedIndex === q.correct_option_index;

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        question_id: q.id,
        question_text: q.question_text,
        options: q.options,
        selected_option_index: selectedIndex,
        correct_option_index: q.correct_option_index,
        is_correct: isCorrect,
        explanation: q.explanation
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= assessment.passing_percentage;

    // Skill level calculation
    let skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' = 'Beginner';
    if (scorePercentage >= 90) {
      skillLevel = 'Master';
    } else if (scorePercentage >= 75) {
      skillLevel = 'Advanced';
    } else if (scorePercentage >= 50) {
      skillLevel = 'Intermediate';
    } else {
      skillLevel = 'Beginner';
    }

    const now = new Date().toISOString();
    const newAttempt: AssessmentAttemptRecord = {
      id: crypto.randomUUID(),
      student_id: studentId,
      assessment_id: assessment.id,
      assessment_title: assessment.title,
      category: assessment.category,
      total_questions: questions.length,
      correct_answers_count: correctCount,
      score_percentage: scorePercentage,
      passed,
      skill_level_awarded: skillLevel,
      time_taken_seconds: Math.max(1, timeTakenSeconds),
      completed_at: now,
      answers: evaluatedAnswers
    };

    this.data.assessment_attempts.push(newAttempt);

    // If passed with decent score, automatically reinforce the student's skill in their profile
    if (passed) {
      let skillName = assessment.title.replace(' Assessment', '');
      if (assessment.category === 'Frontend') skillName = 'React';
      if (assessment.category === 'Backend') skillName = 'Node.js';
      if (assessment.category === 'Full Stack') skillName = 'TypeScript';
      if (assessment.category === 'Cloud') skillName = 'Cloud Computing (AWS/GCP)';

      const profLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' =
        skillLevel === 'Master' ? 'Expert' :
        skillLevel === 'Advanced' ? 'Advanced' :
        skillLevel === 'Intermediate' ? 'Intermediate' : 'Beginner';

      const existingSkill = this.data.student_skills.find(
        ss => ss.student_id === studentId &&
        this.data.skills.some(s => s.id === ss.skill_id && s.name.toLowerCase() === skillName.toLowerCase())
      );

      if (existingSkill) {
        existingSkill.proficiency_level = profLevel;
      } else {
        this.addStudentSkill(studentId, skillName, 'technical', profLevel);
      }
    }

    this.saveDatabase();
    return { attempt: newAttempt, assessment };
  }

  public getStudentAssessmentHistory(studentId: string): AssessmentAttemptRecord[] {
    return this.data.assessment_attempts
      .filter(att => att.student_id === studentId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  }

  public getStudentAssessmentStats(studentId: string): {
    total_attempts: number;
    passed_count: number;
    highest_score: number;
    average_score: number;
    verified_badges_count: number;
  } {
    const attempts = this.data.assessment_attempts.filter(att => att.student_id === studentId);
    if (attempts.length === 0) {
      return {
        total_attempts: 0,
        passed_count: 0,
        highest_score: 0,
        average_score: 0,
        verified_badges_count: 0
      };
    }

    const highestScore = Math.max(...attempts.map(a => a.score_percentage));
    const passedCount = attempts.filter(a => a.passed).length;
    const avgScore = Math.round(attempts.reduce((sum, a) => sum + a.score_percentage, 0) / attempts.length);

    // Count unique assessments passed
    const passedAssessmentIds = new Set(attempts.filter(a => a.passed).map(a => a.assessment_id));

    return {
      total_attempts: attempts.length,
      passed_count: passedCount,
      highest_score: highestScore,
      average_score: avgScore,
      verified_badges_count: passedAssessmentIds.size
    };
  }

  // ==========================================
  // Phase 5: Industry / Company Methods
  // ==========================================

  public findCompanyByUserId(userId: string): CompanyRecord | undefined {
    return this.data.companies.find(c => c.user_id === userId);
  }

  public findCompanyById(id: string): CompanyRecord | undefined {
    return this.data.companies.find(c => c.id === id);
  }

  public findCompanyByName(name: string): CompanyRecord | undefined {
    return this.data.companies.find(c => c.company_name.toLowerCase() === name.toLowerCase());
  }

  public createCompany(company: Omit<CompanyRecord, 'id' | 'created_at' | 'updated_at'>): CompanyRecord {
    const now = new Date().toISOString();
    const newCompany: CompanyRecord = {
      ...company,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    this.data.companies.push(newCompany);
    this.saveDatabase();
    return newCompany;
  }

  public updateCompany(id: string, updates: Partial<CompanyRecord>): CompanyRecord | null {
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.data.companies[index] = {
      ...this.data.companies[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.companies[index];
  }

  public getAllCompanies(): CompanyRecord[] {
    return this.data.companies;
  }

  // Job Postings
  public createJob(
    companyId: string,
    jobData: Omit<JobRecord, 'id' | 'company_id' | 'created_at' | 'updated_at'>
  ): JobRecord {
    const now = new Date().toISOString();
    const newJob: JobRecord = {
      ...jobData,
      id: crypto.randomUUID(),
      company_id: companyId,
      created_at: now,
      updated_at: now
    };
    this.data.jobs.push(newJob);
    this.saveDatabase();
    return newJob;
  }

  public updateJob(id: string, companyId: string, updates: Partial<JobRecord>): JobRecord | null {
    const index = this.data.jobs.findIndex(j => j.id === id && j.company_id === companyId);
    if (index === -1) return null;

    this.data.jobs[index] = {
      ...this.data.jobs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.jobs[index];
  }

  public deleteJob(id: string, companyId: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => !(j.id === id && j.company_id === companyId));
    const deleted = this.data.jobs.length < initialLen;
    if (deleted) {
      // Also cleanup applications for this job
      this.data.applications = this.data.applications.filter(a => a.opportunity_id !== id);
      this.saveDatabase();
    }
    return deleted;
  }

  public toggleJobStatus(id: string, companyId: string): JobRecord | null {
    const job = this.data.jobs.find(j => j.id === id && j.company_id === companyId);
    if (!job) return null;
    job.status = job.status === 'active' ? 'closed' : 'active';
    job.updated_at = new Date().toISOString();
    this.saveDatabase();
    return job;
  }

  public getCompanyJobs(companyId: string): Array<JobRecord & { applications_count: number }> {
    return this.data.jobs
      .filter(j => j.company_id === companyId)
      .map(j => ({
        ...j,
        applications_count: this.data.applications.filter(a => a.opportunity_id === j.id).length
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getJobById(id: string): (JobRecord & { company?: CompanyRecord; applications_count: number }) | null {
    const job = this.data.jobs.find(j => j.id === id);
    if (!job) return null;
    const company = this.findCompanyById(job.company_id);
    const applications_count = this.data.applications.filter(a => a.opportunity_id === job.id).length;
    return {
      ...job,
      company,
      applications_count
    };
  }

  public getAllActiveJobs(): Array<JobRecord & { company?: CompanyRecord; applications_count: number }> {
    return this.data.jobs
      .filter(j => j.status === 'active')
      .map(j => ({
        ...j,
        company: this.findCompanyById(j.company_id),
        applications_count: this.data.applications.filter(a => a.opportunity_id === j.id).length
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Internship Postings
  public createInternship(
    companyId: string,
    internshipData: Omit<InternshipRecord, 'id' | 'company_id' | 'created_at' | 'updated_at'>
  ): InternshipRecord {
    const now = new Date().toISOString();
    const newInternship: InternshipRecord = {
      ...internshipData,
      id: crypto.randomUUID(),
      company_id: companyId,
      created_at: now,
      updated_at: now
    };
    this.data.internships.push(newInternship);
    this.saveDatabase();
    return newInternship;
  }

  public updateInternship(
    id: string,
    companyId: string,
    updates: Partial<InternshipRecord>
  ): InternshipRecord | null {
    const index = this.data.internships.findIndex(i => i.id === id && i.company_id === companyId);
    if (index === -1) return null;

    this.data.internships[index] = {
      ...this.data.internships[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.internships[index];
  }

  public deleteInternship(id: string, companyId: string): boolean {
    const initialLen = this.data.internships.length;
    this.data.internships = this.data.internships.filter(i => !(i.id === id && i.company_id === companyId));
    const deleted = this.data.internships.length < initialLen;
    if (deleted) {
      this.data.applications = this.data.applications.filter(a => a.opportunity_id !== id);
      this.saveDatabase();
    }
    return deleted;
  }

  public toggleInternshipStatus(id: string, companyId: string): InternshipRecord | null {
    const internship = this.data.internships.find(i => i.id === id && i.company_id === companyId);
    if (!internship) return null;
    internship.status = internship.status === 'active' ? 'closed' : 'active';
    internship.updated_at = new Date().toISOString();
    this.saveDatabase();
    return internship;
  }

  public getCompanyInternships(companyId: string): Array<InternshipRecord & { applications_count: number }> {
    return this.data.internships
      .filter(i => i.company_id === companyId)
      .map(i => ({
        ...i,
        applications_count: this.data.applications.filter(a => a.opportunity_id === i.id).length
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getInternshipById(id: string): (InternshipRecord & { company?: CompanyRecord; applications_count: number }) | null {
    const internship = this.data.internships.find(i => i.id === id);
    if (!internship) return null;
    const company = this.findCompanyById(internship.company_id);
    const applications_count = this.data.applications.filter(a => a.opportunity_id === internship.id).length;
    return {
      ...internship,
      company,
      applications_count
    };
  }

  public getAllActiveInternships(): Array<InternshipRecord & { company?: CompanyRecord; applications_count: number }> {
    return this.data.internships
      .filter(i => i.status === 'active')
      .map(i => ({
        ...i,
        company: this.findCompanyById(i.company_id),
        applications_count: this.data.applications.filter(a => a.opportunity_id === i.id).length
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Applications Management
  public createApplication(
    studentId: string,
    opportunityId: string,
    opportunityType: 'job' | 'internship',
    coverNote?: string,
    matchScore?: number,
    matchBreakdown?: any
  ): { application: ApplicationRecord; isNew: boolean } {
    let companyId = '';
    if (opportunityType === 'job') {
      const job = this.data.jobs.find(j => j.id === opportunityId);
      if (!job) throw new Error('Job opportunity not found');
      companyId = job.company_id;
    } else {
      const internship = this.data.internships.find(i => i.id === opportunityId);
      if (!internship) throw new Error('Internship opportunity not found');
      companyId = internship.company_id;
    }

    // Check if already applied
    const existing = this.data.applications.find(
      a => a.student_id === studentId && a.opportunity_id === opportunityId
    );

    if (existing) {
      return { application: existing, isNew: false };
    }

    const now = new Date().toISOString();
    const newApp: ApplicationRecord = {
      id: crypto.randomUUID(),
      opportunity_id: opportunityId,
      opportunity_type: opportunityType,
      student_id: studentId,
      company_id: companyId,
      status: 'Applied',
      cover_note: coverNote?.trim(),
      match_score: typeof matchScore === 'number' ? matchScore : undefined,
      match_breakdown: matchBreakdown || undefined,
      applied_at: now,
      updated_at: now
    };

    this.data.applications.push(newApp);
    this.saveDatabase();
    return { application: newApp, isNew: true };
  }

  public getApplicationById(id: string): ApplicationRecord | null {
    return this.data.applications.find(a => a.id === id) || null;
  }

  public getCompanyApplications(companyId: string): Array<any> {
    const apps = this.data.applications.filter(a => a.company_id === companyId);

    return apps
      .map(a => {
        const student = this.findStudentById(a.student_id);
        const studentUser = student ? this.findUserById(student.user_id) : undefined;
        let opportunityTitle = '';
        let opportunityRequiredSkills: string[] = [];

        if (a.opportunity_type === 'job') {
          const job = this.data.jobs.find(j => j.id === a.opportunity_id);
          opportunityTitle = job?.title || 'Unknown Job';
          opportunityRequiredSkills = job?.required_skills || [];
        } else {
          const internship = this.data.internships.find(i => i.id === a.opportunity_id);
          opportunityTitle = internship?.title || 'Unknown Internship';
          opportunityRequiredSkills = internship?.required_skills || [];
        }

        const studentSkills = student ? this.getStudentSkills(student.id) : [];
        const studentProjects = student ? this.getStudentProjects(student.id) : [];
        const studentCertifications = student ? this.getStudentCertifications(student.id) : [];
        const studentAssessmentStats = student ? this.getStudentAssessmentStats(student.id) : null;
        const studentAssessmentHistory = student ? this.getStudentAssessmentHistory(student.id) : [];

        // Matching skills with opportunity requirements
        const studentSkillNames = studentSkills.map(s => s.skill.name.toLowerCase());
        const matchingSkillsCount = opportunityRequiredSkills.filter(req =>
          studentSkillNames.includes(req.toLowerCase())
        ).length;

        // Check for attached or existing mentor feedback
        const mentorFeedback = (this.data.mentor_feedbacks || []).find(
          f => (a.mentor_feedback_id && f.id === a.mentor_feedback_id) ||
               (f.student_id === a.student_id && f.opportunity_id === a.opportunity_id)
        );

        return {
          ...a,
          student: student
            ? {
                ...student,
                email: studentUser?.email,
                skills_count: studentSkills.length,
                projects_count: studentProjects.length,
                certifications_count: studentCertifications.length,
                assessment_badges: studentAssessmentStats?.verified_badges_count || 0
              }
            : null,
          opportunity_title: opportunityTitle,
          opportunity_required_skills: opportunityRequiredSkills,
          matching_skills_count: matchingSkillsCount,
          student_skills: studentSkills,
          student_projects: studentProjects,
          student_certifications: studentCertifications,
          student_assessment_stats: studentAssessmentStats,
          student_assessment_history: studentAssessmentHistory,
          mentor_feedback: mentorFeedback || null
        };
      })
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }

  public getStudentApplications(studentId: string): Array<any> {
    const apps = this.data.applications.filter(a => a.student_id === studentId);

    return apps
      .map(a => {
        const company = this.findCompanyById(a.company_id);
        let opportunity: any = null;
        if (a.opportunity_type === 'job') {
          opportunity = this.data.jobs.find(j => j.id === a.opportunity_id);
        } else {
          opportunity = this.data.internships.find(i => i.id === a.opportunity_id);
        }

        const mentorFeedback = (this.data.mentor_feedbacks || []).find(
          f => (a.mentor_feedback_id && f.id === a.mentor_feedback_id) ||
               (f.student_id === a.student_id && f.opportunity_id === a.opportunity_id)
        );

        return {
          ...a,
          company: company
            ? {
                id: company.id,
                company_name: company.company_name,
                industry: company.industry,
                location: company.location,
                logo: company.logo
              }
            : null,
          opportunity,
          mentor_feedback: mentorFeedback || null
        };
      })
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }

  public updateApplicationStatus(
    applicationId: string,
    companyId: string,
    status: ApplicationRecord['status'],
    notes?: string,
    evidence?: {
      completion_date?: string;
      certificate_reference?: string;
      certificate_url?: string;
      portfolio_link?: string;
      mentor_feedback_id?: string;
      completion_notes?: string;
    }
  ): ApplicationRecord | null {
    const app = this.data.applications.find(
      a => a.id === applicationId && a.company_id === companyId
    );
    if (!app) return null;

    app.status = status;
    if (notes !== undefined) {
      app.notes = notes;
    }
    if (evidence) {
      if (evidence.completion_date !== undefined) app.completion_date = evidence.completion_date;
      if (evidence.certificate_reference !== undefined) app.certificate_reference = evidence.certificate_reference;
      if (evidence.certificate_url !== undefined) app.certificate_url = evidence.certificate_url;
      if (evidence.portfolio_link !== undefined) app.portfolio_link = evidence.portfolio_link;
      if (evidence.mentor_feedback_id !== undefined) app.mentor_feedback_id = evidence.mentor_feedback_id;
      if (evidence.completion_notes !== undefined) app.completion_notes = evidence.completion_notes;
    }
    app.updated_at = new Date().toISOString();
    this.saveDatabase();
    return app;
  }

  public updateStudentApplicationEvidence(
    applicationId: string,
    studentId: string,
    evidence: {
      completion_date?: string;
      certificate_reference?: string;
      certificate_url?: string;
      portfolio_link?: string;
      completion_notes?: string;
    }
  ): ApplicationRecord | null {
    const app = this.data.applications.find(
      a => a.id === applicationId && a.student_id === studentId
    );
    if (!app) return null;

    if (evidence.completion_date !== undefined) app.completion_date = evidence.completion_date;
    if (evidence.certificate_reference !== undefined) app.certificate_reference = evidence.certificate_reference;
    if (evidence.certificate_url !== undefined) app.certificate_url = evidence.certificate_url;
    if (evidence.portfolio_link !== undefined) app.portfolio_link = evidence.portfolio_link;
    if (evidence.completion_notes !== undefined) app.completion_notes = evidence.completion_notes;
    app.updated_at = new Date().toISOString();
    this.saveDatabase();
    return app;
  }

  public getStudentFullProfileForEmployer(studentId: string): any | null {
    const student = this.findStudentById(studentId);
    if (!student) return null;
    const studentUser = this.findUserById(student.user_id);
    const skills = this.getStudentSkills(student.id);
    const projects = this.getStudentProjects(student.id);
    const certifications = this.getStudentCertifications(student.id);
    const assessmentStats = this.getStudentAssessmentStats(student.id);
    const assessmentHistory = this.getStudentAssessmentHistory(student.id);
    const completion = this.calculateProfileCompletion(student.id);

    return {
      ...student,
      email: studentUser?.email,
      skills,
      projects,
      certifications,
      assessment_stats: assessmentStats,
      assessment_history: assessmentHistory,
      profile_completion: completion.percentage
    };
  }

  public getCompanyDashboardStats(companyId: string): {
    company: CompanyRecord;
    active_jobs_count: number;
    active_internships_count: number;
    total_jobs_count: number;
    total_internships_count: number;
    total_applications_count: number;
    shortlisted_candidates_count: number;
    selected_candidates_count: number;
    under_review_count: number;
    recent_applications: any[];
    recent_postings: any[];
  } | null {
    const company = this.findCompanyById(companyId);
    if (!company) return null;

    const jobs = this.data.jobs.filter(j => j.company_id === companyId);
    const internships = this.data.internships.filter(i => i.company_id === companyId);
    const applications = this.getCompanyApplications(companyId);

    const activeJobs = jobs.filter(j => j.status === 'active');
    const activeInternships = internships.filter(i => i.status === 'active');
    const shortlisted = applications.filter(a => a.status === 'Shortlisted');
    const selected = applications.filter(a => a.status === 'Selected');
    const underReview = applications.filter(a => a.status === 'Under Review');

    // Combine recent postings
    const combinedPostings = [
      ...jobs.map(j => ({ ...j, type: 'job' as const })),
      ...internships.map(i => ({ ...i, type: 'internship' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    return {
      company,
      active_jobs_count: activeJobs.length,
      active_internships_count: activeInternships.length,
      total_jobs_count: jobs.length,
      total_internships_count: internships.length,
      total_applications_count: applications.length,
      shortlisted_candidates_count: shortlisted.length,
      selected_candidates_count: selected.length,
      under_review_count: underReview.length,
      recent_applications: applications.slice(0, 6),
      recent_postings: combinedPostings
    };
  }

  // Phase 8: Industry Mentor Feedback Operations
  public createOrUpdateMentorFeedback(
    companyId: string,
    payload: {
      id?: string;
      student_id: string;
      opportunity_id: string;
      opportunity_type?: 'job' | 'internship';
      mentor_name: string;
      mentor_title?: string;
      mentor_email?: string;
      evaluation_period: string;
      technical_competence: number;
      problem_solving: number;
      communication: number;
      teamwork_collaboration: number;
      professionalism_work_ethic: number;
      learning_ability: number;
      overall_performance: number;
      strengths: string;
      areas_for_improvement: string;
      mentor_comments: string;
      hire_recommendation: 'Recommended' | 'Consider' | 'Not Recommended';
    }
  ): { feedback: MentorFeedbackRecord; isNew: boolean } {
    const studentId = this.resolveStudentId(payload.student_id);
    const student = this.findStudentById(studentId);
    if (!student) {
      throw new Error('Target student not found');
    }

    const company = this.findCompanyById(companyId);
    if (!company) {
      throw new Error('Authorized company profile not found');
    }

    // Determine opportunity type if not provided
    let oppType: 'job' | 'internship' = payload.opportunity_type || 'internship';
    const job = this.data.jobs.find(j => j.id === payload.opportunity_id);
    const intern = this.data.internships.find(i => i.id === payload.opportunity_id);
    if (job) {
      if (job.company_id !== companyId) {
        throw new Error('Unauthorized: Opportunity does not belong to this company');
      }
      oppType = 'job';
    } else if (intern) {
      if (intern.company_id !== companyId) {
        throw new Error('Unauthorized: Opportunity does not belong to this company');
      }
      oppType = 'internship';
    } else {
      throw new Error('Associated opportunity not found');
    }

    const clamp = (val: number) => {
      const num = Number(val);
      if (isNaN(num)) return 3;
      return Math.min(5, Math.max(1, Math.round(num * 10) / 10));
    };

    const tech = clamp(payload.technical_competence);
    const prob = clamp(payload.problem_solving);
    const comm = clamp(payload.communication);
    const team = clamp(payload.teamwork_collaboration);
    const ethic = clamp(payload.professionalism_work_ethic);
    const learn = clamp(payload.learning_ability);
    const overall = clamp(payload.overall_performance);

    const average_score = Math.round(((tech + prob + comm + team + ethic + learn + overall) / 7) * 10) / 10;
    const now = new Date().toISOString();

    // Check if updating by explicit ID or by unique (student + opportunity + period + company)
    let existingIndex = -1;
    if (payload.id) {
      existingIndex = this.data.mentor_feedbacks.findIndex(
        f => f.id === payload.id && f.company_id === companyId
      );
    }

    if (existingIndex === -1) {
      existingIndex = this.data.mentor_feedbacks.findIndex(
        f =>
          f.student_id === studentId &&
          f.opportunity_id === payload.opportunity_id &&
          f.company_id === companyId &&
          f.evaluation_period.trim().toLowerCase() === (payload.evaluation_period || '').trim().toLowerCase()
      );
    }

    if (existingIndex !== -1) {
      const existing = this.data.mentor_feedbacks[existingIndex];
      const updated: MentorFeedbackRecord = {
        ...existing,
        student_id: studentId,
        company_id: companyId,
        opportunity_id: payload.opportunity_id,
        opportunity_type: oppType,
        mentor_name: payload.mentor_name.trim(),
        mentor_title: payload.mentor_title?.trim() || existing.mentor_title || 'Industry Mentor',
        mentor_email: payload.mentor_email?.trim() || existing.mentor_email,
        evaluation_period: payload.evaluation_period?.trim() || existing.evaluation_period,
        technical_competence: tech,
        problem_solving: prob,
        communication: comm,
        teamwork_collaboration: team,
        professionalism_work_ethic: ethic,
        learning_ability: learn,
        overall_performance: overall,
        average_score,
        strengths: payload.strengths?.trim() || 'Demonstrated good technical capabilities and work ethic.',
        areas_for_improvement: payload.areas_for_improvement?.trim() || 'Continue expanding hands-on domain experience.',
        mentor_comments: payload.mentor_comments?.trim() || '',
        hire_recommendation: payload.hire_recommendation || 'Recommended',
        updated_at: now
      };
      this.data.mentor_feedbacks[existingIndex] = updated;
      this.saveDatabase();
      return { feedback: updated, isNew: false };
    }

    const newFeedback: MentorFeedbackRecord = {
      id: crypto.randomUUID(),
      student_id: studentId,
      company_id: companyId,
      opportunity_id: payload.opportunity_id,
      opportunity_type: oppType,
      mentor_name: payload.mentor_name.trim(),
      mentor_title: payload.mentor_title?.trim() || 'Industry Mentor',
      mentor_email: payload.mentor_email?.trim() || company.contact_email,
      evaluation_period: payload.evaluation_period?.trim() || 'Summer 2026 Internship',
      technical_competence: tech,
      problem_solving: prob,
      communication: comm,
      teamwork_collaboration: team,
      professionalism_work_ethic: ethic,
      learning_ability: learn,
      overall_performance: overall,
      average_score,
      strengths: payload.strengths?.trim() || 'Demonstrated solid technical problem solving and teamwork.',
      areas_for_improvement: payload.areas_for_improvement?.trim() || 'Deepen production system design and testing.',
      mentor_comments: payload.mentor_comments?.trim() || 'Solid contributor with strong learning agility.',
      hire_recommendation: payload.hire_recommendation || 'Recommended',
      created_at: now,
      updated_at: now
    };

    this.data.mentor_feedbacks.push(newFeedback);
    this.saveDatabase();
    return { feedback: newFeedback, isNew: true };
  }

  public getMentorFeedbackById(id: string): (MentorFeedbackRecord & { student?: StudentRecord; company?: CompanyRecord; opportunity_title?: string }) | null {
    const feedback = this.data.mentor_feedbacks.find(f => f.id === id);
    if (!feedback) return null;

    const student = this.findStudentById(feedback.student_id);
    const company = this.findCompanyById(feedback.company_id);
    let opportunity_title = 'Opportunity';
    if (feedback.opportunity_type === 'job') {
      const job = this.data.jobs.find(j => j.id === feedback.opportunity_id);
      opportunity_title = job?.title || 'Job Posting';
    } else {
      const intern = this.data.internships.find(i => i.id === feedback.opportunity_id);
      opportunity_title = intern?.title || 'Internship Posting';
    }

    return {
      ...feedback,
      student,
      company,
      opportunity_title
    };
  }

  public getStudentMentorFeedbacks(studentId: string): Array<MentorFeedbackRecord & { company?: CompanyRecord; opportunity_title?: string }> {
    const resolvedId = this.resolveStudentId(studentId);
    return this.data.mentor_feedbacks
      .filter(f => f.student_id === resolvedId || f.student_id === studentId)
      .map(f => {
        const company = this.findCompanyById(f.company_id);
        let opportunity_title = 'Opportunity';
        if (f.opportunity_type === 'job') {
          const job = this.data.jobs.find(j => j.id === f.opportunity_id);
          opportunity_title = job?.title || 'Full-Time Role';
        } else {
          const intern = this.data.internships.find(i => i.id === f.opportunity_id);
          opportunity_title = intern?.title || 'Internship';
        }
        return {
          ...f,
          company,
          opportunity_title
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getCompanyMentorFeedbacks(companyId: string): Array<MentorFeedbackRecord & { student?: StudentRecord; student_name?: string; student_department?: string; opportunity_title?: string }> {
    return this.data.mentor_feedbacks
      .filter(f => f.company_id === companyId)
      .map(f => {
        const student = this.findStudentById(f.student_id);
        let opportunity_title = 'Opportunity';
        if (f.opportunity_type === 'job') {
          const job = this.data.jobs.find(j => j.id === f.opportunity_id);
          opportunity_title = job?.title || 'Full-Time Role';
        } else {
          const intern = this.data.internships.find(i => i.id === f.opportunity_id);
          opportunity_title = intern?.title || 'Internship';
        }
        return {
          ...f,
          student,
          student_name: student?.full_name || 'Student Candidate',
          student_department: student?.department || 'Engineering',
          opportunity_title
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getCompanyPendingEvaluations(companyId: string): {
    pending: Array<{
      application_id: string;
      student_id: string;
      student_name: string;
      student_department: string;
      student_photo: string;
      opportunity_id: string;
      opportunity_type: 'job' | 'internship';
      opportunity_title: string;
      application_status: string;
      applied_at: string;
      has_evaluation: boolean;
      existing_feedback_id?: string;
    }>;
    completed: Array<MentorFeedbackRecord & { student?: StudentRecord; student_name?: string; student_department?: string; opportunity_title?: string }>;
    stats: {
      total_candidates: number;
      pending_count: number;
      completed_count: number;
      average_score: number;
      hire_recommendation_rate: number;
    };
  } {
    const apps = this.data.applications.filter(a => a.company_id === companyId);
    const completedFeedbacks = this.getCompanyMentorFeedbacks(companyId);

    const candidatesList = apps.map(app => {
      const student = this.findStudentById(app.student_id);
      let oppTitle = 'Opportunity';
      if (app.opportunity_type === 'job') {
        const job = this.data.jobs.find(j => j.id === app.opportunity_id);
        oppTitle = job?.title || 'Job';
      } else {
        const intern = this.data.internships.find(i => i.id === app.opportunity_id);
        oppTitle = intern?.title || 'Internship';
      }

      const existingFeedback = completedFeedbacks.find(
        f => f.student_id === app.student_id && f.opportunity_id === app.opportunity_id
      );

      return {
        application_id: app.id,
        student_id: app.student_id,
        student_name: student?.full_name || 'Student Candidate',
        student_department: student?.department || 'Computer Science',
        student_photo: student?.profile_photo || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(student?.full_name || 'Student')}`,
        opportunity_id: app.opportunity_id,
        opportunity_type: app.opportunity_type,
        opportunity_title: oppTitle,
        application_status: app.status,
        applied_at: app.applied_at,
        has_evaluation: !!existingFeedback,
        existing_feedback_id: existingFeedback?.id
      };
    });

    const pending = candidatesList.filter(c => !c.has_evaluation);
    const avgScore = completedFeedbacks.length > 0
      ? Math.round((completedFeedbacks.reduce((acc, f) => acc + f.average_score, 0) / completedFeedbacks.length) * 10) / 10
      : 0;

    const recommendedCount = completedFeedbacks.filter(f => f.hire_recommendation === 'Recommended').length;
    const hireRate = completedFeedbacks.length > 0
      ? Math.round((recommendedCount / completedFeedbacks.length) * 100)
      : 0;

    return {
      pending,
      completed: completedFeedbacks,
      stats: {
        total_candidates: candidatesList.length,
        pending_count: pending.length,
        completed_count: completedFeedbacks.length,
        average_score: avgScore,
        hire_recommendation_rate: hireRate
      }
    };
  }

  public getStudentFeedbackSummary(studentId: string): {
    feedbacks: Array<MentorFeedbackRecord & { company?: CompanyRecord; opportunity_title?: string }>;
    average_score: number;
    total_evaluations: number;
    hire_recommendation_rate: number;
    rubric_breakdown: {
      technical_competence: number;
      problem_solving: number;
      communication: number;
      teamwork_collaboration: number;
      professionalism_work_ethic: number;
      learning_ability: number;
      overall_performance: number;
    };
    industry_validated_strengths: string[];
    latest_feedback?: MentorFeedbackRecord & { company_name?: string; opportunity_title?: string };
  } {
    const feedbacks = this.getStudentMentorFeedbacks(studentId);
    if (feedbacks.length === 0) {
      return {
        feedbacks: [],
        average_score: 0,
        total_evaluations: 0,
        hire_recommendation_rate: 0,
        rubric_breakdown: {
          technical_competence: 0,
          problem_solving: 0,
          communication: 0,
          teamwork_collaboration: 0,
          professionalism_work_ethic: 0,
          learning_ability: 0,
          overall_performance: 0
        },
        industry_validated_strengths: []
      };
    }

    const n = feedbacks.length;
    const avgScore = Math.round((feedbacks.reduce((acc, f) => acc + f.average_score, 0) / n) * 10) / 10;
    const recCount = feedbacks.filter(f => f.hire_recommendation === 'Recommended').length;
    const hireRate = Math.round((recCount / n) * 100);

    const rubric = {
      technical_competence: Math.round((feedbacks.reduce((acc, f) => acc + f.technical_competence, 0) / n) * 10) / 10,
      problem_solving: Math.round((feedbacks.reduce((acc, f) => acc + f.problem_solving, 0) / n) * 10) / 10,
      communication: Math.round((feedbacks.reduce((acc, f) => acc + f.communication, 0) / n) * 10) / 10,
      teamwork_collaboration: Math.round((feedbacks.reduce((acc, f) => acc + f.teamwork_collaboration, 0) / n) * 10) / 10,
      professionalism_work_ethic: Math.round((feedbacks.reduce((acc, f) => acc + f.professionalism_work_ethic, 0) / n) * 10) / 10,
      learning_ability: Math.round((feedbacks.reduce((acc, f) => acc + f.learning_ability, 0) / n) * 10) / 10,
      overall_performance: Math.round((feedbacks.reduce((acc, f) => acc + f.overall_performance, 0) / n) * 10) / 10
    };

    // Extract industry validated strengths from comments and high ratings
    const strengthsSet = new Set<string>();
    feedbacks.forEach(f => {
      if (f.technical_competence >= 4) strengthsSet.add('Technical Execution & Code Quality');
      if (f.problem_solving >= 4) strengthsSet.add('Algorithmic Problem Solving');
      if (f.teamwork_collaboration >= 4) strengthsSet.add('Agile Teamwork & Collaboration');
      if (f.professionalism_work_ethic >= 4) strengthsSet.add('Reliability & Professionalism');
      if (f.learning_ability >= 4) strengthsSet.add('Rapid Technology Acquisition');
      if (f.communication >= 4) strengthsSet.add('Technical Communication');
      if (f.strengths) {
        f.strengths.split(/[,.;]/).forEach(s => {
          const clean = s.trim();
          if (clean.length > 3 && clean.length < 50) strengthsSet.add(clean);
        });
      }
    });

    const latest = feedbacks[0];
    return {
      feedbacks,
      average_score: avgScore,
      total_evaluations: n,
      hire_recommendation_rate: hireRate,
      rubric_breakdown: rubric,
      industry_validated_strengths: Array.from(strengthsSet).slice(0, 6),
      latest_feedback: latest ? {
        ...latest,
        company_name: latest.company?.company_name || 'Industry Partner'
      } : undefined
    };
  }

  public getCollegeMentorFeedbackAnalytics(): {
    total_evaluations: number;
    average_overall_score: number;
    technical_competence_avg: number;
    soft_skills_avg: number;
    work_ethic_avg: number;
    hire_recommendation_rate: number;
    recommendation_distribution: {
      recommended_count: number;
      recommended_percentage: number;
      consider_count: number;
      consider_percentage: number;
      not_recommended_count: number;
      not_recommended_percentage: number;
    };
    rubric_averages: {
      technical_competence: number;
      problem_solving: number;
      communication: number;
      teamwork_collaboration: number;
      professionalism_work_ethic: number;
      learning_ability: number;
      overall_performance: number;
    };
    top_rated_students: Array<{
      student_id: string;
      student_name: string;
      department: string;
      average_score: number;
      evaluations_count: number;
      hire_recommendation: string;
      latest_company: string;
      key_strength: string;
    }>;
    common_improvement_areas: Array<{
      category: string;
      frequency: number;
      examples: string[];
    }>;
    company_feedback_summaries: Array<{
      company_id: string;
      company_name: string;
      evaluations_count: number;
      average_score: number;
      hire_recommendation_rate: number;
    }>;
    recent_feedbacks: Array<MentorFeedbackRecord & { student_name: string; student_department: string; company_name: string; opportunity_title: string }>;
  } {
    const all = this.data.mentor_feedbacks;
    const count = all.length;

    if (count === 0) {
      return {
        total_evaluations: 0,
        average_overall_score: 0,
        technical_competence_avg: 0,
        soft_skills_avg: 0,
        work_ethic_avg: 0,
        hire_recommendation_rate: 0,
        recommendation_distribution: {
          recommended_count: 0,
          recommended_percentage: 0,
          consider_count: 0,
          consider_percentage: 0,
          not_recommended_count: 0,
          not_recommended_percentage: 0
        },
        rubric_averages: {
          technical_competence: 0,
          problem_solving: 0,
          communication: 0,
          teamwork_collaboration: 0,
          professionalism_work_ethic: 0,
          learning_ability: 0,
          overall_performance: 0
        },
        top_rated_students: [],
        common_improvement_areas: [],
        company_feedback_summaries: [],
        recent_feedbacks: []
      };
    }

    const avgOverall = Math.round((all.reduce((acc, f) => acc + f.average_score, 0) / count) * 10) / 10;
    const avgTech = Math.round((all.reduce((acc, f) => acc + f.technical_competence, 0) / count) * 10) / 10;
    const avgProb = Math.round((all.reduce((acc, f) => acc + f.problem_solving, 0) / count) * 10) / 10;
    const avgComm = Math.round((all.reduce((acc, f) => acc + f.communication, 0) / count) * 10) / 10;
    const avgTeam = Math.round((all.reduce((acc, f) => acc + f.teamwork_collaboration, 0) / count) * 10) / 10;
    const avgEthic = Math.round((all.reduce((acc, f) => acc + f.professionalism_work_ethic, 0) / count) * 10) / 10;
    const avgLearn = Math.round((all.reduce((acc, f) => acc + f.learning_ability, 0) / count) * 10) / 10;
    const avgPerf = Math.round((all.reduce((acc, f) => acc + f.overall_performance, 0) / count) * 10) / 10;

    const softAvg = Math.round(((avgComm + avgTeam + avgLearn) / 3) * 10) / 10;

    const recCount = all.filter(f => f.hire_recommendation === 'Recommended').length;
    const considerCount = all.filter(f => f.hire_recommendation === 'Consider').length;
    const notRecCount = all.filter(f => f.hire_recommendation === 'Not Recommended').length;

    const hireRate = Math.round((recCount / count) * 100);

    // Group by student
    const studentMap = new Map<string, MentorFeedbackRecord[]>();
    all.forEach(f => {
      const arr = studentMap.get(f.student_id) || [];
      arr.push(f);
      studentMap.set(f.student_id, arr);
    });

    const topRatedStudents: Array<{
      student_id: string;
      student_name: string;
      department: string;
      average_score: number;
      evaluations_count: number;
      hire_recommendation: string;
      latest_company: string;
      key_strength: string;
    }> = [];

    studentMap.forEach((feedbacks, sId) => {
      const student = this.findStudentById(sId);
      if (student) {
        const studentAvg = Math.round((feedbacks.reduce((a, b) => a + b.average_score, 0) / feedbacks.length) * 10) / 10;
        const lastCompany = this.findCompanyById(feedbacks[0].company_id);
        topRatedStudents.push({
          student_id: student.id,
          student_name: student.full_name,
          department: student.department,
          average_score: studentAvg,
          evaluations_count: feedbacks.length,
          hire_recommendation: feedbacks[0].hire_recommendation,
          latest_company: lastCompany?.company_name || 'Industry Partner',
          key_strength: feedbacks[0].strengths
        });
      }
    });

    topRatedStudents.sort((a, b) => b.average_score - a.average_score);

    // Group by company
    const companyMap = new Map<string, MentorFeedbackRecord[]>();
    all.forEach(f => {
      const arr = companyMap.get(f.company_id) || [];
      arr.push(f);
      companyMap.set(f.company_id, arr);
    });

    const companySummaries: Array<{
      company_id: string;
      company_name: string;
      evaluations_count: number;
      average_score: number;
      hire_recommendation_rate: number;
    }> = [];

    companyMap.forEach((feedbacks, cId) => {
      const company = this.findCompanyById(cId);
      const cAvg = Math.round((feedbacks.reduce((a, b) => a + b.average_score, 0) / feedbacks.length) * 10) / 10;
      const cRec = feedbacks.filter(f => f.hire_recommendation === 'Recommended').length;
      companySummaries.push({
        company_id: cId,
        company_name: company?.company_name || 'Partner Company',
        evaluations_count: feedbacks.length,
        average_score: cAvg,
        hire_recommendation_rate: Math.round((cRec / feedbacks.length) * 100)
      });
    });

    companySummaries.sort((a, b) => b.evaluations_count - a.evaluations_count);

    // Common improvement areas synthesis
    const commonImprovementAreas = [
      {
        category: 'Production System Testing & CI/CD',
        frequency: Math.max(1, Math.round(count * 0.65)),
        examples: ['Automated integration testing', 'Dockerized deployment workflows', 'Telemetry logging']
      },
      {
        category: 'Distributed Architecture & Scaling',
        frequency: Math.max(1, Math.round(count * 0.5)),
        examples: ['Database query optimization', 'Caching strategies with Redis', 'Microservices design']
      },
      {
        category: 'Code Review & Technical Documentation',
        frequency: Math.max(1, Math.round(count * 0.4)),
        examples: ['API contract documentation with OpenAPI/Swagger', 'Pull request review turnaround']
      },
      {
        category: 'Cloud Security & Access Controls',
        frequency: Math.max(1, Math.round(count * 0.35)),
        examples: ['IAM least-privilege principle', 'Secret management & env variables']
      }
    ];

    const recentFeedbacks = all
      .map(f => {
        const student = this.findStudentById(f.student_id);
        const company = this.findCompanyById(f.company_id);
        let oppTitle = 'Opportunity';
        if (f.opportunity_type === 'job') {
          const job = this.data.jobs.find(j => j.id === f.opportunity_id);
          oppTitle = job?.title || 'Job';
        } else {
          const intern = this.data.internships.find(i => i.id === f.opportunity_id);
          oppTitle = intern?.title || 'Internship';
        }
        return {
          ...f,
          student_name: student?.full_name || 'Student Candidate',
          student_department: student?.department || 'Computer Science',
          company_name: company?.company_name || 'Partner Company',
          opportunity_title: oppTitle
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      total_evaluations: count,
      average_overall_score: avgOverall,
      technical_competence_avg: avgTech,
      soft_skills_avg: softAvg,
      work_ethic_avg: avgEthic,
      hire_recommendation_rate: hireRate,
      recommendation_distribution: {
        recommended_count: recCount,
        recommended_percentage: Math.round((recCount / count) * 100),
        consider_count: considerCount,
        consider_percentage: Math.round((considerCount / count) * 100),
        not_recommended_count: notRecCount,
        not_recommended_percentage: Math.round((notRecCount / count) * 100)
      },
      rubric_averages: {
        technical_competence: avgTech,
        problem_solving: avgProb,
        communication: avgComm,
        teamwork_collaboration: avgTeam,
        professionalism_work_ethic: avgEthic,
        learning_ability: avgLearn,
        overall_performance: avgPerf
      },
      top_rated_students: topRatedStudents,
      common_improvement_areas: commonImprovementAreas,
      company_feedback_summaries: companySummaries,
      recent_feedbacks: recentFeedbacks
    };
  }

  public deleteMentorFeedback(id: string, companyId: string): boolean {
    const initialLen = this.data.mentor_feedbacks.length;
    this.data.mentor_feedbacks = this.data.mentor_feedbacks.filter(
      f => !(f.id === id && f.company_id === companyId)
    );
    const deleted = this.data.mentor_feedbacks.length < initialLen;
    if (deleted) {
      this.saveDatabase();
    }
    return deleted;
  }
}

export const db = new DatabaseService();
