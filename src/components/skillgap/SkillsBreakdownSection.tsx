import React, { useState } from 'react';
import { EvaluatedSkill, ActiveTab } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

interface SkillsBreakdownSectionProps {
  matchingSkills: EvaluatedSkill[];
  weakSkills: EvaluatedSkill[];
  missingSkills: EvaluatedSkill[];
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const SkillsBreakdownSection: React.FC<SkillsBreakdownSectionProps> = ({
  matchingSkills,
  weakSkills,
  missingSkills,
  onNavigateToTab
}) => {
  const [filter, setFilter] = useState<'all' | 'matching' | 'weak' | 'missing'>('all');

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Advanced':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Intermediate':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Beginner':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Detailed Skill Gap Breakdown</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare each individual requirement against your profile proficiencies and assessment validations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({matchingSkills.length + weakSkills.length + missingSkills.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('matching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'matching'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Matching ({matchingSkills.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('weak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'weak'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Weak ({weakSkills.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('missing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'missing'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Missing ({missingSkills.length})</span>
          </button>
        </div>
      </div>

      {/* 1. MATCHING SKILLS SECTION */}
      {(filter === 'all' || filter === 'matching') && matchingSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Matching Skills ({matchingSkills.length})</span>
            <span className="text-[11px] font-medium text-emerald-600 normal-case">
              — Fully satisfies or exceeds industry baseline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {matchingSkills.map((skill) => (
              <div
                key={skill.skill_name}
                className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{skill.skill_name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">Requirement Met</span>
                      </div>
                    </div>

                    {/* Verified Badge */}
                    {skill.is_verified ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        Profile Skill
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    {skill.importance}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Your Level:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getLevelBadge(skill.student_proficiency)}`}>
                        {skill.student_proficiency}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Required:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getLevelBadge(skill.required_level)}`}>
                        {skill.required_level}
                      </span>
                    </div>
                  </div>

                  {skill.is_verified && skill.verified_assessment_title && (
                    <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/60 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold truncate max-w-[200px]">{skill.verified_assessment_title}</span>
                      </div>
                      <span className="font-bold text-emerald-700 shrink-0">
                        {skill.verified_score}% Score ({skill.verified_badge})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. WEAK SKILLS SECTION */}
      {(filter === 'all' || filter === 'weak') && weakSkills.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Weak Skills ({weakSkills.length})</span>
            <span className="text-[11px] font-medium text-amber-600 normal-case">
              — Present in profile, but below industry baseline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {weakSkills.map((skill) => (
              <div
                key={skill.skill_name}
                className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        !
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{skill.skill_name}</h4>
                        <span className="text-[10px] text-amber-700 font-semibold">Proficiency Gap</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300 flex items-center gap-1">
                      <span>{skill.gap_percentage}% Gap</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                    {skill.importance}
                  </p>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                      Recommended Action
                    </span>
                    <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                      {skill.recommended_action}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Your Level:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getLevelBadge(skill.student_proficiency)}`}>
                        {skill.student_proficiency}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Target Level:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getLevelBadge(skill.required_level)}`}>
                        {skill.required_level}
                      </span>
                    </div>
                  </div>

                  {/* Progress visually showing gap */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${100 - skill.gap_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MISSING SKILLS SECTION */}
      {(filter === 'all' || filter === 'missing') && missingSkills.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-rose-600" />
            <span>Missing Skills ({missingSkills.length})</span>
            <span className="text-[11px] font-medium text-rose-600 normal-case">
              — Essential industry requirements not found in your profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {missingSkills.map((skill) => (
              <div
                key={skill.skill_name}
                className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        ✕
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{skill.skill_name}</h4>
                        <span className="text-[10px] text-rose-600 font-semibold">Not In Profile</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      Required: {skill.required_level}
                    </span>
                  </div>

                  <div className="mb-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Why This Skill Is Important
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {skill.importance}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                      Recommended Learning Path
                    </span>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {skill.recommended_learning}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    100% Skill Gap
                  </span>

                  {onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('skills')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                    >
                      <span>Add to Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty Filter State */}
      {filter === 'matching' && matchingSkills.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">No matching skills found yet for this role.</p>
        </div>
      )}
      {filter === 'weak' && weakSkills.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">No weak skills! All your added skills meet target proficiencies.</p>
        </div>
      )}
      {filter === 'missing' && missingSkills.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-xs text-emerald-600 font-bold">Incredible! You have all required skills in your profile.</p>
        </div>
      )}
    </div>
  );
};
