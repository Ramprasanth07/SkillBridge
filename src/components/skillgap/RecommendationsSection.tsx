import React from 'react';
import { SkillGapAnalysisReport, ActiveTab } from '../../types';
import {
  Sparkles,
  Zap,
  BookOpen,
  FolderGit2,
  Award,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Target,
  ExternalLink
} from 'lucide-react';

interface RecommendationsSectionProps {
  report: SkillGapAnalysisReport;
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  report,
  onNavigateToTab
}) => {
  const { recommendations } = report;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Strategic Bridging Recommendations</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Actionable roadmap designed to close your skill gaps and prepare you for technical interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Priority Skills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Priority Skills to Bridge</h3>
                <p className="text-[11px] text-slate-500">Highest-impact proficiencies needed first</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendations.priority_skills.length > 0 ? (
                recommendations.priority_skills.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{item.skill_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                          Target: {item.target_level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-semibold text-slate-400">
                        Current: <strong className="text-slate-700">{item.current_level || 'None'}</strong>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                  All required skills are fully satisfied for this role!
                </div>
              )}
            </div>
          </div>

          {onNavigateToTab && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Update your skill levels</span>
              <button
                type="button"
                onClick={() => onNavigateToTab('skills')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Go to Skills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Recommended Learning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Recommended Learning Roadmap</h3>
                <p className="text-[11px] text-slate-500">Conceptual mastery & documentation topics</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendations.recommended_learning.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {item.skill}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {item.action_plan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Skill Assessment Recommended (Phase 2 Integration) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Recommended Skill Assessments</h3>
                <p className="text-[11px] text-slate-500">Earn verified badges to elevate your compatibility score</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendations.recommended_assessments.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      {item.already_passed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {item.passing_percentage}% Passing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>

                  {onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('assessments')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        item.already_passed
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs'
                      }`}
                    >
                      {item.already_passed ? 'Retake' : 'Start Test'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {onNavigateToTab && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">View all tests</span>
              <button
                type="button"
                onClick={() => onNavigateToTab('assessments')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Skill Assessments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 4. Project Practice Recommended */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Project Practice Recommended</h3>
                <p className="text-[11px] text-slate-500">Portfolio artifacts demonstrating role requirements</p>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.recommended_projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{proj.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 mr-1">Skills:</span>
                    {proj.skills_involved.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-semibold border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="pt-1.5 text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Outcome: {proj.expected_outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {onNavigateToTab && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Showcase your work</span>
              <button
                type="button"
                onClick={() => onNavigateToTab('projects')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Add Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase 4 Personalized Learning Roadmap Banner */}
      {onNavigateToTab && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-indigo-800/40">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>Learning Roadmap</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Ready to turn these skill gaps into an actionable plan?
            </h3>
            <p className="text-xs text-slate-300">
              Open your 4-stage personalized learning roadmap customized with targeted exercises, course tracks, and portfolio capstone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('roadmap')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span>Open Learning Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
