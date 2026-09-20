export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'faculty' | 'industry';
}

export interface Student {
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
  updated_at: string;
  profile_completion?: number;
  missing_fields?: string[];
  stats?: {
    skills_count: number;
    technical_skills_count: number;
    soft_skills_count: number;
    projects_count: number;
    certifications_count: number;
  };
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'technical' | 'soft';
  created_at: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  created_at: string;
  skill: SkillItem;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string;
  technologies: string[];
  project_link: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  student_id: string;
  certificate_name: string;
  issuing_organization: string;
  issue_date: string;
  certificate_link: string;
  created_at: string;
  updated_at: string;
}

export interface PlacementReadinessFactor {
  key: string;
  name: string;
  weight: number;
  score: number;
  weighted_score: number;
  label: string;
  evidence: string;
  status: 'optimal' | 'good' | 'needs_attention';
}

export interface StudentReadinessScore {
  total_score: number;
  placement_readiness_percentage: number;
  display_text: string;
  tier: 'Job Ready' | 'High Potential' | 'Developing' | 'Needs Foundation';
  badge_color: string;
  disclaimer: string;
  factors: {
    academic_score: number;
    assessment_score: number;
    skills_score: number;
    portfolio_score: number;
    market_match_score: number;
    assessment_performance?: PlacementReadinessFactor;
    skill_readiness?: PlacementReadinessFactor;
    projects?: PlacementReadinessFactor;
    certifications?: PlacementReadinessFactor;
    academic_standing?: PlacementReadinessFactor;
    roadmap_progress?: PlacementReadinessFactor;
    industry_evidence?: PlacementReadinessFactor;
  };
  factors_list?: PlacementReadinessFactor[];
  reasons: string[];
  strengths?: string[];
  recommendations?: string[];
}

export interface DashboardData {
  student: Student;
  stats: {
    profile_completion_percentage: number;
    missing_fields: string[];
    total_skills_count: number;
    technical_skills_count: number;
    soft_skills_count: number;
    projects_count: number;
    certifications_count: number;
    placement_readiness_percentage?: number;
    placement_readiness_tier?: string;
  };
  placement_readiness?: StudentReadinessScore;
  recent_skills: StudentSkill[];
  recent_projects: Project[];
  recent_certifications: Certification[];
}

