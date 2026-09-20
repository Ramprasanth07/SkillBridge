import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CompanyAnalyticsData } from '../../types';
import {
  TrendingUp,
  Briefcase,
  Users,
  Target,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const IndustryAnalyticsView: React.FC = () => {
  const [data, setData] = useState<CompanyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.analytics.getCompanyAnalytics();
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load company recruitment analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading your recruitment & hiring pipeline analytics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs text-slate-300 font-semibold">{error}</p>
        <button
          onClick={fetchCompanyAnalytics}
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Corporate Intelligence
            </span>
            <span className="text-xs text-slate-400">• Phase 9 Hiring Funnel</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {data?.company_name} — Recruitment Pipeline & Evaluation Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time analytics for your active job/internship listings, candidate applicant flow, match score distributions, and mentor performance reviews.
          </p>
        </div>

        <button
          onClick={fetchCompanyAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {data && (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Total Applicants</p>
              <p className="text-2xl font-black text-white mt-1">{data.total_applications}</p>
              <p className="text-[11px] text-purple-400 mt-1">
                Across {data.total_postings} active listings
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Average Match Quality</p>
              <p className="text-2xl font-black text-indigo-300 mt-1">{data.average_match_score}%</p>
              <p className="text-[11px] text-slate-400 mt-1">Algorithm alignment</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Selection Conversion</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{data.conversion_rate}%</p>
              <p className="text-[11px] text-emerald-400/80 mt-1">
                {data.hiring_funnel.selected} hired candidates
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Mentor Evaluations Given</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {data.mentor_feedback_summary.average_score} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {data.mentor_feedback_summary.total_evaluations} reviews conducted
              </p>
            </div>
          </div>

          {/* Hiring Funnel & Match Quality Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hiring Funnel */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Your Candidate Hiring Pipeline</h3>
                  <p className="text-xs text-slate-400">Progress of candidates through your corporate stages</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {data.total_applications} Candidates
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Applied', count: data.hiring_funnel.applied, color: 'bg-purple-500', pct: 100 },
                  {
                    label: 'Under Review',
                    count: data.hiring_funnel.under_review,
                    color: 'bg-blue-500',
                    pct: data.hiring_funnel.applied > 0 ? Math.round((data.hiring_funnel.under_review / data.hiring_funnel.applied) * 100) : 0
                  },
                  {
                    label: 'Shortlisted for Interview',
                    count: data.hiring_funnel.shortlisted,
                    color: 'bg-indigo-500',
                    pct: data.hiring_funnel.applied > 0 ? Math.round((data.hiring_funnel.shortlisted / data.hiring_funnel.applied) * 100) : 0
                  },
                  {
                    label: 'Selected / Hired',
                    count: data.hiring_funnel.selected,
                    color: 'bg-emerald-500',
                    pct: data.hiring_funnel.applied > 0 ? Math.round((data.hiring_funnel.selected / data.hiring_funnel.applied) * 100) : 0
                  },
                  {
                    label: 'Rejected',
                    count: data.hiring_funnel.rejected,
                    color: 'bg-rose-500/80',
                    pct: data.hiring_funnel.applied > 0 ? Math.round((data.hiring_funnel.rejected / data.hiring_funnel.applied) * 100) : 0
                  }
                ].map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{step.label}</span>
                      <span className="font-mono text-white font-bold">
                        {step.count} ({step.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Quality Breakdown */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Candidate Match Distribution</h3>
                <p className="text-xs text-slate-400">Algorithmic alignment with your job skills</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    label: 'Excellent Fit (85%+ Match)',
                    count: data.match_quality_distribution.excellent_85_plus,
                    color: 'bg-emerald-500',
                    text: 'text-emerald-400'
                  },
                  {
                    label: 'Good Fit (70–84% Match)',
                    count: data.match_quality_distribution.good_70_84,
                    color: 'bg-blue-500',
                    text: 'text-blue-400'
                  },
                  {
                    label: 'Moderate Fit (50–69% Match)',
                    count: data.match_quality_distribution.moderate_50_69,
                    color: 'bg-amber-500',
                    text: 'text-amber-400'
                  },
                  {
                    label: 'Low Fit (<50% Match)',
                    count: data.match_quality_distribution.low_under_50,
                    color: 'bg-rose-500',
                    text: 'text-rose-400'
                  }
                ].map((tier, idx) => {
                  const pct = data.total_applications > 0 ? Math.round((tier.count / data.total_applications) * 100) : 0;
                  return (
                    <div key={idx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-bold ${tier.text}`}>{tier.label}</span>
                        <span className="font-mono text-white font-bold">{tier.count} candidates ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department Source Distribution */}
          {data.department_sources && data.department_sources.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Applicant Pool by Academic Department</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.department_sources.map((dept, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <p className="text-xs font-bold text-white truncate">{dept.department}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-400">{dept.count} candidates</span>
                      <span className="font-mono font-bold text-purple-400">{dept.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
