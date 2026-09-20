import { db, StudentRecord, StudentSkillRecord, SkillRecord, ProjectRecord, CertificationRecord, AssessmentAttemptRecord, JobRecord, InternshipRecord, ApplicationRecord } from './db.js';
import { INDUSTRY_ROLES } from './skillGapData.js';

export interface SkillMatchDetail {
  name: string;
  student_level: string | null;
  student_level_numeric: number; // 0 to 4
  required_level: string;
  required_level_numeric: number; // 1 to 4
  status: 'matching' | 'weak' | 'missing';
  gap_percentage: number;
  is_verified: boolean;
  verified_assessment_title: string | null;
  verified_score: number | null;
  verified_badge: string | null;
}

export interface OpportunityMatchResult {
  opportunity_id: string;
  opportunity_type: 'job' | 'internship';
  title: string;
  company_name: string;
  company_id: string;
  overall_match_percentage: number;
  match_tier: 'Strong Match' | 'Good Match' | 'Developing Match' | 'Low Match';
  match_tier_color: string;
  weights: {
    technical_skills: number;
    assessment_competency: number;
    role_alignment: number;
    projects_experience: number;
    certifications: number;
    academic_eligibility: number;
  };
  score_breakdown: {
    technical_skills_score: number; // 0 to 100
    assessment_score: number; // 0 to 100
    role_alignment_score: number; // 0 to 100
    projects_score: number; // 0 to 100
    certifications_score: number; // 0 to 100
    academic_score: number; // 0 to 100
  };
  skills_analysis: {
    matching_skills: SkillMatchDetail[];
    weak_skills: SkillMatchDetail[];
    missing_skills: SkillMatchDetail[];
    all_evaluated: SkillMatchDetail[];
    matching_count: number;
    weak_count: number;
    missing_count: number;
    total_required_count: number;
    preferred_matches: string[];
  };
  verified_assessments: Array<{
    title: string;
    category: string;
    score_percentage: number;
    badge: string;
    passed: boolean;
  }>;
  projects_alignment: {
    matching_projects: Array<{
      id: string;
      title: string;
      matching_technologies: string[];
    }>;
    total_matching_projects_count: number;
  };
  certifications_alignment: {
    matching_certifications: Array<{
      id: string;
      certificate_name: string;
      issuing_organization: string;
    }>;
    total_matching_certifications_count: number;
  };
  academic_eligibility: {
    is_eligible: boolean;
    cgpa: number | null;
    cgpa_status: 'Exceeds' | 'Meets' | 'Below Target' | 'Not Provided';
    year_of_study: string;
    department: string;
    eligibility_notes: string[];
  };
  why_you_match_summary: string;
}

const PROFICIENCY_NUMERIC_MAP: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4
};

// Skill to Assessment Category Map
const SKILL_ASSESSMENT_CATEGORY_MAP: Record<string, string> = {
  react: 'Frontend',
  javascript: 'Frontend',
  typescript: 'Frontend',
  html: 'Frontend',
  css: 'Frontend',
  'tailwind css': 'Frontend',
  'tailwind': 'Frontend',
  'next.js': 'Frontend',
  'vue': 'Frontend',
  
  'node.js': 'Backend',
  'node': 'Backend',
  'express': 'Backend',
  'python': 'Backend',
  'flask': 'Backend',
  'django': 'Backend',
  'sql': 'Backend',
  'postgresql': 'Backend',
  'mongodb': 'Backend',
  'rest apis': 'Backend',
  'java': 'Backend',
  'c++': 'Backend',

  'full stack': 'Full Stack',
  'full-stack': 'Full Stack',
  'git': 'Full Stack',
  'git & github': 'Full Stack',

  'cloud': 'Cloud',
  'aws': 'Cloud',
  'gcp': 'Cloud',
  'docker': 'Cloud',
  'kubernetes': 'Cloud',
  'cloud computing (aws/gcp)': 'Cloud',
  'devops': 'Cloud'
};

