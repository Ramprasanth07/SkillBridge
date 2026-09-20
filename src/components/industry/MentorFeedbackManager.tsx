import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MentorFeedback, CompanyFeedbackManagementData } from '../../types';
import {
  Award,
  Star,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  Briefcase,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileEdit,
  Trash2,
  X,
  AlertCircle,
  ThumbsUp,
  HelpCircle,
  Building2,
  Sparkles,
  Eye,
  Loader2
} from 'lucide-react';

interface MentorFeedbackManagerProps {
  onRefreshParentStats?: () => void;
  preselectedCandidate?: {
    student_id: string;
    student_name: string;
    opportunity_id: string;
    opportunity_title: string;
    opportunity_type?: 'job' | 'internship';
  } | null;
  onClearPreselected?: () => void;
}

const RUBRIC_CRITERIA = [
  {
    key: 'technical_competence' as const,
    label: 'Technical Competence',
    description: 'Mastery of tools, language fluency, architecture understanding & coding standards.'
  },
  {
    key: 'problem_solving' as const,
    label: 'Problem Solving & Critical Thinking',
    description: 'Analytical troubleshooting, algorithmic reasoning & handling edge cases.'
  },
  {
    key: 'communication' as const,
    label: 'Communication & Documentation',
    description: 'Clarity in standups, technical documentation, PR descriptions & verbal updates.'
  },
  {
    key: 'teamwork_collaboration' as const,
    label: 'Teamwork & Collaboration',
    description: 'Cross-functional cooperation, receptiveness to peer code reviews & team spirit.'
  },
  {
    key: 'professionalism_work_ethic' as const,
    label: 'Professionalism & Work Ethic',
    description: 'Punctuality, ownership of deliverables, meeting sprint deadlines & accountability.'
  },
  {
    key: 'learning_ability' as const,
    label: 'Learning Ability & Agility',
    description: 'Speed of picking up new frameworks, grasping domain logic & proactive initiative.'
  },
  {
    key: 'overall_performance' as const,
    label: 'Overall Performance & Impact',
    description: 'Holistic assessment of project contribution, output quality & company value.'
  }
];

