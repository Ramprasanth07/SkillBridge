import React from 'react';
import { SkillGapRoleOverview } from '../../types';
import {
  Code,
  Cloud,
  Cpu,
  Database,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RoleSelectorProps {
  roles: SkillGapRoleOverview[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  loading: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  loading
}) => {
  const getRoleIcon = (id: string) => {
    switch (id) {
      case 'full-stack-engineer':
        return <Code className="w-5 h-5" />;
      case 'cloud-devops-engineer':
        return <Cloud className="w-5 h-5" />;
      case 'ai-ml-engineer':
        return <Cpu className="w-5 h-5" />;
      case 'data-systems-engineer':
        return <Database className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'from-emerald-500 to-teal-500'
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bar: 'from-indigo-500 to-blue-500'
      };
    }
    if (score >= 40) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'from-amber-500 to-orange-500'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      bar: 'from-rose-500 to-red-500'
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Target Job Roles</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              4 Roles Available
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a target career track to evaluate your verified skills against current industry hiring benchmarks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {roles.map((role) => {
          const isSelected = selectedRoleId === role.role_id;
          const scoreBadge = getMatchScoreBadge(role.overall_match_percentage);

          return (
            <button
              key={role.role_id}
              id={`role-select-${role.role_id}`}
              type="button"
              onClick={() => onSelectRole(role.role_id)}
              disabled={loading}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/15 ring-2 ring-indigo-500/50'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold tracking-wide uppercase">
                  <span>Selected</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {getRoleIcon(role.role_id)}
                  </div>
                  <div className="min-w-0 flex-1 pr-14">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block truncate ${
                        isSelected ? 'text-indigo-300' : 'text-slate-500'
                      }`}
                    >
                      {role.category}
                    </span>
                    <h3
                      className={`text-xs font-bold truncate leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {role.role_title}
                    </h3>
                  </div>
                </div>

                <p
                  className={`text-[11px] line-clamp-2 mb-3.5 leading-relaxed ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {role.short_description}
                </p>
              </div>

              <div
                className={`pt-3 border-t ${
                  isSelected ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Role Compatibility
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? 'bg-white/10 text-white border-white/20'
                        : scoreBadge.bg
                    }`}
                  >
                    {role.overall_match_percentage}%
                  </span>
                </div>

                {/* Compatibility Progress Bar */}
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isSelected ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${scoreBadge.bar} transition-all duration-500`}
                    style={{ width: `${Math.max(4, role.overall_match_percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] mt-2 text-slate-400">
                  <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>
                    {role.matching_skills_count} / {role.total_required_skills_count} Skills Matched
                  </span>
                  <span className={isSelected ? 'text-emerald-300 font-semibold' : 'text-slate-600 font-medium'}>
                    {role.readiness_status}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