export class MatchingEngine {
  // Configurable weights totaling 100%
  public static DEFAULT_WEIGHTS = {
    technical_skills: 0.40,      // 40%
    assessment_competency: 0.20, // 20%
    role_alignment: 0.15,        // 15%
    projects_experience: 0.10,   // 10%
    certifications: 0.05,        // 5%
    academic_eligibility: 0.10   // 10%
  };

  /**
   * Evaluates fit between a student and a job or internship posting
   */
  public static evaluateStudentFit(
    studentId: string,
    opportunity: (JobRecord | InternshipRecord) & { type: 'job' | 'internship'; company?: any }
  ): OpportunityMatchResult | null {
    const student = db.findStudentById(studentId);
    if (!student) return null;

    const studentSkills = db.getStudentSkills(studentId);
    const studentProjects = db.getStudentProjects(studentId);
    const studentCertifications = db.getStudentCertifications(studentId);
    const studentAssessmentAttempts = db.getStudentAssessmentHistory(studentId);

    const requiredSkillsList = opportunity.required_skills || [];
    const preferredSkillsList = (opportunity as JobRecord).preferred_skills || [];
    const companyName = opportunity.company?.company_name || 'Employer Partner';

    // 1. Technical Skills Evaluation (40% weight)
    const evaluatedSkills: SkillMatchDetail[] = [];
    const matchingSkills: SkillMatchDetail[] = [];
    const weakSkills: SkillMatchDetail[] = [];
    const missingSkills: SkillMatchDetail[] = [];

    let skillScoreSum = 0;

    for (const reqSkillName of requiredSkillsList) {
      const cleanReqName = reqSkillName.trim();
      const matchedStudentSkill = this.findMatchingSkillInStudent(cleanReqName, studentSkills);
      const reqTargetLevel = 'Intermediate'; // Default industry expectation for job/internship
      const reqNumeric = PROFICIENCY_NUMERIC_MAP[reqTargetLevel] || 2;

      // Check Phase 2 assessment verification for this skill
      const verification = this.checkSkillAssessmentVerification(cleanReqName, studentAssessmentAttempts);

      if (matchedStudentSkill) {
        const studentLevel = matchedStudentSkill.proficiency_level;
        let studentNumeric = PROFICIENCY_NUMERIC_MAP[studentLevel] || 1;

        // If verified via high score in Phase 2 assessment, reward competence
        if (verification.is_verified && verification.verified_badge) {
          const badgeNum = PROFICIENCY_NUMERIC_MAP[verification.verified_badge] || 1;
          if (badgeNum > studentNumeric) {
            studentNumeric = badgeNum;
          }
        }

        if (studentNumeric >= reqNumeric) {
          // Matching
          const detail: SkillMatchDetail = {
            name: cleanReqName,
            student_level: studentLevel,
            student_level_numeric: studentNumeric,
            required_level: reqTargetLevel,
            required_level_numeric: reqNumeric,
            status: 'matching',
            gap_percentage: 0,
            is_verified: verification.is_verified,
            verified_assessment_title: verification.verified_assessment_title,
            verified_score: verification.verified_score,
            verified_badge: verification.verified_badge
          };
          matchingSkills.push(detail);
          evaluatedSkills.push(detail);
          skillScoreSum += verification.is_verified ? 1.05 : 1.0;
        } else {
          // Weak
          const gapFraction = 1 - (studentNumeric / reqNumeric);
          const detail: SkillMatchDetail = {
            name: cleanReqName,
            student_level: studentLevel,
            student_level_numeric: studentNumeric,
            required_level: reqTargetLevel,
            required_level_numeric: reqNumeric,
            status: 'weak',
            gap_percentage: Math.round(gapFraction * 100),
            is_verified: verification.is_verified,
            verified_assessment_title: verification.verified_assessment_title,
            verified_score: verification.verified_score,
            verified_badge: verification.verified_badge
          };
          weakSkills.push(detail);
          evaluatedSkills.push(detail);
          skillScoreSum += (studentNumeric / reqNumeric) * 0.65;
        }
      } else {
        // Missing
        const detail: SkillMatchDetail = {
          name: cleanReqName,
          student_level: null,
          student_level_numeric: 0,
          required_level: reqTargetLevel,
          required_level_numeric: reqNumeric,
          status: 'missing',
          gap_percentage: 100,
          is_verified: false,
          verified_assessment_title: null,
          verified_score: null,
          verified_badge: null
        };
        missingSkills.push(detail);
        evaluatedSkills.push(detail);
      }
    }

    // Preferred skills bonus
    const preferredMatches: string[] = [];
    let preferredBonus = 0;
    for (const pref of preferredSkillsList) {
      const match = this.findMatchingSkillInStudent(pref, studentSkills);
      if (match) {
        preferredMatches.push(pref);
        preferredBonus += 0.05;
      }
    }

    const rawSkillsScore = requiredSkillsList.length > 0
      ? Math.min(100, Math.round(((skillScoreSum / requiredSkillsList.length) + preferredBonus) * 100))
      : 80;

    // 2. Verified Assessment Competency (20% weight)
    const passedAssessments = (studentAssessmentAttempts || []).filter(a => a.passed);
    const verifiedAssessmentsList = passedAssessments.map(a => ({
      title: a.assessment_title,
      category: a.category,
      score_percentage: a.score_percentage,
      badge: a.skill_level_awarded,
      passed: a.passed
    }));

    // Find if student passed assessments directly related to this opportunity's domain
    const opportunityCategories = this.determineOpportunityCategories(opportunity);
    let assessmentRelevanceScore = 0;

    if (passedAssessments.length > 0) {
      let matchingAssessmentsCount = 0;
      let totalScoreSum = 0;

      for (const attempt of passedAssessments) {
        if (opportunityCategories.includes(attempt.category)) {
          matchingAssessmentsCount++;
          totalScoreSum += attempt.score_percentage;
        }
      }

      if (matchingAssessmentsCount > 0) {
        // High alignment: has verified domain assessment
        const avgScore = totalScoreSum / matchingAssessmentsCount;
        assessmentRelevanceScore = Math.min(100, Math.round(avgScore * 1.05));
      } else {
        // Has passed other assessments (demonstrates standardized evaluation rigor)
        const bestScore = Math.max(...passedAssessments.map(a => a.score_percentage));
        assessmentRelevanceScore = Math.round(bestScore * 0.70);
      }
    } else {
      assessmentRelevanceScore = 0;
    }

    // 3. Role / Track Alignment (15% weight)
    let roleAlignmentScore = 50; // Baseline
    const oppTitleLower = opportunity.title.toLowerCase();
    const studentDeptLower = student.department.toLowerCase();

    // Dept alignment (Computer Science, IT, Software, Electronics, Data Science)
    if (
      studentDeptLower.includes('computer') ||
      studentDeptLower.includes('information') ||
      studentDeptLower.includes('software') ||
      studentDeptLower.includes('data')
    ) {
      roleAlignmentScore += 25;
    } else if (
      studentDeptLower.includes('electronic') ||
      studentDeptLower.includes('electrical') ||
      studentDeptLower.includes('engineering')
    ) {
      roleAlignmentScore += 15;
    }

    // Skill breadth alignment
    const relevantSkillsCount = matchingSkills.length + weakSkills.length;
    if (relevantSkillsCount >= 3) {
      roleAlignmentScore += 25;
    } else if (relevantSkillsCount >= 1) {
      roleAlignmentScore += 15;
    }
    roleAlignmentScore = Math.min(100, roleAlignmentScore);

    // 4. Projects & Practical Experience (10% weight)
    const matchingProjects: Array<{ id: string; title: string; matching_technologies: string[] }> = [];
    for (const proj of studentProjects) {
      const projTechs = (proj.technologies || []).map(t => t.toLowerCase());
      const matchedTechs = requiredSkillsList.filter(req =>
        projTechs.some(t => t.includes(req.toLowerCase()) || req.toLowerCase().includes(t))
      );

      if (matchedTechs.length > 0) {
        matchingProjects.push({
          id: proj.id,
          title: proj.title,
          matching_technologies: matchedTechs
        });
      }
    }

    let projectsScore = 0;
    if (studentProjects.length > 0) {
      if (matchingProjects.length >= 2) {
        projectsScore = 100;
      } else if (matchingProjects.length === 1) {
        projectsScore = 85;
      } else {
        // Has portfolio projects, but in different stack
        projectsScore = Math.min(65, studentProjects.length * 25);
      }
    } else {
      projectsScore = 0;
    }

    // 5. Certifications (5% weight)
    const matchingCertifications: Array<{ id: string; certificate_name: string; issuing_organization: string }> = [];
    for (const cert of studentCertifications) {
      const certNameLower = cert.certificate_name.toLowerCase();
      const isRelevant = requiredSkillsList.some(req => certNameLower.includes(req.toLowerCase())) ||
        opportunityCategories.some(cat => certNameLower.includes(cat.toLowerCase()));

      if (isRelevant) {
        matchingCertifications.push({
          id: cert.id,
          certificate_name: cert.certificate_name,
          issuing_organization: cert.issuing_organization
        });
      }
    }

    let certificationsScore = 0;
    if (studentCertifications.length > 0) {
      if (matchingCertifications.length > 0) {
        certificationsScore = 100;
      } else {
        certificationsScore = Math.min(75, studentCertifications.length * 35);
      }
    } else {
      certificationsScore = 0;
    }

    // 6. Academic Eligibility (10% weight)
    let academicScore = 70; // Baseline
    const eligibilityNotes: string[] = [];
    let isEligible = true;

    // CGPA evaluation
    let cgpaStatus: 'Exceeds' | 'Meets' | 'Below Target' | 'Not Provided' = 'Not Provided';
    if (student.cgpa !== null && student.cgpa !== undefined) {
      if (student.cgpa >= 8.0) {
        academicScore += 30;
        cgpaStatus = 'Exceeds';
        eligibilityNotes.push(`Strong academic standing with CGPA of ${student.cgpa}.`);
      } else if (student.cgpa >= 6.5) {
        academicScore += 15;
        cgpaStatus = 'Meets';
        eligibilityNotes.push(`Satisfies standard cutoff with CGPA of ${student.cgpa}.`);
      } else {
        cgpaStatus = 'Below Target';
        academicScore -= 10;
        eligibilityNotes.push(`CGPA is ${student.cgpa} (recommended: 6.5+).`);
      }
    } else {
      eligibilityNotes.push('Academic CGPA has not been provided in student profile.');
    }

    // Year alignment
    if (opportunity.type === 'internship') {
      const intern = opportunity as InternshipRecord;
      if (intern.eligibility && (student.year_of_study.includes('3rd') || student.year_of_study.includes('4th') || student.year_of_study.includes('Postgraduate'))) {
        eligibilityNotes.push(`Year of study (${student.year_of_study}) aligns with internship requirements.`);
      }
    } else {
      if (student.year_of_study.includes('4th') || student.year_of_study.includes('Postgraduate')) {
        eligibilityNotes.push(`Final year / graduate status is ideal for job commencement.`);
      }
    }

    academicScore = Math.max(0, Math.min(100, academicScore));

    // Calculate Overall Weighted Match Percentage
    const weights = this.DEFAULT_WEIGHTS;
    const finalMatchPct = Math.round(
      (rawSkillsScore * weights.technical_skills) +
      (assessmentRelevanceScore * weights.assessment_competency) +
      (roleAlignmentScore * weights.role_alignment) +
      (projectsScore * weights.projects_experience) +
      (certificationsScore * weights.certifications) +
      (academicScore * weights.academic_eligibility)
    );

    // Determine Match Tier
    let matchTier: 'Strong Match' | 'Good Match' | 'Developing Match' | 'Low Match';
    let matchTierColor = '';
    if (finalMatchPct >= 80) {
      matchTier = 'Strong Match';
      matchTierColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
    } else if (finalMatchPct >= 65) {
      matchTier = 'Good Match';
      matchTierColor = 'text-indigo-400 bg-indigo-950/80 border-indigo-800';
    } else if (finalMatchPct >= 45) {
      matchTier = 'Developing Match';
      matchTierColor = 'text-amber-400 bg-amber-950/80 border-amber-800';
    } else {
      matchTier = 'Low Match';
      matchTierColor = 'text-rose-400 bg-rose-950/80 border-rose-800';
    }

    // Construct "Why you match" summary
    const whySummary = this.generateWhyYouMatchSummary(
      opportunity.title,
      companyName,
      finalMatchPct,
      matchingSkills,
      weakSkills,
      missingSkills,
      verifiedAssessmentsList,
      matchingProjects
    );

    return {
      opportunity_id: opportunity.id,
      opportunity_type: opportunity.type,
      title: opportunity.title,
      company_name: companyName,
      company_id: opportunity.company_id,
      overall_match_percentage: Math.min(100, Math.max(0, finalMatchPct)),
      match_tier: matchTier,
      match_tier_color: matchTierColor,
      weights: {
        technical_skills: Math.round(weights.technical_skills * 100),
        assessment_competency: Math.round(weights.assessment_competency * 100),
        role_alignment: Math.round(weights.role_alignment * 100),
        projects_experience: Math.round(weights.projects_experience * 100),
        certifications: Math.round(weights.certifications * 100),
        academic_eligibility: Math.round(weights.academic_eligibility * 100)
      },
      score_breakdown: {
        technical_skills_score: rawSkillsScore,
        assessment_score: assessmentRelevanceScore,
        role_alignment_score: roleAlignmentScore,
        projects_score: projectsScore,
        certifications_score: certificationsScore,
        academic_score: academicScore
      },
      skills_analysis: {
        matching_skills: matchingSkills,
        weak_skills: weakSkills,
        missing_skills: missingSkills,
        all_evaluated: evaluatedSkills,
        matching_count: matchingSkills.length,
        weak_count: weakSkills.length,
        missing_count: missingSkills.length,
        total_required_count: requiredSkillsList.length,
        preferred_matches: preferredMatches
      },
      verified_assessments: verifiedAssessmentsList,
      projects_alignment: {
        matching_projects: matchingProjects,
        total_matching_projects_count: matchingProjects.length
      },
      certifications_alignment: {
        matching_certifications: matchingCertifications,
        total_matching_certifications_count: matchingCertifications.length
      },
      academic_eligibility: {
        is_eligible: isEligible,
        cgpa: student.cgpa,
        cgpa_status: cgpaStatus,
        year_of_study: student.year_of_study,
        department: student.department,
        eligibility_notes: eligibilityNotes
      },
      why_you_match_summary: whySummary
    };
  }

