import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CollegeActiveTab } from '../../types';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Calendar,
  Zap,
  CheckCircle2,
  Briefcase,
  Layers,
  Award,
  FileText,
  LogOut,
  Landmark,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface CollegeSidebarProps {
  activeTab: CollegeActiveTab;
  setActiveTab: (tab: CollegeActiveTab) => void;
  onCloseMobile?: () => void;
}

export const CollegeSidebar: React.FC<CollegeSidebarProps> = ({
  activeTab,
  setActiveTab,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{
    id: CollegeActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Institutional Overview', icon: LayoutDashboard },
    { id: 'executive', label: 'Executive Analytics & Reports', icon: BarChart3 },
    { id: 'students', label: 'Student Readiness Roster', icon: Users },
    { id: 'departments', label: 'Department Analytics', icon: Building2 },
    { id: 'batches', label: 'Batch Analytics', icon: Calendar },
    { id: 'readiness', label: 'Skill Readiness & Gap', icon: Zap },
    { id: 'assessments', label: 'Assessment Analytics', icon: CheckCircle2 },
    { id: 'placements', label: 'Placement & Hiring', icon: Briefcase },
    { id: 'industry', label: 'Industry Engagement', icon: Layers },
    { id: 'evaluations', label: 'Mentor Feedback & Reviews', icon: Award },
    { id: 'reports', label: 'Institutional Reports', icon: FileText }
  ];

  const handleSelect = (tab: CollegeActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Header / Brand */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">SkillBridge</span>
            </div>
            <p className="text-[11px] text-purple-400 font-semibold truncate">College Admin</p>
          </div>
        </div>

        {/* Institution Badge */}
        <div className="mt-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[11px] font-semibold truncate">Institute of Technology & Science</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
          Institutional Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`college-nav-${item.id}-btn`}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
            </button>
          );
        })}
      </nav>

      {/* User / Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">College Administrator</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@university.edu'}</div>
            </div>
          </div>
          <button
            id="college-logout-btn"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
