import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  UserCircle2,
  Code2,
  FolderGit2,
  Award,
  LogOut,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Briefcase,
  Target,
  Compass
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile
}) => {
  const { student, logout } = useAuth();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCircle2 },
    { id: 'skills', label: 'Skills', icon: Code2, badge: student?.stats?.skills_count ? `${student.stats.skills_count}` : undefined },
    { id: 'assessments', label: 'Skill Assessments', icon: BookOpen },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: TrendingUp },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass },
    { id: 'analytics', label: 'Competency Radar', icon: Target },
    { id: 'opportunities', label: 'Job & Internship Match', icon: Briefcase },
    { id: 'feedback', label: 'Industry Feedback', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: student?.stats?.projects_count ? `${student.stats.projects_count}` : undefined },
    { id: 'certifications', label: 'Certifications', icon: Award, badge: student?.stats?.certifications_count ? `${student.stats.certifications_count}` : undefined },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const completion = student?.profile_completion ?? 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs font-bold">
              SB
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base font-sans">
                Skill<span className="text-indigo-400">Bridge</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Student Mini Profile Summary */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <img
              src={student?.profile_photo || `https://api.dicebear.com/7.x/shapes/svg?seed=${student?.full_name || 'Student'}`}
              alt={student?.full_name || 'Student'}
              className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{student?.full_name || 'Student Name'}</p>
              <p className="text-[11px] text-slate-400 truncate">{student?.department || 'Department'}</p>
              <p className="text-[10px] text-indigo-300 font-medium">{student?.year_of_study || 'Student'}</p>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-3 pt-3 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-400 font-medium">Profile Strength</span>
              <span className="text-indigo-300 font-bold">{completion}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, completion)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Portal Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                </div>
              </button>
            );
          })}

          <div className="pt-4 pb-2">
            <div className="px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Academia Verification</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Institutional records are securely mapped to {student?.college_name || 'your college'}.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            id="sidebar-logout-btn"
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
