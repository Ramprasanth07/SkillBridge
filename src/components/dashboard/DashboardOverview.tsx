import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardData, ActiveTab } from '../../types';
import { PlacementReadinessCard } from './PlacementReadinessCard';
import {
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Building2,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  ExternalLink,
  AlertCircle,
  Compass
} from 'lucide-react';

interface DashboardOverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab }) => {
  const { student, updateStudentLocally } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [matchingStats, setMatchingStats] = useState<{ total_applied: number; shortlisted: number; selected: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, matchRes] = await Promise.all([
        api.student.getDashboard(),
        api.matching.getRecommended().catch(() => ({ recommended: [], stats: { total_applied: 0, shortlisted: 0, selected: 0 } }))
      ]);
      setData(res);
      setRecommended(matchRes.recommended || []);
      setMatchingStats(matchRes.stats || null);
      updateStudentLocally(res.student);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-white rounded-2xl border border-slate-200 p-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-white rounded-2xl border border-slate-200 lg:col-span-2"></div>
          <div className="h-72 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Unable to load dashboard</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { student: currentStudent, stats, recent_skills, recent_projects, recent_certifications } = data;
  const completion = stats.profile_completion_percentage;

  return (
    <div className="space-y-6">
      {/* Hero Banner: Student Identity & Academic Details */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <img
              src={currentStudent.profile_photo || `https://api.dicebear.com/7.x/shapes/svg?seed=${currentStudent.full_name}`}
              alt={currentStudent.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 bg-slate-800 shrink-0 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(currentStudent.full_name)}`;
              }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                  {currentStudent.full_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentStudent.year_of_study}
                </span>
                {currentStudent.cgpa !== null && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CGPA: {currentStudent.cgpa}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{currentStudent.college_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{currentStudent.department}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-2xl line-clamp-2 pt-1">
                {currentStudent.bio || `Student in ${currentStudent.department} at ${currentStudent.college_name}.`}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end justify-between sm:justify-center gap-2 shrink-0">
            <button
              id="dashboard-roadmap-btn"
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-purple-200" />
              <span>Learning Roadmap</span>
            </button>
            <button
              id="dashboard-skillgap-btn"
              type="button"
              onClick={() => setActiveTab('skillgap')}
              className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-200" />
              <span>Skill Gap Analysis</span>
            </button>
            <button
              id="dashboard-take-assessment-btn"
              type="button"
              onClick={() => setActiveTab('assessments')}
              className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Skill Assessments</span>
            </button>
            <button
              id="dashboard-edit-profile-btn"
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-4 py-1.5 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <span>Edit Profile</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real Calculated Placement Readiness Score Card */}
      <PlacementReadinessCard
        readiness={data.placement_readiness}
        onRefresh={fetchDashboard}
        onNavigate={setActiveTab}
      />

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Placement Readiness Metric */}
        <div
          id="stat-card-placement-readiness"
          onClick={() => {
            const el = document.getElementById('placement-readiness-card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-white to-white border-2 border-indigo-500/30 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900">Placement Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-indigo-950">
              {Math.round(data.placement_readiness?.placement_readiness_percentage ?? data.placement_readiness?.total_score ?? 0)}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-indigo-700">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200">
                {data.placement_readiness?.tier || 'In Evaluation'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div
          id="stat-card-completion"
          onClick={() => setActiveTab('profile')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Profile Completion</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
              completion >= 80 ? 'bg-emerald-100 text-emerald-700' : completion >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {completion}%
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>{completion === 100 ? 'All milestones complete' : `${stats.missing_fields.length} items to complete`}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </p>
          </div>
        </div>

        {/* Skills Count */}
        <div
          id="stat-card-skills"
          onClick={() => setActiveTab('skills')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Skills</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900">{stats.total_skills_count}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="font-medium text-indigo-600">{stats.technical_skills_count} Tech</span>
              <span>•</span>
              <span className="font-medium text-emerald-600">{stats.soft_skills_count} Soft</span>
            </div>
          </div>
        </div>

        {/* Projects Count */}
        <div
          id="stat-card-projects"
          onClick={() => setActiveTab('projects')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Projects Built</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900">{stats.projects_count}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Showcased to industry</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </p>
          </div>
        </div>

        {/* Certifications Count */}
        <div
          id="stat-card-certifications"
          onClick={() => setActiveTab('certifications')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Certifications</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900">{stats.certifications_count}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Verified credentials</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Projects & Skills) + Right (Academic Info & Missing Milestones) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase 6 Top Matched Opportunities */}
          {recommended && recommended.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 rounded-2xl border border-indigo-900/60 p-5 sm:p-6 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Top Matched Opportunities</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Calculated from your verified competencies and assessment benchmarks.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('opportunities')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Explore All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommended.slice(0, 3).map((item) => {
                  const opp = item.opportunity;
                  const company = opp.company;
                  const matchScore = item.match_score;
                  const matchTier = item.match?.match_tier || 'Good Match';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab('opportunities')}
                      className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                            {item.type}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{matchScore}%</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {opp.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold truncate">
                          {company?.company_name || 'Corporate Partner'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{opp.location}</span>
                        <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                          Apply <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Skills Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Your Skills Portfolio</h2>
                <p className="text-xs text-slate-500">Validated competencies recognized for campus & industry</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Manage All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recent_skills.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Code2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No skills added yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Add technical and soft skills to improve your profile rating</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('skills')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Add Skills
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recent_skills.map((item) => (
                  <div
                    key={item.id}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                      item.skill.category === 'technical'
                        ? 'bg-blue-50/70 border-blue-200 text-blue-800'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <span>{item.skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/80 font-bold border border-slate-200/60">
                      {item.proficiency_level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Projects Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Featured Projects</h2>
                <p className="text-xs text-slate-500">Academic & personal projects with live links</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Add / Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recent_projects.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No projects added yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Add academic capstones, hackathon projects, or hobby code</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Create Project Entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recent_projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{project.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      {project.project_link && (
                        <a
                          href={project.project_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
                          title="Open project link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
                        {project.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white text-slate-700 border border-slate-200 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Personalized Learning Roadmap Promo Card */}
          <div
            id="dashboard-roadmap-promo-card"
            onClick={() => setActiveTab('roadmap')}
            className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white border border-purple-500/30 hover:border-purple-400/60 shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-end mb-2">
              <ArrowUpRight className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Personalized Learning Roadmap</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              4-Stage targeted preparation pathway converting your identified skill gaps into hands-on exercises and capstone milestones.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-purple-300 pt-2 border-t border-slate-800/80">
              <span>Launch Preparation Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Skill Gap Highlight Card */}
          <div
            id="dashboard-skill-gap-promo-card"
            onClick={() => setActiveTab('skillgap')}
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white border border-indigo-500/30 hover:border-indigo-400/60 shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-end mb-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Skill Gap & Industry Matching</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Evaluate your profile against Full-Stack, Cloud & DevOps, AI/ML, and Data Systems industry benchmarks.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300 pt-2 border-t border-slate-800">
              <span>View Gap Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Institutional Record Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Academic Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">College / University</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{currentStudent.college_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Department</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">{currentStudent.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Year</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{currentStudent.year_of_study}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider block">Cumulative CGPA</span>
                  <span className="text-base font-extrabold text-indigo-950 mt-0.5 block">
                    {currentStudent.cgpa !== null ? `${currentStudent.cgpa} / 10.0` : 'Not recorded'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Missing Profile Items Helper */}
          {stats.missing_fields.length > 0 ? (
            <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Recommended Milestones</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed mb-3">
                Complete these items to achieve 100% profile readiness:
              </p>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {stats.missing_fields.map((field, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-emerald-900">Profile 100% Complete!</p>
              <p className="text-[11px] text-emerald-700 mt-1">Your academic and technical profile is in peak condition for industry opportunities.</p>
            </div>
          )}

          {/* Certifications Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Certifications
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('certifications')}
                className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
              >
                + Add
              </button>
            </div>

            {recent_certifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No certifications added yet.</p>
            ) : (
              <div className="space-y-2">
                {recent_certifications.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800 truncate">{c.certificate_name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.issuing_organization}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