export interface Assessment {
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
  attempts_count: number;
  best_score: number | null;
  best_skill_level: string | null;
  last_attempt_date: string | null;
  passed: boolean;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  options: string[];
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

export interface AssessmentAttempt {
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

export interface AssessmentStats {
  total_attempts: number;
  passed_count: number;
  highest_score: number;
  average_score: number;
  verified_badges_count: number;
}

// Phase 3: Skill Gap Analysis Types
export interface EvaluatedSkill {
  skill_name: string;
  student_proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | null;
  student_proficiency_numeric: number;
  required_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  required_level_numeric: number;
  status: 'matching' | 'weak' | 'missing';
  gap_percentage: number;
  is_verified: boolean;
  verified_assessment_title: string | null;
  verified_score: number | null;
  verified_badge: string | null;
  importance: string;
  recommended_action: string;
  recommended_learning: string;
  recommended_projects: string;
}

export interface SkillGapRoleOverview {
  role_id: string;
  role_title: string;
  category: string;
  short_description: string;
  overall_match_percentage: number;
  readiness_status: 'Job Ready' | 'High Potential' | 'Developing' | 'Needs Foundation';
  matching_skills_count: number;
  total_required_skills_count: number;
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

export type ActiveTab = 'dashboard' | 'profile' | 'skills' | 'projects' | 'certifications' | 'assessments' | 'skillgap' | 'opportunities' | 'feedback' | 'analytics' | 'roadmap';

// Phase 4: Student Learning Roadmap Types
export interface StudentRoadmapMilestone {
  label: string;
  completed: boolean;
}

export interface StudentRoadmapStage {
  stage_number: number;
  title: string;
  description: string;
  progress_percentage: number;
  status: 'completed' | 'in_progress' | 'locked';
  target_summary: string;
  current_summary: string;
  milestones: StudentRoadmapMilestone[];
  action: {
    label: string;
    tab: string;
  };
}

export interface StudentRoadmapData {
  student: {
    id: string;
    full_name: string;
    email?: string;
    college_name?: string;
    department?: string;
    year_of_study?: string;
    profile_photo?: string;
    profile_completion?: number;
  };
  overall_progress: number;
  current_stage: number;
  stage_title: string;
  completed_capstone: boolean;
  is_new_student: boolean;
  stages: StudentRoadmapStage[];
  role_alignment: Array<{
    id: string;
    name: string;
    match: number;
    icon: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    tab: string;
    actionText: string;
  }>;
}

// Phase 5: Industry Portal Types
export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  industry: string;
  website: string;
  location: string;
  company_size: string;
  contact_email: string;
  contact_phone: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  work_arrangement: 'On-site' | 'Hybrid' | 'Remote';
  required_skills: string[];
  min_qualification: string;
  experience_level: string;
  min_cgpa?: number;
  application_deadline: string;
  number_of_openings: number;
  responsibilities: string[];
  preferred_skills: string[];
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  applications_count?: number;
  company?: Company;
}

export interface Internship {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  duration: string;
  stipend: string;
  location: string;
  work_arrangement: 'On-site' | 'Hybrid' | 'Remote';
  eligibility: string;
  application_deadline: string;
  number_of_openings: number;
  responsibilities: string[];
  learning_outcomes: string[];
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  applications_count?: number;
  company?: Company;
}

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected' | 'In Progress' | 'Completed';

export interface Application {
  id: string;
  opportunity_id: string;
  opportunity_type: 'job' | 'internship';
  student_id: string;
  company_id: string;
  status: ApplicationStatus;
  cover_note?: string;
  notes?: string;
  match_score?: number;
  match_breakdown?: OpportunityMatchBreakdown;
  applied_at: string;
  updated_at: string;
  // Internship completion evidence / certificate / portfolio fields
  completion_date?: string;
  certificate_reference?: string;
  certificate_url?: string;
  portfolio_link?: string;
  mentor_feedback_id?: string;
  completion_notes?: string;
  mentor_feedback?: any;
  opportunity_title?: string;
  opportunity_required_skills?: string[];
  matching_skills_count?: number;
  student?: {
    id: string;
    full_name: string;
    email?: string;
    phone: string;
    college_name: string;
    department: string;
    year_of_study: string;
    cgpa: number | null;
    profile_photo: string;
    bio?: string;
    skills_count: number;
    projects_count: number;
    certifications_count: number;
    assessment_badges: number;
  };
  student_skills?: StudentSkill[];
  student_projects?: Project[];
  student_certifications?: Certification[];
  student_assessment_stats?: AssessmentStats | null;
  student_assessment_history?: AssessmentAttempt[];
  company?: Partial<Company>;
  opportunity?: Job | Internship;
}

// Phase 6: Matching Engine Types
export interface SkillMatchDetail {
  name: string;
  student_level: string | null;
  student_level_numeric: number;
  required_level: string;
  required_level_numeric: number;
  status: 'matching' | 'weak' | 'missing';
  gap_percentage: number;
  is_verified: boolean;
  verified_assessment_title: string | null;
  verified_score: number | null;
  verified_badge: string | null;
}

export interface OpportunityMatchBreakdown {
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
    technical_skills_score: number;
    assessment_score: number;
    role_alignment_score: number;
    projects_score: number;
    certifications_score: number;
    academic_score: number;
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

export interface MatchedOpportunityItem {
  id: string;
  type: 'job' | 'internship';
  opportunity: Job | Internship;
  match: OpportunityMatchBreakdown | null;
  match_score: number;
  match_tier: 'Strong Match' | 'Good Match' | 'Developing Match' | 'Low Match';
  has_applied: boolean;
  application: {
    id: string;
    status: string;
    applied_at: string;
    match_score?: number;
  } | null;
}

export interface CandidateProfile extends Student {
  skills: StudentSkill[];
  projects: Project[];
  certifications: Certification[];
  assessment_stats: AssessmentStats | null;
  assessment_history: AssessmentAttempt[];
}

export interface IndustryDashboardData {
  company: Company;
  active_jobs_count: number;
  active_internships_count: number;
  total_jobs_count: number;
  total_internships_count: number;
  total_applications_count: number;
  shortlisted_candidates_count: number;
  selected_candidates_count: number;
  under_review_count: number;
  recent_applications: Application[];
  recent_postings: Array<(Job | Internship) & { type: 'job' | 'internship' }>;
}

export type IndustryActiveTab = 'dashboard' | 'profile' | 'jobs' | 'internships' | 'applications' | 'evaluations' | 'analytics';

// Phase 7 & 8: College & Institutional Administration Types
export type CollegeActiveTab =
  | 'dashboard'
  | 'students'
  | 'departments'
  | 'batches'
  | 'readiness'
  | 'assessments'
  | 'placements'
  | 'industry'
  | 'evaluations'
  | 'reports'
  | 'executive';

export type CollegeReadinessTier = 'Job Ready' | 'High Potential' | 'Developing' | 'Needs Foundation';

export interface CollegeStudentReadinessScore {
  total_score: number;
  placement_readiness_percentage?: number;
  display_text?: string;
  tier: CollegeReadinessTier;
  badge_color: string;
  disclaimer?: string;
  factors: {
    academic_score: number;
    assessment_score: number;
    skills_score: number;
    portfolio_score: number;
    market_match_score: number;
    assessment_performance?: PlacementReadinessFactor;
    skill_readiness?: PlacementReadinessFactor;
    projects?: PlacementReadinessFactor;
    certifications?: PlacementReadinessFactor;
    academic_standing?: PlacementReadinessFactor;
    roadmap_progress?: PlacementReadinessFactor;
    industry_evidence?: PlacementReadinessFactor;
  };
  factors_list?: PlacementReadinessFactor[];
  reasons: string[];
  strengths?: string[];
  recommendations?: string[];
}

export interface CollegeStudentRosterItem {
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
  readiness: CollegeStudentReadinessScore;
}

export interface CollegeDashboardData {
  institution_name: string;
  total_students: number;
  average_cgpa: number;
  assessment_completion_rate: number;
  average_assessment_score: number;
  placement_readiness_rate: number;
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

export interface CollegeDepartmentItem {
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
  students: CollegeStudentRosterItem[];
}

export interface CollegeBatchItem {
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
  students: CollegeStudentRosterItem[];
}

export interface CollegeAssessmentAnalytics {
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
  recent_attempts: Array<AssessmentAttempt & { student_name?: string; student_department?: string }>;
}

export interface CollegeSkillReadinessAnalytics {
  most_common_student_skills: Array<{ name: string; category: string; count: number; percentage: number }>;
  strongest_skills: Array<{ name: string; advanced_count: number; percentage: number }>;
  weakest_skills: Array<{ name: string; beginner_count: number; percentage: number }>;
  industry_demanded_skills: Array<{ name: string; required_count: number; percentage_of_postings: number }>;
  most_frequently_missing_skills: Array<{ name: string; demand_count: number; student_supply_count: number; gap_percentage: number }>;
  overall_skill_readiness_percentage: number;
}

export interface CollegePlacementAnalytics {
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
}

export interface CollegeIndustryAnalytics {
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
    jobs: Job[];
    internships: Internship[];
  }>;
  industry_domain_distribution: Array<{ domain: string; count: number; percentage: number }>;
}

export interface CollegeReportData {
  title: string;
  description: string;
  generated_at: string;
  institution_name: string;
  summary_metrics: Array<{ label: string; value: string | number }>;
  headers: string[];
  rows: Array<Record<string, any>>;
}

// Phase 8: Industry Mentor Feedback Types
export interface MentorFeedback {
  id: string;
  student_id: string;
  company_id: string;
  opportunity_id: string;
  opportunity_type: 'job' | 'internship';
  mentor_name: string;
  mentor_title: string;
  mentor_email?: string;
  evaluation_period: string;
  technical_competence: number;
  problem_solving: number;
  communication: number;
  teamwork_collaboration: number;
  professionalism_work_ethic: number;
  learning_ability: number;
  overall_performance: number;
  average_score: number;
  strengths: string;
  areas_for_improvement: string;
  mentor_comments: string;
  hire_recommendation: 'Recommended' | 'Consider' | 'Not Recommended';
  created_at: string;
  updated_at: string;
  student?: Student;
  student_name?: string;
  student_department?: string;
  company?: Company;
  company_name?: string;
  opportunity_title?: string;
}

export interface StudentFeedbackSummary {
  feedbacks: MentorFeedback[];
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
  latest_feedback?: MentorFeedback & { company_name?: string; opportunity_title?: string };
}

export interface CompanyFeedbackManagementData {
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
  completed: MentorFeedback[];
  stats: {
    total_candidates: number;
    pending_count: number;
    completed_count: number;
    average_score: number;
    hire_recommendation_rate: number;
  };
}

export interface CollegeFeedbackAnalytics {
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
  recent_feedbacks: Array<MentorFeedback & { student_name: string; student_department: string; company_name: string; opportunity_title: string }>;
}

// Phase 9: Analytics & Executive Reports Types
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

export interface SkillDemandSupplyAnalytics {
  total_skills_analyzed: number;
  high_demand_low_supply_count: number;
  high_demand_high_supply_count: number;
  low_demand_high_supply_count: number;
  emerging_skills_count: number;
  skills: SkillDemandItem[];
  top_demanded_skills: SkillDemandItem[];
  critical_deficits: SkillDemandItem[];
  institutional_strengths: SkillDemandItem[];
}

export interface CompetencyRadarAxis {
  axis: string;
  score: number;
  benchmark: number;
  label: string;
  source: string;
  evidence: string;
}

export interface CompetencyRadarData {
  student_id: string;
  student_name: string;
  department: string;
  year_of_study: string;
  cgpa: number | null;
  overall_score: number;
  axes: CompetencyRadarAxis[];
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
    cgpa_contribution: number;
    assessment_contribution: number;
    readiness_contribution: number;
    roadmap_contribution: number;
    market_match_contribution: number;
    mentor_feedback_contribution: number;
  };
  assessment_score: number | null;
  skill_readiness_score: number;
  roadmap_progress: number;
  top_match_score: number | null;
  mentor_feedback_score: number | null;
  placement_status: string;
  verified_badges: number;
}

export interface DepartmentBenchmarkItem {
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
}

export interface BatchBenchmarkItem {
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
}

export interface RoadmapAnalyticsData {
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
}

export interface CompanyAnalyticsData {
  company_name: string;
  active_jobs_count: number;
  active_internships_count: number;
  total_postings: number;
  total_applications: number;
  hiring_funnel: {
    applied: number;
    under_review: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  conversion_rate: number;
  average_match_score: number;
  match_quality_distribution: {
    excellent_85_plus: number;
    good_70_84: number;
    moderate_50_69: number;
    low_under_50: number;
  };
  mentor_feedback_summary: {
    total_evaluations: number;
    average_score: number;
    hire_recommendation_rate: number;
  };
  department_sources: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
}





