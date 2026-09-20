import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentFeedbackSummary, MentorFeedback } from '../../types';
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Building2,
  Briefcase,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface StudentFeedbackViewProps {
  onNavigateToOpportunities?: () => void;
}

const RUBRIC_NAMES: Record<string, { label: string; desc: string }> = {
  technical_competence: {
    label: 'Technical Competence',
    desc: 'System design, code hygiene, frameworks & architectural implementation'
  },
  problem_solving: {
    label: 'Problem Solving & Critical Thinking',
    desc: 'Algorithmic reasoning, troubleshooting speed & analytical approach'
  },
  communication: {
    label: 'Communication & Documentation',
    desc: 'Clarity in updates, technical documentation & active listening'
  },
  teamwork_collaboration: {
    label: 'Teamwork & Collaboration',
    desc: 'Cross-functional alignment, peer code reviews & team synergy'
  },
  professionalism_work_ethic: {
    label: 'Professionalism & Work Ethic',
    desc: 'Reliability, ownership, punctuality & meeting sprint deadlines'
  },
  learning_ability: {
    label: 'Learning Ability & Agility',
    desc: 'Quick adaptation to new libraries, tools & domain knowledge'
  },
  overall_performance: {
    label: 'Overall Workplace Impact',
    desc: 'Holistic project output quality & company value creation'
  }
};