  /**
   * Helper: check if student has a skill by name or partial alias
   */
  private static findMatchingSkillInStudent(
    targetSkillName: string,
    studentSkills: Array<StudentSkillRecord & { skill: SkillRecord }>
  ): (StudentSkillRecord & { skill: SkillRecord }) | undefined {
    const target = targetSkillName.toLowerCase().trim();

    return studentSkills.find(ss => {
      const studentName = ss.skill.name.toLowerCase().trim();
      if (studentName === target) return true;
      if (target.includes(studentName) && studentName.length > 2) return true;
      if (studentName.includes(target) && target.length > 2) return true;

      // Special aliases
      if (target === 'react' && (studentName === 'react.js' || studentName === 'reactjs')) return true;
      if (target === 'node.js' && (studentName === 'node' || studentName === 'nodejs')) return true;
      if (target === 'sql' && (studentName === 'postgresql' || studentName === 'mysql' || studentName === 'database')) return true;
      if (target === 'docker' && (studentName === 'containers' || studentName === 'kubernetes')) return true;

      return false;
    });
  }

  /**
   * Helper: check if student has passed a Phase 2 assessment verifying this skill
   */
  private static checkSkillAssessmentVerification(
    skillName: string,
    assessmentAttempts: AssessmentAttemptRecord[]
  ): {
    is_verified: boolean;
    verified_assessment_title: string | null;
    verified_score: number | null;
    verified_badge: string | null;
  } {
    if (!assessmentAttempts || assessmentAttempts.length === 0) {
      return { is_verified: false, verified_assessment_title: null, verified_score: null, verified_badge: null };
    }

    const passedAttempts = assessmentAttempts.filter(a => a.passed);
    if (passedAttempts.length === 0) {
      return { is_verified: false, verified_assessment_title: null, verified_score: null, verified_badge: null };
    }

    const skillLower = skillName.toLowerCase().trim();
    const mappedCategory = SKILL_ASSESSMENT_CATEGORY_MAP[skillLower];

    if (mappedCategory) {
      const categoryMatches = passedAttempts.filter(a => a.category === mappedCategory || a.category === 'Full Stack');
      if (categoryMatches.length > 0) {
        const best = [...categoryMatches].sort((a, b) => b.score_percentage - a.score_percentage)[0];
        return {
          is_verified: true,
          verified_assessment_title: best.assessment_title,
          verified_score: best.score_percentage,
          verified_badge: best.skill_level_awarded
        };
      }
    }

    return { is_verified: false, verified_assessment_title: null, verified_score: null, verified_badge: null };
  }

