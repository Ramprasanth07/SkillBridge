import { db, StudentRecord, UserRecord, AssessmentAttemptRecord, JobRecord, InternshipRecord, ApplicationRecord, CompanyRecord } from './db.js';
import { INDUSTRY_ROLES } from './skillGapData.js';
import { MatchingEngine } from './matchingEngine.js';
import { SkillGapEngine } from './skillGapEngine.js';

export type ReadinessTier = 'Job Ready' | 'High Potential' | 'Developing' | 'Needs Foundation';

export interface PlacementReadinessFactor {
  key: string;
  name: string;
  weight: number; // 25, 20, 15, 10, 10, 10, 10
  score: number; // 0-100 raw score
  weighted_score: number; // (score * weight) / 100
  label: string;
  evidence: string;
  status: 'optimal' | 'good' | 'needs_attention';
}

export interface StudentReadinessScore {
  total_score: number; // 0-100
  placement_readiness_percentage: number; // 0-100
  display_text: string; // "Placement Readiness: 82%"
  tier: ReadinessTier;
  badge_color: string;
  disclaimer: string;
  factors: {
    // Legacy compatibility (max points: 20, 25, 20, 15, 20)
    academic_score: number;
    assessment_score: number;
    skills_score: number;
    portfolio_score: number;
    market_match_score: number;
    // 7 Real Weighted Signals
    assessment_performance: PlacementReadinessFactor;
    skill_readiness: PlacementReadinessFactor;
    projects: PlacementReadinessFactor;
    certifications: PlacementReadinessFactor;
    academic_standing: PlacementReadinessFactor;
    roadmap_progress: PlacementReadinessFactor;
    industry_evidence: PlacementReadinessFactor;
  };
  factors_list: PlacementReadinessFactor[];
  reasons: string[];
  strengths: string[];
  recommendations: string[];
}

export interface EnrichedStudentRosterItem {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone: string;
  college_name: string;
  department: string;
  year_of_study: string;
  cgpa: number | null;
  profile_photo: string;
  bio?: string;
  created_at: string;
  // Computed & Enriched
  skills_count: number;
  technical_skills_count: number;
  soft_skills_count: number;
  top_skills: Array<{ name: string; category: string; proficiency_level: string }>;
  assessment_status: 'Completed' | 'In Progress' | 'Not Started';
  assessments_attempted: number;
  assessments_passed: number;
  average_assessment_score: number | null;
  highest_assessment_score: number | null;
  verified_badges_count: number;
  projects_count: number;
  certifications_count: number;
  applications_count: number;
  shortlisted_count: number;
  selected_count: number;
  placement_status: 'Selected / Hired' | 'Shortlisted' | 'Under Review' | 'Applied' | 'Not Applied';
  top_match_score: number | null;
  readiness: StudentReadinessScore;
}