export const StudentFeedbackView: React.FC<StudentFeedbackViewProps> = ({
  onNavigateToOpportunities
}) => {
  const [summary, setSummary] = useState<StudentFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<MentorFeedback | null>(null);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.feedback.getStudentFeedback();
      setSummary(res);
      if (res.feedbacks.length > 0) {
        setSelectedFeedback(res.feedbacks[0]);
      }
    } catch (err: any) {
      console.error('Failed to load student feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-medium">Loading Industry Mentor Evaluations...</span>
      </div>
    );
  }

  const hasEvaluations = summary && summary.total_evaluations > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Evidence</span>
            </span>
            <span className="text-xs text-slate-400">Workplace Competency Scorecard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Industry Mentor Feedback & Evaluations
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-world performance evaluations from company mentors, engineering leads, and internship supervisors.
            These verified reviews complement your skill assessments with authentic workplace evidence.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {!hasEvaluations ? (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Industry Evaluations Yet</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            When you complete an internship or job assignment with an industry partner, your supervisor will submit
            a standardized 7-point rubric evaluation detailing your technical execution, problem solving, and hire recommendation.
          </p>
          <div className="pt-2">
            {onNavigateToOpportunities && (
              <button
                onClick={onNavigateToOpportunities}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Explore Internships & Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Has Evaluations Dashboard */
        <div className="space-y-8">
          {/* Key Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Overall Mentor Rating</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2 flex items-baseline gap-1">
                {summary.average_score.toFixed(1)}
                <span className="text-sm text-slate-500 font-normal">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(summary.average_score)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-medium ml-1">
                  Across {summary.total_evaluations} {summary.total_evaluations === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Hire Recommendation</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-indigo-300 mt-2">
                {summary.hire_recommendation_rate}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Full-time conversion rate from mentors
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Technical Mastery</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-400 mt-2 flex items-baseline gap-1">
                {summary.rubric_breakdown.technical_competence.toFixed(1)}
                <span className="text-sm text-slate-500 font-normal">/ 5.0</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Production architecture & code quality
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Teamwork & Work Ethic</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-purple-300 mt-2 flex items-baseline gap-1">
                {(
                  (summary.rubric_breakdown.teamwork_collaboration +
                    summary.rubric_breakdown.professionalism_work_ethic) /
                  2
                ).toFixed(1)}
                <span className="text-sm text-slate-500 font-normal">/ 5.0</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Collaboration & deliverable ownership
              </div>
            </div>
          </div>

          {/* Industry-Validated Strengths */}
          {summary.industry_validated_strengths && summary.industry_validated_strengths.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Industry-Validated Competencies & Endorsements
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Skills and behaviors explicitly cited with outstanding ratings in employer reviews.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {summary.industry_validated_strengths.map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Point Rubric Average Competency Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Standardized 7-Point Competency Profile</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated benchmark across all completed internship and job supervisor scorecards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(summary.rubric_breakdown).map(([key, rawScore]) => {
                const score = Number(rawScore) || 0;
                const meta = RUBRIC_NAMES[key] || { label: key, desc: '' };
                const pct = (score / 5) * 100;
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-white">{meta.label}</div>
                        <div className="text-[11px] text-slate-400">{meta.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-emerald-400">{score.toFixed(1)}</span>
                        <span className="text-[11px] text-slate-500"> / 5.0</span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 4.5
                            ? 'bg-emerald-500'
                            : score >= 4.0
                            ? 'bg-teal-500'
                            : score >= 3.0
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Detailed Feedback Dossiers */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Company Mentor Evaluations ({summary.feedbacks.length})</span>
            </h3>

            <div className="space-y-6">
              {summary.feedbacks.map((fb) => {
                const isSelected = selectedFeedback?.id === fb.id;
                const recColor =
                  fb.hire_recommendation === 'Recommended'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : fb.hire_recommendation === 'Consider'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                return (
                  <div
                    key={fb.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-md transition-all space-y-6"
                  >
                    {/* Card Top Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-lg text-emerald-400 shadow-sm shrink-0">
                          {fb.company?.logo ? (
                            <img
                              src={fb.company.logo}
                              alt={fb.company.company_name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span>{fb.company?.company_name ? fb.company.company_name.charAt(0) : 'C'}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white">
                              {fb.company?.company_name || 'Industry Partner'}
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${recColor}`}>
                              {fb.hire_recommendation === 'Recommended'
                                ? '✓ Recommended for Hire'
                                : fb.hire_recommendation}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-300 font-medium mt-0.5">
                            {fb.opportunity_title} • {fb.evaluation_period}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Evaluated by <strong className="text-slate-200">{fb.mentor_name}</strong> ({fb.mentor_title})
                          </p>
                        </div>
                      </div>

                      {/* Score Highlight */}
                      <div className="text-left sm:text-right bg-slate-950/80 p-3 rounded-xl border border-slate-850 shrink-0">
                        <div className="text-[11px] text-slate-400">Mentor Score</div>
                        <div className="text-xl font-black text-emerald-400 flex items-center sm:justify-end gap-1">
                          <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                          <span>{fb.average_score.toFixed(1)}</span>
                          <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Rubric Breakdown Grid */}
                    <div>
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Performance Rubric Breakdown
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Technical</div>
                          <div className="text-xs font-bold text-emerald-400 mt-1">{fb.technical_competence}/5</div>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Problem Solving</div>
                          <div className="text-xs font-bold text-emerald-400 mt-1">{fb.problem_solving}/5</div>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Communication</div>
                          <div className="text-xs font-bold text-slate-200 mt-1">{fb.communication}/5</div>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Teamwork</div>
                          <div className="text-xs font-bold text-slate-200 mt-1">{fb.teamwork_collaboration}/5</div>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Work Ethic</div>
                          <div className="text-xs font-bold text-emerald-400 mt-1">{fb.professionalism_work_ethic}/5</div>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Learning</div>
                          <div className="text-xs font-bold text-emerald-400 mt-1">{fb.learning_ability}/5</div>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-medium">Overall</div>
                          <div className="text-xs font-bold text-indigo-300 mt-1">{fb.overall_performance}/5</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Qualitative Evaluation Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Key Strengths & High-Impact Contributions</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{fb.strengths}</p>
                      </div>

                      {/* Areas for Growth */}
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Actionable Growth Advice & Next Steps</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{fb.areas_for_improvement}</p>
                      </div>
                    </div>

                    {/* Mentor Comments Quote */}
                    {fb.mentor_comments && (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 relative">
                        <MessageSquare className="w-4 h-4 text-indigo-400 mb-1" />
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{fb.mentor_comments}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
