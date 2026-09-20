import React from 'react';
import { IndustryDashboardData, IndustryActiveTab, Application } from '../../types';
import {
  Building2,
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Award,
  Filter,
  UserCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface IndustryDashboardOverviewProps {
  data: IndustryDashboardData | null;
  loading: boolean;
  onTabChange: (tab: IndustryActiveTab) => void;
  onSelectApplication: (application: Application) => void;
  onOpenCreateJob: () => void;
  onOpenCreateInternship: () => void;
}

export const IndustryDashboardOverview: React.FC<IndustryDashboardOverviewProps> = ({
  data,
  loading,
  onTabChange,
  onSelectApplication,
  onOpenCreateJob,
  onOpenCreateInternship
}) => {
  if (loading || !data) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-28 bg-slate-800 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-24 bg-slate-800 rounded-xl" />
            <div className="h-24 bg-slate-800 rounded-xl" />
            <div className="h-24 bg-slate-800 rounded-xl" />
            <div className="h-24 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const {
    company,
    active_jobs_count,
    active_internships_count,
    total_applications_count,
    shortlisted_candidates_count,
    selected_candidates_count,
    under_review_count,
    recent_applications,
    recent_postings
  } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Hero Employer Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-850 via-slate-800 to-emerald-950/40 border border-slate-750 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Industry Portal & Employer Collaboration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
              Welcome back, {company.company_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Connect directly with verified university engineering students, post high-impact job and internship roles, and streamline your academic hiring pipeline with skill assessment benchmarks.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="dashboard-create-job-btn"
              type="button"
              onClick={onOpenCreateJob}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Job</span>
            </button>

            <button
              id="dashboard-create-internship-btn"
              type="button"
              onClick={onOpenCreateInternship}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Post Internship</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs */}
        <div
          onClick={() => onTabChange('jobs')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{active_jobs_count}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>{data.total_jobs_count} total postings</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </p>
        </div>

        {/* Active Internships */}
        <div
          onClick={() => onTabChange('internships')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Internships</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{active_internships_count}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>{data.total_internships_count} total programs</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </p>
        </div>

        {/* Total Applications */}
        <div
          onClick={() => onTabChange('applications')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applicants</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{total_applications_count}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>{under_review_count} under review</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </p>
        </div>

        {/* Shortlisted Candidates */}
        <div
          onClick={() => onTabChange('applications')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted Talent</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{shortlisted_candidates_count}</div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>{selected_candidates_count} hired / selected</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </p>
        </div>
      </div>

      {/* 3. Pipeline Funnel & Stage Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Candidate Pipeline Stage Distribution
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('applications')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="text-[11px] font-semibold text-slate-400">New Applications</div>
            <div className="text-lg font-black text-white mt-0.5">
              {total_applications_count - under_review_count - shortlisted_candidates_count - selected_candidates_count}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-center">
            <div className="text-[11px] font-semibold text-indigo-300">Under Review</div>
            <div className="text-lg font-black text-indigo-200 mt-0.5">{under_review_count}</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-center">
            <div className="text-[11px] font-semibold text-amber-300">Shortlisted</div>
            <div className="text-lg font-black text-amber-200 mt-0.5">{shortlisted_candidates_count}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
            <div className="text-[11px] font-semibold text-emerald-300">Selected / Hired</div>
            <div className="text-lg font-black text-emerald-200 mt-0.5">{selected_candidates_count}</div>
          </div>
        </div>
      </div>

      {/* 4. Recent Applications & Recent Postings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications List */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Recent Applicant Profiles
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onTabChange('applications')}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold"
            >
              See All ({total_applications_count})
            </button>
          </div>

          {recent_applications.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">No applications received yet.</p>
              <p className="text-[11px] text-slate-500">
                Post active job and internship roles to attract verified student talent.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent_applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                      {app.student?.full_name ? app.student.full_name.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {app.student?.full_name || 'Student Candidate'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.opportunity_title} •{' '}
                        <span className="capitalize text-slate-400">{app.opportunity_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.match_score !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{app.match_score}%</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        app.status === 'Shortlisted'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : app.status === 'Selected'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : app.status === 'Under Review'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-slate-900 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Job & Internship Postings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Listings ({recent_postings.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTabChange('jobs')}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold"
              >
                Manage All
              </button>
            </div>
          </div>

          {recent_postings.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">No job or internship postings created yet.</p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={onOpenCreateJob}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Create First Job
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent_postings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onTabChange(item.type === 'job' ? 'jobs' : 'internships')}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.type === 'job'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-teal-950 text-teal-300 border border-teal-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.location} • {item.work_arrangement} • {item.applications_count || 0} applicants
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
