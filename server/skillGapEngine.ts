import { db, StudentSkillRecord, AssessmentAttemptRecord, SkillRecord } from './db.js';
import { INDUSTRY_ROLES, JobRoleDefinition, IndustrySkillRequirement } from './skillGapData.js';

export interface EvaluatedSkill {
  skill_name: string;
  student_proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | null;
  student_proficiency_numeric: number; // 0 to 4
  required_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  required_level_numeric: number; // 1 to 4
  status: 'matching' | 'weak' | 'missing';
  gap_percentage: number; // 0 to 100
  is_verified: boolean;
  verified_assessment_title: string | null;
  verified_score: number | null;
  verified_badge: string | null;
  importance: string;
  recommended_action: string;
  recommended_learning: string;
  recommended_projects: string;
}

export interface SkillGapAnalysisReport {
  role_id: string;
  role_title: string;
  role_category: string;
  short_description: string;
  detailed_overview: string;
  market_demand: string;
  average_salary_range: string;
  key_responsibilities: string[];
  overall_match_percentage: number;
  readiness_status: 'Job Ready' | 'High Potential' | 'Developing' | 'Needs Foundation';
  readiness_badge_color: string;
  readiness_summary: string;
  matching_skills_count: number;
  weak_skills_count: number;
  missing_skills_count: number;
  total_required_skills_count: number;
  matching_skills: EvaluatedSkill[];
  weak_skills: EvaluatedSkill[];
  missing_skills: EvaluatedSkill[];
  all_evaluated_skills: EvaluatedSkill[];
  has_profile_skills: boolean;
  has_assessments: boolean;
  recommendations: {
    priority_skills: Array<{
      skill_name: string;
      current_level: string | null;
      target_level: string;
      reason: string;
    }>;
    recommended_learning: Array<{
      title: string;
      skill: string;
      action_plan: string;
    }>;
    recommended_assessments: Array<{
      assessment_id?: string;
      title: string;
      category: string;
      reason: string;
      passing_percentage: number;
      already_passed: boolean;
    }>;
    recommended_projects: Array<{
      title: string;
      skills_involved: string[];
      description: string;
      expected_outcome: string;
    }>;
  };
}

const PROFICIENCY_NUMERIC_MAP: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4
};