export interface CollegeDashboardStats {
  institution_name: string;
  total_students: number;
  average_cgpa: number;
  assessment_completion_rate: number; // % of students who completed at least 1 test
  average_assessment_score: number;
  placement_readiness_rate: number; // % of Job Ready + High Potential
  students_placement_ready_count: number;
  active_job_applications_count: number;
  shortlisted_students_count: number;
  selected_students_count: number;
  rejected_applications_count: number;
  industry_partners_count: number;
  active_jobs_count: number;
  active_internships_count: number;
  readiness_distribution: {
    job_ready: number;
    high_potential: number;
    developing: number;
    needs_foundation: number;
  };
  placement_funnel: {
    applied: number;
    under_review: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  department_summary: Array<{
    department: string;
    student_count: number;
    average_cgpa: number;
    readiness_rate: number;
    assessment_rate: number;
    applications_count: number;
    placed_count: number;
  }>;
  batch_summary: Array<{
    batch: string;
    student_count: number;
    average_cgpa: number;
    readiness_rate: number;
    actively_applying_count: number;
    placed_count: number;
  }>;
  recent_placement_activity: Array<{
    application_id: string;
    student_id: string;
    student_name: string;
    student_department: string;
    company_name: string;
    opportunity_title: string;
    opportunity_type: 'job' | 'internship';
    status: string;
    applied_at: string;
    match_score?: number;
  }>;
}

export class CollegeAdminEngine {
  /**
   * Calculate transparent Institutional Student Readiness Score (0-100)
   * Weighted formula:
   * - Assessment performance: 25%
   * - Skill readiness / skill-gap status: 20%
   * - Projects: 15%
   * - Certifications: 10%
   * - Academic standing: 10%
   * - Roadmap progress: 10%
   * - Industry evidence / feedback: 10%
   */
  public static calculateStudentReadiness(studentId: string): StudentReadinessScore {
    const student = db.findStudentById(studentId);
    if (!student) {
      const emptyFactor = (key: string, name: string, weight: number): PlacementReadinessFactor => ({
        key,
        name,
        weight,
        score: 0,
        weighted_score: 0,
        label: '0%',
        evidence: 'No student record found.',
        status: 'needs_attention'
      });

      return {
        total_score: 0,
        placement_readiness_percentage: 0,
        display_text: 'Placement Readiness: 0%',
        tier: 'Needs Foundation',
        badge_color: 'bg-rose-950 text-rose-300 border-rose-800',
        disclaimer: 'Readiness indicator based on verified student competencies and industry evidence, not a placement guarantee.',
        factors: {
          academic_score: 0,
          assessment_score: 0,
          skills_score: 0,
          portfolio_score: 0,
          market_match_score: 0,
          assessment_performance: emptyFactor('assessment', 'Standardized Assessments', 25),
          skill_readiness: emptyFactor('skills', 'Skill Readiness & Gap Coverage', 20),
          projects: emptyFactor('projects', 'Hands-on Projects', 15),
          certifications: emptyFactor('certifications', 'Industry Certifications', 10),
          academic_standing: emptyFactor('academic', 'Academic Standing', 10),
          roadmap_progress: emptyFactor('roadmap', 'Learning Roadmap Progress', 10),
          industry_evidence: emptyFactor('industry', 'Industry Evidence & Feedback', 10)
        },
        factors_list: [],
        reasons: ['No student record found.'],
        strengths: [],
        recommendations: ['Create and verify student account.']
      };
    }

    const skills = db.getStudentSkills(studentId);
    const projects = db.getStudentProjects(studentId);
    const certs = db.getStudentCertifications(studentId);
    const asmtStats = db.getStudentAssessmentStats(studentId);
    const applications = db.getStudentApplications(studentId);
    const rawData = db.getRawData();
    const mentorFeedbacks = (rawData.mentor_feedbacks || []).filter(f => f.student_id === studentId);

    // ==========================================
    // 1. Assessment Performance (25% Weight)
    // ==========================================
    let asmtRaw = 20; // baseline fallback if unattempted
    let asmtEvidence = 'No standardized assessments attempted yet.';
    let asmtStatus: 'optimal' | 'good' | 'needs_attention' = 'needs_attention';

    const avgScore = asmtStats?.average_score ?? 0;
    const passedCount = asmtStats?.passed_count ?? 0;
    const totalAttempts = asmtStats?.total_attempts ?? 0;

    if (totalAttempts > 0) {
      const avgPart = (avgScore / 100) * 70;
      const passPart = Math.min(30, passedCount * 15);
      asmtRaw = Math.min(100, Math.round(avgPart + passPart));
      asmtEvidence = `Completed ${totalAttempts} assessment(s), passed ${passedCount} with an average of ${avgScore}%.`;
      if (asmtRaw >= 75) asmtStatus = 'optimal';
      else if (asmtRaw >= 50) asmtStatus = 'good';
    } else {
      asmtEvidence = 'No standardized technical assessments attempted yet (complete assessments to unlock up to 25% readiness).';
    }
    const asmtWeighted = Number(((asmtRaw * 25) / 100).toFixed(1));

    // ==========================================
    // 2. Skill Readiness & Skill-Gap Status (20% Weight)
    // ==========================================
    let skillsRaw = 15;
    let skillsEvidence = 'No skills registered yet.';
    let skillsStatus: 'optimal' | 'good' | 'needs_attention' = 'needs_attention';

    const techSkills = skills.filter(s => s.skill.category === 'technical');
    const softSkills = skills.filter(s => s.skill.category === 'soft');
    const advancedSkills = skills.filter(s => s.proficiency_level === 'Advanced' || s.proficiency_level === 'Expert');

    if (skills.length > 0) {
      const techPoints = Math.min(45, techSkills.length * 9);
      const softPoints = Math.min(25, softSkills.length * 8.5);
      const masteryPoints = Math.min(30, advancedSkills.length * 10);
      skillsRaw = Math.min(100, Math.round(techPoints + softPoints + masteryPoints));
      skillsEvidence = `${skills.length} verified skills (${techSkills.length} Technical, ${softSkills.length} Soft, ${advancedSkills.length} Advanced/Expert).`;
      if (skillsRaw >= 75) skillsStatus = 'optimal';
      else if (skillsRaw >= 50) skillsStatus = 'good';
    } else {
      skillsEvidence = 'Add technical and soft skills to bridge industry role requirements.';
    }
    const skillsWeighted = Number(((skillsRaw * 20) / 100).toFixed(1));

    // ==========================================
    // 3. Hands-on Projects (15% Weight)
    // ==========================================
    let projectsRaw = 15;
    let projectsEvidence = 'No portfolio projects showcased.';
    let projectsStatus: 'optimal' | 'good' | 'needs_attention' = 'needs_attention';

    if (projects.length > 0) {
      const countPoints = Math.min(60, projects.length * 30);
      const multiTechCount = projects.filter(p => p.technologies && p.technologies.length >= 3).length;
      const linkedCount = projects.filter(p => !!p.project_link).length;
      const qualityPoints = Math.min(40, multiTechCount * 15 + linkedCount * 10);
      projectsRaw = Math.min(100, Math.round(countPoints + qualityPoints));
      projectsEvidence = `${projects.length} repository/showcase project(s) with ${multiTechCount} multi-stack architecture(s).`;
      if (projectsRaw >= 75) projectsStatus = 'optimal';
      else if (projectsRaw >= 50) projectsStatus = 'good';
    } else {
      projectsEvidence = 'Build and link repository capstone projects to showcase implementation capability.';
    }
    const projectsWeighted = Number(((projectsRaw * 15) / 100).toFixed(1));

    // ==========================================
    // 4. Industry Certifications (10% Weight)
    // ==========================================
    let certsRaw = 15;
    let certsEvidence = 'No credentials recorded.';
    let certsStatus: 'optimal' | 'good' | 'needs_attention' = 'needs_attention';

    if (certs.length > 0) {
      const basePoints = certs.length === 1 ? 55 : certs.length === 2 ? 85 : 100;
      const linkBonus = certs.filter(c => !!c.certificate_link).length * 10;
      certsRaw = Math.min(100, basePoints + linkBonus);
      certsEvidence = `${certs.length} verified credential(s) from recognized authorities.`;
      if (certsRaw >= 75) certsStatus = 'optimal';
      else if (certsRaw >= 50) certsStatus = 'good';
    } else {
      certsEvidence = 'Add verified industry credentials (AWS, Google, Meta, etc.) to reinforce credibility.';
    }
    const certsWeighted = Number(((certsRaw * 10) / 100).toFixed(1));

    // ==========================================
    // 5. Academic Standing (10% Weight)
    // ==========================================
    let academicRaw = 70; // baseline if null
    let academicEvidence = 'Academic CGPA unrecorded; baseline institutional metric applied.';
    let academicStatus: 'optimal' | 'good' | 'needs_attention' = 'good';

    if (student.cgpa !== null && student.cgpa !== undefined) {
      if (student.cgpa >= 9.0) {
        academicRaw = 100;
        academicStatus = 'optimal';
      } else if (student.cgpa >= 8.0) {
        academicRaw = 88;
        academicStatus = 'optimal';
      } else if (student.cgpa >= 7.0) {
        academicRaw = 76;
        academicStatus = 'good';
      } else if (student.cgpa >= 6.0) {
        academicRaw = 62;
        academicStatus = 'good';
      } else {
        academicRaw = 48;
        academicStatus = 'needs_attention';
      }
      academicEvidence = `Academic standing verified with CGPA of ${student.cgpa}/10.0.`;
    }
    const academicWeighted = Number(((academicRaw * 10) / 100).toFixed(1));

    // ==========================================
    // 6. Learning Roadmap Progress (10% Weight)
    // ==========================================
    const s1 = Math.min(25, (techSkills.length / 4) * 25);
    const s2 = Math.min(25, (advancedSkills.length / 3) * 12 + Math.min(13, projects.length * 6.5));
    const s3 = Math.min(25, (passedCount / 2) * 15 + (avgScore / 100) * 10);
    const hasCapstone = projects.some(p => (p.technologies && p.technologies.length >= 3) || p.title.toLowerCase().includes('capstone'));
    const s4 = Math.min(25, (hasCapstone ? 15 : 0) + Math.min(10, certs.length * 5));
    const roadmapRaw = Math.min(100, Math.max(20, Math.round(s1 + s2 + s3 + s4)));

    let roadmapStatus: 'optimal' | 'good' | 'needs_attention' = 'needs_attention';
    if (roadmapRaw >= 75) roadmapStatus = 'optimal';
    else if (roadmapRaw >= 50) roadmapStatus = 'good';

    const roadmapEvidence = `Roadmap at ${roadmapRaw}% progression across foundational literacy, intermediate competence, and capstone milestones.`;
    const roadmapWeighted = Number(((roadmapRaw * 10) / 100).toFixed(1));

    // ==========================================
    // 7. Industry Evidence & Feedback (10% Weight)
    // ==========================================
    let evidencePoints = 20; // baseline
    const completedInternships = applications.filter(a => a.status === 'Completed' || (a.status === 'Selected' && a.completion_date));
    const inProgressInternships = applications.filter(a => a.status === 'In Progress');
    const shortlistedApps = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected');
    const totalApps = applications.length;

    evidencePoints += completedInternships.length * 40;
    evidencePoints += inProgressInternships.length * 25;
    evidencePoints += shortlistedApps.length * 15;
    if (totalApps > 0) evidencePoints += 10;

    if (mentorFeedbacks.length > 0) {
      const avgMentorRating = mentorFeedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / mentorFeedbacks.length;
      evidencePoints += Math.round((avgMentorRating / 5) * 25);
      const hasRecommendation = mentorFeedbacks.some(f => f.hire_recommendation === 'Recommended');
      if (hasRecommendation) evidencePoints += 10;
    }

    const industryRaw = Math.min(100, Math.max(15, Math.round(evidencePoints)));
    let industryStatus: 'optimal' | 'good' | 'needs_attention' = 'needs_attention';
    if (industryRaw >= 70) industryStatus = 'optimal';
    else if (industryRaw >= 45) industryStatus = 'good';

    let industryEvidence = '';
    if (completedInternships.length > 0) {
      industryEvidence = `Successfully completed ${completedInternships.length} industry internship(s) with verified completion records.`;
    } else if (inProgressInternships.length > 0) {
      industryEvidence = `Active in-progress industry internship underway with corporate mentoring.`;
    } else if (shortlistedApps.length > 0) {
      industryEvidence = `Candidate shortlisted/selected in ${shortlistedApps.length} competitive recruitment round(s).`;
    } else if (totalApps > 0) {
      industryEvidence = `Actively engaged in recruitment pipelines (${totalApps} application(s) submitted).`;
    } else {
      industryEvidence = 'Apply to corporate postings to build real-world interview and placement evidence.';
    }
    if (mentorFeedbacks.length > 0) {
      industryEvidence += ` Evaluated by industry mentors (${mentorFeedbacks.length} review(s)).`;
    }
    const industryWeighted = Number(((industryRaw * 10) / 100).toFixed(1));

    // ==========================================
    // TOTAL READINESS SCORE CALCULATION
    // ==========================================
    const totalScore = Math.min(
      100,
      Math.round(
        asmtWeighted +
        skillsWeighted +
        projectsWeighted +
        certsWeighted +
        academicWeighted +
        roadmapWeighted +
        industryWeighted
      )
    );

    let tier: ReadinessTier = 'Needs Foundation';
    let badge_color = 'bg-slate-900 text-slate-300 border-slate-700';

    if (totalScore >= 80) {
      tier = 'Job Ready';
      badge_color = 'bg-emerald-950 text-emerald-300 border-emerald-800';
    } else if (totalScore >= 65) {
      tier = 'High Potential';
      badge_color = 'bg-indigo-950 text-indigo-300 border-indigo-800';
    } else if (totalScore >= 45) {
      tier = 'Developing';
      badge_color = 'bg-amber-950 text-amber-300 border-amber-800';
    }

    const factorAsmt: PlacementReadinessFactor = {
      key: 'assessment_performance',
      name: 'Assessment Performance',
      weight: 25,
      score: asmtRaw,
      weighted_score: asmtWeighted,
      label: `${asmtRaw}%`,
      evidence: asmtEvidence,
      status: asmtStatus
    };

    const factorSkills: PlacementReadinessFactor = {
      key: 'skill_readiness',
      name: 'Skill Readiness & Gap Coverage',
      weight: 20,
      score: skillsRaw,
      weighted_score: skillsWeighted,
      label: `${skillsRaw}%`,
      evidence: skillsEvidence,
      status: skillsStatus
    };

    const factorProjects: PlacementReadinessFactor = {
      key: 'projects',
      name: 'Projects Portfolio',
      weight: 15,
      score: projectsRaw,
      weighted_score: projectsWeighted,
      label: `${projectsRaw}%`,
      evidence: projectsEvidence,
      status: projectsStatus
    };

    const factorCerts: PlacementReadinessFactor = {
      key: 'certifications',
      name: 'Industry Certifications',
      weight: 10,
      score: certsRaw,
      weighted_score: certsWeighted,
      label: `${certsRaw}%`,
      evidence: certsEvidence,
      status: certsStatus
    };

    const factorAcademic: PlacementReadinessFactor = {
      key: 'academic_standing',
      name: 'Academic Standing',
      weight: 10,
      score: academicRaw,
      weighted_score: academicWeighted,
      label: `${academicRaw}%`,
      evidence: academicEvidence,
      status: academicStatus
    };

    const factorRoadmap: PlacementReadinessFactor = {
      key: 'roadmap_progress',
      name: 'Roadmap Progress',
      weight: 10,
      score: roadmapRaw,
      weighted_score: roadmapWeighted,
      label: `${roadmapRaw}%`,
      evidence: roadmapEvidence,
      status: roadmapStatus
    };

    const factorIndustry: PlacementReadinessFactor = {
      key: 'industry_evidence',
      name: 'Industry Evidence & Feedback',
      weight: 10,
      score: industryRaw,
      weighted_score: industryWeighted,
      label: `${industryRaw}%`,
      evidence: industryEvidence,
      status: industryStatus
    };

    const factors_list = [
      factorAsmt,
      factorSkills,
      factorProjects,
      factorCerts,
      factorAcademic,
      factorRoadmap,
      factorIndustry
    ];

    // Reasons, strengths, recommendations
    const reasons: string[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];

    if (student.cgpa && student.cgpa >= 8.0) {
      strengths.push(`Strong academic standing with CGPA of ${student.cgpa}/10.0.`);
      reasons.push(`Strong academic record (CGPA: ${student.cgpa}).`);
    }
    if (passedCount >= 1 && avgScore >= 70) {
      strengths.push(`Verified proficiency across ${passedCount} standardized technical assessments (${avgScore}% avg).`);
      reasons.push(`Passed ${passedCount} standardized assessments with ${avgScore}% avg.`);
    } else if (totalAttempts === 0) {
      recommendations.push('Attempt standardized assessments in Phase 2 to verify technical mastery.');
      reasons.push('Has not yet completed standardized technical assessments.');
    }
    if (skills.length >= 6) {
      strengths.push(`Rich multi-disciplinary profile with ${skills.length} technical and soft competencies.`);
      reasons.push(`Proficient in ${skills.length} verified competencies.`);
    } else {
      recommendations.push('Add core technical proficiencies to cover target corporate job descriptions.');
    }
    if (projects.length >= 2) {
      strengths.push(`Demonstrated hands-on engineering experience with ${projects.length} repository projects.`);
    } else {
      recommendations.push('Build and document full-stack or architecture capstone projects.');
    }
    if (certs.length >= 2) {
      strengths.push(`Holds ${certs.length} verified third-party industry certifications.`);
    }
    if (completedInternships.length > 0 || shortlistedApps.length > 0) {
      strengths.push('Demonstrated corporate engagement with verified recruiter shortlists or completed internships.');
    }

    // Legacy scores for backward compatibility
    const legacyAcademic = Math.round((academicRaw / 100) * 20);
    const legacyAssessment = Math.round((asmtRaw / 100) * 25);
    const legacySkills = Math.round((skillsRaw / 100) * 20);
    const legacyPortfolio = Math.round((projectsRaw / 100) * 10 + (certsRaw / 100) * 5);
    const legacyMarket = Math.round((industryRaw / 100) * 10 + (roadmapRaw / 100) * 10);

    return {
      total_score: totalScore,
      placement_readiness_percentage: totalScore,
      display_text: `Placement Readiness: ${totalScore}%`,
      tier,
      badge_color,
      disclaimer: 'Readiness indicator calculated from verified academic, technical assessment, skill, and industry evidence data. Not a legal or contractual placement guarantee.',
      factors: {
        academic_score: legacyAcademic,
        assessment_score: legacyAssessment,
        skills_score: legacySkills,
        portfolio_score: legacyPortfolio,
        market_match_score: legacyMarket,
        assessment_performance: factorAsmt,
        skill_readiness: factorSkills,
        projects: factorProjects,
        certifications: factorCerts,
        academic_standing: factorAcademic,
        roadmap_progress: factorRoadmap,
        industry_evidence: factorIndustry
      },
      factors_list,
      reasons: reasons.length > 0 ? reasons : ['Profile initialized; completing assessments and projects will increase readiness.'],
      strengths: strengths.length > 0 ? strengths : ['Basic profile registered on SkillBridge.'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continue pursuing advanced technical coursework and recruitment pipelines.']
    };
  }

  /**
   * Get enriched student list with all academic, skill, assessment, and placement fields
   */
  public static getEnrichedStudentRoster(): EnrichedStudentRosterItem[] {
    const rawData = db.getRawData();
    const students = rawData.students;

    return students.map(student => {
      const user = rawData.users.find(u => u.id === student.user_id);
      const studentSkills = db.getStudentSkills(student.id);
      const projects = db.getStudentProjects(student.id);
      const certs = db.getStudentCertifications(student.id);
      const asmtStats = db.getStudentAssessmentStats(student.id);
      const applications = db.getStudentApplications(student.id);

      const readiness = this.calculateStudentReadiness(student.id);

      // Top skills
      const topSkills = studentSkills.slice(0, 5).map(s => ({
        name: s.skill.name,
        category: s.skill.category,
        proficiency_level: s.proficiency_level
      }));

      // Placement status
      let placement_status: EnrichedStudentRosterItem['placement_status'] = 'Not Applied';
      if (applications.some(a => a.status === 'Selected')) {
        placement_status = 'Selected / Hired';
      } else if (applications.some(a => a.status === 'Shortlisted')) {
        placement_status = 'Shortlisted';
      } else if (applications.some(a => a.status === 'Under Review')) {
        placement_status = 'Under Review';
      } else if (applications.length > 0) {
        placement_status = 'Applied';
      }

      // Assessment status
      let assessment_status: EnrichedStudentRosterItem['assessment_status'] = 'Not Started';
      if (asmtStats && asmtStats.passed_count > 0) {
        assessment_status = 'Completed';
      } else if (asmtStats && asmtStats.total_attempts > 0) {
        assessment_status = 'In Progress';
      }

      const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
      const selectedCount = applications.filter(a => a.status === 'Selected').length;

      // Find top match score from applications or readiness
      let topMatchScore: number | null = null;
      if (applications.length > 0) {
        const scores = applications.map(a => a.match_score).filter((s): s is number => typeof s === 'number');
        if (scores.length > 0) topMatchScore = Math.max(...scores);
      }

      return {
        id: student.id,
        user_id: student.user_id,
        full_name: student.full_name,
        email: user?.email,
        phone: student.phone,
        college_name: student.college_name,
        department: student.department,
        year_of_study: student.year_of_study,
        cgpa: student.cgpa,
        profile_photo: student.profile_photo,
        bio: student.bio,
        created_at: student.created_at,
        skills_count: studentSkills.length,
        technical_skills_count: studentSkills.filter(s => s.skill.category === 'technical').length,
        soft_skills_count: studentSkills.filter(s => s.skill.category === 'soft').length,
        top_skills: topSkills,
        assessment_status,
        assessments_attempted: asmtStats?.total_attempts ?? 0,
        assessments_passed: asmtStats?.passed_count ?? 0,
        average_assessment_score: asmtStats?.average_score ?? null,
        highest_assessment_score: asmtStats?.highest_score ?? null,
        verified_badges_count: asmtStats?.verified_badges_count ?? 0,
        projects_count: projects.length,
        certifications_count: certs.length,
        applications_count: applications.length,
        shortlisted_count: shortlistedCount,
        selected_count: selectedCount,
        placement_status,
        top_match_score: topMatchScore,
        readiness
      };
    });
  }

  /**
   * Get single student detailed institutional dossier
   */
  public static getStudentDossier(studentId: string): any | null {
    const student = db.findStudentById(studentId);
    if (!student) return null;

    const user = db.findUserById(student.user_id);
    const skills = db.getStudentSkills(studentId);
    const projects = db.getStudentProjects(studentId);
    const certs = db.getStudentCertifications(studentId);
    const asmtStats = db.getStudentAssessmentStats(studentId);
    const asmtHistory = db.getStudentAssessmentHistory(studentId);
    const applications = db.getStudentApplications(studentId);
    const readiness = this.calculateStudentReadiness(studentId);

    // Skill Gap evaluation for top industry roles
    const skillGapRoles = SkillGapEngine.getAllRoles();
    let topSkillGapReport: any = null;
    if (skillGapRoles.length > 0) {
      try {
        topSkillGapReport = SkillGapEngine.analyzeStudentRoleGap(studentId, skillGapRoles[0].id);
      } catch (e) {
        // ignore
      }
    }

    return {
      student: {
        ...student,
        email: user?.email
      },
      skills,
      projects,
      certifications: certs,
      assessment_stats: asmtStats,
      assessment_history: asmtHistory,
      applications,
      readiness,
      skill_gap_summary: topSkillGapReport
    };
  }

  /**
   * Get live institutional dashboard metrics
   */
  public static getDashboardStats(): CollegeDashboardStats {
    const rawData = db.getRawData();
    const students = this.getEnrichedStudentRoster();
    const companies = rawData.companies;
    const jobs = rawData.jobs.filter(j => j.status === 'active');
    const internships = rawData.internships.filter(i => i.status === 'active');
    const applications = rawData.applications;

    const totalStudents = students.length;

    // Average CGPA
    const validCgpas = students.map(s => s.cgpa).filter((c): c is number => c !== null);
    const averageCgpa = validCgpas.length > 0
      ? Number((validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2))
      : 0;

    // Assessment completion rate
    const studentsWithAsmt = students.filter(s => s.assessments_attempted > 0).length;
    const assessmentCompletionRate = totalStudents > 0
      ? Math.round((studentsWithAsmt / totalStudents) * 100)
      : 0;

    // Average assessment score
    const allAttempts = rawData.assessment_attempts;
    const averageAssessmentScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((a, b) => a + b.score_percentage, 0) / allAttempts.length)
      : 0;

    // Placement readiness rate
    const readyStudents = students.filter(
      s => s.readiness.tier === 'Job Ready' || s.readiness.tier === 'High Potential'
    );
    const placementReadinessRate = totalStudents > 0
      ? Math.round((readyStudents.length / totalStudents) * 100)
      : 0;

    // Placement status counts
    const shortlistedStudents = new Set(
      applications.filter(a => a.status === 'Shortlisted').map(a => a.student_id)
    ).size;
    const selectedStudents = new Set(
      applications.filter(a => a.status === 'Selected').map(a => a.student_id)
    ).size;
    const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

    // Readiness distribution
    const readinessDistribution = {
      job_ready: students.filter(s => s.readiness.tier === 'Job Ready').length,
      high_potential: students.filter(s => s.readiness.tier === 'High Potential').length,
      developing: students.filter(s => s.readiness.tier === 'Developing').length,
      needs_foundation: students.filter(s => s.readiness.tier === 'Needs Foundation').length
    };

    // Placement funnel
    const placementFunnel = {
      applied: applications.length,
      under_review: applications.filter(a => a.status === 'Under Review').length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      selected: applications.filter(a => a.status === 'Selected').length,
      rejected: rejectedApps
    };

    // Department summary
    const departmentsMap = new Map<string, typeof students>();
    students.forEach(s => {
      const dept = s.department || 'General';
      if (!departmentsMap.has(dept)) departmentsMap.set(dept, []);
      departmentsMap.get(dept)!.push(s);
    });

    const departmentSummary = Array.from(departmentsMap.entries()).map(([dept, deptStudents]) => {
      const deptCgpas = deptStudents.map(s => s.cgpa).filter((c): c is number => c !== null);
      const avgDeptCgpa = deptCgpas.length > 0
        ? Number((deptCgpas.reduce((a, b) => a + b, 0) / deptCgpas.length).toFixed(2))
        : 0;
      const deptReady = deptStudents.filter(
        s => s.readiness.tier === 'Job Ready' || s.readiness.tier === 'High Potential'
      ).length;
      const deptAsmt = deptStudents.filter(s => s.assessments_attempted > 0).length;
      const deptApps = deptStudents.reduce((acc, s) => acc + s.applications_count, 0);
      const deptPlaced = deptStudents.filter(s => s.placement_status === 'Selected / Hired').length;

      return {
        department: dept,
        student_count: deptStudents.length,
        average_cgpa: avgDeptCgpa,
        readiness_rate: deptStudents.length > 0 ? Math.round((deptReady / deptStudents.length) * 100) : 0,
        assessment_rate: deptStudents.length > 0 ? Math.round((deptAsmt / deptStudents.length) * 100) : 0,
        applications_count: deptApps,
        placed_count: deptPlaced
      };
    });

    // Batch summary
    const batchesMap = new Map<string, typeof students>();
    students.forEach(s => {
      const batch = s.year_of_study || 'Unknown Batch';
      if (!batchesMap.has(batch)) batchesMap.set(batch, []);
      batchesMap.get(batch)!.push(s);
    });

    const batchSummary = Array.from(batchesMap.entries()).map(([batch, batchStudents]) => {
      const batchCgpas = batchStudents.map(s => s.cgpa).filter((c): c is number => c !== null);
      const avgBatchCgpa = batchCgpas.length > 0
        ? Number((batchCgpas.reduce((a, b) => a + b, 0) / batchCgpas.length).toFixed(2))
        : 0;
      const batchReady = batchStudents.filter(
        s => s.readiness.tier === 'Job Ready' || s.readiness.tier === 'High Potential'
      ).length;
      const batchApplying = batchStudents.filter(s => s.applications_count > 0).length;
      const batchPlaced = batchStudents.filter(s => s.placement_status === 'Selected / Hired').length;

      return {
        batch,
        student_count: batchStudents.length,
        average_cgpa: avgBatchCgpa,
        readiness_rate: batchStudents.length > 0 ? Math.round((batchReady / batchStudents.length) * 100) : 0,
        actively_applying_count: batchApplying,
        placed_count: batchPlaced
      };
    });

    // Recent placement activity
    const recentActivity = applications.slice(0, 8).map(app => {
      const student = rawData.students.find(s => s.id === app.student_id);
      const company = rawData.companies.find(c => c.id === app.company_id);
      let oppTitle = 'Opportunity';
      if (app.opportunity_type === 'job') {
        oppTitle = rawData.jobs.find(j => j.id === app.opportunity_id)?.title || 'Job';
      } else {
        oppTitle = rawData.internships.find(i => i.id === app.opportunity_id)?.title || 'Internship';
      }

      return {
        application_id: app.id,
        student_id: app.student_id,
        student_name: student?.full_name || 'Student',
        student_department: student?.department || 'Engineering',
        company_name: company?.company_name || 'Partner Company',
        opportunity_title: oppTitle,
        opportunity_type: app.opportunity_type,
        status: app.status,
        applied_at: app.applied_at,
        match_score: app.match_score
      };
    });

    const institutionName = students.length > 0 && students[0].college_name
      ? students[0].college_name
      : 'Institute of Technology & Science';

    return {
      institution_name: institutionName,
      total_students: totalStudents,
      average_cgpa: averageCgpa,
      assessment_completion_rate: assessmentCompletionRate,
      average_assessment_score: averageAssessmentScore,
      placement_readiness_rate: placementReadinessRate,
      students_placement_ready_count: readyStudents.length,
      active_job_applications_count: applications.length,
      shortlisted_students_count: shortlistedStudents,
      selected_students_count: selectedStudents,
      rejected_applications_count: rejectedApps,
      industry_partners_count: companies.length,
      active_jobs_count: jobs.length,
      active_internships_count: internships.length,
      readiness_distribution: readinessDistribution,
      placement_funnel: placementFunnel,
      department_summary: departmentSummary,
      batch_summary: batchSummary,
      recent_placement_activity: recentActivity
    };
  }

