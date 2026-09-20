import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  LogOut,
  Bell,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { IndustryActiveTab } from '../../types';

interface IndustryNavbarProps {
  activeTab: IndustryActiveTab;
  onTabChange: (tab: IndustryActiveTab) => void;
  onOpenMobileMenu?: () => void;
}

export const IndustryNavbar: React.FC<IndustryNavbarProps> = ({
  activeTab,
  onTabChange
}) => {
  const { company, user, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Portal Type */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Skill<span className="text-emerald-400">Bridge</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Industry Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {company?.company_name || 'Industry Partner'}
              </p>
            </div>
          </div>

          {/* Quick Nav Chips */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              id="navbar-industry-tab-dashboard"
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              id="navbar-industry-tab-jobs"
              type="button"
              onClick={() => onTabChange('jobs')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jobs
            </button>
            <button
              id="navbar-industry-tab-internships"
              type="button"
              onClick={() => onTabChange('internships')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'internships'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Internships
            </button>
            <button
              id="navbar-industry-tab-applications"
              type="button"
              onClick={() => onTabChange('applications')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'applications'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Applicants
            </button>
            <button
              id="navbar-industry-tab-evaluations"
              type="button"
              onClick={() => onTabChange('evaluations')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'evaluations'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mentor Feedback
            </button>
            <button
              id="navbar-industry-tab-analytics"
              type="button"
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Company Profile pill & Logout */}
          <div className="flex items-center gap-3">
            <button
              id="navbar-industry-profile-btn"
              type="button"
              onClick={() => onTabChange('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {company?.company_name ? company.company_name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors leading-tight">
                  {company?.company_name || 'My Company'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {company?.industry || 'Employer'}
                </div>
              </div>
            </button>

            <button
              id="navbar-industry-logout-btn"
              type="button"
              onClick={logout}
              title="Sign out of employer account"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
