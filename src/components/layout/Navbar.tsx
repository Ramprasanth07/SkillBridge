import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import { 
  GraduationCap, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  ExternalLink,
  ChevronDown,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const { student, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header id="app-navbar" className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-toggle"
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                  Skill<span className="text-indigo-600">Bridge</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Student Portal
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick College Tag */}
            {student?.college_name && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 max-w-xs truncate">
                <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{student.college_name}</span>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="navbar-notifications-btn"
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDropdown(false);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
              </button>

              {showNotifications && (
                <div 
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                    <span className="text-xs text-indigo-600 font-medium">1 New</span>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Welcome to SkillBridge!</p>
                      <p className="text-xs text-slate-500 mt-0.5">Complete your profile to unlock verified skill badges and portfolio showcases.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                type="button"
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden"
              >
                <img
                  src={student?.profile_photo || `https://api.dicebear.com/7.x/shapes/svg?seed=${student?.full_name || 'Student'}`}
                  alt={student?.full_name || 'Student Avatar'}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(student?.full_name || 'Student')}`;
                  }}
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {student?.full_name || 'Student'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {student?.department ? student.department.split(' ')[0] : 'CSE'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {showDropdown && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{student?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{student?.email || 'student@university.edu'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active Student
                    </div>
                  </div>

                  <button
                    id="dropdown-profile-link"
                    type="button"
                    onClick={() => {
                      setActiveTab('profile');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Manage Profile
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    id="dropdown-logout-btn"
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
