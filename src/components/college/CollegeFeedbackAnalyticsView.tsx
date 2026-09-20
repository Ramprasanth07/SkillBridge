import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeFeedbackAnalytics, MentorFeedback } from '../../types';
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  X,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  ChevronRight,
  BookOpen,
  Loader2
} from 'lucide-react';

export const CollegeFeedbackAnalyticsView: React.FC = () => {
  const [data, setData] = useState<CollegeFeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedbackForView, setSelectedFeedbackForView] = useState<MentorFeedback | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.feedback.getCollegeFeedbackAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load college mentor feedback analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-medium">Aggregating Institutional Industry Evaluations...</span>
      </div>
    );
  }

  if (!data || data.total_evaluations === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-3">
        <Award className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Industry Mentor Evaluations Recorded</h3>
        <p className="text-xs text-slate-400">
          As partner companies evaluate students following internships and job placements, institutional analytics,
          competency indexes, and curriculum improvement insights will be aggregated here.
        </p>
      </div>
    );
  }

  const filteredFeedbacks = data.recent_feedbacks.filter(f => {
    const q = searchQuery.toLowerCase();
    return (
      (f.student_name || '').toLowerCase().includes(q) ||
      (f.student_department || '').toLowerCase().includes(q) ||
      (f.company_name || '').toLowerCase().includes(q) ||
      f.mentor_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Feedback Analytics</span>
            </span>
            <span className="text-xs text-slate-400">Industry Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Industry Mentor Performance & Curriculum Analytics
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Consolidated workplace evaluations from employer partners. Benchmark student technical competence,
            soft skills, and work ethic to drive curriculum modernization and placement readiness.
          </p>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Completed Evaluations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {data.total_evaluations}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all academic departments</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>College-Wide Mentor Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 flex items-baseline gap-1">
            {data.average_overall_score.toFixed(1)}
            <span className="text-sm text-slate-500 font-normal">/ 5.0</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Institutional performance index</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Technical Mastery Index</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 mt-2 flex items-baseline gap-1">
            {data.technical_competence_avg.toFixed(1)}
            <span className="text-sm text-slate-500 font-normal">/ 5.0</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Problem solving & architecture score</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Placement Hire Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-300 mt-2">
            {data.hire_recommendation_rate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Recommended for full-time offer</div>
        </div>
      </div>

      {/* Grid: Rubrics Benchmark + Hire Recommendation Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rubric Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Institutional Competency Rubric Benchmark</span>
              </h3>
              <p className="text-xs text-slate-400">
                Average ratings given by industry mentors across all evaluated cohorts.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Technical Competence', score: data.rubric_averages.technical_competence, desc: 'Frameworks, clean architecture, DevOps' },
              { label: 'Problem Solving & Critical Thinking', score: data.rubric_averages.problem_solving, desc: 'Algorithmic efficiency & debugging speed' },
              { label: 'Communication & Documentation', score: data.rubric_averages.communication, desc: 'Technical specifications, standup clarity' },
              { label: 'Teamwork & Collaboration', score: data.rubric_averages.teamwork_collaboration, desc: 'Cross-functional cooperation & code reviews' },
              { label: 'Professionalism & Work Ethic', score: data.rubric_averages.professionalism_work_ethic, desc: 'Deliverable accountability & punctuality' },
              { label: 'Learning Ability & Agility', score: data.rubric_averages.learning_ability, desc: 'Rapid framework onboarding & research' },
              { label: 'Overall Workplace Impact', score: data.rubric_averages.overall_performance, desc: 'Holistic business value delivery' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-slate-500 ml-2 hidden sm:inline text-[11px]">— {item.desc}</span>
                  </div>
                  <div className="font-bold text-emerald-400 text-sm">
                    {item.score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(item.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Distribution (1 col) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Hire Conversion Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Distribution of mentor hiring recommendations across all completed internships.
            </p>

            <div className="space-y-4 mt-6">
              {/* Recommended */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">Recommended for Full-Time Hire</span>
                  <span className="font-extrabold text-emerald-400">
                    {data.recommendation_distribution.recommended_percentage}% ({data.recommendation_distribution.recommended_count})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${data.recommendation_distribution.recommended_percentage}%` }}
                  />
                </div>
              </div>

              {/* Consider */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">Consider with Targeted Training</span>
                  <span className="font-extrabold text-amber-400">
                    {data.recommendation_distribution.consider_percentage}% ({data.recommendation_distribution.consider_count})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${data.recommendation_distribution.consider_percentage}%` }}
                  />
                </div>
              </div>

              {/* Not Recommended */}
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300">Needs Foundation Work</span>
                  <span className="font-extrabold text-rose-400">
                    {data.recommendation_distribution.not_recommended_percentage}% ({data.recommendation_distribution.not_recommended_count})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${data.recommendation_distribution.not_recommended_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>High conversion reflects robust alignment between coursework and employer tech stacks.</span>
          </div>
        </div>
      </div>

      {/* Curriculum Insights & Common Improvement Areas */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white">Curriculum Modernization & Skill Gap Insights</h3>
            <p className="text-xs text-slate-400">
              Aggregated from industry mentor feedback on recurring development areas among students.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {data.common_improvement_areas.map((area, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 hover:border-slate-750 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{area.category}</span>
                </div>
                <div className="text-[11px] text-amber-400/90 font-medium mt-1">
                  Cited in ~{Math.round((area.frequency / data.total_evaluations) * 100)}% of mentor scorecards
                </div>
                <div className="space-y-1 mt-3">
                  {area.examples.map((ex, i) => (
                    <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 text-[11px] text-indigo-300 font-medium flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Recommended for Lab Modules</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top-Rated Students Leaderboard */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Top-Rated Students by Industry Mentors</span>
            </h3>
            <p className="text-xs text-slate-400">
              High-performing candidates with exemplary scores across industry internships.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Partner Company</th>
                <th className="p-3 text-center">Mentor Score</th>
                <th className="p-3">Key Validated Strength</th>
                <th className="p-3 text-right">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.top_rated_students.map((st) => (
                <tr key={st.student_id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="p-3 font-semibold text-white">{st.student_name}</td>
                  <td className="p-3 text-slate-400">{st.department}</td>
                  <td className="p-3 text-indigo-300 font-medium">{st.latest_company}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      <Star className="w-3 h-3 fill-emerald-400" />
                      <span>{st.average_score.toFixed(1)}</span>
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-slate-300">{st.key_strength}</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {st.hire_recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Evaluations Table with Search */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Recent Industry Mentor Evaluation Feed</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete evaluation dossiers and qualitative notes from corporate supervisors.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, company, mentor..."
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFeedbacks.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">No matching evaluations found.</div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-4 bg-slate-950/70 border border-slate-850 hover:border-slate-750 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{fb.student_name}</h4>
                    <span className="text-xs text-slate-400">• {fb.student_department}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {fb.company_name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{fb.opportunity_title}</span>
                    <span>•</span>
                    <span>Mentor: {fb.mentor_name} ({fb.mentor_title})</span>
                    <span>•</span>
                    <span>{fb.evaluation_period}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>{fb.average_score.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{fb.hire_recommendation}</div>
                  </div>

                  <button
                    onClick={() => setSelectedFeedbackForView(fb)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
                    title="View Evaluation Dossier"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dossier Detail Modal */}
      {selectedFeedbackForView && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Mentor Evaluation Dossier</h3>
                <p className="text-xs text-slate-400">
                  {selectedFeedbackForView.student_name} • {selectedFeedbackForView.company_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedbackForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-850">
                <div>
                  <div className="text-[11px] text-slate-400">Overall Rating</div>
                  <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                    <span>{selectedFeedbackForView.average_score.toFixed(1)} / 5.0</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {selectedFeedbackForView.hire_recommendation}
                </span>
              </div>

              {/* Rubric grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Technical Competence</span>
                  <span className="font-bold text-white">{selectedFeedbackForView.technical_competence}/5</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Problem Solving</span>
                  <span className="font-bold text-white">{selectedFeedbackForView.problem_solving}/5</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Communication</span>
                  <span className="font-bold text-white">{selectedFeedbackForView.communication}/5</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Teamwork & Collaboration</span>
                  <span className="font-bold text-white">{selectedFeedbackForView.teamwork_collaboration}/5</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Work Ethic & Ownership</span>
                  <span className="font-bold text-white">{selectedFeedbackForView.professionalism_work_ethic}/5</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Learning Agility</span>
                  <span className="font-bold text-white">{selectedFeedbackForView.learning_ability}/5</span>
                </div>
              </div>

              {/* Strengths & Improvement */}
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                  <div className="font-semibold text-emerald-400">Validated Strengths</div>
                  <p className="text-slate-300 leading-relaxed">{selectedFeedbackForView.strengths}</p>
                </div>

                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                  <div className="font-semibold text-amber-400">Areas for Growth & Skill Gaps</div>
                  <p className="text-slate-300 leading-relaxed">{selectedFeedbackForView.areas_for_improvement}</p>
                </div>

                {selectedFeedbackForView.mentor_comments && (
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                    <div className="font-semibold text-slate-200">Mentor Remarks</div>
                    <p className="text-slate-400 italic">"{selectedFeedbackForView.mentor_comments}"</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Evaluated by {selectedFeedbackForView.mentor_name} ({selectedFeedbackForView.mentor_title})
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
