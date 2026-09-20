import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ExecutiveKpiData,
  TopPerformerItem,
  DepartmentBenchmarkItem,
  BatchBenchmarkItem,
  RoadmapAnalyticsData,
  CompetencyRadarData
} from '../../types';
import {
  BarChart3,
  TrendingUp,
  Target,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Building2,
  Calendar,
  Search,
  Filter,
  Download,
  Sparkles,
  ArrowRight,
  Briefcase,
  ChevronRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { SkillDemandReport } from './SkillDemandReport';
import { ExecutiveReportCenter } from './ExecutiveReportCenter';
import { CompetencyRadarModal } from './CompetencyRadarModal';

type AnalyticsSubTab =
  | 'overview'
  | 'skills'
  | 'assessments'
  | 'skillgaps'
  | 'roadmap'
  | 'placements'
  | 'feedback'
  | 'benchmarks'
  | 'leaderboard'
  | 'reports';

export const AnalyticsReportsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>('overview');
  const [dateRange, setDateRange] = useState<string>('all');
  const [department, setDepartment] = useState<string>('all');
  const [batch, setBatch] = useState<string>('all');

  // Overview KPIs state
  const [kpis, setKpis] = useState<ExecutiveKpiData | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<TopPerformerItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardSort, setLeaderboardSort] = useState<'composite' | 'cgpa' | 'assessment' | 'readiness' | 'roadmap'>('composite');

  // Benchmarks state
  const [deptBenchmarks, setDeptBenchmarks] = useState<DepartmentBenchmarkItem[]>([]);
  const [batchBenchmarks, setBatchBenchmarks] = useState<BatchBenchmarkItem[]>([]);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // Assessments & Skill gaps state
  const [asmtData, setAsmtData] = useState<any>(null);
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapAnalyticsData | null>(null);
  const [placementData, setPlacementData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [moduleLoading, setModuleLoading] = useState(false);

  // Radar inspection modal
  const [inspectedStudentId, setInspectedStudentId] = useState<string | null>(null);

  // Departments list
  const departmentsList = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering'
  ];

  // Batches list
  const batchesList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // Fetch Executive KPIs
  const fetchExecutiveKpis = async () => {
    try {
      setKpiLoading(true);
      setKpiError(null);
      const res = await api.analytics.getExecutive({ dateRange, department, batch });
      setKpis(res.data);
    } catch (err: any) {
      setKpiError(err.message || 'Failed to load executive KPIs.');
    } finally {
      setKpiLoading(false);
    }
  };

  // Fetch subtab specific data
  useEffect(() => {
    fetchExecutiveKpis();

    if (activeSubTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeSubTab === 'benchmarks') {
      fetchBenchmarks();
    } else if (activeSubTab === 'assessments') {
      fetchAssessments();
    } else if (activeSubTab === 'skillgaps') {
      fetchSkillGaps();
    } else if (activeSubTab === 'roadmap') {
      fetchRoadmap();
    } else if (activeSubTab === 'placements') {
      fetchPlacements();
    } else if (activeSubTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeSubTab, dateRange, department, batch]);

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const res = await api.analytics.getTopPerformers({
        department,
        batch,
        search: leaderboardSearch,
        sortBy: leaderboardSort
      });
      setLeaderboard(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchBenchmarks = async () => {
    try {
      setBenchmarkLoading(true);
      const [deptRes, batchRes] = await Promise.all([
        api.analytics.getDepartments(),
        api.analytics.getBatches()
      ]);
      setDeptBenchmarks(deptRes.data);
      setBatchBenchmarks(batchRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      setModuleLoading(true);
      const res = await api.analytics.getAssessments({ dateRange, department });
      setAsmtData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setModuleLoading(false);
    }
  };

  const fetchSkillGaps = async () => {
    try {
      setModuleLoading(true);
      const res = await api.analytics.getSkillGaps({ department, batch });
      setSkillGapData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setModuleLoading(false);
    }
  };

  const fetchRoadmap = async () => {
    try {
      setModuleLoading(true);
      const res = await api.analytics.getRoadmap({ department, batch });
      setRoadmapData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setModuleLoading(false);
    }
  };

  const fetchPlacements = async () => {
    try {
      setModuleLoading(true);
      const res = await api.analytics.getPlacements({ dateRange, department });
      setPlacementData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setModuleLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setModuleLoading(true);
      const res = await api.analytics.getFeedback({ dateRange, department });
      setFeedbackData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setModuleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-900/90 text-purple-300 border border-purple-700">
                Executive Layer
              </span>
              <span className="text-xs text-slate-400">• Institutional Intelligence & Governance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Executive Analytics & Reporting Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Cross-platform data aggregation unifying verified student competencies, live employer vacancy demands, standardized coding assessments, learning roadmap progression, and corporate mentor feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('reports')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-900/30"
            >
              <FileText className="w-4 h-4" />
              Executive Reports
            </button>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="all">All Time History</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="academic_year">Current Academic Year</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium max-w-[200px] truncate"
            >
              <option value="all">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={batch}
              onChange={e => setBatch(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="all">All Batches / Years</option>
              {batchesList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setDateRange('all');
            setDepartment('all');
            setBatch('all');
          }}
          className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
        >
          Reset Filters
        </button>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 select-none">
        {[
          { id: 'overview', label: 'Executive KPIs', icon: BarChart3 },
          { id: 'skills', label: 'Skill Demand vs Supply', icon: TrendingUp },
          { id: 'leaderboard', label: 'Top Performers Leaderboard', icon: Award },
          { id: 'assessments', label: 'Assessment Analytics', icon: CheckCircle2 },
          { id: 'skillgaps', label: 'Role-wise Skill Gaps', icon: Target },
          { id: 'roadmap', label: 'Learning Roadmap Progress', icon: Layers },
          { id: 'placements', label: 'Placement Funnel', icon: Briefcase },
          { id: 'feedback', label: 'Mentor Feedback Analytics', icon: Sparkles },
          { id: 'benchmarks', label: 'Department & Batch Matrices', icon: Building2 },
          { id: 'reports', label: 'Formal Reports Center', icon: FileText }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as AnalyticsSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW / EXECUTIVE KPIS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {kpiLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading live executive KPIs...</p>
            </div>
          ) : kpis ? (
            <>
              {/* Top 4 Primary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">Placement Readiness Rate</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Phase 1–8
                    </span>
                  </div>
                  <p className="text-3xl font-black text-purple-300 mt-2">
                    {kpis.overall_skill_readiness_rate}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Job Ready + High Potential Cohort
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">Placement Conversion</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Hired
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-400 mt-2">
                    {kpis.placement_conversion_rate}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {kpis.selected_candidates} selected of {kpis.total_applications} applicants
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">Assessment Mastery</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Phase 2
                    </span>
                  </div>
                  <p className="text-3xl font-black text-indigo-300 mt-2">
                    {kpis.average_assessment_score}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {kpis.assessment_completion_rate}% cohort participation rate
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">Corporate Mentor Rating</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Phase 8
                    </span>
                  </div>
                  <p className="text-3xl font-black text-amber-400 mt-2">
                    {kpis.average_mentor_feedback_score} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Independent industry evaluations
                  </p>
                </div>
              </div>

              {/* Recruitment Funnel & Readiness Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recruitment Funnel */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Recruitment & Hiring Funnel</h3>
                      <p className="text-xs text-slate-400">Student applications moving through corporate review stages</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {kpis.total_applications} Total Apps
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'Applied', count: kpis.funnel.applied, color: 'bg-purple-500', pct: 100 },
                      {
                        label: 'Under Review',
                        count: kpis.funnel.under_review,
                        color: 'bg-blue-500',
                        pct: kpis.funnel.applied > 0 ? Math.round((kpis.funnel.under_review / kpis.funnel.applied) * 100) : 0
                      },
                      {
                        label: 'Shortlisted for Interview',
                        count: kpis.funnel.shortlisted,
                        color: 'bg-indigo-500',
                        pct: kpis.funnel.applied > 0 ? Math.round((kpis.funnel.shortlisted / kpis.funnel.applied) * 100) : 0
                      },
                      {
                        label: 'Selected / Hired',
                        count: kpis.funnel.selected,
                        color: 'bg-emerald-500',
                        pct: kpis.funnel.applied > 0 ? Math.round((kpis.funnel.selected / kpis.funnel.applied) * 100) : 0
                      },
                      {
                        label: 'Rejected',
                        count: kpis.funnel.rejected,
                        color: 'bg-rose-500/80',
                        pct: kpis.funnel.applied > 0 ? Math.round((kpis.funnel.rejected / kpis.funnel.applied) * 100) : 0
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">{step.label}</span>
                          <span className="font-mono text-white font-bold">
                            {step.count} ({step.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: `${step.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cohort Skill Readiness Tier Distribution */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Student Readiness Tiers</h3>
                    <p className="text-xs text-slate-400">Institutional scoring across {kpis.total_students} students</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      {
                        tier: 'Job Ready (75-100)',
                        count: kpis.readiness_distribution.job_ready,
                        color: 'bg-emerald-500',
                        textColor: 'text-emerald-400',
                        desc: 'Immediately deployable for high-tier recruitment'
                      },
                      {
                        tier: 'High Potential (55-74)',
                        count: kpis.readiness_distribution.high_potential,
                        color: 'bg-blue-500',
                        textColor: 'text-blue-400',
                        desc: 'Strong core skills; requires brief specialization'
                      },
                      {
                        tier: 'Developing (35-54)',
                        count: kpis.readiness_distribution.developing,
                        color: 'bg-amber-500',
                        textColor: 'text-amber-400',
                        desc: 'Foundations active; roadmap guidance recommended'
                      },
                      {
                        tier: 'Needs Foundation (<35)',
                        count: kpis.readiness_distribution.needs_foundation,
                        color: 'bg-rose-500',
                        textColor: 'text-rose-400',
                        desc: 'Curricular baseline reinforcement required'
                      }
                    ].map((item, idx) => {
                      const pct = kpis.total_students > 0 ? Math.round((item.count / kpis.total_students) * 100) : 0;
                      return (
                        <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={`font-bold ${item.textColor}`}>{item.tier}</span>
                            <span className="font-mono font-black text-white">{item.count} students ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Key Executive Takeaways */}
              {kpis.key_highlights && kpis.key_highlights.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-900/40">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Key Executive Observations
                  </h3>
                  <ul className="space-y-1.5">
                    {kpis.key_highlights.map((highlight, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SKILL DEMAND VS SUPPLY TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'skills' && (
        <SkillDemandReport dateRange={dateRange} department={department} batch={batch} />
      )}

      {/* ========================================================================= */}
      {/* 3. TOP PERFORMERS LEADERBOARD TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Top Performers Institutional Leaderboard</h3>
                <p className="text-xs text-slate-400">
                  Transparent Composite Index: CGPA (20%), Standardized Tests (25%), Skill Readiness (20%), Roadmap (15%), Market Match (10%), Mentor Feedback (10%).
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={leaderboardSearch}
                    onChange={e => setLeaderboardSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchLeaderboard()}
                    className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <select
                  value={leaderboardSort}
                  onChange={e => setLeaderboardSort(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="composite">Sort by Composite Index</option>
                  <option value="cgpa">Sort by CGPA</option>
                  <option value="assessment">Sort by Assessment Score</option>
                  <option value="readiness">Sort by Skill Readiness</option>
                  <option value="roadmap">Sort by Roadmap Progress</option>
                </select>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 font-bold">Rank</th>
                    <th className="py-3 px-3 font-bold">Student</th>
                    <th className="py-3 px-3 font-bold">Department</th>
                    <th className="py-3 px-3 font-bold">CGPA</th>
                    <th className="py-3 px-3 font-bold">Composite Score</th>
                    <th className="py-3 px-3 font-bold">Assessments</th>
                    <th className="py-3 px-3 font-bold">Roadmap %</th>
                    <th className="py-3 px-3 font-bold">Mentor Score</th>
                    <th className="py-3 px-3 font-bold">Status</th>
                    <th className="py-3 px-3 font-bold text-right">Radar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboardLoading ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400">
                        Calculating institutional composite scores...
                      </td>
                    </tr>
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map(student => (
                      <tr key={student.student_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-bold font-mono">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            student.rank === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : student.rank === 2
                              ? 'bg-slate-300 text-slate-950 font-black'
                              : student.rank === 3
                              ? 'bg-amber-700 text-white font-black'
                              : 'text-slate-400'
                          }`}>
                            {student.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          <div>
                            <span>{student.student_name}</span>
                            <span className="block text-[10px] text-slate-400 font-normal">{student.year_of_study}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300 truncate max-w-[140px]">{student.department}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-200">
                          {student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-baseline gap-1 font-mono font-black text-purple-300">
                            <span className="text-sm">{student.composite_score}</span>
                            <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-indigo-300">
                          {student.assessment_score !== null ? `${student.assessment_score}%` : 'Unattempted'}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400">
                          {student.roadmap_progress}%
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {student.mentor_feedback_score !== null ? (
                            <span className="text-amber-400 font-bold">{student.mentor_feedback_score}/5.0</span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            student.placement_status === 'Selected / Hired'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : student.placement_status === 'Shortlisted'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {student.placement_status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setInspectedStudentId(student.student_id)}
                            className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                          >
                            <Target className="w-3 h-3" />
                            <span>Radar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ASSESSMENTS ANALYTICS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'assessments' && asmtData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Total Attempts</p>
              <p className="text-2xl font-black text-white mt-1">{asmtData.total_attempts}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Participation Rate</p>
              <p className="text-2xl font-black text-purple-300 mt-1">{asmtData.completion_rate}%</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Average Score</p>
              <p className="text-2xl font-black text-indigo-300 mt-1">{asmtData.overall_average_score}%</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Pass Rate</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{asmtData.overall_pass_rate}%</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Track-Wise Technical Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 font-bold">Assessment Track</th>
                    <th className="py-3 px-3 font-bold">Category</th>
                    <th className="py-3 px-3 font-bold">Difficulty</th>
                    <th className="py-3 px-3 font-bold">Attempts</th>
                    <th className="py-3 px-3 font-bold">Pass Rate</th>
                    <th className="py-3 px-3 font-bold">Average Score</th>
                    <th className="py-3 px-3 font-bold">Top Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {asmtData.assessments_breakdown.map((track: any) => (
                    <tr key={track.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white">{track.title}</td>
                      <td className="py-3 px-3 text-slate-300">{track.category}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {track.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{track.total_attempts}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{track.pass_rate}%</td>
                      <td className="py-3 px-3 font-mono text-purple-300">{track.average_score}%</td>
                      <td className="py-3 px-3 font-mono text-indigo-300">{track.highest_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ROLE-WISE SKILL GAPS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'skillgaps' && skillGapData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillGapData.roles.map((role: any) => (
              <div key={role.role_id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{role.role_title}</h4>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {role.average_match_score}% Avg Match
                  </span>
                </div>
                <p className="text-xs text-slate-400">Market Demand: {role.market_demand}</p>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Job Ready: {role.distribution.job_ready}</span>
                    <span className="text-slate-400">High Potential: {role.distribution.high_potential}</span>
                    <span className="text-slate-400">Developing: {role.distribution.developing}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(role.distribution.job_ready / Math.max(1, role.students_evaluated)) * 100}%` }} />
                    <div className="bg-blue-500 h-full" style={{ width: `${(role.distribution.high_potential / Math.max(1, role.students_evaluated)) * 100}%` }} />
                    <div className="bg-amber-500 h-full" style={{ width: `${(role.distribution.developing / Math.max(1, role.students_evaluated)) * 100}%` }} />
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <span className="text-rose-400 font-bold block mb-1">Most Common Missing Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.top_missing_skills.map((ms: any, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px]">
                        {ms.skill_name} ({ms.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LEARNING ROADMAP PROGRESS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'roadmap' && roadmapData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Avg Roadmap Progress</p>
              <p className="text-2xl font-black text-purple-300 mt-1">{roadmapData.average_roadmap_progress}%</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Completed Capstones</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{roadmapData.completed_capstones_count}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Stage 4 Mastery</p>
              <p className="text-2xl font-black text-indigo-300 mt-1">{roadmapData.stage_distribution.stage_4.count}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Stage 1 Foundation</p>
              <p className="text-2xl font-black text-slate-300 mt-1">{roadmapData.stage_distribution.stage_1.count}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Roadmap Stage Cohort Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { stage: roadmapData.stage_distribution.stage_1, color: 'border-slate-700' },
                { stage: roadmapData.stage_distribution.stage_2, color: 'border-blue-800' },
                { stage: roadmapData.stage_distribution.stage_3, color: 'border-purple-800' },
                { stage: roadmapData.stage_distribution.stage_4, color: 'border-emerald-800' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl bg-slate-800/60 border ${item.color}`}>
                  <p className="text-xs font-bold text-white truncate">{item.stage.label}</p>
                  <p className="text-xl font-black text-white mt-1">{item.stage.count} students</p>
                  <p className="text-[11px] text-slate-400">{item.stage.percentage}% of cohort</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PLACEMENT FUNNEL TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'placements' && placementData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Total Applications</p>
              <p className="text-2xl font-black text-white mt-1">{placementData.total_applications}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Shortlisted</p>
              <p className="text-2xl font-black text-purple-300 mt-1">{placementData.shortlisted_count}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Selected / Hired</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{placementData.selected_count}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Conversion Rate</p>
              <p className="text-2xl font-black text-indigo-300 mt-1">{placementData.conversion_rate}%</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Departmental Placement Conversion Rates</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 font-bold">Department</th>
                    <th className="py-3 px-3 font-bold">Applications</th>
                    <th className="py-3 px-3 font-bold">Shortlisted</th>
                    <th className="py-3 px-3 font-bold">Selected</th>
                    <th className="py-3 px-3 font-bold">Conversion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {placementData.department_placements.map((dp: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white">{dp.department}</td>
                      <td className="py-3 px-3 font-mono">{dp.applied_count}</td>
                      <td className="py-3 px-3 font-mono text-purple-300">{dp.shortlisted_count}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{dp.selected_count}</td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-300">{dp.conversion_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MENTOR FEEDBACK TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'feedback' && feedbackData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Total Evaluations</p>
              <p className="text-2xl font-black text-white mt-1">{feedbackData.total_evaluations}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Average Rating</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{feedbackData.average_overall_score} / 5.0</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Hire Recommendation</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {feedbackData.recommendation_distribution.recommended_percentage}%
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Technical Rubric</p>
              <p className="text-2xl font-black text-indigo-300 mt-1">
                {feedbackData.rubric_averages.technical_competence} / 5.0
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">6-Point Corporate Rubric Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(feedbackData.rubric_averages).map(([key, val]) => (
                <div key={key} className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <p className="text-[11px] text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-black text-white mt-1">{Number(val)} / 5.0</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. DEPARTMENT & BATCH BENCHMARKS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'benchmarks' && (
        <div className="space-y-6">
          {/* Department Benchmark Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Departmental Comparative Benchmark Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 font-bold">Department</th>
                    <th className="py-3 px-3 font-bold">Students</th>
                    <th className="py-3 px-3 font-bold">Avg CGPA</th>
                    <th className="py-3 px-3 font-bold">Test Rate</th>
                    <th className="py-3 px-3 font-bold">Avg Test</th>
                    <th className="py-3 px-3 font-bold">Readiness %</th>
                    <th className="py-3 px-3 font-bold">Roadmap %</th>
                    <th className="py-3 px-3 font-bold">Hired</th>
                    <th className="py-3 px-3 font-bold">Conv %</th>
                    <th className="py-3 px-3 font-bold">Mentor Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deptBenchmarks.map(d => (
                    <tr key={d.department} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white">{d.department}</td>
                      <td className="py-3 px-3 font-mono">{d.student_count}</td>
                      <td className="py-3 px-3 font-mono">{d.average_cgpa.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono">{d.assessment_completion_rate}%</td>
                      <td className="py-3 px-3 font-mono text-purple-300">{d.average_assessment_score}%</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{d.skill_readiness_rate}%</td>
                      <td className="py-3 px-3 font-mono text-indigo-300">{d.average_roadmap_progress}%</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{d.selected_count}</td>
                      <td className="py-3 px-3 font-mono">{d.placement_conversion_rate}%</td>
                      <td className="py-3 px-3 font-mono text-amber-400">{d.mentor_feedback_score ? `${d.mentor_feedback_score}/5.0` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Batch Progression Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Batch & Year-of-Study Progression Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 font-bold">Batch / Year</th>
                    <th className="py-3 px-3 font-bold">Students</th>
                    <th className="py-3 px-3 font-bold">Avg CGPA</th>
                    <th className="py-3 px-3 font-bold">Test Rate</th>
                    <th className="py-3 px-3 font-bold">Readiness %</th>
                    <th className="py-3 px-3 font-bold">Roadmap %</th>
                    <th className="py-3 px-3 font-bold">Applying</th>
                    <th className="py-3 px-3 font-bold">Hired</th>
                    <th className="py-3 px-3 font-bold">Mentor Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {batchBenchmarks.map(b => (
                    <tr key={b.batch} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white">{b.batch}</td>
                      <td className="py-3 px-3 font-mono">{b.student_count}</td>
                      <td className="py-3 px-3 font-mono">{b.average_cgpa.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono">{b.assessment_completion_rate}%</td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{b.skill_readiness_rate}%</td>
                      <td className="py-3 px-3 font-mono text-indigo-300">{b.average_roadmap_progress}%</td>
                      <td className="py-3 px-3 font-mono">{b.actively_applying_count}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{b.selected_count}</td>
                      <td className="py-3 px-3 font-mono text-amber-400">{b.mentor_feedback_score ? `${b.mentor_feedback_score}/5.0` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. FORMAL EXECUTIVE REPORT CENTER TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'reports' && (
        <ExecutiveReportCenter dateRange={dateRange} department={department} batch={batch} />
      )}

      {/* Competency Radar Modal */}
      {inspectedStudentId && (
        <CompetencyRadarModal
          studentId={inspectedStudentId}
          onClose={() => setInspectedStudentId(null)}
        />
      )}
    </div>
  );
};
