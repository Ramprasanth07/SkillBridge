import {
  db,
  StudentRecord,
  UserRecord,
  AssessmentAttemptRecord,
  JobRecord,
  InternshipRecord,
  ApplicationRecord,
  CompanyRecord,
  MentorFeedbackRecord,
  StudentSkillRecord
} from './db.js';
import { INDUSTRY_ROLES, JobRoleDefinition } from './skillGapData.js';
import { SkillGapEngine } from './skillGapEngine.js';
import { CollegeAdminEngine, EnrichedStudentRosterItem } from './collegeAdminEngine.js';
import { MatchingEngine } from './matchingEngine.js';

export interface AnalyticsFilterOptions {
  dateRange?: 'all' | '30d' | '90d' | 'academic_year' | string;
  department?: string;
  batch?: string;
  search?: string;
}

export interface SkillDemandItem {
  skill_name: string;
  category: 'technical' | 'soft';
  industry_demand_count: number;
  student_supply_count: number;
  verified_supply_count: number;
  demand_supply_ratio: number;
  readiness_percentage: number;
  gap_count: number;
  classification: 'High Demand / Low Supply' | 'High Demand / High Supply' | 'Low Demand / High Supply' | 'Emerging Skills';
}

export interface ExecutiveKpiData {
  total_students: number;
  total_industry_partners: number;
  active_jobs: number;
  active_internships: number;
  total_applications: number;
  shortlisted_candidates: number;
  selected_candidates: number;
  placement_conversion_rate: number;
  assessment_completion_rate: number;
  average_assessment_score: number;
  overall_skill_readiness_rate: number;
  average_mentor_feedback_score: number;
  readiness_distribution: {
    job_ready: number;
    high_potential: number;
    developing: number;
    needs_foundation: number;
  };
  funnel: {
    applied: number;
    under_review: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  key_highlights: string[];
}

export interface CompetencyRadarData {
  student_id: string;
  student_name: string;
  department: string;
  year_of_study: string;
  cgpa: number | null;
  overall_score: number;
  axes: Array<{
    axis: string;
    score: number; // 0-100
    benchmark: number; // 0-100
    label: string;
    source: string;
    evidence: string;
  }>;
  mentor_evidence?: {
    overall_rating: number;
    evaluator: string;
    strengths: string;
    areas_for_improvement: string;
  };
}

export interface TopPerformerItem {
  rank: number;
  student_id: string;
  student_name: string;
  department: string;
  year_of_study: string;
  cgpa: number | null;
  composite_score: number;
  factors: {
    cgpa_contribution: number; // max 20
    assessment_contribution: number; // max 25
    readiness_contribution: number; // max 20
    roadmap_contribution: number; // max 15
    market_match_contribution: number; // max 10
    mentor_feedback_contribution: number; // max 10
  };
  assessment_score: number | null;
  skill_readiness_score: number;
  roadmap_progress: number;
  top_match_score: number | null;
  mentor_feedback_score: number | null;
  placement_status: string;
  verified_badges: number;
}

export class AnalyticsEngine {
  /**
   * Helper to filter an item's timestamp based on dateRange
   */
  private static isWithinDateRange(timestampStr?: string, dateRange?: string): boolean {
    if (!dateRange || dateRange === 'all') return true;
    if (!timestampStr) return true;

    const time = new Date(timestampStr).getTime();
    if (isNaN(time)) return true;

    const now = Date.now();
    if (dateRange === '30d') {
      return time >= now - 30 * 24 * 60 * 60 * 1000;
    }
    if (dateRange === '90d') {
      return time >= now - 90 * 24 * 60 * 60 * 1000;
    }
    if (dateRange === 'academic_year') {
      // Current academic year: 365 days window
      return time >= now - 365 * 24 * 60 * 60 * 1000;
    }
    return true;
  }

  /**
   * Compute a student's roadmap progress percentage (0-100)
   * Derived from Phase 1 profile skills, Phase 2 assessments, projects, and certifications
   */
  public static calculateStudentRoadmapProgress(studentId: string): {
    overall_progress: number;
    current_stage: 1 | 2 | 3 | 4;
    stage_title: string;
    completed_capstone: boolean;
    role_progress: Record<string, number>;
  } {
    const student = db.findStudentById(studentId);
    if (!student) {
      return {
        overall_progress: 0,
        current_stage: 1,
        stage_title: 'Stage 1: Foundational Literacy',
        completed_capstone: false,
        role_progress: {}
      };
    }

    const skills = db.getStudentSkills(studentId);
    const projects = db.getStudentProjects(studentId);
    const certs = db.getStudentCertifications(studentId);
    const asmtStats = db.getStudentAssessmentStats(studentId);

    // 1. Foundation Skills (Stage 1) -> Up to 25%
    const techSkillsCount = skills.filter(s => s.skill.category === 'technical').length;
    const stage1Progress = Math.min(25, (techSkillsCount / 4) * 25);

    // 2. Intermediate Competence & Projects (Stage 2) -> Up to 25%
    const advancedCount = skills.filter(s => s.proficiency_level === 'Advanced' || s.proficiency_level === 'Expert').length;
    const projectScore = Math.min(15, projects.length * 7.5);
    const stage2Progress = Math.min(25, (advancedCount / 3) * 10 + projectScore);

    // 3. Standardized Assessments Verified (Stage 3) -> Up to 25%
    const passedCount = asmtStats?.passed_count ?? 0;
    const avgScore = asmtStats?.average_score ?? 0;
    const stage3Progress = Math.min(25, (passedCount / 2) * 15 + (avgScore / 100) * 10);

    // 4. Capstone Portfolio & Industry Alignment (Stage 4) -> Up to 25%
    const hasCapstone = projects.some(p => (p.technologies && p.technologies.length >= 3) || p.title.toLowerCase().includes('capstone') || p.title.toLowerCase().includes('smart') || p.title.toLowerCase().includes('network'));
    const certScore = Math.min(10, certs.length * 5);
    const stage4Progress = Math.min(25, (hasCapstone ? 15 : 0) + certScore);

    const overall = Math.min(100, Math.round(stage1Progress + stage2Progress + stage3Progress + stage4Progress));

    let current_stage: 1 | 2 | 3 | 4 = 1;
    let stage_title = 'Stage 1: Foundational Literacy';
    if (overall >= 75) {
      current_stage = 4;
      stage_title = 'Stage 4: Capstone Portfolio & Market Readiness';
    } else if (overall >= 50) {
      current_stage = 3;
      stage_title = 'Stage 3: Advanced Architecture & Specialization';
    } else if (overall >= 25) {
      current_stage = 2;
      stage_title = 'Stage 2: Core Engineering & Frameworks';
    }

    // Role-wise progress for 4 roles
    const roleProgress: Record<string, number> = {};
    for (const role of INDUSTRY_ROLES) {
      try {
        const gapRes = SkillGapEngine.analyzeStudentRoleGap(studentId, role.id);
        if ('overall_match_percentage' in gapRes) {
          roleProgress[role.id] = gapRes.overall_match_percentage;
        } else {
          roleProgress[role.id] = 0;
        }
      } catch (e) {
        roleProgress[role.id] = 0;
      }
    }

    return {
      overall_progress: overall,
      current_stage,
      stage_title,
      completed_capstone: hasCapstone,
      role_progress: roleProgress
    };
  }

  /**
   * 1. High-level Executive KPIs
   */
  public static getExecutiveKpis(filters?: AnalyticsFilterOptions): ExecutiveKpiData {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    if (filters?.batch && filters.batch !== 'all') {
      students = students.filter(s => s.year_of_study === filters.batch);
    }

    const studentIds = new Set(students.map(s => s.id));

    // Applications filtered
    let applications = rawData.applications.filter(a => studentIds.has(a.student_id));
    if (filters?.dateRange) {
      applications = applications.filter(a => this.isWithinDateRange(a.applied_at, filters.dateRange));
    }

    // Assessment attempts filtered
    let attempts = rawData.assessment_attempts.filter(a => studentIds.has(a.student_id));
    if (filters?.dateRange) {
      attempts = attempts.filter(a => this.isWithinDateRange(a.completed_at, filters.dateRange));
    }

    // Mentor feedback filtered
    let feedbacks = rawData.mentor_feedbacks.filter(f => studentIds.has(f.student_id));
    if (filters?.dateRange) {
      feedbacks = feedbacks.filter(f => this.isWithinDateRange(f.created_at, filters.dateRange));
    }

    const companies = rawData.companies;
    const activeJobs = rawData.jobs.filter(j => j.status === 'active');
    const activeInternships = rawData.internships.filter(i => i.status === 'active');

    // Funnel
    const appliedCount = applications.length;
    const underReviewCount = applications.filter(a => a.status === 'Under Review').length;
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
    const selectedCount = applications.filter(a => a.status === 'Selected').length;
    const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

    const conversionRate = appliedCount > 0 ? Math.round((selectedCount / appliedCount) * 100) : 0;

    // Assessment stats
    const uniqueAssessedStudents = new Set(attempts.map(a => a.student_id)).size;
    const asmtCompletionRate = students.length > 0 ? Math.round((uniqueAssessedStudents / students.length) * 100) : 0;
    const avgAsmtScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score_percentage, 0) / attempts.length)
      : 0;

