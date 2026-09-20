import {
  User,
  Student,
  Company,
  Job,
  Internship,
  Application,
  CandidateProfile,
  IndustryDashboardData,
  StudentSkill,
  Project,
  Certification,
  DashboardData,
  SkillItem,
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentStats,
  SkillGapAnalysisReport,
  SkillGapRoleOverview,
  OpportunityMatchBreakdown,
  MatchedOpportunityItem,
  MentorFeedback,
  StudentFeedbackSummary,
  CompanyFeedbackManagementData,
  CollegeFeedbackAnalytics,
  ExecutiveKpiData,
  SkillDemandSupplyAnalytics,
  CompetencyRadarData,
  TopPerformerItem,
  DepartmentBenchmarkItem,
  BatchBenchmarkItem,
  RoadmapAnalyticsData,
  CompanyAnalyticsData,
  CollegeReportData,
  StudentRoadmapData,
  StudentReadinessScore
} from '../types';

const TOKEN_KEY = 'skillbridge_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth API
  auth: {
    register: (data: {
      fullName: string;
      email: string;
      password: string;
      phone: string;
      collegeName: string;
      department: string;
      yearOfStudy: string;
    }) => request<{ token: string; user: User; student: Student }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    registerCompany: (data: {
      companyName: string;
      email: string;
      password: string;
      industry: string;
      location: string;
      website?: string;
      companySize?: string;
      contactPhone?: string;
      description?: string;
    }) => request<{ token: string; user: User; company: Company }>('/api/auth/register-company', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: User; student?: Student; company?: Company }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    getMe: () => request<{ user: User; student?: Student; company?: Company }>('/api/auth/me')
  },

  // Student API
  student: {
    getDashboard: () => request<DashboardData>('/api/student/dashboard'),

    getProfile: () => request<{ student: Student; profile_completion: number; missing_fields: string[] }>('/api/student/profile'),

    updateProfile: (profileData: {
      full_name: string;
      phone: string;
      college_name: string;
      department: string;
      year_of_study: string;
      cgpa?: number | null | string;
      profile_photo?: string;
      bio?: string;
    }) => request<{ message: string; student: Student; profile_completion: number; missing_fields: string[] }>('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

    // Skills
    getSkills: () => request<{ all: StudentSkill[]; technical: StudentSkill[]; soft: StudentSkill[]; total_count: number }>('/api/student/skills'),

    addSkill: (payload: { skill_name: string; category: 'technical' | 'soft'; proficiency_level?: string }) =>
      request<{ message: string; added: { studentSkill: StudentSkill; skill: SkillItem }; all: StudentSkill[]; profile_completion: number }>('/api/student/skills', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    removeSkill: (studentSkillId: string) =>
      request<{ message: string; all: StudentSkill[]; profile_completion: number }>(`/api/student/skills/${studentSkillId}`, {
        method: 'DELETE'
      }),

    // Projects
    getProjects: () => request<{ projects: Project[]; count: number }>('/api/student/projects'),

    createProject: (data: { title: string; description: string; technologies: string[] | string; project_link?: string }) =>
      request<{ message: string; project: Project; profile_completion: number }>('/api/student/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateProject: (id: string, data: Partial<{ title: string; description: string; technologies: string[] | string; project_link: string }>) =>
      request<{ message: string; project: Project }>(`/api/student/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    deleteProject: (id: string) =>
      request<{ message: string; profile_completion: number }>(`/api/student/projects/${id}`, {
        method: 'DELETE'
      }),

    // Certifications
    getCertifications: () => request<{ certifications: Certification[]; count: number }>('/api/student/certifications'),

    createCertification: (data: { certificate_name: string; issuing_organization: string; issue_date: string; certificate_link?: string }) =>
      request<{ message: string; certification: Certification; profile_completion: number }>('/api/student/certifications', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateCertification: (id: string, data: Partial<{ certificate_name: string; issuing_organization: string; issue_date: string; certificate_link: string }>) =>
      request<{ message: string; certification: Certification }>(`/api/student/certifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    deleteCertification: (id: string) =>
      request<{ message: string; profile_completion: number }>(`/api/student/certifications/${id}`, {
        method: 'DELETE'
      }),

    // Phase 4: Learning Roadmap
    getRoadmap: () =>
      request<{ success: boolean; data: StudentRoadmapData }>('/api/student/roadmap'),

    // Placement Readiness Score (7-Factor Real Calculation)
    getPlacementReadiness: () =>
      request<{ success: boolean; readiness: StudentReadinessScore }>('/api/student/placement-readiness')
  },

  // Catalog
  skills: {
    getCatalog: () => request<{ all: SkillItem[]; technical: SkillItem[]; soft: SkillItem[] }>('/api/skills/catalog')
  },

  // Assessments (Phase 2)
  assessments: {
    getAll: () => request<{ assessments: Assessment[]; stats: AssessmentStats }>('/api/assessments'),

    getById: (id: string) => request<{ assessment: Assessment }>(`/api/assessments/${id}`),

    getQuestions: (id: string) =>
      request<{
        assessment: {
          id: string;
          title: string;
          category: string;
          total_questions: number;
          time_limit_minutes: number;
          difficulty: string;
          passing_percentage: number;
        };
        questions: AssessmentQuestion[];
      }>(`/api/assessments/${id}/questions`),

    submit: (id: string, payload: { time_taken_seconds: number; answers: Array<{ question_id: string; selected_option_index: number }> | { [key: string]: number } }) =>
      request<{
        message: string;
        attempt: AssessmentAttempt;
        assessment: Assessment;
        stats: AssessmentStats;
      }>(`/api/assessments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    getHistory: () => request<{ history: AssessmentAttempt[]; stats: AssessmentStats }>('/api/assessments/history')
  },

  // Skill Gap Analysis (Phase 3)
  skillGap: {
    getRoles: () =>
      request<{
        roles: Array<{
          id: string;
          title: string;
          category: string;
          short_description: string;
          market_demand: string;
          average_salary_range: string;
          total_skills_count: number;
        }>;
      }>('/api/skill-gap/roles'),

    getOverview: () =>
      request<{
        overview: SkillGapRoleOverview[];
      }>('/api/skill-gap/overview'),

    getRoleReport: (roleId: string) =>
      request<{
        report: SkillGapAnalysisReport;
      }>(`/api/skill-gap/role/${roleId}`)
  },

  // Phase 5: Industry Portal API
  industry: {
    getDashboard: () => request<IndustryDashboardData>('/api/industry/dashboard'),

    getProfile: () => request<{ company: Company }>('/api/industry/profile'),

    updateProfile: (data: Partial<Company>) =>
      request<{ message: string; company: Company }>('/api/industry/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    // Jobs
    getJobs: () => request<{ jobs: Job[] }>('/api/industry/jobs'),

    createJob: (data: Omit<Job, 'id' | 'company_id' | 'created_at' | 'updated_at'>) =>
      request<{ message: string; job: Job }>('/api/industry/jobs', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateJob: (id: string, data: Partial<Job>) =>
      request<{ message: string; job: Job }>(`/api/industry/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    toggleJobStatus: (id: string) =>
      request<{ message: string; job: Job }>(`/api/industry/jobs/${id}/status`, {
        method: 'PATCH'
      }),

    deleteJob: (id: string) =>
      request<{ message: string }>(`/api/industry/jobs/${id}`, {
        method: 'DELETE'
      }),

    // Internships
    getInternships: () => request<{ internships: Internship[] }>('/api/industry/internships'),

    createInternship: (data: Omit<Internship, 'id' | 'company_id' | 'created_at' | 'updated_at'>) =>
      request<{ message: string; internship: Internship }>('/api/industry/internships', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateInternship: (id: string, data: Partial<Internship>) =>
      request<{ message: string; internship: Internship }>(`/api/industry/internships/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    toggleInternshipStatus: (id: string) =>
      request<{ message: string; internship: Internship }>(`/api/industry/internships/${id}/status`, {
        method: 'PATCH'
      }),

    deleteInternship: (id: string) =>
      request<{ message: string }>(`/api/industry/internships/${id}`, {
        method: 'DELETE'
      }),

    // Applications & Candidate Pipeline
    getApplications: () => request<{ applications: Application[] }>('/api/industry/applications'),

    updateApplicationStatus: (
      id: string,
      status: Application['status'],
      notes?: string,
      evidence?: {
        completion_date?: string;
        certificate_reference?: string;
        certificate_url?: string;
        portfolio_link?: string;
        mentor_feedback_id?: string;
        completion_notes?: string;
      }
    ) =>
      request<{ message: string; application: Application }>(`/api/industry/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes, ...evidence })
      }),

    getCandidateProfile: (studentId: string) =>
      request<{ candidate: CandidateProfile }>(`/api/industry/students/${studentId}`),

    getApplicantDossier: (applicationId: string) =>
      request<{
        application: Application;
        student: CandidateProfile;
        opportunity: Job | Internship;
        match_analysis: OpportunityMatchBreakdown;
      }>(`/api/matching/industry/applicant-dossier/${applicationId}`)
  },

  // Opportunities (For Students & Public Directory)
  opportunities: {
    getJobs: () => request<{ jobs: Job[] }>('/api/opportunities/jobs'),

    getInternships: () => request<{ internships: Internship[] }>('/api/opportunities/internships'),

    getById: (type: 'job' | 'internship', id: string) =>
      request<{ opportunity: Job | Internship; type: string }>(`/api/opportunities/${type}/${id}`),

    apply: (type: 'job' | 'internship', id: string, cover_note?: string) =>
      request<{ message: string; application: Application; isNew: boolean }>(`/api/opportunities/${type}/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ cover_note })
      }),

    getMyApplications: () => request<{ applications: Application[] }>('/api/opportunities/student/my-applications'),

    submitApplicationEvidence: (
      applicationId: string,
      evidence: {
        completion_date?: string;
        certificate_reference?: string;
        certificate_url?: string;
        portfolio_link?: string;
        completion_notes?: string;
        status?: Application['status'];
      }
    ) =>
      request<{ message: string; application: Application }>(`/api/opportunities/student/applications/${applicationId}/evidence`, {
        method: 'PATCH',
        body: JSON.stringify(evidence)
      })
  },

  // Phase 6: Intelligent Matching Engine API
  matching: {
    getOpportunities: () =>
      request<{
        opportunities: MatchedOpportunityItem[];
        total_count: number;
        jobs_count: number;
        internships_count: number;
        applied_count: number;
      }>('/api/matching/opportunities'),

    getRecommended: () =>
      request<{
        recommended: Array<{
          id: string;
          type: 'job' | 'internship';
          opportunity: Job | Internship;
          match: OpportunityMatchBreakdown | null;
          match_score: number;
          has_applied: boolean;
        }>;
        stats: {
          total_applied: number;
          shortlisted: number;
          selected: number;
        };
      }>('/api/matching/recommended'),

    getOpportunityDetail: (type: 'job' | 'internship', id: string) =>
      request<{
        opportunity: Job | Internship;
        type: string;
        match: OpportunityMatchBreakdown | null;
        application: Application | null;
        has_applied: boolean;
      }>(`/api/matching/opportunities/${type}/${id}`),

    smartApply: (opportunityId: string, opportunityType: 'job' | 'internship', coverNote?: string) =>
      request<{
        message: string;
        application: Application;
        match: OpportunityMatchBreakdown | null;
        isNew: boolean;
      }>('/api/matching/apply', {
        method: 'POST',
        body: JSON.stringify({
          opportunity_id: opportunityId,
          opportunity_type: opportunityType,
          cover_note: coverNote
        })
      }),

    getMyApplications: () =>
      request<{ applications: Application[] }>('/api/matching/applications')
  },

  // Phase 7: College Administration API
  college: {
    getDashboard: () =>
      request<{ success: boolean; data: import('../types').CollegeDashboardData }>('/api/college/dashboard'),

    getStudents: () =>
      request<{ success: boolean; count: number; data: import('../types').CollegeStudentRosterItem[] }>('/api/college/students'),

    getStudentDossier: (id: string) =>
      request<{ success: boolean; data: any }>(`/api/college/students/${id}`),

    getDepartments: () =>
      request<{ success: boolean; data: import('../types').CollegeDepartmentItem[] }>('/api/college/departments'),

    getBatches: () =>
      request<{ success: boolean; data: import('../types').CollegeBatchItem[] }>('/api/college/batches'),

    getAssessments: () =>
      request<{ success: boolean; data: import('../types').CollegeAssessmentAnalytics }>('/api/college/assessments'),

    getReadiness: () =>
      request<{ success: boolean; data: import('../types').CollegeSkillReadinessAnalytics }>('/api/college/readiness'),

    getPlacements: () =>
      request<{ success: boolean; data: import('../types').CollegePlacementAnalytics }>('/api/college/placements'),

    getIndustry: () =>
      request<{ success: boolean; data: import('../types').CollegeIndustryAnalytics }>('/api/college/industry'),

    getReport: (reportType: string) =>
      request<{ success: boolean; data: import('../types').CollegeReportData }>(`/api/college/reports/${reportType}`)
  },

  // Phase 8: Industry Mentor Feedback API
  feedback: {
    submitFeedback: (payload: {
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
    }) =>
      request<{ message: string; feedback: MentorFeedback; isNew: boolean }>('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    getPendingEvaluations: () =>
      request<CompanyFeedbackManagementData>('/api/feedback/pending'),

    getCompanyEvaluations: () =>
      request<{ feedbacks: MentorFeedback[]; stats: CompanyFeedbackManagementData['stats'] }>('/api/feedback/company'),

    getStudentFeedback: (studentId?: string) =>
      request<StudentFeedbackSummary>(studentId ? `/api/feedback/student/${studentId}` : '/api/feedback/student'),

    getCollegeFeedbackAnalytics: () =>
      request<{ success: boolean; data: CollegeFeedbackAnalytics }>('/api/feedback/college/analytics'),

    getFeedbackById: (id: string) =>
      request<MentorFeedback>(`/api/feedback/${id}`),

    updateFeedback: (id: string, payload: Partial<MentorFeedback>) =>
      request<{ message: string; feedback: MentorFeedback }>(`/api/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),

    deleteFeedback: (id: string) =>
      request<{ message: string }>(`/api/feedback/${id}`, {
        method: 'DELETE'
      })
  },

  // Phase 9: Analytics & Executive Reports API
  analytics: {
    getExecutive: (params?: { dateRange?: string; department?: string; batch?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: ExecutiveKpiData }>(`/api/analytics/executive${q ? `?${q}` : ''}`);
    },

    getSkills: (params?: { dateRange?: string; department?: string; batch?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: SkillDemandSupplyAnalytics }>(`/api/analytics/skills${q ? `?${q}` : ''}`);
    },

    getAssessments: (params?: { dateRange?: string; department?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: import('../types').CollegeAssessmentAnalytics }>(`/api/analytics/assessments${q ? `?${q}` : ''}`);
    },

    getSkillGaps: (params?: { department?: string; batch?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{
        success: boolean;
        data: {
          roles: any[];
          institution_wide_missing_skills: Array<{ skill_name: string; count: number }>;
          institution_wide_weak_skills: Array<{ skill_name: string; count: number }>;
          foundation_support_students_count: number;
          high_readiness_students_count: number;
        };
      }>(`/api/analytics/skill-gaps${q ? `?${q}` : ''}`);
    },

    getRoadmap: (params?: { department?: string; batch?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: RoadmapAnalyticsData }>(`/api/analytics/roadmap${q ? `?${q}` : ''}`);
    },

    getPlacements: (params?: { dateRange?: string; department?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: any }>(`/api/analytics/placements${q ? `?${q}` : ''}`);
    },

    getIndustry: () =>
      request<{ success: boolean; data: import('../types').CollegeIndustryAnalytics }>('/api/analytics/industry'),

    getFeedback: (params?: { dateRange?: string; department?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: any }>(`/api/analytics/feedback${q ? `?${q}` : ''}`);
    },

    getDepartments: () =>
      request<{ success: boolean; data: DepartmentBenchmarkItem[] }>('/api/analytics/departments'),

    getBatches: () =>
      request<{ success: boolean; data: BatchBenchmarkItem[] }>('/api/analytics/batches'),

    getTopPerformers: (params?: { department?: string; batch?: string; search?: string; sortBy?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: TopPerformerItem[] }>(`/api/analytics/top-performers${q ? `?${q}` : ''}`);
    },

    getStudentRadar: (studentId: string) =>
      request<{ success: boolean; data: { radar: CompetencyRadarData; roadmap: any } }>(`/api/analytics/student/${studentId}`),

    getMyRadar: () =>
      request<{ success: boolean; data: { radar: CompetencyRadarData; roadmap: any } }>('/api/analytics/student/me'),

    getReport: (reportType: string, params?: { dateRange?: string; department?: string; batch?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; data: CollegeReportData }>(`/api/analytics/reports/${reportType}${q ? `?${q}` : ''}`);
    },

    getCompanyAnalytics: () =>
      request<{ success: boolean; data: CompanyAnalyticsData }>('/api/analytics/company')
  }
};