  /**
   * Get detailed department analytics
   */
  public static getDepartmentAnalytics(): Array<{
    department: string;
    student_count: number;
    average_cgpa: number;
    assessment_completion_rate: number;
    average_assessment_score: number;
    job_ready_count: number;
    high_potential_count: number;
    developing_count: number;
    needs_foundation_count: number;
    placement_readiness_rate: number;
    total_applications: number;
    shortlisted_count: number;
    selected_count: number;
    top_skills: string[];
    students: EnrichedStudentRosterItem[];
  }> {
    const students = this.getEnrichedStudentRoster();
    const departmentsMap = new Map<string, EnrichedStudentRosterItem[]>();

    students.forEach(s => {
      const dept = s.department || 'General';
      if (!departmentsMap.has(dept)) departmentsMap.set(dept, []);
      departmentsMap.get(dept)!.push(s);
    });

    return Array.from(departmentsMap.entries()).map(([department, deptStudents]) => {
      const validCgpas = deptStudents.map(s => s.cgpa).filter((c): c is number => c !== null);
      const avgCgpa = validCgpas.length > 0
        ? Number((validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2))
        : 0;

      const attemptedStudents = deptStudents.filter(s => s.assessments_attempted > 0);
      const asmtCompletionRate = deptStudents.length > 0
        ? Math.round((attemptedStudents.length / deptStudents.length) * 100)
        : 0;

      const asmtScores = deptStudents
        .map(s => s.average_assessment_score)
        .filter((s): s is number => s !== null);
      const avgAsmtScore = asmtScores.length > 0
        ? Math.round(asmtScores.reduce((a, b) => a + b, 0) / asmtScores.length)
        : 0;

      const jobReady = deptStudents.filter(s => s.readiness.tier === 'Job Ready').length;
      const highPot = deptStudents.filter(s => s.readiness.tier === 'High Potential').length;
      const dev = deptStudents.filter(s => s.readiness.tier === 'Developing').length;
      const needsFound = deptStudents.filter(s => s.readiness.tier === 'Needs Foundation').length;

      const readinessRate = deptStudents.length > 0
        ? Math.round(((jobReady + highPot) / deptStudents.length) * 100)
        : 0;

      const totalApps = deptStudents.reduce((acc, s) => acc + s.applications_count, 0);
      const shortlists = deptStudents.reduce((acc, s) => acc + s.shortlisted_count, 0);
      const selects = deptStudents.reduce((acc, s) => acc + s.selected_count, 0);

      // Extract most common skills in department
      const skillCounts = new Map<string, number>();
      deptStudents.forEach(s => {
        s.top_skills.forEach(ts => {
          skillCounts.set(ts.name, (skillCounts.get(ts.name) || 0) + 1);
        });
      });
      const sortedSkills = Array.from(skillCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(s => s[0]);

      return {
        department,
        student_count: deptStudents.length,
        average_cgpa: avgCgpa,
        assessment_completion_rate: asmtCompletionRate,
        average_assessment_score: avgAsmtScore,
        job_ready_count: jobReady,
        high_potential_count: highPot,
        developing_count: dev,
        needs_foundation_count: needsFound,
        placement_readiness_rate: readinessRate,
        total_applications: totalApps,
        shortlisted_count: shortlists,
        selected_count: selects,
        top_skills: sortedSkills,
        students: deptStudents
      };
    });
  }

  /**
   * Get detailed batch analytics
   */
  public static getBatchAnalytics(): Array<{
    batch: string;
    total_students: number;
    average_cgpa: number;
    assessment_completion_rate: number;
    average_assessment_score: number;
    skill_readiness_rate: number;
    actively_applying_count: number;
    shortlisted_count: number;
    selected_count: number;
    readiness_distribution: {
      job_ready: number;
      high_potential: number;
      developing: number;
      needs_foundation: number;
    };
    students: EnrichedStudentRosterItem[];
  }> {
    const students = this.getEnrichedStudentRoster();
    const batchesMap = new Map<string, EnrichedStudentRosterItem[]>();

    students.forEach(s => {
      const batch = s.year_of_study || 'Unknown Batch';
      if (!batchesMap.has(batch)) batchesMap.set(batch, []);
      batchesMap.get(batch)!.push(s);
    });

    return Array.from(batchesMap.entries()).map(([batch, batchStudents]) => {
      const validCgpas = batchStudents.map(s => s.cgpa).filter((c): c is number => c !== null);
      const avgCgpa = validCgpas.length > 0
        ? Number((validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2))
        : 0;

      const attempted = batchStudents.filter(s => s.assessments_attempted > 0);
      const asmtRate = batchStudents.length > 0
        ? Math.round((attempted.length / batchStudents.length) * 100)
        : 0;

      const asmtScores = batchStudents
        .map(s => s.average_assessment_score)
        .filter((s): s is number => s !== null);
      const avgAsmtScore = asmtScores.length > 0
        ? Math.round(asmtScores.reduce((a, b) => a + b, 0) / asmtScores.length)
        : 0;

      const jobReady = batchStudents.filter(s => s.readiness.tier === 'Job Ready').length;
      const highPot = batchStudents.filter(s => s.readiness.tier === 'High Potential').length;
      const dev = batchStudents.filter(s => s.readiness.tier === 'Developing').length;
      const needsFound = batchStudents.filter(s => s.readiness.tier === 'Needs Foundation').length;

      const readinessRate = batchStudents.length > 0
        ? Math.round(((jobReady + highPot) / batchStudents.length) * 100)
        : 0;

      const applying = batchStudents.filter(s => s.applications_count > 0).length;
      const shortlists = batchStudents.reduce((acc, s) => acc + s.shortlisted_count, 0);
      const selects = batchStudents.reduce((acc, s) => acc + s.selected_count, 0);

      return {
        batch,
        total_students: batchStudents.length,
        average_cgpa: avgCgpa,
        assessment_completion_rate: asmtRate,
        average_assessment_score: avgAsmtScore,
        skill_readiness_rate: readinessRate,
        actively_applying_count: applying,
        shortlisted_count: shortlists,
        selected_count: selects,
        readiness_distribution: {
          job_ready: jobReady,
          high_potential: highPot,
          developing: dev,
          needs_foundation: needsFound
        },
        students: batchStudents
      };
    });
  }

  /**
   * Get institutional assessment analytics
   */
  public static getAssessmentAnalytics(): {
    total_assessments_available: number;
    total_attempts: number;
    unique_students_attempted: number;
    completion_rate: number;
    overall_average_score: number;
    overall_pass_rate: number;
    score_distribution: {
      '0_39': number;
      '40_59': number;
      '60_79': number;
      '80_100': number;
    };
    skill_level_distribution: {
      Beginner: number;
      Intermediate: number;
      Advanced: number;
      Master: number;
    };
    assessments_breakdown: Array<{
      id: string;
      title: string;
      category: string;
      difficulty: string;
      passing_percentage: number;
      total_attempts: number;
      passed_attempts: number;
      pass_rate: number;
      average_score: number;
      highest_score: number;
    }>;
    department_performance: Array<{
      department: string;
      total_attempts: number;
      average_score: number;
      pass_rate: number;
    }>;
    recent_attempts: Array<AssessmentAttemptRecord & { student_name?: string; student_department?: string }>;
  } {
    const rawData = db.getRawData();
    const assessments = rawData.assessments;
    const attempts = rawData.assessment_attempts;
    const students = rawData.students;

    const uniqueStudents = new Set(attempts.map(a => a.student_id)).size;
    const completionRate = students.length > 0 ? Math.round((uniqueStudents / students.length) * 100) : 0;

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    const avgScore = totalAttempts > 0
      ? Math.round(attempts.reduce((a, b) => a + b.score_percentage, 0) / totalAttempts)
      : 0;

    // Score distribution
    const scoreDist = {
      '0_39': attempts.filter(a => a.score_percentage < 40).length,
      '40_59': attempts.filter(a => a.score_percentage >= 40 && a.score_percentage < 60).length,
      '60_79': attempts.filter(a => a.score_percentage >= 60 && a.score_percentage < 80).length,
      '80_100': attempts.filter(a => a.score_percentage >= 80).length
    };

    // Skill level distribution
    const skillLevelDist = {
      Beginner: attempts.filter(a => a.skill_level_awarded === 'Beginner').length,
      Intermediate: attempts.filter(a => a.skill_level_awarded === 'Intermediate').length,
      Advanced: attempts.filter(a => a.skill_level_awarded === 'Advanced').length,
      Master: attempts.filter(a => a.skill_level_awarded === 'Master').length
    };

    // Assessments breakdown
    const asmtBreakdown = assessments.map(asmt => {
      const asmtAttempts = attempts.filter(a => a.assessment_id === asmt.id);
      const count = asmtAttempts.length;
      const passed = asmtAttempts.filter(a => a.passed).length;
      const pRate = count > 0 ? Math.round((passed / count) * 100) : 0;
      const aScore = count > 0
        ? Math.round(asmtAttempts.reduce((acc, cur) => acc + cur.score_percentage, 0) / count)
        : 0;
      const hScore = count > 0 ? Math.max(...asmtAttempts.map(a => a.score_percentage)) : 0;

      return {
        id: asmt.id,
        title: asmt.title,
        category: asmt.category,
        difficulty: asmt.difficulty,
        passing_percentage: asmt.passing_percentage,
        total_attempts: count,
        passed_attempts: passed,
        pass_rate: pRate,
        average_score: aScore,
        highest_score: hScore
      };
    });

    // Department performance
    const deptAttemptsMap = new Map<string, AssessmentAttemptRecord[]>();
    attempts.forEach(att => {
      const st = students.find(s => s.id === att.student_id);
      const dept = st?.department || 'General';
      if (!deptAttemptsMap.has(dept)) deptAttemptsMap.set(dept, []);
      deptAttemptsMap.get(dept)!.push(att);
    });

    const deptPerformance = Array.from(deptAttemptsMap.entries()).map(([department, atts]) => {
      const count = atts.length;
      const passed = atts.filter(a => a.passed).length;
      const pRate = count > 0 ? Math.round((passed / count) * 100) : 0;
      const aScore = count > 0 ? Math.round(atts.reduce((a, b) => a + b.score_percentage, 0) / count) : 0;

      return {
        department,
        total_attempts: count,
        average_score: aScore,
        pass_rate: pRate
      };
    });

    // Recent attempts with student names
    const recentAttempts = attempts.slice(0, 10).map(att => {
      const st = students.find(s => s.id === att.student_id);
      return {
        ...att,
        student_name: st?.full_name || 'Student',
        student_department: st?.department || 'Engineering'
      };
    });

    return {
      total_assessments_available: assessments.length,
      total_attempts: totalAttempts,
      unique_students_attempted: uniqueStudents,
      completion_rate: completionRate,
      overall_average_score: avgScore,
      overall_pass_rate: overallPassRate,
      score_distribution: scoreDist,
      skill_level_distribution: skillLevelDist,
      assessments_breakdown: asmtBreakdown,
      department_performance: deptPerformance,
      recent_attempts: recentAttempts
    };
  }

  /**
   * Get institutional skill readiness and market demand comparison
   */
  public static getSkillReadinessAnalytics(): {
    most_common_student_skills: Array<{ name: string; category: string; count: number; percentage: number }>;
    strongest_skills: Array<{ name: string; advanced_count: number; percentage: number }>;
    weakest_skills: Array<{ name: string; beginner_count: number; percentage: number }>;
    industry_demanded_skills: Array<{ name: string; required_count: number; percentage_of_postings: number }>;
    most_frequently_missing_skills: Array<{ name: string; demand_count: number; student_supply_count: number; gap_percentage: number }>;
    overall_skill_readiness_percentage: number;
  } {
    const rawData = db.getRawData();
    const students = rawData.students;
    const studentSkills = rawData.student_skills;
    const skills = rawData.skills;
    const jobs = rawData.jobs.filter(j => j.status === 'active');
    const internships = rawData.internships.filter(i => i.status === 'active');
    const totalPostings = jobs.length + internships.length;
    const totalStudents = students.length;

    // Student skills counts
    const skillCountMap = new Map<string, { count: number; category: string; advanced: number; beginner: number }>();

    studentSkills.forEach(ss => {
      const sk = skills.find(s => s.id === ss.skill_id);
      const name = sk ? sk.name : 'Unknown Skill';
      const cat = sk ? sk.category : 'technical';

      if (!skillCountMap.has(name)) {
        skillCountMap.set(name, { count: 0, category: cat, advanced: 0, beginner: 0 });
      }
      const entry = skillCountMap.get(name)!;
      entry.count += 1;
      if (ss.proficiency_level === 'Advanced' || ss.proficiency_level === 'Expert') {
        entry.advanced += 1;
      }
      if (ss.proficiency_level === 'Beginner') {
        entry.beginner += 1;
      }
    });

    const mostCommon = Array.from(skillCountMap.entries())
      .map(([name, data]) => ({
        name,
        category: data.category,
        count: data.count,
        percentage: totalStudents > 0 ? Math.round((data.count / totalStudents) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const strongest = Array.from(skillCountMap.entries())
      .filter(([_, data]) => data.advanced > 0)
      .map(([name, data]) => ({
        name,
        advanced_count: data.advanced,
        percentage: data.count > 0 ? Math.round((data.advanced / data.count) * 100) : 0
      }))
      .sort((a, b) => b.advanced_count - a.advanced_count)
      .slice(0, 8);

    const weakest = Array.from(skillCountMap.entries())
      .filter(([_, data]) => data.beginner > 0)
      .map(([name, data]) => ({
        name,
        beginner_count: data.beginner,
        percentage: data.count > 0 ? Math.round((data.beginner / data.count) * 100) : 0
      }))
      .sort((a, b) => b.beginner_count - a.beginner_count)
      .slice(0, 8);

    // Industry Demanded Skills from active jobs & internships
    const industryDemandMap = new Map<string, number>();
    [...jobs, ...internships].forEach(opp => {
      opp.required_skills.forEach(req => {
        industryDemandMap.set(req, (industryDemandMap.get(req) || 0) + 1);
      });
    });

    const industryDemanded = Array.from(industryDemandMap.entries())
      .map(([name, reqCount]) => ({
        name,
        required_count: reqCount,
        percentage_of_postings: totalPostings > 0 ? Math.round((reqCount / totalPostings) * 100) : 0
      }))
      .sort((a, b) => b.required_count - a.required_count)
      .slice(0, 10);

    // Missing Skills Gap (Demanded by industry vs student supply)
    const missingSkills = Array.from(industryDemandMap.entries())
      .map(([name, demandCount]) => {
        const studentSupply = skillCountMap.get(name)?.count || 0;
        const supplyRate = totalStudents > 0 ? studentSupply / totalStudents : 0;
        const gapPct = Math.max(0, Math.round((1 - supplyRate) * 100));
        return {
          name,
          demand_count: demandCount,
          student_supply_count: studentSupply,
          gap_percentage: gapPct
        };
      })
      .sort((a, b) => b.gap_percentage - a.gap_percentage)
      .slice(0, 8);

    // Overall Institutional Skill Readiness
    const dashboardStats = this.getDashboardStats();

    return {
      most_common_student_skills: mostCommon,
      strongest_skills: strongest,
      weakest_skills: weakest,
      industry_demanded_skills: industryDemanded,
      most_frequently_missing_skills: missingSkills,
      overall_skill_readiness_percentage: dashboardStats.placement_readiness_rate
    };
  }

  /**
   * Get placement & pipeline analytics
   */
  public static getPlacementAnalytics(): {
    total_applications: number;
    shortlisted_count: number;
    selected_count: number;
    rejected_count: number;
    under_review_count: number;
    conversion_rate: number;
    by_opportunity_type: {
      jobs_count: number;
      internships_count: number;
    };
    department_placements: Array<{
      department: string;
      applied_count: number;
      shortlisted_count: number;
      selected_count: number;
      conversion_rate: number;
    }>;
    top_hiring_partners: Array<{
      company_id: string;
      company_name: string;
      industry: string;
      applications_count: number;
      shortlisted_count: number;
      selected_count: number;
    }>;
    applications_list: Array<any>;
  } {
    const rawData = db.getRawData();
    const applications = rawData.applications;
    const students = rawData.students;
    const companies = rawData.companies;

    const totalApps = applications.length;
    const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
    const selected = applications.filter(a => a.status === 'Selected').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;
    const underReview = applications.filter(a => a.status === 'Under Review').length;

    const conversionRate = totalApps > 0 ? Math.round((selected / totalApps) * 100) : 0;

    const jobsCount = applications.filter(a => a.opportunity_type === 'job').length;
    const internshipsCount = applications.filter(a => a.opportunity_type === 'internship').length;

    // Department placements
    const deptMap = new Map<string, ApplicationRecord[]>();
    applications.forEach(app => {
      const st = students.find(s => s.id === app.student_id);
      const dept = st?.department || 'General';
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(app);
    });

    const deptPlacements = Array.from(deptMap.entries()).map(([department, apps]) => {
      const appCount = apps.length;
      const sCount = apps.filter(a => a.status === 'Shortlisted').length;
      const selCount = apps.filter(a => a.status === 'Selected').length;
      const cRate = appCount > 0 ? Math.round((selCount / appCount) * 100) : 0;

      return {
        department,
        applied_count: appCount,
        shortlisted_count: sCount,
        selected_count: selCount,
        conversion_rate: cRate
      };
    });

    // Top hiring partners
    const companyMap = new Map<string, ApplicationRecord[]>();
    applications.forEach(app => {
      if (!companyMap.has(app.company_id)) companyMap.set(app.company_id, []);
      companyMap.get(app.company_id)!.push(app);
    });

    const topPartners = Array.from(companyMap.entries()).map(([companyId, apps]) => {
      const comp = companies.find(c => c.id === companyId);
      const sCount = apps.filter(a => a.status === 'Shortlisted').length;
      const selCount = apps.filter(a => a.status === 'Selected').length;

      return {
        company_id: companyId,
        company_name: comp?.company_name || 'Partner Company',
        industry: comp?.industry || 'Technology',
        applications_count: apps.length,
        shortlisted_count: sCount,
        selected_count: selCount
      };
    }).sort((a, b) => b.applications_count - a.applications_count);

    // Enriched applications list
    const enrichedApps = applications.map(app => {
      const student = students.find(s => s.id === app.student_id);
      const company = companies.find(c => c.id === app.company_id);
      let oppTitle = 'Opportunity';
      if (app.opportunity_type === 'job') {
        oppTitle = rawData.jobs.find(j => j.id === app.opportunity_id)?.title || 'Job';
      } else {
        oppTitle = rawData.internships.find(i => i.id === app.opportunity_id)?.title || 'Internship';
      }

      return {
        ...app,
        student_name: student?.full_name,
        student_department: student?.department,
        student_cgpa: student?.cgpa,
        company_name: company?.company_name,
        opportunity_title: oppTitle
      };
    });

    return {
      total_applications: totalApps,
      shortlisted_count: shortlisted,
      selected_count: selected,
      rejected_count: rejected,
      under_review_count: underReview,
      conversion_rate: conversionRate,
      by_opportunity_type: {
        jobs_count: jobsCount,
        internships_count: internshipsCount
      },
      department_placements: deptPlacements,
      top_hiring_partners: topPartners,
      applications_list: enrichedApps
    };
  }

  /**
   * Get institutional industry engagement metrics & company partners
   */
  public static getIndustryEngagementAnalytics(): {
    total_partners: number;
    active_jobs_count: number;
    active_internships_count: number;
    total_applications_received: number;
    partners_list: Array<{
      id: string;
      company_name: string;
      industry: string;
      location: string;
      company_size: string;
      website: string;
      contact_email: string;
      logo: string;
      active_jobs_count: number;
      active_internships_count: number;
      total_applicants_count: number;
      shortlisted_count: number;
      selected_count: number;
      jobs: JobRecord[];
      internships: InternshipRecord[];
    }>;
    industry_domain_distribution: Array<{ domain: string; count: number; percentage: number }>;
  } {
    const rawData = db.getRawData();
    const companies = rawData.companies;
    const jobs = rawData.jobs;
    const internships = rawData.internships;
    const applications = rawData.applications;

    const activeJobs = jobs.filter(j => j.status === 'active');
    const activeInternships = internships.filter(i => i.status === 'active');

    const partnersList = companies.map(comp => {
      const compJobs = jobs.filter(j => j.company_id === comp.id && j.status === 'active');
      const compInternships = internships.filter(i => i.company_id === comp.id && i.status === 'active');
      const compApps = applications.filter(a => a.company_id === comp.id);
      const shortlists = compApps.filter(a => a.status === 'Shortlisted').length;
      const selects = compApps.filter(a => a.status === 'Selected').length;

      return {
        id: comp.id,
        company_name: comp.company_name,
        industry: comp.industry,
        location: comp.location,
        company_size: comp.company_size,
        website: comp.website,
        contact_email: comp.contact_email,
        logo: comp.logo,
        active_jobs_count: compJobs.length,
        active_internships_count: compInternships.length,
        total_applicants_count: compApps.length,
        shortlisted_count: shortlists,
        selected_count: selects,
        jobs: compJobs,
        internships: compInternships
      };
    });

    // Domain distribution
    const domainMap = new Map<string, number>();
    companies.forEach(c => {
      domainMap.set(c.industry, (domainMap.get(c.industry) || 0) + 1);
    });

    const domainDist = Array.from(domainMap.entries()).map(([domain, count]) => ({
      domain,
      count,
      percentage: companies.length > 0 ? Math.round((count / companies.length) * 100) : 0
    }));

    return {
      total_partners: companies.length,
      active_jobs_count: activeJobs.length,
      active_internships_count: activeInternships.length,
      total_applications_received: applications.length,
      partners_list: partnersList,
      industry_domain_distribution: domainDist
    };
  }

  /**
   * Generate institutional downloadable / printable report
   */
  public static generateInstitutionalReport(reportType: string): {
    title: string;
    description: string;
    generated_at: string;
    institution_name: string;
    summary_metrics: Array<{ label: string; value: string | number }>;
    headers: string[];
    rows: Array<Record<string, any>>;
  } {
    const dashboard = this.getDashboardStats();
    const students = this.getEnrichedStudentRoster();
    const now = new Date().toISOString();

    switch (reportType) {
      case 'readiness': {
        const rows = students.map(s => ({
          student_name: s.full_name,
          department: s.department,
          year: s.year_of_study,
          cgpa: s.cgpa ? s.cgpa.toFixed(2) : 'N/A',
          skills_count: s.skills_count,
          readiness_tier: s.readiness.tier,
          readiness_score: `${s.readiness.total_score}/100`,
          assessments_passed: s.assessments_passed,
          placement_status: s.placement_status,
          top_match_percentage: s.top_match_score ? `${s.top_match_score}%` : 'N/A'
        }));

        return {
          title: 'Institutional Student Readiness & Competency Report',
          description: 'Comprehensive evaluation of student academic performance, standardized Phase 2 assessments, technical proficiencies, and placement readiness classifications.',
          generated_at: now,
          institution_name: dashboard.institution_name,
          summary_metrics: [
            { label: 'Total Students', value: dashboard.total_students },
            { label: 'Placement Readiness Rate', value: `${dashboard.placement_readiness_rate}%` },
            { label: 'Placement Ready Cohort', value: dashboard.students_placement_ready_count },
            { label: 'Average Institutional CGPA', value: dashboard.average_cgpa }
          ],
          headers: [
            'Student Name',
            'Department',
            'Year / Batch',
            'CGPA',
            'Skills Count',
            'Readiness Tier',
            'Readiness Score',
            'Assessments Passed',
            'Placement Status',
            'Top Match %'
          ],
          rows
        };
      }

      case 'department': {
        const deptAnalytics = this.getDepartmentAnalytics();
        const rows = deptAnalytics.map(d => ({
          department: d.department,
          student_count: d.student_count,
          average_cgpa: d.average_cgpa.toFixed(2),
          assessment_rate: `${d.assessment_completion_rate}%`,
          average_score: `${d.average_assessment_score}%`,
          readiness_rate: `${d.placement_readiness_rate}%`,
          job_ready_count: d.job_ready_count,
          total_applications: d.total_applications,
          selected_hired: d.selected_count
        }));

        return {
          title: 'Department Academic & Placement Performance Report',
          description: 'Department-wise breakdown of student enrollment, academic standings, assessment benchmarks, skill gap trends, and placement recruitment statistics.',
          generated_at: now,
          institution_name: dashboard.institution_name,
          summary_metrics: [
            { label: 'Total Departments', value: deptAnalytics.length },
            { label: 'Total Students', value: dashboard.total_students },
            { label: 'Avg CGPA', value: dashboard.average_cgpa },
            { label: 'Total Hired', value: dashboard.selected_students_count }
          ],
          headers: [
            'Department',
            'Student Count',
            'Average CGPA',
            'Assessment Completion %',
            'Avg Assessment Score',
            'Placement Readiness %',
            'Job Ready Students',
            'Applications',
            'Hired / Selected'
          ],
          rows
        };
      }

      case 'assessment': {
        const asmtAnalytics = this.getAssessmentAnalytics();
        const rows = asmtAnalytics.assessments_breakdown.map(a => ({
          assessment_title: a.title,
          category: a.category,
          difficulty: a.difficulty,
          passing_mark: `${a.passing_percentage}%`,
          total_attempts: a.total_attempts,
          passed_attempts: a.passed_attempts,
          pass_rate: `${a.pass_rate}%`,
          average_score: `${a.average_score}%`,
          highest_score: `${a.highest_score}%`
        }));

        return {
          title: 'Institutional Standardized Assessment Benchmark Report',
          description: 'Detailed analytics on student technical evaluations across Phase 2 standardized assessments, scoring distributions, and skill-level credentialing.',
          generated_at: now,
          institution_name: dashboard.institution_name,
          summary_metrics: [
            { label: 'Assessments Conducted', value: asmtAnalytics.total_assessments_available },
            { label: 'Total Attempts', value: asmtAnalytics.total_attempts },
            { label: 'Overall Pass Rate', value: `${asmtAnalytics.overall_pass_rate}%` },
            { label: 'Overall Avg Score', value: `${asmtAnalytics.overall_average_score}%` }
          ],
          headers: [
            'Assessment Title',
            'Category',
            'Difficulty',
            'Passing Mark %',
            'Total Attempts',
            'Passed Attempts',
            'Pass Rate %',
            'Average Score %',
            'Highest Score %'
          ],
          rows
        };
      }

      case 'placement': {
        const placementAnalytics = this.getPlacementAnalytics();
        const rows = placementAnalytics.applications_list.map(a => ({
          student_name: a.student_name || 'N/A',
          department: a.student_department || 'N/A',
          company_name: a.company_name || 'N/A',
          opportunity_title: a.opportunity_title,
          type: a.opportunity_type,
          status: a.status,
          match_score: a.match_score ? `${a.match_score}%` : 'N/A',
          applied_at: new Date(a.applied_at).toLocaleDateString()
        }));

        return {
          title: 'Institutional Placement & Industry Hiring Report',
          description: 'Official recruitment dossier recording student application flows, candidate shortlisting, employer selections, and corporate hiring conversion rates.',
          generated_at: now,
          institution_name: dashboard.institution_name,
          summary_metrics: [
            { label: 'Total Applications', value: placementAnalytics.total_applications },
            { label: 'Shortlisted', value: placementAnalytics.shortlisted_count },
            { label: 'Selected / Hired', value: placementAnalytics.selected_count },
            { label: 'Placement Conversion', value: `${placementAnalytics.conversion_rate}%` }
          ],
          headers: [
            'Student Name',
            'Department',
            'Company Partner',
            'Position Title',
            'Type',
            'Status',
            'AI Match %',
            'Applied Date'
          ],
          rows
        };
      }

      default: {
        return {
          title: 'General Institutional Summary Report',
          description: 'Overall executive summary of institutional performance on SkillBridge.',
          generated_at: now,
          institution_name: dashboard.institution_name,
          summary_metrics: [
            { label: 'Total Students', value: dashboard.total_students },
            { label: 'Industry Partners', value: dashboard.industry_partners_count },
            { label: 'Readiness Rate', value: `${dashboard.placement_readiness_rate}%` }
          ],
          headers: ['Metric', 'Value'],
          rows: [
            { metric: 'Total Students', value: dashboard.total_students },
            { metric: 'Average CGPA', value: dashboard.average_cgpa },
            { metric: 'Assessment Completion', value: `${dashboard.assessment_completion_rate}%` },
            { metric: 'Placement Readiness Rate', value: `${dashboard.placement_readiness_rate}%` },
            { metric: 'Active Applications', value: dashboard.active_job_applications_count },
            { metric: 'Hired Students', value: dashboard.selected_students_count }
          ]
        };
      }
    }
  }
}
