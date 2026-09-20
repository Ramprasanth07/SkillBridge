import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeSkillReadinessAnalytics } from '../../types';
import {
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react';

export const SkillReadinessAnalytics: React.FC = () => {
  const [data, setData] = useState<CollegeSkillReadinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        setLoading(true);
        const res = await api.college.getReadiness();
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch institutional skill readiness analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchReadiness();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Analyzing Institutional Competencies vs Market Demand...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error || 'Skill readiness data unavailable.'}</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Institutional Skill Readiness & Market Gap</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              {data.overall_skill_readiness_percentage}% Overall Readiness
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven comparison between active student skill proficiencies and current corporate market demand across active job postings.
          </p>
        </div>
      </div>

      {/* Row 1: Institutional Gap Analysis (Market Demand vs Student Supply) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Most Critical Institutional Skill Gaps</h2>
            <p className="text-xs text-slate-400 mt-0.5">High industry demand with low verified student supply</p>
          </div>
          <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-lg">
            High Priority Intervention
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {data.most_frequently_missing_skills.map((gap, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{gap.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {gap.gap_percentage}% Gap
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Industry Job Demand:</span>
                  <strong className="text-purple-300">{gap.demand_count} Postings</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Student Supply:</span>
                  <strong className="text-emerald-300">{gap.student_supply_count} Students</strong>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${gap.gap_percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Top Student Skills & Industry Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Common Student Skills */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Most Common Student Competencies</h2>

          <div className="space-y-3">
            {data.most_common_student_skills.slice(0, 6).map((sk, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {sk.name} <span className="text-[10px] text-slate-500">({sk.category})</span>
                  </span>
                  <span className="text-white font-bold">{sk.count} Students ({sk.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${sk.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Demanded Skills */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Industry Required Skills in Postings</h2>

          <div className="space-y-3">
            {data.industry_demanded_skills.slice(0, 6).map((sk, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {sk.name}
                  </span>
                  <span className="text-white font-bold">{sk.required_count} Postings ({sk.percentage_of_postings}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${sk.percentage_of_postings}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Strongest vs Weakest Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strongest Skills */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Top Advanced Technical Proficiencies</h2>
          </div>

          <div className="space-y-2">
            {data.strongest_skills.slice(0, 5).map((sk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{sk.name}</span>
                <span className="text-xs font-bold text-emerald-400">{sk.advanced_count} Advanced ({sk.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest Skills */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Skills Needing Foundation Upgrades</h2>
          </div>

          <div className="space-y-2">
            {data.weakest_skills.slice(0, 5).map((sk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{sk.name}</span>
                <span className="text-xs font-bold text-amber-400">{sk.beginner_count} at Beginner Tier ({sk.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
