import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeAssessmentAnalytics } from '../../types';
import {
  CheckCircle2,
  Users,
  Award,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

export const AssessmentAnalytics: React.FC = () => {
  const [data, setData] = useState<CollegeAssessmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const res = await api.college.getAssessments();
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load institutional assessment analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Compiling Standardized Assessment Results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error || 'Data unavailable.'}</p>
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
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Standardized Assessment Analytics</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            {data.total_attempts} Total Attempts
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Objective, verified standardized testing metrics across core engineering competencies, score distributions, and department pass rates.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Tests Available</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.total_assessments_available}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{data.unique_students_attempted} Unique Students Tested</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Participation Rate</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">{data.completion_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Of Enrolled Student Base</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Institutional Average</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">{data.overall_average_score}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across All Completed Tests</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Overall Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{data.overall_pass_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Passing Standard (≥ 70%)</div>
        </div>
      </div>

      {/* Row 2: Score Distribution & Skill Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Institutional Score Bracket Distribution</h2>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-300">80% – 100% (Distinction / Master)</span>
                <span className="text-white font-bold">{data.score_distribution['80_100']} Attempts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(data.score_distribution['80_100'] / (data.total_attempts || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-blue-300">60% – 79% (Competent / Advanced)</span>
                <span className="text-white font-bold">{data.score_distribution['60_79']} Attempts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(data.score_distribution['60_79'] / (data.total_attempts || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-300">40% – 59% (Developing / Intermediate)</span>
                <span className="text-white font-bold">{data.score_distribution['40_59']} Attempts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(data.score_distribution['40_59'] / (data.total_attempts || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-rose-300">0% – 39% (Foundational / Re-test Required)</span>
                <span className="text-white font-bold">{data.score_distribution['0_39']} Attempts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${(data.score_distribution['0_39'] / (data.total_attempts || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Levels Awarded */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Verified Skill Badges Awarded</h2>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-center">
              <Award className="w-5 h-5 text-purple-400 mx-auto" />
              <div className="text-xs font-bold text-purple-300 mt-1">Master Tier</div>
              <div className="text-xl font-black text-white mt-0.5">{data.skill_level_distribution.Master}</div>
              <div className="text-[10px] text-slate-400">Score &gt; 85%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-center">
              <Award className="w-5 h-5 text-blue-400 mx-auto" />
              <div className="text-xs font-bold text-blue-300 mt-1">Advanced Tier</div>
              <div className="text-xl font-black text-white mt-0.5">{data.skill_level_distribution.Advanced}</div>
              <div className="text-[10px] text-slate-400">Score 70%–85%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="text-xs font-bold text-amber-300 mt-1">Intermediate</div>
              <div className="text-xl font-black text-white mt-0.5">{data.skill_level_distribution.Intermediate}</div>
              <div className="text-[10px] text-slate-400">Score 50%–69%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <Award className="w-5 h-5 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-300 mt-1">Beginner</div>
              <div className="text-xl font-black text-white mt-0.5">{data.skill_level_distribution.Beginner}</div>
              <div className="text-[10px] text-slate-500">Score &lt; 50%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Assessment Breakdown Cards */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight">Standardized Assessment Benchmark Matrix</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {data.assessments_breakdown.map((ass) => (
            <div key={ass.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-white tracking-tight truncate">{ass.title}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    {ass.difficulty}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Category: <span className="capitalize text-slate-300">{ass.category}</span> • Pass Mark: {ass.passing_percentage}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Attempts</div>
                  <div className="text-xs font-bold text-white mt-0.5">{ass.total_attempts}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Pass Rate</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{ass.pass_rate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Avg Score</div>
                  <div className="text-xs font-bold text-purple-400 mt-0.5">{ass.average_score}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Department Performance Comparison */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Department Assessment Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Total Attempts</th>
                <th className="py-2.5 px-3 text-center">Average Score</th>
                <th className="py-2.5 px-3 text-center">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data.department_performance.map((dp, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-white">{dp.department}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{dp.total_attempts}</td>
                  <td className="py-3 px-3 text-center font-bold text-white">{dp.average_score}%</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800">
                      {dp.pass_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