  /**
   * Helper: derive category tags from opportunity title and skills
   */
  private static determineOpportunityCategories(
    opportunity: JobRecord | InternshipRecord
  ): string[] {
    const categories: Set<string> = new Set();
    const text = (opportunity.title + ' ' + (opportunity.required_skills || []).join(' ')).toLowerCase();

    if (text.includes('front') || text.includes('react') || text.includes('ui') || text.includes('web')) {
      categories.add('Frontend');
    }
    if (text.includes('back') || text.includes('node') || text.includes('python') || text.includes('api') || text.includes('server') || text.includes('sql')) {
      categories.add('Backend');
    }
    if (text.includes('full') || (categories.has('Frontend') && categories.has('Backend'))) {
      categories.add('Full Stack');
    }
    if (text.includes('cloud') || text.includes('devops') || text.includes('aws') || text.includes('docker') || text.includes('infrastructure')) {
      categories.add('Cloud');
    }

    if (categories.size === 0) {
      categories.add('Full Stack');
    }

    return Array.from(categories);
  }

  /**
   * Helper: generate natural language summary of match factors
   */
  private static generateWhyYouMatchSummary(
    roleTitle: string,
    companyName: string,
    matchPct: number,
    matchingSkills: SkillMatchDetail[],
    weakSkills: SkillMatchDetail[],
    missingSkills: SkillMatchDetail[],
    verifiedAssessments: Array<{ title: string; badge: string; score_percentage: number }>,
    matchingProjects: Array<{ title: string }>
  ): string {
    const matchingNames = matchingSkills.map(s => s.name).join(', ');
    const verifiedNames = verifiedAssessments.map(v => `${v.title} (${v.badge})`).join(', ');

    if (matchPct >= 80) {
      return `Outstanding alignment with ${companyName}'s ${roleTitle} opening. You meet ${matchingSkills.length} core technical requirements (${matchingNames})${verifiedAssessments.length > 0 ? ` backed by verified Phase 2 credentials (${verifiedNames})` : ''} and practical project implementation experience.`;
    } else if (matchPct >= 65) {
      return `Strong competitive profile for ${roleTitle}. You possess core foundational competencies (${matchingNames}) and ${matchingProjects.length} matching practical projects. Addressing ${missingSkills.length > 0 ? missingSkills.map(m => m.name).join(', ') : 'minor skill gaps'} will maximize your interview readiness.`;
    } else {
      return `Potential match with growth runway. You share ${matchingSkills.length} overlapping technical skills with this posting. Review the missing skill recommendations to level up your candidacy.`;
    }
  }
}
