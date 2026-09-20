import React, { useState } from 'react';
import { StudentReadinessScore, ActiveTab } from '../../types';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
  FolderGit2,
  Code2,
  GraduationCap,
  Briefcase,
  Compass,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface PlacementReadinessCardProps {
  readiness?: StudentReadinessScore | null;
  onRefresh?: () => void;
  onNavigate?: (tab: ActiveTab) => void;
  compact?: boolean;
}

export const PlacementReadinessCard: React.FC<PlacementReadinessCardProps> = ({
  readiness,
  onRefresh,
  onNavigate,
  compact = false
}) => {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  if (!readiness) {
    return null;
  }

  const score = Math.round(readiness.placement_readiness_percentage ?? readiness.total_score);
  const tier = readiness.tier || (score >= 80 ? 'Job Ready' : score >= 65 ? 'High Potential' : score >= 50 ? 'Developing' : 'Needs Foundation');

  const getTierColor = (t: string) => {
    switch (t) {
      case 'Job Ready':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          bar: 'bg-emerald-500',
          badge: 'bg-emerald-500 text-white',
          glow: 'from-emerald-500/20 to-teal-500/20'
        };
      case 'High Potential':
        return {
          bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
          bar: 'bg-indigo-500',
          badge: 'bg-indigo-600 text-white',
          glow: 'from-indigo-500/20 to-purple-500/20'
        };
      case 'Developing':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          bar: 'bg-amber-500',
          badge: 'bg-amber-500 text-white',
          glow: 'from-amber-500/20 to-orange-500/20'
        };
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          bar: 'bg-rose-500',
          badge: 'bg-rose-500 text-white',
          glow: 'from-rose-500/20 to-red-500/20'
        };
    }
  };

  const colors = getTierColor(tier);

  const getFactorIcon = (key: string) => {
    switch (key) {
      case 'assessment_performance':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'skill_readiness':
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 'projects':
        return <FolderGit2 className="w-4 h-4 text-emerald-400" />;
      case 'certifications':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'academic_standing':
        return <GraduationCap className="w-4 h-4 text-blue-400" />;
      case 'roadmap_progress':
        return <Compass className="w-4 h-4 text-pink-400" />;
      case 'industry_evidence':
        return <Briefcase className="w-4 h-4 text-teal-400" />;
      default:
        return <Zap className="w-4 h-4 text-slate-400" />;
    }
  };

  const getFactorNavTab = (key: string): ActiveTab => {
    switch (key) {
      case 'assessment_performance':
        return 'assessments';
      case 'skill_readiness':
        return 'skills';
      case 'projects':
        return 'projects';
      case 'certifications':
        return 'certifications';
      case 'academic_standing':
        return 'profile';
      case 'roadmap_progress':
        return 'roadmap';
      case 'industry_evidence':
        return 'opportunities';
      default:
        return 'dashboard';
    }
  };

  return (
    <div
      id="placement-readiness-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-indigo-900/50 p-5 sm:p-6 text-white shadow-lg space-y-5 font-sans"
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${colors.glow}`}
      />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Placement Intelligence Engine</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.bg}`}>
              {tier}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>Placement Readiness:</span>
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              {score}%
            </span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Calculated from real academic standing, verified assessment tests, project portfolio, roadmap progress, and industry internship evidence.
          </p>
        </div>

        {/* Action / Toggle button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            id="toggle-readiness-breakdown-btn"
            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>{showDetailedBreakdown ? 'Hide Breakdown' : 'Explain Breakdown'}</span>
            {showDetailedBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar with Tier Markers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Overall Readiness Progress</span>
          <span className="font-bold text-white">{score} / 100 Points</span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/60 relative">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>Foundation (&lt;50%)</span>
          <span className="text-center">Developing (50-64%)</span>
          <span className="text-center">High Potential (65-79%)</span>
          <span className="text-right">Job Ready (80%+)</span>
        </div>
      </div>

      {/* Actionable Suggestions & Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Strengths */}
        {readiness.strengths && readiness.strengths.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-850/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current Strengths</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {readiness.strengths.map((st, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actionable Suggestions to Improve Score */}
        {readiness.recommendations && readiness.recommendations.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-850/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <TrendingUp className="w-4 h-4" />
              <span>How to Improve Your Score</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {readiness.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">→</span>
                  <span className="text-slate-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Factor Breakdown (7-Factor Weighted Breakdown) */}
      {showDetailedBreakdown && readiness.factors_list && readiness.factors_list.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Factor Multi-Criteria Evaluation Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Formula: Weighted Sum of verified credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {readiness.factors_list.map((factor) => {
              const tab = getFactorNavTab(factor.key);
              return (
                <div
                  key={factor.key}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-700/60 shrink-0">
                        {getFactorIcon(factor.key)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {factor.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Weight: {factor.weight}%
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-indigo-300">
                        {factor.score}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        +{factor.weighted_score.toFixed(1)} pts
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.score >= 80 ? 'bg-emerald-500' : factor.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="line-clamp-1">{factor.evidence}</span>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate(tab)}
                        className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100"
                      >
                        <span>Improve</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-300">Intelligent Weighted Skill Matching Engine: </span>
            Scores automatically re-compute across your real profile inputs, assessment outcomes, and industry verification.
          </div>
        </div>
      )}
    </div>
  );
};
