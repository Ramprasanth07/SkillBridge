import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeDashboardData, CollegeActiveTab } from '../../types';
import {
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';

interface CollegeAdminDashboardProps {
  onNavigateTab: (tab: CollegeActiveTab) => void;
}

export const CollegeAdminDashboard: React.FC<CollegeAdminDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<CollegeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.college.getDashboard();
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch institutional dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Loading Institutional Metrics & Cohort Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error || 'Institutional metrics unavailable.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700/60">
                Institutional Executive View
              </span>
              <span className="text-xs text-slate-400">• Real-Time Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {data.institution_name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralized college governance, student skill readiness monitoring, department benchmarking, standardized assessments, and industry placement pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Export Institutional Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Enrolled Students */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{data.total_students}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Average CGPA: <span className="text-white font-bold">{data.average_cgpa.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Card 2: Placement Readiness Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Placement Ready</span>
            <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/60">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-purple-400">{data.placement_readiness_rate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <span className="text-white font-bold">{data.students_placement_ready_count}</span> of {data.total_students} Students
            </div>
          </div>
        </div>

        {/* Card 3: Assessment Completion */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Assessment Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-400">{data.assessment_completion_rate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Avg Score: <span className="text-white font-bold">{data.average_assessment_score}%</span></div>
          </div>
        </div>

        {/* Card 4: Industry & Placements */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Hired & Selected</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/60">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-400">{data.selected_students_count}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <span className="text-white font-bold">{data.shortlisted_students_count}</span> Shortlisted Candidates
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Institutional Readiness Distribution & Placement Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Readiness Distribution Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Skill Readiness Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Categorization based on academic, assessment, and project benchmarks</p>
            </div>
            <button
              onClick={() => onNavigateTab('readiness')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>View Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Job Ready */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Job Ready (Score ≥ 75)
                </span>
                <span className="text-white font-bold">{data.readiness_distribution.job_ready} Students</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(data.readiness_distribution.job_ready / (data.total_students || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* High Potential */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-blue-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  High Potential (Score 60–74)
                </span>
                <span className="text-white font-bold">{data.readiness_distribution.high_potential} Students</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(data.readiness_distribution.high_potential / (data.total_students || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Developing */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Developing (Score 40–59)
                </span>
                <span className="text-white font-bold">{data.readiness_distribution.developing} Students</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(data.readiness_distribution.developing / (data.total_students || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Needs Foundation */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Needs Foundation (Score &lt; 40)
                </span>
                <span className="text-white font-bold">{data.readiness_distribution.needs_foundation} Students</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${(data.readiness_distribution.needs_foundation / (data.total_students || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Placement Pipeline Funnel */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Institutional Placement Funnel</h2>
              <p className="text-xs text-slate-400 mt-0.5">Corporate recruitment flow & candidate stage conversions</p>
            </div>
            <button
              onClick={() => onNavigateTab('placements')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>View Placements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center pt-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] uppercase font-bold text-slate-400">Applications</div>
              <div className="text-lg font-black text-white mt-1">{data.placement_funnel.applied}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Submitted</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] uppercase font-bold text-blue-400">In Review</div>
              <div className="text-lg font-black text-blue-300 mt-1">{data.placement_funnel.under_review}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Screening</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Shortlisted</div>
              <div className="text-lg font-black text-indigo-300 mt-1">{data.placement_funnel.shortlisted}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Interviews</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Selected</div>
              <div className="text-lg font-black text-emerald-300 mt-1">{data.placement_funnel.selected}</div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5">Offers</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Industry Partners: <strong>{data.industry_partners_count}</strong></span>
            </div>
            <div className="text-slate-400">
              Active Postings: <strong className="text-white">{data.active_jobs_count + data.active_internships_count}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Department Summary Benchmark */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Academic Department Performance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comparative academic, readiness, and placement KPIs across branches</p>
          </div>
          <button
            onClick={() => onNavigateTab('departments')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
          >
            <span>All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Students</th>
                <th className="py-2.5 px-3 text-center">Avg CGPA</th>
                <th className="py-2.5 px-3 text-center">Assessment %</th>
                <th className="py-2.5 px-3 text-center">Readiness Rate</th>
                <th className="py-2.5 px-3 text-center">Placed</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data.department_summary.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{dept.department}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">{dept.student_count}</td>
                  <td className="py-3 px-3 text-center font-bold text-white">{dept.average_cgpa.toFixed(2)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                      {dept.assessment_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800">
                      {dept.readiness_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-amber-300 font-bold">{dept.placed_count}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigateTab('departments')}
                      className="text-purple-400 hover:text-purple-300 font-bold text-[11px] underline underline-offset-2"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Recent Placement Activity & Batch Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Placement Activity */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Corporate Placement Activity</h2>
            <button
              onClick={() => onNavigateTab('placements')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold"
            >
              Full Log
            </button>
          </div>

          <div className="space-y-2">
            {data.recent_placement_activity.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/30 text-center text-xs text-slate-400">
                No recent placement activity recorded yet.
              </div>
            ) : (
              data.recent_placement_activity.slice(0, 5).map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setSelectedStudentId(act.student_id)}
                        className="text-xs font-bold text-white hover:text-purple-300 transition-colors truncate"
                      >
                        {act.student_name}
                      </button>
                      <span className="text-[10px] text-slate-400">({act.student_department})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      Applied for <strong className="text-slate-300">{act.opportunity_title}</strong> at {act.company_name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        act.status === 'Selected'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : act.status === 'Shortlisted'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {act.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(act.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Batch Overview */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight">Graduation Batch Breakdown</h2>
            <button
              onClick={() => onNavigateTab('batches')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold"
            >
              Batch Analytics
            </button>
          </div>

          <div className="space-y-2.5">
            {data.batch_summary.map((batch, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{batch.batch} Cohort</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {batch.student_count} Enrolled • Avg CGPA: {batch.average_cgpa.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {batch.readiness_rate}% Ready
                  </span>
                  <button
                    onClick={() => onNavigateTab('batches')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudentId && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};
