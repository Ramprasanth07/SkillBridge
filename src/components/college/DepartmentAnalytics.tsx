import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeDepartmentItem } from '../../types';
import {
  Building2,
  Users,
  GraduationCap,
  Target,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Award,
  ArrowRight
} from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';

export const DepartmentAnalytics: React.FC = () => {
  const [departments, setDepartments] = useState<CollegeDepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoading(true);
        const res = await api.college.getDepartments();
        setDepartments(res.data);
        if (res.data.length > 0) {
          setExpandedDept(res.data[0].department);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch department analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Computing Department Level Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error}</p>
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Academic Department Analytics</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            {departments.length} Departments
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed departmental comparisons, skill readiness indices, standardized assessment participation rates, and student cohort rosters.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const isExpanded = expandedDept === dept.department;
          return (
            <div
              key={dept.department}
              className={`rounded-2xl border transition-all p-5 shadow-xs ${
                isExpanded
                  ? 'bg-slate-900 border-purple-600/60 ring-1 ring-purple-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/80 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">{dept.department}</h2>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {dept.student_count} Students Enrolled • Avg CGPA: <strong className="text-white">{dept.average_cgpa.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedDept(isExpanded ? null : dept.department)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Department Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Readiness</div>
                  <div className="text-base font-extrabold text-purple-400 mt-0.5">{dept.placement_readiness_rate}%</div>
                  <div className="text-[10px] text-slate-500">{dept.job_ready_count} Job Ready</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Assessments</div>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5">{dept.assessment_completion_rate}%</div>
                  <div className="text-[10px] text-slate-500">{dept.average_assessment_score}% Avg</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Selections</div>
                  <div className="text-base font-extrabold text-amber-400 mt-0.5">{dept.selected_count}</div>
                  <div className="text-[10px] text-slate-500">{dept.shortlisted_count} Shortlisted</div>
                </div>
              </div>

              {/* Department Readiness Tier Breakdown Bar */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Cohort Readiness Distribution</span>
                  <span className="text-slate-300">
                    {dept.job_ready_count} Ready / {dept.high_potential_count} High Pot / {dept.developing_count} Dev / {dept.needs_foundation_count} Found
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full"
                    title={`Job Ready: ${dept.job_ready_count}`}
                    style={{ width: `${(dept.job_ready_count / (dept.student_count || 1)) * 100}%` }}
                  />
                  <div
                    className="bg-blue-500 h-full"
                    title={`High Potential: ${dept.high_potential_count}`}
                    style={{ width: `${(dept.high_potential_count / (dept.student_count || 1)) * 100}%` }}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    title={`Developing: ${dept.developing_count}`}
                    style={{ width: `${(dept.developing_count / (dept.student_count || 1)) * 100}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    title={`Needs Foundation: ${dept.needs_foundation_count}`}
                    style={{ width: `${(dept.needs_foundation_count / (dept.student_count || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Top Skills */}
              <div className="mt-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Core Department Technical Stack
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dept.top_skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expandable Student List */}
              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Enrolled Students in {dept.department}</span>
                    <span className="text-slate-400 text-[11px] font-normal">{dept.students.length} Total</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {dept.students.map((st) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={st.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                            alt={st.full_name}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <button
                              onClick={() => setSelectedStudentId(st.id)}
                              className="font-bold text-white hover:text-purple-300 text-left truncate block"
                            >
                              {st.full_name}
                            </button>
                            <span className="text-[10px] text-slate-400">CGPA: {st.cgpa ? st.cgpa.toFixed(2) : 'N/A'} • {st.year_of_study}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${st.readiness.badge_color}`}>
                            {st.readiness.tier} ({st.readiness.total_score})
                          </span>
                          <button
                            onClick={() => setSelectedStudentId(st.id)}
                            className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
                          >
                            Dossier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
