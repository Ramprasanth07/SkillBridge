import React, { useEffect, useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  Award,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Target,
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';
import { ActiveTab, StudentRoadmapData } from '../../types';

interface LearningRoadmapViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const LearningRoadmapView: React.FC<LearningRoadmapViewProps> = ({ setActiveTab }) => {
  const [data, setData] = useState<StudentRoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.student.getRoadmap();
      if (res && res.data) {
        setData(res.data);
      } else {
        throw new Error('Invalid roadmap data received');
      }
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setError(err?.message || 'Unable to load your learning roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  if (loading) {
    return (
      <div id="roadmap-loading-state" className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
          <div className="h-4 w-96 bg-slate-100 rounded mb-6" />
          <div className="h-10 w-full bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div id="roadmap-error-state" className="bg-white rounded-xl p-8 border border-red-200 shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to Load Learning Roadmap</h3>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          {error || 'An unexpected error occurred while compiling your milestones.'}
        </p>
        <button
          id="roadmap-retry-btn"
          onClick={fetchRoadmap}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Calculation
        </button>
      </div>
    );
  }

  const overallProgress = Math.min(100, Math.max(0, data.overall_progress || 0));
  const stages = data.stages || [];
  const recommendations = data.recommendations || [];
  const roleAlignment = data.role_alignment || [];

  return (
    <div id="learning-roadmap-view" className="space-y-8">
      {/* Header Banner */}
      <div
        id="roadmap-header-card"
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                    Career Progression
                  </span>
                  <span className="text-xs text-slate-300">
                    Stage {data.current_stage || 1} of 4 Active
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Personalized Learning Roadmap
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
              <div className="text-right">
                <p className="text-xs text-slate-300">Overall Progress</p>
                <p className="text-xl font-bold text-white">{overallProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-indigo-400/30 border-t-indigo-400 flex items-center justify-center font-bold text-xs">
                {overallProgress}%
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mb-6">
            Track your structured trajectory toward industry readiness. Master foundational skills, showcase applied
            projects, validate problem solving via standardized assessments, and deliver capstone achievements for
            high-match placement.
          </p>

          {/* Progress Track Bar */}
          <div className="bg-white/10 rounded-full h-3 p-0.5 border border-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, overallProgress)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Stage 1: Foundational</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Stage 2: Core Engineering</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Stage 3: Benchmarks</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Stage 4: Market Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Student Onboarding Callout if brand new */}
      {data.is_new_student && (
        <div
          id="roadmap-onboarding-callout"
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-950 text-sm">Welcome to SkillBridge! Let&apos;s build your roadmap.</h4>
              <p className="text-xs text-indigo-800 mt-0.5">
                Start by adding your first technical skills to complete Stage 1 milestones and activate real-time industry gap analysis.
              </p>
            </div>
          </div>
          <button
            id="roadmap-get-started-btn"
            onClick={() => setActiveTab('skills')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition"
          >
            Declare Skills
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Core Milestone Stages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Career Milestone Stages</h2>
            <p className="text-xs text-slate-500">
              Complete each stage sequentially to advance your institutional and industry readiness score.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {stages.filter(s => s.status === 'completed').length} of 4 Stages Completed
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stages.map(stage => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isLocked = stage.status === 'locked';

            return (
              <div
                key={stage.stage_number}
                id={`roadmap-stage-${stage.stage_number}-card`}
                className={`bg-white rounded-xl border transition-all duration-200 p-6 flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 shadow-sm bg-gradient-to-b from-emerald-50/20 to-white'
                    : isInProgress
                    ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div>
                  {/* Stage Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : isInProgress
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isInProgress ? (
                          <Clock className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {stage.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {stage.target_summary}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {stage.description}
                  </p>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{stage.current_summary}</span>
                      <span className="text-slate-900 font-bold">{stage.progress_percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isInProgress
                            ? 'bg-indigo-600'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.max(2, stage.progress_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Required Milestones
                    </h4>
                    {stage.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg"
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span className={milestone.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                          {milestone.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {isCompleted ? 'Stage benchmark satisfied' : 'Action required'}
                  </span>
                  <button
                    id={`roadmap-stage-${stage.stage_number}-action-btn`}
                    onClick={() => setActiveTab(stage.action.tab as ActiveTab)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {stage.action.label}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Role Alignments (Phase 3 Integration) */}
      <div id="roadmap-roles-section" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Target Industry Role Alignment
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates your roadmap progress and verified skills against standard industry archetype competencies.
            </p>
          </div>
          <button
            id="roadmap-skillgap-jump-btn"
            onClick={() => setActiveTab('skillgap')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            Detailed Skill Gap Report
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {roleAlignment.map(role => (
            <div
              key={role.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900">{role.name}</span>
                  <span className="text-xs font-bold text-indigo-600">{role.match}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      role.match >= 75
                        ? 'bg-emerald-500'
                        : role.match >= 40
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(5, role.match)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('skillgap')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-between pt-2 border-t border-slate-200/60"
              >
                <span>View Requirements</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Recommendations */}
      <div id="roadmap-recommendations-section" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Recommended Next Actions
          </h3>
          <p className="text-xs text-slate-500">
            Personalized guidance based on your verified skills, missing milestones, and hiring benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rec.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : rec.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{rec.description}</p>
              </div>

              <button
                id={`roadmap-rec-action-${index}-btn`}
                onClick={() => setActiveTab(rec.tab as ActiveTab)}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                {rec.actionText}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