export class SkillGapEngine {
  public static getAllRoles(): Array<{
    id: string;
    title: string;
    category: string;
    short_description: string;
    market_demand: string;
    average_salary_range: string;
    total_skills_count: number;
  }> {
    return INDUSTRY_ROLES.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      short_description: r.short_description,
      market_demand: r.market_demand,
      average_salary_range: r.average_salary_range,
      total_skills_count: r.required_skills.length
    }));
  }

  public static getRoleById(roleId: string): JobRoleDefinition | undefined {
    return INDUSTRY_ROLES.find(r => r.id.toLowerCase() === roleId.toLowerCase());
  }

  public static analyzeStudentRoleGap(studentId: string, roleId: string): SkillGapAnalysisReport | { error: string } {
    const role = this.getRoleById(roleId);
    if (!role) {
      return { error: `Job role '${roleId}' not found.` };
    }

    const student = db.findStudentById(studentId);
    if (!student) {
      return { error: 'Student profile not found.' };
    }

    // Retrieve Student's real profile skills and assessment attempts
    const studentSkills = db.getStudentSkills(studentId);
    const assessmentAttempts = db.getStudentAssessmentHistory(studentId);
    const allAssessments = db.getAllAssessments(studentId);

    const hasProfileSkills = studentSkills.length > 0;
    const hasAssessments = assessmentAttempts.length > 0;

    const matchingSkills: EvaluatedSkill[] = [];
    const weakSkills: EvaluatedSkill[] = [];
    const missingSkills: EvaluatedSkill[] = [];
    const allEvaluated: EvaluatedSkill[] = [];

    let totalScoreAccumulator = 0;

    for (const req of role.required_skills) {
      // Find if student has this skill or any alias
      const matchedStudentSkill = this.findMatchingStudentSkill(studentSkills, req);
      const reqNumeric = PROFICIENCY_NUMERIC_MAP[req.required_level] || 2;

      // Check Phase 2 Assessment Verification for this skill
      const verificationInfo = this.checkAssessmentVerification(req, assessmentAttempts);

      if (matchedStudentSkill) {
        const studentProficiency = matchedStudentSkill.proficiency_level;
        let studentNumeric = PROFICIENCY_NUMERIC_MAP[studentProficiency] || 1;

        // If verified with high score in Phase 2, reinforce proficiency if higher
        if (verificationInfo.is_verified && verificationInfo.verified_badge) {
          const badgeNumeric = PROFICIENCY_NUMERIC_MAP[verificationInfo.verified_badge] || 1;
          if (badgeNumeric > studentNumeric) {
            studentNumeric = badgeNumeric;
          }
        }

        if (studentNumeric >= reqNumeric) {
          // MATCHING SKILL
          const evaluated: EvaluatedSkill = {
            skill_name: req.skill_name,
            student_proficiency: studentProficiency,
            student_proficiency_numeric: studentNumeric,
            required_level: req.required_level,
            required_level_numeric: reqNumeric,
            status: 'matching',
            gap_percentage: 0,
            is_verified: verificationInfo.is_verified,
            verified_assessment_title: verificationInfo.verified_assessment_title,
            verified_score: verificationInfo.verified_score,
            verified_badge: verificationInfo.verified_badge,
            importance: req.importance,
            recommended_action: verificationInfo.is_verified
              ? 'Skill verified via Phase 2 assessment. Keep up-to-date with industry trends.'
              : 'Skill satisfies requirements. Take a Phase 2 assessment to earn a verified credential badge.',
            recommended_learning: req.recommended_learning,
            recommended_projects: req.recommended_projects
          };

          matchingSkills.push(evaluated);
          allEvaluated.push(evaluated);
          // 100% contribution + verification bonus
          totalScoreAccumulator += verificationInfo.is_verified ? 1.05 : 1.0;
        } else {
          // WEAK SKILL (Present in profile, but below industry target)
          const gapFraction = 1 - (studentNumeric / reqNumeric);
          const gapPct = Math.round(gapFraction * 100);

          const evaluated: EvaluatedSkill = {
            skill_name: req.skill_name,
            student_proficiency: studentProficiency,
            student_proficiency_numeric: studentNumeric,
            required_level: req.required_level,
            required_level_numeric: reqNumeric,
            status: 'weak',
            gap_percentage: gapPct,
            is_verified: verificationInfo.is_verified,
            verified_assessment_title: verificationInfo.verified_assessment_title,
            verified_score: verificationInfo.verified_score,
            verified_badge: verificationInfo.verified_badge,
            importance: req.importance,
            recommended_action: `Upgrade proficiency from ${studentProficiency} to ${req.required_level} through hands-on project implementations and technical practice.`,
            recommended_learning: req.recommended_learning,
            recommended_projects: req.recommended_projects
          };

          weakSkills.push(evaluated);
          allEvaluated.push(evaluated);
          // Partial contribution based on current level
          totalScoreAccumulator += (studentNumeric / reqNumeric) * 0.65;
        }
      } else {
        // MISSING SKILL (Not in profile)
        const evaluated: EvaluatedSkill = {
          skill_name: req.skill_name,
          student_proficiency: null,
          student_proficiency_numeric: 0,
          required_level: req.required_level,
          required_level_numeric: reqNumeric,
          status: 'missing',
          gap_percentage: 100,
          is_verified: false,
          verified_assessment_title: null,
          verified_score: null,
          verified_badge: null,
          importance: req.importance,
          recommended_action: `Add this essential skill to your learning roadmap and acquire baseline ${req.required_level} competency.`,
          recommended_learning: req.recommended_learning,
          recommended_projects: req.recommended_projects
        };

        missingSkills.push(evaluated);
        allEvaluated.push(evaluated);
        // 0% contribution
      }
    }

    // Overall Match Percentage
    const totalRequiredSkills = role.required_skills.length;
    let matchPercentage = totalRequiredSkills > 0
      ? Math.min(100, Math.round((totalScoreAccumulator / totalRequiredSkills) * 100))
      : 0;

    // Determine Readiness Status
    let readinessStatus: 'Job Ready' | 'High Potential' | 'Developing' | 'Needs Foundation';
    let readinessBadgeColor = '';
    let readinessSummary = '';

    if (matchPercentage >= 80) {
      readinessStatus = 'Job Ready';
      readinessBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      readinessSummary = 'Exceptional alignment with industry hiring standards. You possess the required technical breadth, core competencies, and verified assessment credentials.';
    } else if (matchPercentage >= 60) {
      readinessStatus = 'High Potential';
      readinessBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-300';
      readinessSummary = 'Strong competitive foundation. Addressing a few target weak areas and verifying your skills will elevate you to interview-ready status.';
    } else if (matchPercentage >= 40) {
      readinessStatus = 'Developing';
      readinessBadgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
      readinessSummary = 'Solid early groundwork established. Focus on building practical projects and mastering the identified missing competencies.';
    } else {
      readinessStatus = 'Needs Foundation';
      readinessBadgeColor = 'bg-rose-50 text-rose-700 border-rose-300';
      readinessSummary = 'Early stage for this role. We recommend starting with core foundational skills, coursework, and introductory skill assessments.';
    }

    // Generate Targeted Recommendations
    const prioritySkills = [
      ...weakSkills.map(w => ({
        skill_name: w.skill_name,
        current_level: w.student_proficiency,
        target_level: w.required_level,
        reason: `Current level (${w.student_proficiency || 'None'}) is below industry baseline (${w.required_level}).`
      })),
      ...missingSkills.slice(0, 3).map(m => ({
        skill_name: m.skill_name,
        current_level: null,
        target_level: m.required_level,
        reason: `Missing required core skill for ${role.title}.`
      }))
    ];

    const recommendedLearning = [
      ...weakSkills.map(w => ({
        title: `Deepen ${w.skill_name} Competencies`,
        skill: w.skill_name,
        action_plan: w.recommended_learning
      })),
      ...missingSkills.map(m => ({
        title: `Learn ${m.skill_name} Fundamentals`,
        skill: m.skill_name,
        action_plan: m.recommended_learning
      }))
    ].slice(0, 4);

    // Identify Recommended Phase 2 Assessments
    const recommendedAssessments = allAssessments.map(asmt => {
      const alreadyPassed = asmt.passed;
      let reason = `Validate your competencies in ${asmt.title}`;
      if (asmt.category === 'Frontend' && role.id === 'full-stack-engineer') {
        reason = 'Verify your React and frontend UI capabilities for this full-stack role.';
      } else if (asmt.category === 'Backend' && (role.id === 'full-stack-engineer' || role.id === 'data-systems-engineer')) {
        reason = 'Verify your Node.js, SQL, and API engineering skills.';
      } else if (asmt.category === 'Cloud' && (role.id === 'cloud-devops-engineer' || role.id === 'data-systems-engineer')) {
        reason = 'Verify your Docker, Linux, and Cloud infrastructure knowledge.';
      } else if (asmt.category === 'Full Stack') {
        reason = 'Demonstrate end-to-end TypeScript, Git, and architecture mastery.';
      }

      return {
        assessment_id: asmt.id,
        title: asmt.title,
        category: asmt.category,
        reason,
        passing_percentage: asmt.passing_percentage,
        already_passed: alreadyPassed
      };
    });

    // Recommended Projects
    const recommendedProjects = [
      {
        title: `${role.title} Portfolio Milestone Project`,
        skills_involved: role.required_skills.slice(0, 4).map(s => s.skill_name),
        description: `Build and deploy an enterprise-grade application demonstrating ${role.required_skills.slice(0, 3).map(s => s.skill_name).join(', ')}.`,
        expected_outcome: 'Production-ready GitHub repository with README documentation, unit tests, and live deployment link.'
      },
      {
        title: `Targeted Gap-Bridging Sandbox: ${weakSkills[0]?.skill_name || missingSkills[0]?.skill_name || 'Core Systems'}`,
        skills_involved: [
          weakSkills[0]?.skill_name || missingSkills[0]?.skill_name || 'System Architecture',
          weakSkills[1]?.skill_name || missingSkills[1]?.skill_name || 'Automated Testing'
        ],
        description: weakSkills[0]?.recommended_projects || missingSkills[0]?.recommended_projects || 'Build an isolated proof-of-concept module.',
        expected_outcome: 'Demonstrable code artifact solving real-world performance or architecture constraints.'
      }
    ];

    return {
      role_id: role.id,
      role_title: role.title,
      role_category: role.category,
      short_description: role.short_description,
      detailed_overview: role.detailed_overview,
      market_demand: role.market_demand,
      average_salary_range: role.average_salary_range,
      key_responsibilities: role.key_responsibilities,
      overall_match_percentage: matchPercentage,
      readiness_status: readinessStatus,
      readiness_badge_color: readinessBadgeColor,
      readiness_summary: readinessSummary,
      matching_skills_count: matchingSkills.length,
      weak_skills_count: weakSkills.length,
      missing_skills_count: missingSkills.length,
      total_required_skills_count: totalRequiredSkills,
      matching_skills: matchingSkills,
      weak_skills: weakSkills,
      missing_skills: missingSkills,
      all_evaluated_skills: allEvaluated,
      has_profile_skills: hasProfileSkills,
      has_assessments: hasAssessments,
      recommendations: {
        priority_skills: prioritySkills,
        recommended_learning: recommendedLearning,
        recommended_assessments: recommendedAssessments,
        recommended_projects: recommendedProjects
      }
    };
  }

  public static analyzeAllRolesOverview(studentId: string): Array<{
    role_id: string;
    role_title: string;
    category: string;
    short_description: string;
    overall_match_percentage: number;
    readiness_status: string;
    matching_skills_count: number;
    total_required_skills_count: number;
  }> {
    return INDUSTRY_ROLES.map(r => {
      const report = this.analyzeStudentRoleGap(studentId, r.id);
      if ('error' in report) {
        return {
          role_id: r.id,
          role_title: r.title,
          category: r.category,
          short_description: r.short_description,
          overall_match_percentage: 0,
          readiness_status: 'Needs Foundation',
          matching_skills_count: 0,
          total_required_skills_count: r.required_skills.length
        };
      }
      return {
        role_id: r.id,
        role_title: r.title,
        category: r.category,
        short_description: r.short_description,
        overall_match_percentage: report.overall_match_percentage,
        readiness_status: report.readiness_status,
        matching_skills_count: report.matching_skills_count,
        total_required_skills_count: report.total_required_skills_count
      };
    });
  }

  private static findMatchingStudentSkill(
    studentSkills: Array<StudentSkillRecord & { skill: SkillRecord }>,
    req: IndustrySkillRequirement
  ): (StudentSkillRecord & { skill: SkillRecord }) | undefined {
    const targetName = req.skill_name.toLowerCase().trim();
    const aliases = req.aliases.map(a => a.toLowerCase().trim());

    return studentSkills.find(ss => {
      const studentSkillName = ss.skill.name.toLowerCase().trim();
      if (studentSkillName === targetName) return true;
      if (aliases.includes(studentSkillName)) return true;

      // Partial containment for common compound names
      if (targetName.includes(studentSkillName) && studentSkillName.length > 2) return true;
      if (studentSkillName.includes(targetName)) return true;

      return false;
    });
  }

  private static checkAssessmentVerification(
    req: IndustrySkillRequirement,
    assessmentAttempts: AssessmentAttemptRecord[]
  ): {
    is_verified: boolean;
    verified_assessment_title: string | null;
    verified_score: number | null;
    verified_badge: string | null;
  } {
    if (!assessmentAttempts || assessmentAttempts.length === 0) {
      return {
        is_verified: false,
        verified_assessment_title: null,
        verified_score: null,
        verified_badge: null
      };
    }

    const passedAttempts = assessmentAttempts.filter(a => a.passed);
    if (passedAttempts.length === 0) {
      return {
        is_verified: false,
        verified_assessment_title: null,
        verified_score: null,
        verified_badge: null
      };
    }

    // Direct assessment title match or category match
    const categoryMatches = passedAttempts.filter(a => a.category === req.related_assessment_category);
    if (categoryMatches.length > 0) {
      // Pick highest score
      const best = [...categoryMatches].sort((a, b) => b.score_percentage - a.score_percentage)[0];
      return {
        is_verified: true,
        verified_assessment_title: best.assessment_title,
        verified_score: best.score_percentage,
        verified_badge: best.skill_level_awarded
      };
    }

    return {
      is_verified: false,
      verified_assessment_title: null,
      verified_score: null,
      verified_badge: null
    };
  }
}
