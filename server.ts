import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import studentRoutes from './server/routes/student.js';
import skillsRoutes from './server/routes/skills.js';
import assessmentsRoutes from './server/routes/assessments.js';
import skillGapRoutes from './server/routes/skillGap.js';
import industryRoutes from './server/routes/industry.js';
import opportunitiesRoutes from './server/routes/opportunities.js';
import matchingRoutes from './server/routes/matching.js';
import collegeRoutes from './server/routes/college.js';
import feedbackRoutes from './server/routes/feedback.js';
import analyticsRoutes from './server/routes/analytics.js';
import { db, DB_FILE, PROJECT_ROOT } from './server/db.js';
import { hashPassword } from './server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDemoDataIfNeeded() {
  let demoStudent = db.findUserByEmail('alex.chen@university.edu');
  let studentRecord: any = null;

  if (!demoStudent) {
    console.log('Seeding demo student account (alex.chen@university.edu)...');
    const pwdHash = await hashPassword('password123');
    const user = db.createUser({
      email: 'alex.chen@university.edu',
      password_hash: pwdHash,
      role: 'student'
    });

    const student = db.createStudent({
      user_id: user.id,
      full_name: 'Alex Chen',
      phone: '+1 (555) 234-5678',
      college_name: 'Institute of Technology & Science',
      department: 'Computer Science and Engineering',
      year_of_study: '3rd Year',
      cgpa: 8.92,
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Passionate computer science undergraduate focusing on full-stack web development, distributed systems, and collaborative engineering.'
    });
    studentRecord = student;

    // Seed Skills
    db.addStudentSkill(student.id, 'React', 'technical', 'Advanced');
    db.addStudentSkill(student.id, 'TypeScript', 'technical', 'Advanced');
    db.addStudentSkill(student.id, 'Node.js', 'technical', 'Intermediate');
    db.addStudentSkill(student.id, 'Python', 'technical', 'Intermediate');
    db.addStudentSkill(student.id, 'SQL', 'technical', 'Intermediate');
    db.addStudentSkill(student.id, 'Communication', 'soft', 'Advanced');
    db.addStudentSkill(student.id, 'Teamwork & Collaboration', 'soft', 'Expert');
    db.addStudentSkill(student.id, 'Problem Solving', 'soft', 'Advanced');

    // Seed Projects
    db.createProject(student.id, {
      title: 'EduCollab - Peer Learning Network',
      description: 'A real-time collaborative workspace for university students to share course notes, schedule peer review sessions, and exchange code snippets with live syntax highlighting.',
      technologies: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'Tailwind CSS'],
      project_link: 'https://github.com/alexchen/educollab'
    });

    db.createProject(student.id, {
      title: 'Smart Campus Resource Scheduler',
      description: 'An automated reservation portal for campus lab computers, seminar halls, and project hardware kits with calendar conflict resolution algorithms.',
      technologies: ['Python', 'Flask', 'PostgreSQL', 'Docker'],
      project_link: 'https://github.com/alexchen/smart-campus'
    });

    // Seed Certifications
    db.createCertification(student.id, {
      certificate_name: 'AWS Certified Cloud Practitioner',
      issuing_organization: 'Amazon Web Services (AWS)',
      issue_date: '2025-11-15',
      certificate_link: 'https://aws.amazon.com/verification/sample-id-12345'
    });

    db.createCertification(student.id, {
      certificate_name: 'Meta Front-End Developer Professional Certificate',
      issuing_organization: 'Meta / Coursera',
      issue_date: '2025-06-20',
      certificate_link: 'https://coursera.org/verify/sample-meta-6789'
    });
  } else {
    studentRecord = db.findStudentByUserId(demoStudent.id);
  }

  // Phase 5: Seed Demo Industry Accounts
  const existingCompanyUser = db.findUserByEmail('recruiting@cloudscale.tech');
  if (!existingCompanyUser) {
    console.log('Seeding demo industry account (recruiting@cloudscale.tech)...');
    const pwdHash = await hashPassword('password123');
    const user = db.createUser({
      email: 'recruiting@cloudscale.tech',
      password_hash: pwdHash,
      role: 'industry'
    });

    const company = db.createCompany({
      user_id: user.id,
      company_name: 'CloudScale Technologies',
      description: 'CloudScale Technologies builds next-generation cloud infrastructure, enterprise Kubernetes orchestration platforms, and modern microservice developer tooling for global Fortune 500 enterprises.',
      industry: 'Cloud Infrastructure & Enterprise SaaS',
      website: 'https://cloudscale.tech',
      location: 'San Francisco, CA & Bengaluru, India',
      company_size: '201-500 employees',
      contact_email: 'recruiting@cloudscale.tech',
      contact_phone: '+1 (555) 456-7890',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80'
    });

    // Seed Job Postings
    const job1 = db.createJob(company.id, {
      title: 'Associate Full-Stack Cloud Engineer',
      description: 'Join our Platform Team to build resilient microservice APIs, developer consoles, and scalable web dashboards using React, TypeScript, Node.js, and Docker.',
      employment_type: 'Full-time',
      location: 'Remote / San Francisco',
      work_arrangement: 'Remote',
      required_skills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Docker'],
      min_qualification: 'B.Tech / B.E / MCA in Computer Science or related IT discipline',
      experience_level: '0-1 Years (Entry Level)',
      application_deadline: '2026-11-30',
      number_of_openings: 3,
      responsibilities: [
        'Develop responsive web interfaces in modern React & TypeScript',
        'Implement performant RESTful endpoints and microservices in Node.js',
        'Collaborate with cloud architects to containerize apps using Docker',
        'Participate in agile sprint ceremonies and code reviews'
      ],
      preferred_skills: ['Tailwind CSS', 'Git & GitHub', 'Cloud Computing (AWS/GCP)'],
      status: 'active'
    });

    db.createJob(company.id, {
      title: 'Backend Systems Developer',
      description: 'Design and optimize high-throughput data processing pipelines, database caching layers, and secure backend microservices.',
      employment_type: 'Full-time',
      location: 'Bengaluru, India (Hybrid)',
      work_arrangement: 'Hybrid',
      required_skills: ['Python', 'SQL', 'Data Structures & Algorithms', 'Docker', 'REST APIs'],
      min_qualification: 'B.Tech in Computer Science / Information Science',
      experience_level: '1-3 Years',
      application_deadline: '2026-12-15',
      number_of_openings: 2,
      responsibilities: [
        'Engineer low-latency distributed APIs and database query layers',
        'Implement relational database schemas, indexes, and migrations',
        'Build automated unit and integration test suites'
      ],
      preferred_skills: ['Cloud Computing (AWS/GCP)', 'Node.js'],
      status: 'active'
    });

    // Seed Internship Postings
    const intern1 = db.createInternship(company.id, {
      title: 'Summer Cloud & DevOps Intern',
      description: 'Hands-on summer internship working alongside senior Site Reliability Engineers on automated CI/CD deployment pipelines, container orchestration, and cloud infrastructure monitoring.',
      required_skills: ['Docker', 'Cloud Computing (AWS/GCP)', 'Git & GitHub', 'Python'],
      duration: '6 Months',
      stipend: '₹35,000 / month ($1,500/mo)',
      location: 'Bengaluru, India / Hybrid',
      work_arrangement: 'Hybrid',
      eligibility: 'Pre-final and final year undergraduate engineering students (3rd & 4th Year B.Tech / BE)',
      application_deadline: '2026-10-31',
      number_of_openings: 5,
      responsibilities: [
        'Configure Docker container images and multi-stage build workflows',
        'Assist in creating automated GitHub Actions deployment pipelines',
        'Monitor server telemetry and log visualization dashboards'
      ],
      learning_outcomes: [
        'Production experience with modern cloud ecosystems (AWS / GCP)',
        'Proficiency in containerization, Kubernetes fundamentals, and CI/CD pipelines',
        'Industry mentorship with direct return offer evaluation'
      ],
      status: 'active'
    });

    const intern2 = db.createInternship(company.id, {
      title: 'Frontend Engineering Intern (React & TypeScript)',
      description: 'Work with the Design System team building reusable component libraries, interactive data dashboards, and polished user journeys.',
      required_skills: ['React', 'TypeScript', 'Tailwind CSS', 'Git & GitHub'],
      duration: '3 Months',
      stipend: '₹25,000 / month ($1,200/mo)',
      location: 'Remote',
      work_arrangement: 'Remote',
      eligibility: '2nd, 3rd, or 4th Year Computer Science / IT / Circuit branch students',
      application_deadline: '2026-10-15',
      number_of_openings: 4,
      responsibilities: [
        'Build modular, accessible React components with Tailwind CSS',
        'Connect frontend interfaces to mock and production GraphQL & REST APIs',
        'Write clean TypeScript code adhering to accessibility (WCAG AA) standards'
      ],
      learning_outcomes: [
        'Mastery of enterprise React patterns, TypeScript typing, and state management',
        'Portfolio-grade production code shipped to thousands of daily users'
      ],
      status: 'active'
    });

    // Seed initial applications from student Alex Chen
    if (studentRecord) {
      db.createApplication(
        studentRecord.id,
        intern2.id,
        'internship',
        'I am excited to apply for the Frontend Engineering Internship. Having built full-stack React & TypeScript projects with verified credentials, I am eager to contribute to CloudScale’s component systems.'
      );

      const app2 = db.createApplication(
        studentRecord.id,
        job1.id,
        'job',
        'As an undergraduate with strong foundations in React, TypeScript, Node.js, and Docker, I am keen to join the Platform Team as an Associate Full-Stack Cloud Engineer.'
      );

      // Set status to Shortlisted for interactive showcase
      db.updateApplicationStatus(app2.application.id, company.id, 'Shortlisted', 'Strong portfolio projects and high assessment test score in React & TypeScript.');
    }
  }

  // Seed 2nd demo company Apex Data Labs
  const existingCompany2 = db.findUserByEmail('talent@apexlabs.io');
  if (!existingCompany2) {
    const pwdHash = await hashPassword('password123');
    const user = db.createUser({
      email: 'talent@apexlabs.io',
      password_hash: pwdHash,
      role: 'industry'
    });

    const company2 = db.createCompany({
      user_id: user.id,
      company_name: 'Apex Data Labs',
      description: 'Apex Data Labs develops high-throughput distributed data engines, real-time AI vector search indexing, and predictive analytics tools for modern tech teams.',
      industry: 'AI & Data Systems',
      website: 'https://apexlabs.io',
      location: 'Boston, MA & Remote',
      company_size: '51-200 employees',
      contact_email: 'talent@apexlabs.io',
      contact_phone: '+1 (555) 789-0199',
      logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&auto=format&fit=crop&q=80'
    });

    db.createJob(company2.id, {
      title: 'Junior Machine Learning & Data Engineer',
      description: 'Build robust data extraction and preprocessing pipelines for our high-scale ML training clusters.',
      employment_type: 'Full-time',
      location: 'Remote',
      work_arrangement: 'Remote',
      required_skills: ['Python', 'SQL', 'Machine Learning', 'Data Structures & Algorithms'],
      min_qualification: 'B.Tech / B.E / M.Tech in CS / Data Science',
      experience_level: '0-2 Years',
      application_deadline: '2026-11-20',
      number_of_openings: 2,
      responsibilities: [
        'Implement automated feature engineering pipelines in Python and SQL',
        'Optimize model inference serving and evaluate accuracy metrics'
      ],
      preferred_skills: ['Docker', 'Git & GitHub'],
      status: 'active'
    });

    db.createInternship(company2.id, {
      title: 'Data Science & Analytics Intern',
      description: 'Analyze real-world telemetry data, build visual analytics dashboards, and support predictive modeling experiments.',
      required_skills: ['Python', 'SQL', 'Problem Solving', 'Communication'],
      duration: '3 Months',
      stipend: '₹30,000 / month ($1,400/mo)',
      location: 'Remote',
      work_arrangement: 'Remote',
      eligibility: 'All college years eligible with strong analytical mindset',
      application_deadline: '2026-10-25',
      number_of_openings: 3,
      responsibilities: [
        'Query large datasets to extract actionable product metrics',
        'Create interactive dashboard visualizations in Python/SQL'
      ],
      learning_outcomes: [
        'Direct mentorship by senior staff data scientists',
        'Experience building end-to-end analytics pipelines'
      ],
      status: 'active'
    });
  }

  // Phase 7: Seed College Admin Account (admin@university.edu)
  const existingAdmin = db.findUserByEmail('admin@university.edu');
  if (!existingAdmin) {
    console.log('Seeding demo college admin account (admin@university.edu)...');
    const pwdHash = await hashPassword('password123');
    db.createUser({
      email: 'admin@university.edu',
      password_hash: pwdHash,
      role: 'admin'
    });
  }

  // Seed Additional Student Cohort for Rich Department & Batch Analytics
  const student2User = db.findUserByEmail('priya.sharma@university.edu');
  if (!student2User) {
    const pwdHash = await hashPassword('password123');
    const u2 = db.createUser({
      email: 'priya.sharma@university.edu',
      password_hash: pwdHash,
      role: 'student'
    });
    const s2 = db.createStudent({
      user_id: u2.id,
      full_name: 'Priya Sharma',
      phone: '+1 (555) 345-6789',
      college_name: 'Institute of Technology & Science',
      department: 'Information Technology',
      year_of_study: '4th Year',
      cgpa: 9.25,
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Final year IT undergraduate specializing in Cloud Engineering, Microservices architecture, and DevOps automation.'
    });
    db.addStudentSkill(s2.id, 'React', 'technical', 'Advanced');
    db.addStudentSkill(s2.id, 'TypeScript', 'technical', 'Advanced');
    db.addStudentSkill(s2.id, 'Docker', 'technical', 'Advanced');
    db.addStudentSkill(s2.id, 'Cloud Computing (AWS/GCP)', 'technical', 'Expert');
    db.addStudentSkill(s2.id, 'Node.js', 'technical', 'Advanced');
    db.addStudentSkill(s2.id, 'REST APIs', 'technical', 'Expert');
    db.addStudentSkill(s2.id, 'Problem Solving', 'soft', 'Expert');
    db.addStudentSkill(s2.id, 'Leadership', 'soft', 'Advanced');

    db.createProject(s2.id, {
      title: 'KubeDeploy - Multi-Cluster Deployment CLI',
      description: 'Zero-downtime deployment orchestrator for staging Kubernetes clusters with canary routing policies.',
      technologies: ['Docker', 'Kubernetes', 'Go', 'TypeScript'],
      project_link: 'https://github.com/priyasharma/kubedeploy'
    });

    db.createCertification(s2.id, {
      certificate_name: 'AWS Certified Solutions Architect – Associate',
      issuing_organization: 'Amazon Web Services',
      issue_date: '2025-08-10',
      certificate_link: 'https://aws.amazon.com/verify/arch-44123'
    });

    // Take Cloud assessment
    const cloudAsmt = db.getRawData().assessments.find(a => a.category === 'Cloud');
    if (cloudAsmt) {
      db.submitAssessmentAttempt(s2.id, cloudAsmt.id, 620, [
        { question_id: 'q1', selected_option_index: 0 },
        { question_id: 'q2', selected_option_index: 0 },
        { question_id: 'q3', selected_option_index: 0 },
        { question_id: 'q4', selected_option_index: 0 },
        { question_id: 'q5', selected_option_index: 0 },
        { question_id: 'q6', selected_option_index: 0 },
        { question_id: 'q7', selected_option_index: 0 },
        { question_id: 'q8', selected_option_index: 0 },
        { question_id: 'q9', selected_option_index: 0 },
        { question_id: 'q10', selected_option_index: 0 }
      ]);
    }

    // Apply to CloudScale and mark Selected
    const cloudCompany = db.findCompanyByName('CloudScale Technologies');
    if (cloudCompany) {
      const job = db.getRawData().jobs.find(j => j.company_id === cloudCompany.id);
      if (job) {
        const app = db.createApplication(s2.id, job.id, 'job', 'I have architected scalable Kubernetes clusters and am excited to join CloudScale as an Associate Full-Stack Cloud Engineer.');
        db.updateApplicationStatus(app.application.id, cloudCompany.id, 'Selected', 'Exceptional performance in technical cloud assessment and portfolio review.');
      }
    }
  }

  const student3User = db.findUserByEmail('marcus.vance@university.edu');
  if (!student3User) {
    const pwdHash = await hashPassword('password123');
    const u3 = db.createUser({
      email: 'marcus.vance@university.edu',
      password_hash: pwdHash,
      role: 'student'
    });
    const s3 = db.createStudent({
      user_id: u3.id,
      full_name: 'Marcus Vance',
      phone: '+1 (555) 456-7890',
      college_name: 'Institute of Technology & Science',
      department: 'Artificial Intelligence & Data Science',
      year_of_study: '4th Year',
      cgpa: 8.40,
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'AI & Data Science senior researcher passionate about neural language models, semantic vector indexing, and scalable distributed ML pipelines.'
    });
    db.addStudentSkill(s3.id, 'Python', 'technical', 'Expert');
    db.addStudentSkill(s3.id, 'SQL', 'technical', 'Advanced');
    db.addStudentSkill(s3.id, 'Machine Learning', 'technical', 'Advanced');
    db.addStudentSkill(s3.id, 'Data Structures & Algorithms', 'technical', 'Advanced');
    db.addStudentSkill(s3.id, 'Docker', 'technical', 'Intermediate');
    db.addStudentSkill(s3.id, 'Communication', 'soft', 'Intermediate');
    db.addStudentSkill(s3.id, 'Problem Solving', 'soft', 'Expert');

    db.createProject(s3.id, {
      title: 'VectorFlow - Real-Time Embedding Search',
      description: 'Distributed vector similarity index for million-scale document embeddings with GPU acceleration.',
      technologies: ['Python', 'PyTorch', 'FAISS', 'FastAPI'],
      project_link: 'https://github.com/marcusvance/vectorflow'
    });

    const apexCompany = db.findCompanyByName('Apex Data Labs');
    if (apexCompany) {
      const job = db.getRawData().jobs.find(j => j.company_id === apexCompany.id);
      if (job) {
        const app = db.createApplication(s3.id, job.id, 'job', 'Passionate about vector embeddings and high-scale data engines, eager to contribute to Apex Data Labs.');
        db.updateApplicationStatus(app.application.id, apexCompany.id, 'Shortlisted', 'Strong algorithmic background and solid machine learning project portfolio.');
      }
    }
  }

  const student4User = db.findUserByEmail('devon.patel@university.edu');
  if (!student4User) {
    const pwdHash = await hashPassword('password123');
    const u4 = db.createUser({
      email: 'devon.patel@university.edu',
      password_hash: pwdHash,
      role: 'student'
    });
    const s4 = db.createStudent({
      user_id: u4.id,
      full_name: 'Devon Patel',
      phone: '+1 (555) 567-8901',
      college_name: 'Institute of Technology & Science',
      department: 'Electronics & Communication Engineering',
      year_of_study: '2nd Year',
      cgpa: 8.10,
      profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'ECE sophomore exploring IoT edge computing, microcontroller firmware, and embedded system networking.'
    });
    db.addStudentSkill(s4.id, 'Python', 'technical', 'Intermediate');
    db.addStudentSkill(s4.id, 'SQL', 'technical', 'Beginner');
    db.addStudentSkill(s4.id, 'Problem Solving', 'soft', 'Intermediate');
    db.addStudentSkill(s4.id, 'Communication', 'soft', 'Intermediate');
  }

  // Phase 8: Seed realistic demo mentor evaluations if not present
  if (db.getRawData().mentor_feedbacks.length === 0) {
    console.log('Seeding Phase 8 Industry Mentor Feedback records...');
    const cloudScale = db.findCompanyByName('CloudScale Technologies');
    const apex = db.findCompanyByName('Apex Data Labs');
    const alex = db.findStudentByEmail('alex.chen@university.edu') || db.getRawData().students[0];
    const priya = db.findStudentByEmail('priya.sharma@university.edu') || db.getRawData().students[1];
    const marcus = db.findStudentByEmail('marcus.vance@university.edu') || db.getRawData().students[2];

    if (cloudScale && alex) {
      const intern = db.getRawData().internships.find(i => i.company_id === cloudScale.id);
      if (intern) {
        db.createOrUpdateMentorFeedback(cloudScale.id, {
          student_id: alex.id,
          opportunity_id: intern.id,
          opportunity_type: 'internship',
          mentor_name: 'Marcus Sterling',
          mentor_title: 'Principal Cloud Platform Architect',
          mentor_email: 'm.sterling@cloudscale.tech',
          evaluation_period: 'Summer 2026 Internship',
          technical_competence: 5,
          problem_solving: 5,
          communication: 4,
          teamwork_collaboration: 5,
          professionalism_work_ethic: 5,
          learning_ability: 5,
          overall_performance: 5,
          strengths: 'Exceptional mastery of Docker containerization, CI/CD automated deployment pipelines, and TypeScript microservices. Diagnosed and resolved a critical telemetry bottlenecks during sprint release.',
          areas_for_improvement: 'Continue deepening Kubernetes custom operator CRDs and multi-region failover topologies.',
          mentor_comments: 'Alex performed at a senior associate engineer level throughout his 12-week internship. He consistently delivered production-grade code ahead of sprint milestones with clean architecture and comprehensive tests.',
          hire_recommendation: 'Recommended'
        });
      }
    }

    if (apex && priya) {
      const intern = db.getRawData().internships.find(i => i.company_id === apex.id) || db.getRawData().internships[0];
      if (intern) {
        db.createOrUpdateMentorFeedback(apex.id, {
          student_id: priya.id,
          opportunity_id: intern.id,
          opportunity_type: 'internship',
          mentor_name: 'Dr. Arvind Natarajan',
          mentor_title: 'Director of AI & NLP Research',
          mentor_email: 'arvind.natarajan@apexlabs.ai',
          evaluation_period: 'Spring 2026 Internship',
          technical_competence: 5,
          problem_solving: 5,
          communication: 4,
          teamwork_collaboration: 4,
          professionalism_work_ethic: 5,
          learning_ability: 5,
          overall_performance: 5,
          strengths: 'Rigorous mathematical foundations in semantic embeddings, PyTorch transformer fine-tuning, and Python data pipelines.',
          areas_for_improvement: 'Gain more experience with production low-latency inference serving frameworks like Triton.',
          mentor_comments: 'Priya contributed directly to our core retrieval ranking algorithms, driving a 14% improvement in semantic search recall. Strongly recommended for full-time research role.',
          hire_recommendation: 'Recommended'
        });
      }
    }

    if (apex && marcus) {
      const job = db.getRawData().jobs.find(j => j.company_id === apex.id) || db.getRawData().jobs[0];
      if (job) {
        db.createOrUpdateMentorFeedback(apex.id, {
          student_id: marcus.id,
          opportunity_id: job.id,
          opportunity_type: 'job',
          mentor_name: 'Sarah Jenkins',
          mentor_title: 'Staff Distributed Systems Engineer',
          mentor_email: 's.jenkins@apexlabs.ai',
          evaluation_period: 'Winter 2025 Co-op',
          technical_competence: 4,
          problem_solving: 5,
          communication: 4,
          teamwork_collaboration: 4,
          professionalism_work_ethic: 5,
          learning_ability: 5,
          overall_performance: 4.5,
          strengths: 'Outstanding algorithmic complexity analysis, vector search prototyping, and GPU pipeline profiling.',
          areas_for_improvement: 'Enhance slide presentation clarity for cross-functional business stakeholders.',
          mentor_comments: 'Marcus engineered a high-throughput embedding indexing module that reduced build times by 40%.',
          hire_recommendation: 'Recommended'
        });
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Seed sample student & companies for immediate interactive demonstration
  await seedDemoDataIfNeeded();

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SkillBridge API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/assessments', assessmentsRoutes);
  app.use('/api/skill-gap', skillGapRoutes);
  app.use('/api/industry', industryRoutes);
  app.use('/api/opportunities', opportunitiesRoutes);
  app.use('/api/matching', matchingRoutes);
  app.use('/api/college', collegeRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(PROJECT_ROOT, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillBridge] Server started on http://0.0.0.0:${PORT}`);
    console.log(`[SkillBridge] Active persistent database: ${DB_FILE}`);
  });
}

startServer();