    // Student readiness distribution
    let jobReady = 0;
    let highPotential = 0;
    let developing = 0;
    let needsFoundation = 0;

    for (const student of students) {
      const readiness = CollegeAdminEngine.calculateStudentReadiness(student.id);
      if (readiness.tier === 'Job Ready') jobReady++;
      else if (readiness.tier === 'High Potential') highPotential++;
      else if (readiness.tier === 'Developing') developing++;
      else needsFoundation++;
    }

    const readyOrHighCount = jobReady + highPotential;
    const overallSkillReadinessRate = students.length > 0 ? Math.round((readyOrHighCount / students.length) * 100) : 0;

    // Mentor feedback average
    const avgMentorScore = feedbacks.length > 0
      ? Number((feedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / feedbacks.length).toFixed(2))
      : 0;

    // Highlights
    const keyHighlights: string[] = [];
    if (overallSkillReadinessRate >= 60) {
      keyHighlights.push(`Institutional readiness is strong at ${overallSkillReadinessRate}%, led by robust core software proficiencies.`);
    } else {
      keyHighlights.push(`Institutional readiness is currently at ${overallSkillReadinessRate}%; targeted roadmap intervention recommended.`);
    }

    if (conversionRate > 0) {
      keyHighlights.push(`Placement pipeline conversion stands at ${conversionRate}% with ${selectedCount} students hired across active corporate roles.`);
    } else {
      keyHighlights.push(`${appliedCount} active student applications submitted across ${companies.length} corporate hiring partners.`);
    }

    if (avgMentorScore > 0) {
      keyHighlights.push(`Industry mentor evaluations average ${avgMentorScore}/5.0 based on real project and internship performance.`);
    }