export const MentorFeedbackManager: React.FC<MentorFeedbackManagerProps> = ({
  onRefreshParentStats,
  preselectedCandidate,
  onClearPreselected
}) => {
  const [data, setData] = useState<CompanyFeedbackManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'Recommended' | 'Consider' | 'Not Recommended'>('all');

  // Modal States
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFeedbackForView, setSelectedFeedbackForView] = useState<MentorFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [feedbackForm, setFeedbackForm] = useState({
    id: undefined as string | undefined,
    student_id: '',
    student_name: '',
    student_department: '',
    opportunity_id: '',
    opportunity_title: '',
    opportunity_type: 'internship' as 'job' | 'internship',
    mentor_name: '',
    mentor_title: 'Senior Engineering Mentor',
    mentor_email: '',
    evaluation_period: 'Summer 2026 Internship',
    technical_competence: 4,
    problem_solving: 4,
    communication: 4,
    teamwork_collaboration: 4,
    professionalism_work_ethic: 5,
    learning_ability: 5,
    overall_performance: 4,
    strengths: '',
    areas_for_improvement: '',
    mentor_comments: '',
    hire_recommendation: 'Recommended' as 'Recommended' | 'Consider' | 'Not Recommended'
  });

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const res = await api.feedback.getPendingEvaluations();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load company evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  // If opened with a preselected candidate from application pipeline
  useEffect(() => {
    if (preselectedCandidate) {
      openEvaluationModal({
        student_id: preselectedCandidate.student_id,
        student_name: preselectedCandidate.student_name,
        opportunity_id: preselectedCandidate.opportunity_id,
        opportunity_title: preselectedCandidate.opportunity_title,
        opportunity_type: preselectedCandidate.opportunity_type || 'internship'
      });
      if (onClearPreselected) {
        onClearPreselected();
      }
    }
  }, [preselectedCandidate]);

  const openEvaluationModal = (target: {
    id?: string;
    student_id: string;
    student_name: string;
    student_department?: string;
    opportunity_id: string;
    opportunity_title: string;
    opportunity_type?: 'job' | 'internship';
    mentor_name?: string;
    mentor_title?: string;
    mentor_email?: string;
    evaluation_period?: string;
    technical_competence?: number;
    problem_solving?: number;
    communication?: number;
    teamwork_collaboration?: number;
    professionalism_work_ethic?: number;
    learning_ability?: number;
    overall_performance?: number;
    strengths?: string;
    areas_for_improvement?: string;
    mentor_comments?: string;
    hire_recommendation?: 'Recommended' | 'Consider' | 'Not Recommended';
  }) => {
    setFormError(null);
    setFeedbackForm({
      id: target.id,
      student_id: target.student_id,
      student_name: target.student_name,
      student_department: target.student_department || 'Computer Science',
      opportunity_id: target.opportunity_id,
      opportunity_title: target.opportunity_title,
      opportunity_type: target.opportunity_type || 'internship',
      mentor_name: target.mentor_name || 'Marcus Sterling',
      mentor_title: target.mentor_title || 'Lead Engineering Mentor',
      mentor_email: target.mentor_email || '',
      evaluation_period: target.evaluation_period || 'Summer 2026 Internship',
      technical_competence: target.technical_competence || 4,
      problem_solving: target.problem_solving || 4,
      communication: target.communication || 4,
      teamwork_collaboration: target.teamwork_collaboration || 4,
      professionalism_work_ethic: target.professionalism_work_ethic || 5,
      learning_ability: target.learning_ability || 5,
      overall_performance: target.overall_performance || 4,
      strengths: target.strengths || '',
      areas_for_improvement: target.areas_for_improvement || '',
      mentor_comments: target.mentor_comments || '',
      hire_recommendation: target.hire_recommendation || 'Recommended'
    });
    setIsEvaluationModalOpen(true);
  };

  const calculateCurrentAverage = () => {
    const sum =
      Number(feedbackForm.technical_competence) +
      Number(feedbackForm.problem_solving) +
      Number(feedbackForm.communication) +
      Number(feedbackForm.teamwork_collaboration) +
      Number(feedbackForm.professionalism_work_ethic) +
      Number(feedbackForm.learning_ability) +
      Number(feedbackForm.overall_performance);
    return Math.round((sum / 7) * 10) / 10;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!feedbackForm.mentor_name.trim()) {
      setFormError('Please provide the evaluating Mentor Name.');
      return;
    }

    if (!feedbackForm.strengths.trim() || feedbackForm.strengths.trim().length < 5) {
      setFormError('Please detail the key strengths demonstrated by the candidate.');
      return;
    }

    if (!feedbackForm.areas_for_improvement.trim() || feedbackForm.areas_for_improvement.trim().length < 5) {
      setFormError('Please specify areas for skill growth & development.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.feedback.submitFeedback(feedbackForm);
      setActionSuccess(res.message || 'Mentor evaluation successfully submitted!');
      setIsEvaluationModalOpen(false);
      await loadEvaluations();
      if (onRefreshParentStats) {
        onRefreshParentStats();
      }
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit evaluation. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this evaluation record?')) return;
    try {
      await api.feedback.deleteFeedback(id);
      setActionSuccess('Evaluation deleted successfully.');
      setIsViewModalOpen(false);
      await loadEvaluations();
      if (onRefreshParentStats) {
        onRefreshParentStats();
      }
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete evaluation');
    }
  };

  // Filtered lists
  const filteredPending = (data?.pending || []).filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.student_name.toLowerCase().includes(q) ||
      item.opportunity_title.toLowerCase().includes(q) ||
      item.student_department.toLowerCase().includes(q)
    );
  });

  const filteredCompleted = (data?.completed || []).filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.student_name || '').toLowerCase().includes(q) ||
      (item.opportunity_title || '').toLowerCase().includes(q) ||
      item.mentor_name.toLowerCase().includes(q) ||
      item.strengths.toLowerCase().includes(q);

    const matchesRec =
      recommendationFilter === 'all' || item.hire_recommendation === recommendationFilter;

    return matchesSearch && matchesRec;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Post-Internship & Employment Reviews</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Industry Mentor Feedback Portal</h1>
          <p className="text-sm text-slate-400">
            Evaluate candidate performance across standardized industry rubrics, validate student competencies, and provide actionable feedback.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Interns & Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {data?.stats.total_candidates || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all posted openings</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Pending Evaluation</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-2">
            {data?.stats.pending_count || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting mentor scorecard</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Average Mentor Rating</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 flex items-baseline gap-1">
            {data?.stats.average_score ? data.stats.average_score.toFixed(1) : '—'}
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {data?.stats.completed_count || 0} completed evaluations
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-400">Hire Recommendation Rate</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-2">
            {data?.stats.hire_recommendation_rate || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Recommended for full-time conversion</div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeSubTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Reviews ({data?.pending.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('completed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeSubTab === 'completed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed Scorecards ({data?.completed.length || 0})</span>
            </button>
          </div>

          {/* Search and filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, role, skill..."
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>

            {activeSubTab === 'completed' && (
              <select
                value={recommendationFilter}
                onChange={(e: any) => setRecommendationFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Recommendations</option>
                <option value="Recommended">Recommended</option>
                <option value="Consider">Consider</option>
                <option value="Not Recommended">Not Recommended</option>
              </select>
            )}
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs">Loading mentor evaluations...</span>
          </div>
        ) : activeSubTab === 'pending' ? (
          // PENDING EVALUATIONS TABLE / CARDS
          filteredPending.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mx-auto" />
              <div className="text-sm font-medium text-slate-200">All Candidate Evaluations Complete!</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No outstanding post-internship evaluations at this time. As new candidates join or conclude their programs, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPending.map((item) => (
                <div
                  key={item.application_id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.student_photo}
                        alt={item.student_name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700 bg-slate-800"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{item.student_name}</h4>
                        <p className="text-xs text-slate-400">{item.student_department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                            {item.opportunity_title}
                          </span>
                          <span className="text-[11px] text-slate-500 uppercase font-mono">
                            {item.opportunity_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Evaluation Pending
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Status: <strong className="text-slate-200">{item.application_status}</strong>
                    </span>
                    <button
                      onClick={() =>
                        openEvaluationModal({
                          student_id: item.student_id,
                          student_name: item.student_name,
                          student_department: item.student_department,
                          opportunity_id: item.opportunity_id,
                          opportunity_title: item.opportunity_title,
                          opportunity_type: item.opportunity_type
                        })
                      }
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Submit Evaluation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // COMPLETED EVALUATIONS
          filteredCompleted.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-200">No evaluations found</div>
              <p className="text-xs text-slate-500">
                {searchQuery || recommendationFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Completed scorecards will appear here once mentors evaluate candidates.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCompleted.map((feedback) => {
                const recColor =
                  feedback.hire_recommendation === 'Recommended'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : feedback.hire_recommendation === 'Consider'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                return (
                  <div
                    key={feedback.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-white">
                            {feedback.student_name || 'Student Candidate'}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${recColor}`}>
                            {feedback.hire_recommendation}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>{feedback.student_department}</span>
                          <span>•</span>
                          <span className="text-indigo-300">{feedback.opportunity_title}</span>
                          <span>•</span>
                          <span>{feedback.evaluation_period}</span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Scorecard Average</div>
                          <div className="text-lg font-bold text-emerald-400 flex items-center justify-end gap-1">
                            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                            <span>{feedback.average_score.toFixed(1)}</span>
                            <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedFeedbackForView(feedback);
                              setIsViewModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
                            title="View Full Evaluation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              openEvaluationModal({
                                id: feedback.id,
                                student_id: feedback.student_id,
                                student_name: feedback.student_name || 'Candidate',
                                student_department: feedback.student_department,
                                opportunity_id: feedback.opportunity_id,
                                opportunity_title: feedback.opportunity_title || 'Role',
                                opportunity_type: feedback.opportunity_type,
                                mentor_name: feedback.mentor_name,
                                mentor_title: feedback.mentor_title,
                                mentor_email: feedback.mentor_email,
                                evaluation_period: feedback.evaluation_period,
                                technical_competence: feedback.technical_competence,
                                problem_solving: feedback.problem_solving,
                                communication: feedback.communication,
                                teamwork_collaboration: feedback.teamwork_collaboration,
                                professionalism_work_ethic: feedback.professionalism_work_ethic,
                                learning_ability: feedback.learning_ability,
                                overall_performance: feedback.overall_performance,
                                strengths: feedback.strengths,
                                areas_for_improvement: feedback.areas_for_improvement,
                                mentor_comments: feedback.mentor_comments,
                                hire_recommendation: feedback.hire_recommendation
                              })
                            }
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
                            title="Edit Evaluation"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Rubrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-850">
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Technical</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{feedback.technical_competence}/5</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Problem Solving</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{feedback.problem_solving}/5</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Communication</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{feedback.communication}/5</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Teamwork</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{feedback.teamwork_collaboration}/5</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Work Ethic</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{feedback.professionalism_work_ethic}/5</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Learning Agility</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{feedback.learning_ability}/5</div>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Overall Impact</div>
                        <div className="text-xs font-bold text-indigo-300 mt-0.5">{feedback.overall_performance}/5</div>
                      </div>
                    </div>

                    {/* Qualitative Notes Preview */}
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850/80 text-xs space-y-1.5">
                      <div className="text-slate-300 font-medium">
                        <span className="text-emerald-400 font-semibold">Strengths: </span>
                        {feedback.strengths}
                      </div>
                      {feedback.mentor_comments && (
                        <div className="text-slate-400 italic">
                          "{feedback.mentor_comments}"
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                        <span>Evaluated by {feedback.mentor_name} ({feedback.mentor_title})</span>
                        <span>{new Date(feedback.updated_at || feedback.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* EVALUATION SUBMISSION MODAL */}
      {isEvaluationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {feedbackForm.id ? 'Edit Mentor Evaluation' : 'Submit Industry Mentor Evaluation'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluating candidate <strong className="text-slate-200">{feedbackForm.student_name}</strong> for {feedbackForm.opportunity_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEvaluationModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Mentor & Period Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/70 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mentor Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={feedbackForm.mentor_name}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, mentor_name: e.target.value })}
                    placeholder="e.g. Marcus Sterling"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mentor Title / Role
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.mentor_title}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, mentor_title: e.target.value })}
                    placeholder="e.g. Principal Architect"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Evaluation Period <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={feedbackForm.evaluation_period}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, evaluation_period: e.target.value })}
                    placeholder="e.g. Summer 2026 Internship"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Rubric Evaluation Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>7-Point Industry Rubric Scorecard (1 to 5)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Rate the student candidate across each competency dimension.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    Average: {calculateCurrentAverage()} / 5.0
                  </div>
                </div>

                <div className="space-y-3">
                  {RUBRIC_CRITERIA.map((criterion) => {
                    const currentVal = (feedbackForm as any)[criterion.key] as number;
                    return (
                      <div
                        key={criterion.key}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-750 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="max-w-md">
                          <div className="text-xs font-semibold text-white">{criterion.label}</div>
                          <div className="text-[11px] text-slate-400">{criterion.description}</div>
                        </div>

                        {/* 1 to 5 buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = currentVal === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setFeedbackForm({
                                    ...feedbackForm,
                                    [criterion.key]: val
                                  })
                                }
                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                                  isSelected
                                    ? val >= 4
                                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                      : val === 3
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                      : 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                                }`}
                              >
                                <span>{val}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Feedback Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Candidate Strengths & Core Contributions <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={feedbackForm.strengths}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
                    placeholder="Highlight specific technical skills, architectural accomplishments, and commendable soft skills..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Areas for Growth & Skill Gaps <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={feedbackForm.areas_for_improvement}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, areas_for_improvement: e.target.value })}
                    placeholder="Identify domains, tooling, or engineering practices the candidate should focus on before taking on full-time engineering responsibilities..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Additional Mentor Comments & Personal Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackForm.mentor_comments}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, mentor_comments: e.target.value })}
                    placeholder="Provide a final qualitative remark or advice for the student's career trajectory..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Hire Recommendation Selector */}
                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Overall Hire / Full-Time Conversion Recommendation <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        feedbackForm.hire_recommendation === 'Recommended'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hire_recommendation"
                        checked={feedbackForm.hire_recommendation === 'Recommended'}
                        onChange={() => setFeedbackForm({ ...feedbackForm, hire_recommendation: 'Recommended' })}
                        className="text-emerald-500"
                      />
                      <span className="text-xs">Recommended for Hire</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        feedbackForm.hire_recommendation === 'Consider'
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hire_recommendation"
                        checked={feedbackForm.hire_recommendation === 'Consider'}
                        onChange={() => setFeedbackForm({ ...feedbackForm, hire_recommendation: 'Consider' })}
                        className="text-amber-500"
                      />
                      <span className="text-xs">Consider with Growth</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        feedbackForm.hire_recommendation === 'Not Recommended'
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hire_recommendation"
                        checked={feedbackForm.hire_recommendation === 'Not Recommended'}
                        onChange={() => setFeedbackForm({ ...feedbackForm, hire_recommendation: 'Not Recommended' })}
                        className="text-rose-500"
                      />
                      <span className="text-xs">Not Recommended</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Scorecard...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EVALUATION DETAILS MODAL */}
      {isViewModalOpen && selectedFeedbackForView && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Mentor Evaluation Dossier</h3>
                <p className="text-xs text-slate-400">
                  {selectedFeedbackForView.student_name} • {selectedFeedbackForView.opportunity_title}
                </p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Score header */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-850">
                <div>
                  <div className="text-[11px] text-slate-400">Overall Mentor Rating</div>
                  <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                    <span>{selectedFeedbackForView.average_score.toFixed(1)} / 5.0</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedFeedbackForView.hire_recommendation === 'Recommended'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedFeedbackForView.hire_recommendation === 'Consider'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {selectedFeedbackForView.hire_recommendation}
                </span>
              </div>

              {/* Rubric matrix breakdown */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-2">Competency Rubric Scores</h4>
                <div className="space-y-2">
                  {RUBRIC_CRITERIA.map((crit) => {
                    const score = (selectedFeedbackForView as any)[crit.key] as number;
                    return (
                      <div
                        key={crit.key}
                        className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-850"
                      >
                        <span className="text-slate-300 font-medium">{crit.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-white w-6 text-right">{score}/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Improvement */}
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                  <div className="font-semibold text-emerald-400">Validated Key Strengths</div>
                  <p className="text-slate-300">{selectedFeedbackForView.strengths}</p>
                </div>

                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                  <div className="font-semibold text-amber-400">Areas for Growth & Skill Gaps</div>
                  <p className="text-slate-300">{selectedFeedbackForView.areas_for_improvement}</p>
                </div>

                {selectedFeedbackForView.mentor_comments && (
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                    <div className="font-semibold text-slate-200">Mentor Remarks</div>
                    <p className="text-slate-400 italic">"{selectedFeedbackForView.mentor_comments}"</p>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Evaluator: {selectedFeedbackForView.mentor_name} ({selectedFeedbackForView.mentor_title})
                </span>
                <span>{selectedFeedbackForView.evaluation_period}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
