import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
  SkillGapRoleOverview,
  SkillGapAnalysisReport,
  ActiveTab
} from '../../types';
import { RoleSelector } from './RoleSelector';
import { OverallScoreCard } from './OverallScoreCard';
import { SkillsBreakdownSection } from './SkillsBreakdownSection';
import { RecommendationsSection } from './RecommendationsSection';
import { RoleOverviewDetails } from './RoleOverviewDetails';
import {
  TrendingUp,
  RotateCw,
  AlertCircle,
  Sparkles,
  BookOpen,
  Code2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface SkillGapManagerProps {
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const SkillGapManager: React.FC<SkillGapManagerProps> = ({
  onNavigateToTab
}) => {
  const [rolesOverview, setRolesOverview] = useState<SkillGapRoleOverview[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('full-stack-engineer');
  const [report, setReport] = useState<SkillGapAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Overview of all 4 roles
  const loadOverviewAndReport = useCallback(async (roleToSelect?: string) => {
    try {
      setLoading(true);
      setError(null);

      const overviewRes = await api.skillGap.getOverview();
      const overviewList = overviewRes.overview || [];
      setRolesOverview(overviewList);

      const targetRole = roleToSelect || selectedRoleId || overviewList[0]?.role_id || 'full-stack-engineer';
      setSelectedRoleId(targetRole);

      const reportRes = await api.skillGap.getRoleReport(targetRole);
      setReport(reportRes.report);
    } catch (err: any) {
      console.error('Failed to load skill gap data:', err);
      setError(err.message || 'Failed to generate skill gap analysis');
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    loadOverviewAndReport();
  }, []);

  // Handle single role switch
  const handleSelectRole = async (roleId: string) => {
    if (roleId === selectedRoleId && report) return;

    setSelectedRoleId(roleId);
    setReportLoading(true);
    setError(null);

    try {
      const reportRes = await api.skillGap.getRoleReport(roleId);
      setReport(reportRes.report);
    } catch (err: any) {
      console.error(`Failed to load report for ${roleId}:`, err);
      setError(err.message || 'Failed to switch role analysis');
    } finally {
      setReportLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadOverviewAndReport(selectedRoleId);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-4 w-80 bg-slate-100 animate-pulse rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>

        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Skill Gap Analysis
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            The intelligent matching engine compares your profile skills and verified assessment performance against real-world industry job requirements.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            id="skillgap-refresh-btn"
            type="button"
            onClick={handleRefresh}
            disabled={loading || reportLoading}
            className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${reportLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Re-evaluate Gaps</span>
          </button>

          {onNavigateToTab && (
            <button
              id="skillgap-take-assessment-header-btn"
              type="button"
              onClick={() => onNavigateToTab('assessments')}
              className="px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Skill Assessments</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty / Incomplete Skills State Banner if student has 0 skills */}
      {report && !report.has_profile_skills && (
        <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                No Profile Skills Added Yet
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Add your technical and soft skills in your profile or take skill assessments to generate accurate role compatibility results.
              </p>
            </div>
          </div>

          {onNavigateToTab && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateToTab('skills')}
                className="px-3 py-2 bg-white text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold border border-amber-300 shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Add Skills</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab('assessments')}
                className="px-3 py-2 bg-amber-600 text-white hover:bg-amber-500 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Take Assessments</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Job Role Selection Grid */}
      <RoleSelector
        roles={rolesOverview}
        selectedRoleId={selectedRoleId}
        onSelectRole={handleSelectRole}
        loading={reportLoading}
      />

      {/* Loading Overlay when switching roles */}
      {reportLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold text-slate-700">Evaluating compatibility report for selected role...</p>
        </div>
      )}

      {/* Main Report Content */}
      {!reportLoading && report && (
        <div className="space-y-6 animate-fadeIn">
          {/* 3. Overall Match Score Card */}
          <OverallScoreCard report={report} />

          {/* 4. Industry Role Expectations & Profile Details */}
          <RoleOverviewDetails report={report} />

          {/* 5. Detailed Skill Breakdown: Matching, Weak, Missing */}
          <SkillsBreakdownSection
            matchingSkills={report.matching_skills}
            weakSkills={report.weak_skills}
            missingSkills={report.missing_skills}
            onNavigateToTab={onNavigateToTab}
          />

          {/* 6. Strategic Recommendations & Bridging Plan */}
          <RecommendationsSection
            report={report}
            onNavigateToTab={onNavigateToTab}
          />
        </div>
      )}
    </div>
  );
};
