import React from 'react';
import { SkillGapAnalysisReport } from '../../types';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';

interface RoleOverviewDetailsProps {
  report: SkillGapAnalysisReport;
}

export const RoleOverviewDetails: React.FC<RoleOverviewDetailsProps> = ({ report }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Industry Role Profile & Expectations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key market benchmarks and typical responsibilities for {report.role_title}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Demand: <strong className="text-slate-900">{report.market_demand.split('(')[0]}</strong></span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Salary: <strong className="text-emerald-900">{report.average_salary_range}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Responsibilities */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Core Industry Responsibilities</span>
          </h3>
          <ul className="space-y-2">
            {report.key_responsibilities.map((resp, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed p-2 rounded-lg bg-slate-50/60 border border-slate-200/50"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Market Demand & Hiring Context */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hiring Market Analysis</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <p className="text-slate-700 leading-relaxed font-medium">
                {report.market_demand}
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Industry standards require balanced competency in core architecture, collaborative versioning, and test coverage.
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Curriculum Alignment</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-900 leading-relaxed">
              Mapped directly to university computer science department syllabus and real-world corporate internship requirements.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
