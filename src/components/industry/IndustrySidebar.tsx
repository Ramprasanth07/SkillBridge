import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  Clock,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  TrendingUp
} from 'lucide-react';
import { IndustryActiveTab } from '../../types';

interface IndustrySidebarProps {
  activeTab: IndustryActiveTab;
  onTabChange: (tab: IndustryActiveTab) => void;
  stats?: {
    active_jobs: number;
    active_internships: number;
    total_applications: number;
    shortlisted_count: number;
  };
}

export const IndustrySidebar: React.FC<IndustrySidebarProps> = ({
  activeTab,
  onTabChange,
  stats
}) => {
  const { company, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as IndustryActiveTab,
      label: 'Industry Dashboard',
      subtitle: 'Overview & pipeline stats',
      icon: LayoutDashboard
    },
    {
      id: 'profile' as IndustryActiveTab,
      label: 'Company Profile',
      subtitle: 'Organization details & logo',
      icon: Building2
    },
    {
      id: 'jobs' as IndustryActiveTab,
      label: 'Manage Jobs',
      subtitle: 'Full-time & part-time roles',
      icon: Briefcase,
      count: stats?.active_jobs
    },
    {
      id: 'internships' as IndustryActiveTab,
      label: 'Manage Internships',
      subtitle: 'Student training programs',
      icon: GraduationCap,
      count: stats?.active_internships
    },
    {
      id: 'applications' as IndustryActiveTab,
      label: 'Application Pipeline',
      subtitle: 'Review & shortlist talent',
      icon: Users,
      count: stats?.total_applications,
      highlightBadge: stats?.shortlisted_count ? `${stats.shortlisted_count} Shortlisted` : undefined
    },
    {
      id: 'evaluations' as IndustryActiveTab,
      label: 'Mentor Feedback',
      subtitle: 'Internship & Job reviews',
      icon: Award
    },
    {
      id: 'analytics' as IndustryActiveTab,
      label: 'Recruitment Analytics',
      subtitle: 'Pipeline & match quality',
      icon: TrendingUp
    }
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Company Header Card */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-base shrink-0">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.company_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span>{company?.company_name ? company.company_name.charAt(0).toUpperCase() : 'C'}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs font-bold text-white truncate">
              {company?.company_name || 'CloudScale Technologies'}
            </h3>
            <p className="text-[11px] text-emerald-400 truncate">
              {company?.industry || 'Enterprise SaaS'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Employer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="p-3 space-y-1.5 flex-1">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Employer Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-industry-tab-${item.id}`}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-600/20 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs leading-tight font-semibold flex items-center gap-1.5">
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div
                    className={`text-[10px] truncate leading-tight mt-0.5 ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {item.count !== undefined && item.count !== null && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.highlightBadge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {item.highlightBadge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Action Helper Banner */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Student Matching</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Candidate applications showcase verified test scores from standardized assessments and student role readiness.
          </p>
        </div>
      </div>

      {/* Bottom Signout */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          id="sidebar-industry-logout-btn"
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
