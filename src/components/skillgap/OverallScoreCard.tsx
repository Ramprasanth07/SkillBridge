import React from 'react';
import { SkillGapAnalysisReport } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

interface OverallScoreCardProps {
  report: SkillGapAnalysisReport;
}

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ report }) => {
  const {
    overall_match_percentage,
    readiness_status,
    readiness_badge_color,
    readiness_summary,
    matching_skills_count,
    weak_skills_count,
    missing_skills_count,
    total_required_skills_count,
    matching_skills
  } = report;

  // Count how many matching skills are backed by verified Phase 2 assessments
  const verifiedCount = matching_skills.filter(s => s.is_verified).length;

  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'Job Ready':
        return {
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          gradient: 'from-emerald-500 to-teal-600',
          strokeColor: '#059669'
        };
      case 'High Potential':
        return {
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          gradient: 'from-indigo-500 to-blue-600',
          strokeColor: '#4f46e5'
        };
      case 'Developing':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          gradient: 'from-amber-500 to-orange-600',
          strokeColor: '#d97706'
        };
      default:
        return {
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          gradient: 'from-rose-500 to-red-600',
          strokeColor: '#e11d48'
        };
    }
  };

  const visuals = getStatusVisuals(readiness_status);

  // SVG Circular progress math
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_match_percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner with Title and Readiness Badge */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {report.role_category}
              </span>
              <span className="text-xs text-slate-400 font-medium">Evaluation Report</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {report.role_title}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {report.detailed_overview}
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Current Readiness
            </span>
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                readiness_status === 'Job Ready'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : readiness_status === 'High Potential'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : readiness_status === 'Developing'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{readiness_status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Score & Metric Breakdown */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Circular Progress Gauge */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={visuals.strokeColor}
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {overall_match_percentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">
                Match
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-900">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Industry Alignment</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {readiness_summary}
            </p>
          </div>
        </div>

        {/* 4 Metric Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Matching Skills */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-bold">Matching Skills</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-emerald-900">
                  {matching_skills_count}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  / {total_required_skills_count}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                Meets or exceeds level
              </p>
            </div>
          </div>

          {/* Weak Skills */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] font-bold">Weak Skills</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-amber-900">
                  {weak_skills_count}
                </span>
                <span className="text-xs text-amber-700 font-semibold">
                  / {total_required_skills_count}
                </span>
              </div>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                Below industry target
              </p>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-[11px] font-bold">Missing Skills</span>
              <HelpCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-rose-900">
                  {missing_skills_count}
                </span>
                <span className="text-xs text-rose-700 font-semibold">
                  / {total_required_skills_count}
                </span>
              </div>
              <p className="text-[10px] text-rose-700 font-medium mt-0.5">
                Not in student profile
              </p>
            </div>
          </div>

          {/* Verified by Assessment */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-800 mb-1">
              <span className="text-[11px] font-bold">Verified Skills</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-indigo-900">
                  {verifiedCount}
                </span>
                <span className="text-xs text-indigo-700 font-semibold">
                  / {matching_skills_count}
                </span>
              </div>
              <p className="text-[10px] text-indigo-700 font-medium mt-0.5">
                Backed by verified tests
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