    return {
      total_students: students.length,
      total_industry_partners: companies.length,
      active_jobs: activeJobs.length,
      active_internships: activeInternships.length,
      total_applications: appliedCount,
      shortlisted_candidates: shortlistedCount,
      selected_candidates: selectedCount,
      placement_conversion_rate: conversionRate,
      assessment_completion_rate: asmtCompletionRate,
      average_assessment_score: avgAsmtScore,
      overall_skill_readiness_rate: overallSkillReadinessRate,
      average_mentor_feedback_score: avgMentorScore,
      readiness_distribution: {
        job_ready: jobReady,
        high_potential: highPotential,
        developing,
        needs_foundation: needsFoundation
      },
      funnel: {
        applied: appliedCount,
        under_review: underReviewCount,
        shortlisted: shortlistedCount,
        selected: selectedCount,
        rejected: rejectedCount
      },
      key_highlights: keyHighlights
    };
  }

  /**
   * 2. Industry Demand vs Student Skill Supply
   */
  public static getSkillDemandSupplyAnalytics(filters?: AnalyticsFilterOptions): {
    total_skills_analyzed: number;
    high_demand_low_supply_count: number;
    high_demand_high_supply_count: number;
    low_demand_high_supply_count: number;
    emerging_skills_count: number;
    skills: SkillDemandItem[];
    top_demanded_skills: SkillDemandItem[];
    critical_deficits: SkillDemandItem[];
    institutional_strengths: SkillDemandItem[];
  } {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    if (filters?.batch && filters.batch !== 'all') {
      students = students.filter(s => s.year_of_study === filters.batch);
    }

    const studentIds = new Set(students.map(s => s.id));
    const studentSkills = rawData.student_skills.filter(ss => studentIds.has(ss.student_id));
    const allSkills = rawData.skills;
    const jobs = rawData.jobs.filter(j => j.status === 'active');
    const internships = rawData.internships.filter(i => i.status === 'active');
    const attempts = rawData.assessment_attempts.filter(a => studentIds.has(a.student_id) && a.passed);

    // Map skill name to metrics
    const skillMap = new Map<string, {
      category: 'technical' | 'soft';
      demand: number;
      supply: number;
      verifiedSupply: number;
    }>();

    // 1. Initialize from master skills catalog
    allSkills.forEach(s => {
      skillMap.set(s.name.trim(), {
        category: s.category,
        demand: 0,
        supply: 0,
        verifiedSupply: 0
      });
    });

    // 2. Count Industry Demand from active jobs and internships
    const countDemand = (reqList: string[]) => {
      reqList.forEach(req => {
        const cleanReq = req.trim();
        // find matching skill or create
        let foundKey: string | null = null;
        for (const key of skillMap.keys()) {
          if (key.toLowerCase() === cleanReq.toLowerCase()) {
            foundKey = key;
            break;
          }
        }
        if (!foundKey) {
          foundKey = cleanReq;
          skillMap.set(foundKey, { category: 'technical', demand: 0, supply: 0, verifiedSupply: 0 });
        }
        skillMap.get(foundKey)!.demand += 1;
      });
    };

    jobs.forEach(j => {
      countDemand(j.required_skills || []);
      countDemand(j.preferred_skills || []);
    });
    internships.forEach(i => {
      countDemand(i.required_skills || []);
    });

    // Also include roles required skills as industry baseline demand
    INDUSTRY_ROLES.forEach(r => {
      r.required_skills.forEach(rs => {
        let foundKey: string | null = null;
        for (const key of skillMap.keys()) {
          if (key.toLowerCase() === rs.skill_name.toLowerCase()) {
            foundKey = key;
            break;
          }
        }
        if (!foundKey) {
          foundKey = rs.skill_name;
          skillMap.set(foundKey, { category: 'technical', demand: 0, supply: 0, verifiedSupply: 0 });
        }
        skillMap.get(foundKey)!.demand += 2; // Baseline industry weight
      });
    });

    // 3. Count Student Supply
    studentSkills.forEach(ss => {
      const sk = allSkills.find(s => s.id === ss.skill_id);
      if (sk) {
        const key = sk.name.trim();
        if (!skillMap.has(key)) {
          skillMap.set(key, { category: sk.category, demand: 0, supply: 0, verifiedSupply: 0 });
        }
        skillMap.get(key)!.supply += 1;
      }
    });

    // 4. Count Verified Assessment Supply
    attempts.forEach(att => {
      const cat = att.category;
      let matchedSkillName = '';
      if (cat === 'Frontend') matchedSkillName = 'React';
      else if (cat === 'Backend') matchedSkillName = 'Node.js';
      else if (cat === 'Full Stack') matchedSkillName = 'TypeScript';
      else if (cat === 'Cloud') matchedSkillName = 'Cloud Computing';

      for (const [key, val] of skillMap.entries()) {
        if (key.toLowerCase().includes(matchedSkillName.toLowerCase())) {
          val.verifiedSupply += 1;
        }
      }
    });

    const totalStudents = students.length;

    // Construct SkillDemandItem list
    const items: SkillDemandItem[] = Array.from(skillMap.entries()).map(([name, data]) => {
      const ratio = data.supply > 0 ? Number((data.demand / data.supply).toFixed(2)) : data.demand;
      const readinessPct = totalStudents > 0 ? Math.min(100, Math.round((data.supply / totalStudents) * 100)) : 0;
      const gap = Math.max(0, data.demand - data.supply);

      let classification: SkillDemandItem['classification'] = 'Low Demand / High Supply';
      if (data.demand >= 3 && data.supply < 3) {
        classification = 'High Demand / Low Supply';
      } else if (data.demand >= 3 && data.supply >= 3) {
        classification = 'High Demand / High Supply';
      } else if (data.demand >= 1 && data.supply <= 1) {
        classification = 'Emerging Skills';
      } else {
        classification = 'Low Demand / High Supply';
      }

      return {
        skill_name: name,
        category: data.category,
        industry_demand_count: data.demand,
        student_supply_count: data.supply,
        verified_supply_count: data.verifiedSupply,
        demand_supply_ratio: ratio,
        readiness_percentage: readinessPct,
        gap_count: gap,
        classification
      };
    }).sort((a, b) => b.industry_demand_count - a.industry_demand_count);

    const highDemandLowSupply = items.filter(i => i.classification === 'High Demand / Low Supply');
    const highDemandHighSupply = items.filter(i => i.classification === 'High Demand / High Supply');
    const lowDemandHighSupply = items.filter(i => i.classification === 'Low Demand / High Supply');
    const emergingSkills = items.filter(i => i.classification === 'Emerging Skills');

    return {
      total_skills_analyzed: items.length,
      high_demand_low_supply_count: highDemandLowSupply.length,
      high_demand_high_supply_count: highDemandHighSupply.length,
      low_demand_high_supply_count: lowDemandHighSupply.length,
      emerging_skills_count: emergingSkills.length,
      skills: items,
      top_demanded_skills: items.slice(0, 8),
      critical_deficits: highDemandLowSupply.slice(0, 6),
      institutional_strengths: highDemandHighSupply.slice(0, 6)
    };
  }

  /**
   * 3. Assessment Analytics
   */
  public static getAssessmentAnalytics(filters?: AnalyticsFilterOptions) {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    const studentIds = new Set(students.map(s => s.id));

    let attempts = rawData.assessment_attempts.filter(a => studentIds.has(a.student_id));
    if (filters?.dateRange) {
      attempts = attempts.filter(a => this.isWithinDateRange(a.completed_at, filters.dateRange));
    }

    const assessments = rawData.assessments;
    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(attempts.map(a => a.student_id)).size;
    const completionRate = students.length > 0 ? Math.round((uniqueStudents / students.length) * 100) : 0;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const avgScore = totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score_percentage, 0) / totalAttempts)
      : 0;

    const scoreDistribution = {
      '0_39': attempts.filter(a => a.score_percentage < 40).length,
      '40_59': attempts.filter(a => a.score_percentage >= 40 && a.score_percentage < 60).length,
      '60_79': attempts.filter(a => a.score_percentage >= 60 && a.score_percentage < 80).length,
      '80_100': attempts.filter(a => a.score_percentage >= 80).length
    };

    const skillLevelDistribution = {
      Beginner: attempts.filter(a => a.skill_level_awarded === 'Beginner').length,
      Intermediate: attempts.filter(a => a.skill_level_awarded === 'Intermediate').length,
      Advanced: attempts.filter(a => a.skill_level_awarded === 'Advanced').length,
      Master: attempts.filter(a => a.skill_level_awarded === 'Master').length
    };

    // Assessment tracks breakdown
    const trackBreakdown = assessments.map(asmt => {
      const asmtAttempts = attempts.filter(a => a.assessment_id === asmt.id);
      const count = asmtAttempts.length;
      const passed = asmtAttempts.filter(a => a.passed).length;
      const passRate = count > 0 ? Math.round((passed / count) * 100) : 0;
      const averageScore = count > 0 ? Math.round(asmtAttempts.reduce((sum, a) => sum + a.score_percentage, 0) / count) : 0;
      const highestScore = count > 0 ? Math.max(...asmtAttempts.map(a => a.score_percentage)) : 0;

      return {
        id: asmt.id,
        title: asmt.title,
        category: asmt.category,
        difficulty: asmt.difficulty,
        passing_percentage: asmt.passing_percentage,
        total_attempts: count,
        passed_attempts: passed,
        pass_rate: passRate,
        average_score: averageScore,
        highest_score: highestScore
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

    const departmentPerformance = Array.from(deptAttemptsMap.entries()).map(([dept, deptAtts]) => ({
      department: dept,
      total_attempts: deptAtts.length,
      average_score: deptAtts.length > 0 ? Math.round(deptAtts.reduce((sum, a) => sum + a.score_percentage, 0) / deptAtts.length) : 0,
      pass_rate: deptAtts.length > 0 ? Math.round((deptAtts.filter(a => a.passed).length / deptAtts.length) * 100) : 0
    }));

    return {
      total_assessments_available: assessments.length,
      total_attempts: totalAttempts,
      unique_students_attempted: uniqueStudents,
      completion_rate: completionRate,
      overall_average_score: avgScore,
      overall_pass_rate: overallPassRate,
      score_distribution: scoreDistribution,
      skill_level_distribution: skillLevelDistribution,
      assessments_breakdown: trackBreakdown,
      department_performance: departmentPerformance
    };
  }

  /**
   * 4. Phase 3 Skill Gap Analytics & Role-wise readiness
   */
  public static getSkillGapAnalytics(filters?: AnalyticsFilterOptions): {
    roles: Array<{
      role_id: string;
      role_title: string;
      category: string;
      market_demand: string;
      average_salary_range: string;
      students_evaluated: number;
      average_match_score: number;
      distribution: {
        job_ready: number;
        high_potential: number;
        developing: number;
        needs_foundation: number;
      };
      top_missing_skills: Array<{ skill_name: string; count: number }>;
      top_weak_skills: Array<{ skill_name: string; count: number }>;
      top_matching_skills: Array<{ skill_name: string; count: number }>;
    }>;
    institution_wide_missing_skills: Array<{ skill_name: string; count: number }>;
    institution_wide_weak_skills: Array<{ skill_name: string; count: number }>;
    foundation_support_students_count: number;
    high_readiness_students_count: number;
  } {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    if (filters?.batch && filters.batch !== 'all') {
      students = students.filter(s => s.year_of_study === filters.batch);
    }

    const missingSkillGlobal = new Map<string, number>();
    const weakSkillGlobal = new Map<string, number>();

    const roleResults = INDUSTRY_ROLES.map(role => {
      let totalMatch = 0;
      let evaluatedCount = 0;
      let jobReady = 0;
      let highPotential = 0;
      let developing = 0;
      let needsFoundation = 0;

      const missingCounts = new Map<string, number>();
      const weakCounts = new Map<string, number>();
      const matchCounts = new Map<string, number>();

      for (const st of students) {
        try {
          const report = SkillGapEngine.analyzeStudentRoleGap(st.id, role.id);
          if ('overall_match_percentage' in report) {
            evaluatedCount++;
            totalMatch += report.overall_match_percentage;

            if (report.readiness_status === 'Job Ready') jobReady++;
            else if (report.readiness_status === 'High Potential') highPotential++;
            else if (report.readiness_status === 'Developing') developing++;
            else needsFoundation++;

            report.missing_skills.forEach(s => {
              missingCounts.set(s.skill_name, (missingCounts.get(s.skill_name) || 0) + 1);
              missingSkillGlobal.set(s.skill_name, (missingSkillGlobal.get(s.skill_name) || 0) + 1);
            });

            report.weak_skills.forEach(s => {
              weakCounts.set(s.skill_name, (weakCounts.get(s.skill_name) || 0) + 1);
              weakSkillGlobal.set(s.skill_name, (weakSkillGlobal.get(s.skill_name) || 0) + 1);
            });

            report.matching_skills.forEach(s => {
              matchCounts.set(s.skill_name, (matchCounts.get(s.skill_name) || 0) + 1);
            });
          }
        } catch (e) {
          // ignore error for single evaluation
        }
      }

      const avgMatch = evaluatedCount > 0 ? Math.round(totalMatch / evaluatedCount) : 0;

      const topMissing = Array.from(missingCounts.entries())
        .map(([skill_name, count]) => ({ skill_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topWeak = Array.from(weakCounts.entries())
        .map(([skill_name, count]) => ({ skill_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topMatching = Array.from(matchCounts.entries())
        .map(([skill_name, count]) => ({ skill_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        role_id: role.id,
        role_title: role.title,
        category: role.category,
        market_demand: role.market_demand,
        average_salary_range: role.average_salary_range,
        students_evaluated: evaluatedCount,
        average_match_score: avgMatch,
        distribution: {
          job_ready: jobReady,
          high_potential: highPotential,
          developing,
          needs_foundation: needsFoundation
        },
        top_missing_skills: topMissing,
        top_weak_skills: topWeak,
        top_matching_skills: topMatching
      };
    });

    const globalMissing = Array.from(missingSkillGlobal.entries())
      .map(([skill_name, count]) => ({ skill_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const globalWeak = Array.from(weakSkillGlobal.entries())
      .map(([skill_name, count]) => ({ skill_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Foundation support students count
    let foundationCount = 0;
    let highReadinessCount = 0;
    for (const student of students) {
      const readiness = CollegeAdminEngine.calculateStudentReadiness(student.id);
      if (readiness.tier === 'Needs Foundation') foundationCount++;
      if (readiness.tier === 'Job Ready' || readiness.tier === 'High Potential') highReadinessCount++;
    }

    return {
      roles: roleResults,
      institution_wide_missing_skills: globalMissing,
      institution_wide_weak_skills: globalWeak,
      foundation_support_students_count: foundationCount,
      high_readiness_students_count: highReadinessCount
    };
  }

  /**
   * 5. Learning Roadmap Analytics (Phase 4 integration)
   */
  public static getRoadmapAnalytics(filters?: AnalyticsFilterOptions): {
    average_roadmap_progress: number;
    stage_distribution: {
      stage_1: { count: number; percentage: number; label: string };
      stage_2: { count: number; percentage: number; label: string };
      stage_3: { count: number; percentage: number; label: string };
      stage_4: { count: number; percentage: number; label: string };
    };
    completed_capstones_count: number;
    most_frequently_incomplete_skills: Array<{ skill_name: string; incomplete_count: number; percentage: number }>;
    role_wise_roadmap_progress: Array<{
      role_id: string;
      role_title: string;
      average_progress: number;
      benchmark_requirement: number;
    }>;
  } {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    if (filters?.batch && filters.batch !== 'all') {
      students = students.filter(s => s.year_of_study === filters.batch);
    }

    let totalProgress = 0;
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    let s4 = 0;
    let capstoneCount = 0;

    const roleTotals: Record<string, { sum: number; count: number }> = {};
    INDUSTRY_ROLES.forEach(r => {
      roleTotals[r.id] = { sum: 0, count: 0 };
    });

    const incompleteSkillsMap = new Map<string, number>();

    for (const st of students) {
      const rm = this.calculateStudentRoadmapProgress(st.id);
      totalProgress += rm.overall_progress;
      if (rm.current_stage === 1) s1++;
      else if (rm.current_stage === 2) s2++;
      else if (rm.current_stage === 3) s3++;
      else if (rm.current_stage === 4) s4++;

      if (rm.completed_capstone) capstoneCount++;

      // Role progress aggregation
      Object.entries(rm.role_progress).forEach(([rId, score]) => {
        if (roleTotals[rId]) {
          roleTotals[rId].sum += score;
          roleTotals[rId].count += 1;
        }
      });

      // Collect missing skills across roles for incomplete topics
      const stSkills = db.getStudentSkills(st.id).map(s => s.skill.name.toLowerCase());
      INDUSTRY_ROLES[0].required_skills.forEach(req => {
        if (!stSkills.includes(req.skill_name.toLowerCase())) {
          incompleteSkillsMap.set(req.skill_name, (incompleteSkillsMap.get(req.skill_name) || 0) + 1);
        }
      });
    }

    const totalStudents = students.length;
    const avgOverall = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    const roleBreakdown = INDUSTRY_ROLES.map(role => {
      const data = roleTotals[role.id];
      const avg = data && data.count > 0 ? Math.round(data.sum / data.count) : 0;
      return {
        role_id: role.id,
        role_title: role.title,
        average_progress: avg,
        benchmark_requirement: 75
      };
    });

    const topIncomplete = Array.from(incompleteSkillsMap.entries())
      .map(([skill_name, count]) => ({
        skill_name,
        incomplete_count: count,
        percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
      }))
      .sort((a, b) => b.incomplete_count - a.incomplete_count)
      .slice(0, 6);

    return {
      average_roadmap_progress: avgOverall,
      stage_distribution: {
        stage_1: {
          count: s1,
          percentage: totalStudents > 0 ? Math.round((s1 / totalStudents) * 100) : 0,
          label: 'Stage 1: Foundational Literacy'
        },
        stage_2: {
          count: s2,
          percentage: totalStudents > 0 ? Math.round((s2 / totalStudents) * 100) : 0,
          label: 'Stage 2: Core Engineering & Frameworks'
        },
        stage_3: {
          count: s3,
          percentage: totalStudents > 0 ? Math.round((s3 / totalStudents) * 100) : 0,
          label: 'Stage 3: Advanced Architecture & Specialization'
        },
        stage_4: {
          count: s4,
          percentage: totalStudents > 0 ? Math.round((s4 / totalStudents) * 100) : 0,
          label: 'Stage 4: Capstone Portfolio Mastery'
        }
      },
      completed_capstones_count: capstoneCount,
      most_frequently_incomplete_skills: topIncomplete,
      role_wise_roadmap_progress: roleBreakdown
    };
  }

  /**
   * 6. Placement & Recruitment Funnel Analytics
   */
  public static getPlacementAnalytics(filters?: AnalyticsFilterOptions) {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    const studentIds = new Set(students.map(s => s.id));

    let applications = rawData.applications.filter(a => studentIds.has(a.student_id));
    if (filters?.dateRange) {
      applications = applications.filter(a => this.isWithinDateRange(a.applied_at, filters.dateRange));
    }

    const companies = rawData.companies;
    const totalApps = applications.length;
    const underReview = applications.filter(a => a.status === 'Under Review').length;
    const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
    const selected = applications.filter(a => a.status === 'Selected').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;

    const conversionRate = totalApps > 0 ? Math.round((selected / totalApps) * 100) : 0;
    const jobPlacements = applications.filter(a => a.opportunity_type === 'job' && a.status === 'Selected').length;
    const internshipPlacements = applications.filter(a => a.opportunity_type === 'internship' && a.status === 'Selected').length;

    // Average match score of shortlisted and selected
    const selectedAppsWithScore = applications.filter(a => a.status === 'Selected' && a.match_score !== undefined);
    const avgSelectedMatch = selectedAppsWithScore.length > 0
      ? Math.round(selectedAppsWithScore.reduce((sum, a) => sum + (a.match_score || 0), 0) / selectedAppsWithScore.length)
      : null;

    // Department placements
    const deptMap = new Map<string, { applied: number; shortlisted: number; selected: number }>();
    applications.forEach(app => {
      const st = students.find(s => s.id === app.student_id);
      const dept = st?.department || 'General';
      if (!deptMap.has(dept)) deptMap.set(dept, { applied: 0, shortlisted: 0, selected: 0 });
      const entry = deptMap.get(dept)!;
      entry.applied++;
      if (app.status === 'Shortlisted') entry.shortlisted++;
      if (app.status === 'Selected') entry.selected++;
    });

    const departmentPlacements = Array.from(deptMap.entries()).map(([dept, d]) => ({
      department: dept,
      applied_count: d.applied,
      shortlisted_count: d.shortlisted,
      selected_count: d.selected,
      conversion_rate: d.applied > 0 ? Math.round((d.selected / d.applied) * 100) : 0
    }));

    // Top hiring corporate partners
    const compMap = new Map<string, { name: string; applied: number; shortlisted: number; selected: number }>();
    applications.forEach(app => {
      const c = companies.find(comp => comp.id === app.company_id);
      const cName = c?.company_name || 'Corporate Partner';
      if (!compMap.has(app.company_id)) {
        compMap.set(app.company_id, { name: cName, applied: 0, shortlisted: 0, selected: 0 });
      }
      const entry = compMap.get(app.company_id)!;
      entry.applied++;
      if (app.status === 'Shortlisted') entry.shortlisted++;
      if (app.status === 'Selected') entry.selected++;
    });

    const topPartners = Array.from(compMap.values())
      .sort((a, b) => b.selected - a.selected || b.applied - a.applied)
      .slice(0, 6);

    return {
      total_applications: totalApps,
      under_review_count: underReview,
      shortlisted_count: shortlisted,
      selected_count: selected,
      rejected_count: rejected,
      conversion_rate: conversionRate,
      job_placements_count: jobPlacements,
      internship_placements_count: internshipPlacements,
      average_match_score_selected: avgSelectedMatch,
      department_placements: departmentPlacements,
      top_hiring_partners: topPartners
    };
  }

  /**
   * 7. Industry Engagement Analytics
   */
  public static getIndustryEngagementAnalytics() {
    return CollegeAdminEngine.getIndustryEngagementAnalytics();
  }

  /**
   * 8. Industry Mentor Feedback Analytics (Phase 8 integration)
   */
  public static getMentorFeedbackAnalytics(filters?: AnalyticsFilterOptions) {
    const rawData = db.getRawData();
    let students = rawData.students;
    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    const studentIds = new Set(students.map(s => s.id));

    let feedbacks = rawData.mentor_feedbacks.filter(f => studentIds.has(f.student_id));
    if (filters?.dateRange) {
      feedbacks = feedbacks.filter(f => this.isWithinDateRange(f.created_at, filters.dateRange));
    }

    const totalEvals = feedbacks.length;
    const avgOverall = totalEvals > 0
      ? Number((feedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / totalEvals).toFixed(2))
      : 0;

    const calcRubric = (key: keyof MentorFeedbackRecord) => {
      if (totalEvals === 0) return 0;
      const sum = feedbacks.reduce((acc, f) => acc + (Number(f[key]) || 0), 0);
      return Number((sum / totalEvals).toFixed(2));
    };

    const rubricAverages = {
      technical_competence: calcRubric('technical_competence'),
      problem_solving: calcRubric('problem_solving'),
      communication: calcRubric('communication'),
      teamwork_collaboration: calcRubric('teamwork_collaboration'),
      professionalism_work_ethic: calcRubric('professionalism_work_ethic'),
      learning_ability: calcRubric('learning_ability'),
      overall_performance: avgOverall
    };

    const recommendedCount = feedbacks.filter(f => f.hire_recommendation === 'Recommended').length;
    const considerCount = feedbacks.filter(f => f.hire_recommendation === 'Consider').length;
    const notRecCount = feedbacks.filter(f => f.hire_recommendation === 'Not Recommended').length;

    const recommendationDistribution = {
      recommended_count: recommendedCount,
      recommended_percentage: totalEvals > 0 ? Math.round((recommendedCount / totalEvals) * 100) : 0,
      consider_count: considerCount,
      consider_percentage: totalEvals > 0 ? Math.round((considerCount / totalEvals) * 100) : 0,
      not_recommended_count: notRecCount,
      not_recommended_percentage: totalEvals > 0 ? Math.round((notRecCount / totalEvals) * 100) : 0
    };

    // Department breakdown
    const deptMap = new Map<string, number[]>();
    feedbacks.forEach(f => {
      const st = students.find(s => s.id === f.student_id);
      const dept = st?.department || 'General';
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(f.overall_performance);
    });

    const departmentFeedback = Array.from(deptMap.entries()).map(([dept, scores]) => ({
      department: dept,
      evaluations_count: scores.length,
      average_score: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
    }));

    return {
      total_evaluations: totalEvals,
      average_overall_score: avgOverall,
      rubric_averages: rubricAverages,
      recommendation_distribution: recommendationDistribution,
      department_feedback: departmentFeedback,
      feedbacks: feedbacks.slice(0, 10).map(f => {
        const st = students.find(s => s.id === f.student_id);
        const comp = rawData.companies.find(c => c.id === f.company_id);
        return {
          ...f,
          student_name: st?.full_name || 'Student',
          student_department: st?.department || 'Engineering',
          company_name: comp?.company_name || 'Corporate Partner'
        };
      })
    };
  }

  /**
   * 9. Department Benchmark Matrix
   */
  public static getDepartmentBenchmarkMatrix(): Array<{
    department: string;
    student_count: number;
    average_cgpa: number;
    assessment_completion_rate: number;
    average_assessment_score: number;
    skill_readiness_rate: number;
    average_roadmap_progress: number;
    applications_count: number;
    shortlisted_count: number;
    selected_count: number;
    placement_conversion_rate: number;
    mentor_feedback_score: number | null;
    top_skills: string[];
  }> {
    const rawData = db.getRawData();
    const students = CollegeAdminEngine.getEnrichedStudentRoster();
    const feedbacks = rawData.mentor_feedbacks;

    const deptMap = new Map<string, EnrichedStudentRosterItem[]>();
    students.forEach(s => {
      const dept = s.department || 'General';
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(s);
    });

    return Array.from(deptMap.entries()).map(([department, deptStudents]) => {
      const validCgpas = deptStudents.map(s => s.cgpa).filter((c): c is number => c !== null);
      const avgCgpa = validCgpas.length > 0
        ? Number((validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2))
        : 0;

      const attempted = deptStudents.filter(s => s.assessments_attempted > 0);
      const asmtRate = deptStudents.length > 0 ? Math.round((attempted.length / deptStudents.length) * 100) : 0;
      const asmtScores = deptStudents.map(s => s.average_assessment_score).filter((s): s is number => s !== null);
      const avgAsmtScore = asmtScores.length > 0 ? Math.round(asmtScores.reduce((a, b) => a + b, 0) / asmtScores.length) : 0;

      const readyCount = deptStudents.filter(s => s.readiness.tier === 'Job Ready' || s.readiness.tier === 'High Potential').length;
      const readinessRate = deptStudents.length > 0 ? Math.round((readyCount / deptStudents.length) * 100) : 0;

      // Roadmap progress for department
      let deptRoadmapSum = 0;
      deptStudents.forEach(s => {
        const rm = this.calculateStudentRoadmapProgress(s.id);
        deptRoadmapSum += rm.overall_progress;
      });
      const avgRoadmap = deptStudents.length > 0 ? Math.round(deptRoadmapSum / deptStudents.length) : 0;

      const totalApps = deptStudents.reduce((acc, s) => acc + s.applications_count, 0);
      const shortlists = deptStudents.reduce((acc, s) => acc + s.shortlisted_count, 0);
      const selects = deptStudents.reduce((acc, s) => acc + s.selected_count, 0);
      const convRate = totalApps > 0 ? Math.round((selects / totalApps) * 100) : 0;

      // Mentor feedback
      const deptStudentIds = new Set(deptStudents.map(s => s.id));
      const deptFeedbacks = feedbacks.filter(f => deptStudentIds.has(f.student_id));
      const avgFeedback = deptFeedbacks.length > 0
        ? Number((deptFeedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / deptFeedbacks.length).toFixed(2))
        : null;

      // Top skills
      const skillCounts = new Map<string, number>();
      deptStudents.forEach(s => {
        s.top_skills.forEach(ts => {
          skillCounts.set(ts.name, (skillCounts.get(ts.name) || 0) + 1);
        });
      });
      const topSkills = Array.from(skillCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(e => e[0]);

      return {
        department,
        student_count: deptStudents.length,
        average_cgpa: avgCgpa,
        assessment_completion_rate: asmtRate,
        average_assessment_score: avgAsmtScore,
        skill_readiness_rate: readinessRate,
        average_roadmap_progress: avgRoadmap,
        applications_count: totalApps,
        shortlisted_count: shortlists,
        selected_count: selects,
        placement_conversion_rate: convRate,
        mentor_feedback_score: avgFeedback,
        top_skills: topSkills
      };
    });
  }

  /**
   * 10. Batch Benchmark Matrix
   */
  public static getBatchBenchmarkMatrix(): Array<{
    batch: string;
    student_count: number;
    average_cgpa: number;
    assessment_completion_rate: number;
    average_assessment_score: number;
    skill_readiness_rate: number;
    average_roadmap_progress: number;
    actively_applying_count: number;
    shortlisted_count: number;
    selected_count: number;
    placement_conversion_rate: number;
    mentor_feedback_score: number | null;
  }> {
    const rawData = db.getRawData();
    const students = CollegeAdminEngine.getEnrichedStudentRoster();
    const feedbacks = rawData.mentor_feedbacks;

    const batchMap = new Map<string, EnrichedStudentRosterItem[]>();
    students.forEach(s => {
      const batch = s.year_of_study || 'Unknown Batch';
      if (!batchMap.has(batch)) batchMap.set(batch, []);
      batchMap.get(batch)!.push(s);
    });

    return Array.from(batchMap.entries()).map(([batch, batchStudents]) => {
      const validCgpas = batchStudents.map(s => s.cgpa).filter((c): c is number => c !== null);
      const avgCgpa = validCgpas.length > 0
        ? Number((validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2))
        : 0;

      const attempted = batchStudents.filter(s => s.assessments_attempted > 0);
      const asmtRate = batchStudents.length > 0 ? Math.round((attempted.length / batchStudents.length) * 100) : 0;
      const asmtScores = batchStudents.map(s => s.average_assessment_score).filter((s): s is number => s !== null);
      const avgAsmtScore = asmtScores.length > 0 ? Math.round(asmtScores.reduce((a, b) => a + b, 0) / asmtScores.length) : 0;

      const readyCount = batchStudents.filter(s => s.readiness.tier === 'Job Ready' || s.readiness.tier === 'High Potential').length;
      const readinessRate = batchStudents.length > 0 ? Math.round((readyCount / batchStudents.length) * 100) : 0;

      let roadmapSum = 0;
      batchStudents.forEach(s => {
        const rm = this.calculateStudentRoadmapProgress(s.id);
        roadmapSum += rm.overall_progress;
      });
      const avgRoadmap = batchStudents.length > 0 ? Math.round(roadmapSum / batchStudents.length) : 0;

      const applyingCount = batchStudents.filter(s => s.applications_count > 0).length;
      const shortlists = batchStudents.reduce((acc, s) => acc + s.shortlisted_count, 0);
      const selects = batchStudents.reduce((acc, s) => acc + s.selected_count, 0);
      const totalApps = batchStudents.reduce((acc, s) => acc + s.applications_count, 0);
      const convRate = totalApps > 0 ? Math.round((selects / totalApps) * 100) : 0;

      const batchStudentIds = new Set(batchStudents.map(s => s.id));
      const batchFeedbacks = feedbacks.filter(f => batchStudentIds.has(f.student_id));
      const avgFeedback = batchFeedbacks.length > 0
        ? Number((batchFeedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / batchFeedbacks.length).toFixed(2))
        : null;

      return {
        batch,
        student_count: batchStudents.length,
        average_cgpa: avgCgpa,
        assessment_completion_rate: asmtRate,
        average_assessment_score: avgAsmtScore,
        skill_readiness_rate: readinessRate,
        average_roadmap_progress: avgRoadmap,
        actively_applying_count: applyingCount,
        shortlisted_count: shortlists,
        selected_count: selects,
        placement_conversion_rate: convRate,
        mentor_feedback_score: avgFeedback
      };
    });
  }

  /**
   * 11. Top Performers Leaderboard
   * Ranks students by institutional composite index:
   * - CGPA (20%)
   * - Assessment Performance (25%)
   * - Skill Readiness (20%)
   * - Roadmap Progress (15%)
   * - Market Match (10%)
   * - Industry Mentor Feedback (10%)
   */
  public static getTopPerformersLeaderboard(filters?: {
    department?: string;
    batch?: string;
    search?: string;
    sortBy?: 'composite' | 'cgpa' | 'assessment' | 'readiness' | 'roadmap';
  }): TopPerformerItem[] {
    const rawData = db.getRawData();
    let students = CollegeAdminEngine.getEnrichedStudentRoster();
    const feedbacks = rawData.mentor_feedbacks;

    if (filters?.department && filters.department !== 'all') {
      students = students.filter(s => s.department === filters.department);
    }
    if (filters?.batch && filters.batch !== 'all') {
      students = students.filter(s => s.year_of_study === filters.batch);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      students = students.filter(s =>
        s.full_name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }

    const items: TopPerformerItem[] = students.map(student => {
      // 1. CGPA Contribution (max 20)
      const cgpa = student.cgpa ?? 7.0;
      const cgpaContrib = Math.min(20, Math.round((cgpa / 10) * 20));

      // 2. Assessment Contribution (max 25)
      const asmtScore = student.average_assessment_score ?? (student.assessments_attempted > 0 ? 60 : 30);
      const asmtContrib = Math.min(25, Math.round((asmtScore / 100) * 25));

      // 3. Skill Readiness Contribution (max 20)
      const readinessScore = student.readiness.total_score;
      const readinessContrib = Math.min(20, Math.round((readinessScore / 100) * 20));

      // 4. Roadmap Progress Contribution (max 15)
      const rm = this.calculateStudentRoadmapProgress(student.id);
      const roadmapContrib = Math.min(15, Math.round((rm.overall_progress / 100) * 15));

      // 5. Market Match Contribution (max 10)
      const topMatch = student.top_match_score ?? 60;
      const marketContrib = Math.min(10, Math.round((topMatch / 100) * 10));

      // 6. Mentor Feedback Contribution (max 10)
      const studentFeedbacks = feedbacks.filter(f => f.student_id === student.id);
      let mentorScore: number | null = null;
      let mentorContrib = 7.5; // neutral baseline if not evaluated
      if (studentFeedbacks.length > 0) {
        mentorScore = Number((studentFeedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / studentFeedbacks.length).toFixed(2));
        mentorContrib = Math.min(10, Math.round((mentorScore / 5) * 10));
      }

      const composite = Math.min(100, Math.round(cgpaContrib + asmtContrib + readinessContrib + roadmapContrib + marketContrib + mentorContrib));

      return {
        rank: 0,
        student_id: student.id,
        student_name: student.full_name,
        department: student.department,
        year_of_study: student.year_of_study,
        cgpa: student.cgpa,
        composite_score: composite,
        factors: {
          cgpa_contribution: cgpaContrib,
          assessment_contribution: asmtContrib,
          readiness_contribution: readinessContrib,
          roadmap_contribution: roadmapContrib,
          market_match_contribution: marketContrib,
          mentor_feedback_contribution: mentorContrib
        },
        assessment_score: student.average_assessment_score,
        skill_readiness_score: readinessScore,
        roadmap_progress: rm.overall_progress,
        top_match_score: student.top_match_score,
        mentor_feedback_score: mentorScore,
        placement_status: student.placement_status,
        verified_badges: student.verified_badges_count
      };
    });

    // Sort
    const sortBy = filters?.sortBy || 'composite';
    if (sortBy === 'cgpa') {
      items.sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0));
    } else if (sortBy === 'assessment') {
      items.sort((a, b) => (b.assessment_score ?? 0) - (a.assessment_score ?? 0));
    } else if (sortBy === 'readiness') {
      items.sort((a, b) => b.skill_readiness_score - a.skill_readiness_score);
    } else if (sortBy === 'roadmap') {
      items.sort((a, b) => b.roadmap_progress - a.roadmap_progress);
    } else {
      items.sort((a, b) => b.composite_score - a.composite_score);
    }

    // Assign rank
    items.forEach((it, idx) => {
      it.rank = idx + 1;
    });

    return items;
  }

  /**
   * 12. Student Competency Radar & Personal Analytics
   * 5 Dimensions: Technical Aptitude, Soft Skills, Assessment Mastery, Practical Projects, Certifications
   */
  public static getStudentCompetencyRadar(studentId: string): CompetencyRadarData | null {
    const student = db.findStudentById(studentId);
    if (!student) return null;

    const skills = db.getStudentSkills(studentId);
    const projects = db.getStudentProjects(studentId);
    const certs = db.getStudentCertifications(studentId);
    const asmtStats = db.getStudentAssessmentStats(studentId);
    const feedbacks = db.getRawData().mentor_feedbacks.filter(f => f.student_id === studentId);

    // 1. Technical Aptitude (0-100)
    const techSkills = skills.filter(s => s.skill.category === 'technical');
    const advancedTech = techSkills.filter(s => s.proficiency_level === 'Advanced' || s.proficiency_level === 'Expert');
    const techScore = Math.min(100, Math.round(
      (techSkills.length * 10) +
      (advancedTech.length * 15) +
      ((asmtStats?.passed_count ?? 0) * 15)
    ));

    // 2. Soft Skills (0-100)
    const softSkills = skills.filter(s => s.skill.category === 'soft');
    let softScore = Math.min(100, softSkills.length * 20);
    if (feedbacks.length > 0) {
      const avgComm = feedbacks.reduce((acc, f) => acc + (f.communication + f.teamwork_collaboration) / 2, 0) / feedbacks.length;
      softScore = Math.min(100, Math.round((softScore * 0.4) + ((avgComm / 5) * 100 * 0.6)));
    } else {
      softScore = Math.min(100, Math.max(50, softScore));
    }

    // 3. Assessment Mastery (0-100)
    let asmtScore = 0;
    if (asmtStats && asmtStats.total_attempts > 0) {
      const passRate = (asmtStats.passed_count / asmtStats.total_attempts) * 40;
      const scoreWeight = ((asmtStats.average_score ?? 0) / 100) * 60;
      asmtScore = Math.min(100, Math.round(passRate + scoreWeight));
    } else {
      asmtScore = 20; // baseline if unattempted
    }

    // 4. Practical Projects (0-100)
    const projectScore = Math.min(100, Math.round(projects.length * 35));

    // 5. Certifications & Verified Credentials (0-100)
    const certScore = Math.min(100, Math.round((certs.length * 30) + ((asmtStats?.passed_count ?? 0) * 20)));

    const overallScore = Math.min(100, Math.round(
      (techScore * 0.25) +
      (softScore * 0.20) +
      (asmtScore * 0.25) +
      (projectScore * 0.15) +
      (certScore * 0.15)
    ));

    const axes = [
      {
        axis: 'Technical Aptitude',
        score: techScore,
        benchmark: 75,
        label: 'Core Programming & Stack Depth',
        source: 'Phase 1 Skills + Phase 2 Assessments',
        evidence: `${techSkills.length} Technical Skills declared, ${advancedTech.length} Advanced/Expert competencies verified.`
      },
      {
        axis: 'Soft Skills',
        score: softScore,
        benchmark: 70,
        label: 'Communication & Teamwork',
        source: 'Phase 1 Profile + Phase 8 Mentor Feedback',
        evidence: feedbacks.length > 0
          ? `Backed by ${feedbacks.length} corporate mentor evaluations.`
          : `${softSkills.length} declared interpersonal competencies.`
      },
      {
        axis: 'Assessment Mastery',
        score: asmtScore,
        benchmark: 65,
        label: 'Standardized Exam Benchmarks',
        source: 'Phase 2 Standardized Code Tests',
        evidence: asmtStats
          ? `${asmtStats.passed_count} of ${asmtStats.total_attempts} tests passed (Avg score: ${asmtStats.average_score ?? 0}%).`
          : 'No standardized tests attempted yet.'
      },
      {
        axis: 'Practical Projects',
        score: projectScore,
        benchmark: 60,
        label: 'Portfolio & Artifact Demonstrations',
        source: 'Phase 1 Verified Project Repositories',
        evidence: `${projects.length} verified project portfolios registered in student record.`
      },
      {
        axis: 'Certifications',
        score: certScore,
        benchmark: 50,
        label: 'External Credentials & Badges',
        source: 'Phase 1 Certifications + Phase 2 Verified Badges',
        evidence: `${certs.length} formal certifications and ${asmtStats?.passed_count ?? 0} skill badges awarded.`
      }
    ];

    let mentorEvidence: CompetencyRadarData['mentor_evidence'] = undefined;
    if (feedbacks.length > 0) {
      const latest = feedbacks[feedbacks.length - 1];
      mentorEvidence = {
        overall_rating: latest.overall_performance,
        evaluator: `${latest.mentor_name}${latest.mentor_title ? `, ${latest.mentor_title}` : ''}`,
        strengths: latest.strengths,
        areas_for_improvement: latest.areas_for_improvement
      };
    }

    return {
      student_id: student.id,
      student_name: student.full_name,
      department: student.department,
      year_of_study: student.year_of_study,
      cgpa: student.cgpa,
      overall_score: overallScore,
      axes,
      mentor_evidence: mentorEvidence
    };
  }

  /**
   * 13. Industry / Company Specific Analytics
   * Strictly scoped to the authenticated employer's company
   */
  public static getCompanyAnalytics(companyId: string) {
    const rawData = db.getRawData();
    const company = db.findCompanyById(companyId);
    if (!company) return null;

    const jobs = rawData.jobs.filter(j => j.company_id === companyId);
    const internships = rawData.internships.filter(i => i.company_id === companyId);
    const applications = rawData.applications.filter(a => a.company_id === companyId);
    const feedbacks = rawData.mentor_feedbacks.filter(f => f.company_id === companyId);
    const students = rawData.students;

    const totalApps = applications.length;
    const underReview = applications.filter(a => a.status === 'Under Review').length;
    const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
    const selected = applications.filter(a => a.status === 'Selected').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;

    // Match quality distribution
    const matchBuckets = {
      excellent_85_plus: applications.filter(a => (a.match_score || 0) >= 85).length,
      good_70_84: applications.filter(a => (a.match_score || 0) >= 70 && (a.match_score || 0) < 85).length,
      moderate_50_69: applications.filter(a => (a.match_score || 0) >= 50 && (a.match_score || 0) < 70).length,
      low_under_50: applications.filter(a => (a.match_score || 0) < 50).length
    };

    const avgMatchScore = totalApps > 0
      ? Math.round(applications.reduce((sum, a) => sum + (a.match_score || 0), 0) / totalApps)
      : 0;

    // Evaluated candidates
    const avgFeedbackScore = feedbacks.length > 0
      ? Number((feedbacks.reduce((sum, f) => sum + f.overall_performance, 0) / feedbacks.length).toFixed(2))
      : 0;

    const hireRecRate = feedbacks.length > 0
      ? Math.round((feedbacks.filter(f => f.hire_recommendation === 'Recommended').length / feedbacks.length) * 100)
      : 0;

    // Department source distribution
    const deptSourceMap = new Map<string, number>();
    applications.forEach(app => {
      const st = students.find(s => s.id === app.student_id);
      const d = st?.department || 'Other';
      deptSourceMap.set(d, (deptSourceMap.get(d) || 0) + 1);
    });

    const departmentSources = Array.from(deptSourceMap.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0
    }));

    return {
      company_name: company.company_name,
      active_jobs_count: jobs.filter(j => j.status === 'active').length,
      active_internships_count: internships.filter(i => i.status === 'active').length,
      total_postings: jobs.length + internships.length,
      total_applications: totalApps,
      hiring_funnel: {
        applied: totalApps,
        under_review: underReview,
        shortlisted: shortlisted,
        selected: selected,
        rejected: rejected
      },
      conversion_rate: totalApps > 0 ? Math.round((selected / totalApps) * 100) : 0,
      average_match_score: avgMatchScore,
      match_quality_distribution: matchBuckets,
      mentor_feedback_summary: {
        total_evaluations: feedbacks.length,
        average_score: avgFeedbackScore,
        hire_recommendation_rate: hireRecRate
      },
      department_sources: departmentSources
    };
  }

  /**
   * 14. Formal Executive Reports (Supports all 9 report templates)
   */
  public static generateExecutiveReport(reportType: string, filters?: AnalyticsFilterOptions): {
    title: string;
    description: string;
    generated_at: string;
    institution_name: string;
    summary_metrics: Array<{ label: string; value: string | number }>;
    headers: string[];
    rows: Array<Record<string, any>>;
  } {
    const rawData = db.getRawData();
    const students = CollegeAdminEngine.getEnrichedStudentRoster();
    const institutionName = students.length > 0 && students[0].college_name
      ? students[0].college_name
      : 'Institute of Technology & Science';
    const now = new Date().toISOString();

    switch (reportType) {
      // 1. Institutional Performance Report
      case 'institutional': {
        const kpis = this.getExecutiveKpis(filters);
        return {
          title: 'Institutional Performance & Executive Benchmark Report',
          description: 'High-level synthesis of academic readiness, standardized skill testing, recruitment funnel throughput, and corporate stakeholder feedback.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Total Enrollment', value: kpis.total_students },
            { label: 'Industry Partners', value: kpis.total_industry_partners },
            { label: 'Placement Ready Cohort', value: `${kpis.overall_skill_readiness_rate}%` },
            { label: 'Placement Conversion', value: `${kpis.placement_conversion_rate}%` },
            { label: 'Avg Mentor Rating', value: `${kpis.average_mentor_feedback_score}/5.0` }
          ],
          headers: ['Metric Category', 'Measured Indicator', 'Value', 'Status Benchmark'],
          rows: [
            { category: 'Academic Standing', metric: 'Total Student Body', value: kpis.total_students, benchmark: 'Full Enrollment' },
            { category: 'Skill Competency', metric: 'Overall Placement Readiness Rate', value: `${kpis.overall_skill_readiness_rate}%`, benchmark: 'Target: >70%' },
            { category: 'Phase 2 Assessments', metric: 'Standardized Test Completion Rate', value: `${kpis.assessment_completion_rate}%`, benchmark: 'Target: >80%' },
            { category: 'Phase 2 Assessments', metric: 'Average Assessment Score', value: `${kpis.average_assessment_score}%`, benchmark: 'Target: >75%' },
            { category: 'Recruitment & Placement', metric: 'Active Applications Submitted', value: kpis.total_applications, benchmark: 'Active Flow' },
            { category: 'Recruitment & Placement', metric: 'Candidates Shortlisted', value: kpis.shortlisted_candidates, benchmark: 'Screening' },
            { category: 'Recruitment & Placement', metric: 'Candidates Selected / Hired', value: kpis.selected_candidates, benchmark: 'Hired' },
            { category: 'Recruitment & Placement', metric: 'Placement Conversion Rate', value: `${kpis.placement_conversion_rate}%`, benchmark: 'Target: >35%' },
            { category: 'Corporate Mentorship', metric: 'Average Mentor Performance Score', value: `${kpis.average_mentor_feedback_score}/5.0`, benchmark: 'Industry Standard' }
          ]
        };
      }

      // 2. Student Readiness Report
      case 'student_readiness': {
        const rows = students.map(s => {
          const rm = this.calculateStudentRoadmapProgress(s.id);
          return {
            student_name: s.full_name,
            department: s.department,
            year: s.year_of_study,
            cgpa: s.cgpa ? s.cgpa.toFixed(2) : 'N/A',
            skills_count: s.skills_count,
            readiness_tier: s.readiness.tier,
            readiness_score: `${s.readiness.total_score}/100`,
            roadmap_progress: `${rm.overall_progress}%`,
            assessments_passed: s.assessments_passed,
            placement_status: s.placement_status
          };
        });

        const readyCount = students.filter(s => s.readiness.tier === 'Job Ready' || s.readiness.tier === 'High Potential').length;
        const readinessRate = students.length > 0 ? Math.round((readyCount / students.length) * 100) : 0;

        return {
          title: 'Student Skill Readiness & Tier Roster Report',
          description: 'Comprehensive evaluation of student academic standing, verified skill competencies, roadmap progression, and placement tier classification.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Total Students', value: students.length },
            { label: 'Readiness Rate', value: `${readinessRate}%` },
            { label: 'Job Ready Cohort', value: students.filter(s => s.readiness.tier === 'Job Ready').length },
            { label: 'High Potential', value: students.filter(s => s.readiness.tier === 'High Potential').length }
          ],
          headers: ['Student Name', 'Department', 'Year', 'CGPA', 'Skills Count', 'Readiness Tier', 'Readiness Score', 'Roadmap %', 'Tests Passed', 'Placement Status'],
          rows
        };
      }

      // 3. Skill Demand & Gap Report
      case 'skill_demand_gap': {
        const demandData = this.getSkillDemandSupplyAnalytics(filters);
        const rows = demandData.skills.map(s => ({
          skill_name: s.skill_name,
          category: s.category,
          industry_demand: s.industry_demand_count,
          student_supply: s.student_supply_count,
          verified_supply: s.verified_supply_count,
          readiness_rate: `${s.readiness_percentage}%`,
          net_gap: s.gap_count,
          classification: s.classification
        }));

        return {
          title: 'Industry Skill Demand vs Campus Supply Report',
          description: 'Comparative audit matching employer market demand against campus skill inventories, highlighting critical deficits and surplus proficiencies.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Skills Analyzed', value: demandData.total_skills_analyzed },
            { label: 'Critical Talent Deficits', value: demandData.high_demand_low_supply_count },
            { label: 'Core Institutional Strengths', value: demandData.high_demand_high_supply_count },
            { label: 'Emerging Skills', value: demandData.emerging_skills_count }
          ],
          headers: ['Skill Name', 'Category', 'Industry Demand', 'Campus Supply', 'Verified Supply', 'Readiness %', 'Net Gap', 'Quadrant Classification'],
          rows
        };
      }

      // 4. Assessment Performance Report
      case 'assessment_performance': {
        const asmtData = this.getAssessmentAnalytics(filters);
        const rows = asmtData.assessments_breakdown.map(a => ({
          title: a.title,
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
          title: 'Standardized Technical Assessment Performance Report',
          description: 'Institutional audit of standardized Phase 2 coding and technical evaluations, pass rates, score distributions, and subject-matter benchmarks.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Total Assessments', value: asmtData.total_assessments_available },
            { label: 'Total Attempts', value: asmtData.total_attempts },
            { label: 'Overall Pass Rate', value: `${asmtData.overall_pass_rate}%` },
            { label: 'Overall Avg Score', value: `${asmtData.overall_average_score}%` }
          ],
          headers: ['Assessment Title', 'Track', 'Difficulty', 'Passing Mark', 'Attempts', 'Passed', 'Pass Rate', 'Avg Score', 'Highest Score'],
          rows
        };
      }

      // 5. Placement & Recruitment Report
      case 'placement_recruitment': {
        const placementData = this.getPlacementAnalytics(filters);
        const rawApps = rawData.applications;
        const rows = rawApps.map(a => {
          const st = students.find(s => s.id === a.student_id);
          const comp = rawData.companies.find(c => c.id === a.company_id);
          let title = 'Opportunity';
          if (a.opportunity_type === 'job') {
            title = rawData.jobs.find(j => j.id === a.opportunity_id)?.title || 'Job';
          } else {
            title = rawData.internships.find(i => i.id === a.opportunity_id)?.title || 'Internship';
          }

          return {
            student_name: st?.full_name || 'Student',
            department: st?.department || 'Engineering',
            company: comp?.company_name || 'Partner',
            role_title: title,
            type: a.opportunity_type,
            status: a.status,
            match_score: a.match_score ? `${a.match_score}%` : 'N/A',
            applied_date: a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'
          };
        });

        return {
          title: 'Placement Pipeline & Corporate Recruitment Report',
          description: 'Official dossier of all student applications, employer shortlisting flows, candidate selections, and corporate recruitment throughput.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Total Applications', value: placementData.total_applications },
            { label: 'Shortlisted Candidates', value: placementData.shortlisted_count },
            { label: 'Selected / Hired', value: placementData.selected_count },
            { label: 'Placement Conversion', value: `${placementData.conversion_rate}%` }
          ],
          headers: ['Student Name', 'Department', 'Company Partner', 'Position', 'Type', 'Status', 'Match %', 'Applied Date'],
          rows
        };
      }

      // 6. Industry Engagement Report
      case 'industry_engagement': {
        const indData = this.getIndustryEngagementAnalytics();
        const rows = indData.partners_list.map(p => ({
          company_name: p.company_name,
          industry_domain: p.industry,
          location: p.location,
          company_size: p.company_size,
          active_jobs: p.active_jobs_count,
          active_internships: p.active_internships_count,
          total_applicants: p.total_applicants_count,
          shortlisted: p.shortlisted_count,
          hired: p.selected_count
        }));

        return {
          title: 'Corporate Industry Partner Engagement Report',
          description: 'Directory and engagement metrics of registered corporate employers, active job openings, applicant pipelines, and hiring conversion rates.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Corporate Partners', value: indData.total_partners },
            { label: 'Active Jobs', value: indData.active_jobs_count },
            { label: 'Active Internships', value: indData.active_internships_count },
            { label: 'Applications Handled', value: indData.total_applications_received }
          ],
          headers: ['Company Name', 'Industry Domain', 'Location', 'Scale', 'Active Jobs', 'Internships', 'Applicants', 'Shortlisted', 'Hired'],
          rows
        };
      }

      // 7. Mentor Feedback Report
      case 'mentor_feedback': {
        const feedbackData = this.getMentorFeedbackAnalytics(filters);
        const rows = rawData.mentor_feedbacks.map(f => {
          const st = students.find(s => s.id === f.student_id);
          const comp = rawData.companies.find(c => c.id === f.company_id);
          return {
            student_name: st?.full_name || 'Student',
            department: st?.department || 'Engineering',
            company: comp?.company_name || 'Corporate Partner',
            mentor_name: f.mentor_name,
            overall_score: `${f.overall_performance}/5.0`,
            technical: `${f.technical_competence}/5`,
            problem_solving: `${f.problem_solving}/5`,
            communication: `${f.communication}/5`,
            work_ethic: `${f.professionalism_work_ethic}/5`,
            hire_recommendation: f.hire_recommendation
          };
        });

        return {
          title: 'Industry Mentor Evaluation & Competency Feedback Report',
          description: 'Independent evaluations from corporate industry mentors rating student technical competence, problem-solving, soft skills, and hire recommendations.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Evaluations Completed', value: feedbackData.total_evaluations },
            { label: 'Average Score', value: `${feedbackData.average_overall_score}/5.0` },
            { label: 'Hire Recommendation Rate', value: `${feedbackData.recommendation_distribution.recommended_percentage}%` },
            { label: 'Technical Average', value: `${feedbackData.rubric_averages.technical_competence}/5.0` }
          ],
          headers: ['Student Name', 'Department', 'Company', 'Mentor', 'Overall Score', 'Technical', 'Problem Solving', 'Communication', 'Work Ethic', 'Recommendation'],
          rows
        };
      }

      // 8. Department Benchmark Report
      case 'department_benchmark': {
        const deptData = this.getDepartmentBenchmarkMatrix();
        const rows = deptData.map(d => ({
          department: d.department,
          student_count: d.student_count,
          average_cgpa: d.average_cgpa.toFixed(2),
          assessment_rate: `${d.assessment_completion_rate}%`,
          average_score: `${d.average_assessment_score}%`,
          readiness_rate: `${d.skill_readiness_rate}%`,
          roadmap_progress: `${d.average_roadmap_progress}%`,
          applications: d.applications_count,
          hired: d.selected_count,
          conversion_rate: `${d.placement_conversion_rate}%`,
          mentor_rating: d.mentor_feedback_score ? `${d.mentor_feedback_score}/5.0` : 'N/A'
        }));

        return {
          title: 'Departmental Academic & Placement Benchmark Report',
          description: 'Comparative institutional matrix evaluating academic performance, assessment participation, skill readiness, and placement success across departments.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Departments Tracked', value: deptData.length },
            { label: 'Total Students', value: students.length },
            { label: 'Top Readiness Dept', value: deptData.sort((a, b) => b.skill_readiness_rate - a.skill_readiness_rate)[0]?.department || 'Computer Science' }
          ],
          headers: ['Department', 'Students', 'Avg CGPA', 'Test Participation', 'Avg Score', 'Skill Readiness', 'Roadmap %', 'Applications', 'Hired', 'Conversion %', 'Mentor Rating'],
          rows
        };
      }

      // 9. Batch Performance Report
      case 'batch_performance': {
        const batchData = this.getBatchBenchmarkMatrix();
        const rows = batchData.map(b => ({
          batch: b.batch,
          student_count: b.student_count,
          average_cgpa: b.average_cgpa.toFixed(2),
          assessment_rate: `${b.assessment_completion_rate}%`,
          average_score: `${b.average_assessment_score}%`,
          readiness_rate: `${b.skill_readiness_rate}%`,
          roadmap_progress: `${b.average_roadmap_progress}%`,
          actively_applying: b.actively_applying_count,
          hired: b.selected_count,
          conversion_rate: `${b.placement_conversion_rate}%`,
          mentor_rating: b.mentor_feedback_score ? `${b.mentor_feedback_score}/5.0` : 'N/A'
        }));

        return {
          title: 'Academic Batch & Year-of-Study Progression Report',
          description: 'Longitudinal cohort tracking student skill accumulation, standardized testing, and corporate placement across academic years.',
          generated_at: now,
          institution_name: institutionName,
          summary_metrics: [
            { label: 'Batches Tracked', value: batchData.length },
            { label: 'Total Students', value: students.length }
          ],
          headers: ['Batch / Year', 'Students', 'Avg CGPA', 'Test Participation', 'Avg Score', 'Skill Readiness', 'Roadmap %', 'Applying', 'Hired', 'Conversion %', 'Mentor Rating'],
          rows
        };
      }

      default: {
        return this.generateExecutiveReport('institutional', filters);
      }
    }
  }
}
