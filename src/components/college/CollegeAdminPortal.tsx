import React, { useState } from 'react';
import { CollegeActiveTab } from '../../types';
import { CollegeSidebar } from './CollegeSidebar';
import { CollegeAdminDashboard } from './CollegeAdminDashboard';
import { StudentReadinessRoster } from './StudentReadinessRoster';
import { DepartmentAnalytics } from './DepartmentAnalytics';
import { BatchAnalytics } from './BatchAnalytics';
import { SkillReadinessAnalytics } from './SkillReadinessAnalytics';
import { AssessmentAnalytics } from './AssessmentAnalytics';
import { PlacementAnalytics } from './PlacementAnalytics';
import { IndustryEngagement } from './IndustryEngagement';
import { InstitutionalReports } from './InstitutionalReports';
import { CollegeFeedbackAnalyticsView } from './CollegeFeedbackAnalyticsView';
import { AnalyticsReportsView } from '../analytics/AnalyticsReportsView';
import { Menu, X, Landmark, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CollegeAdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CollegeActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const tabTitles: Record<CollegeActiveTab, string> = {
    dashboard: 'Institutional Executive Overview',
    executive: 'Executive Analytics & Governance Reports',
    students: 'Student Placement Readiness Roster',
    departments: 'Academic Department Benchmarks',
    batches: 'Graduation Batch & Cohort Analytics',
    readiness: 'Skill Readiness & Market Gap Matrix',
    assessments: 'Standardized Assessment Analytics',
    placements: 'Recruitment & Placement Outcomes',
    industry: 'Industry & Corporate Engagement',
    evaluations: 'Industry Mentor Feedback & Performance Analytics',
    reports: 'Institutional Governance Reports'
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <CollegeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-64 h-full bg-slate-900 border-r border-slate-800 shadow-2xl relative flex flex-col">
            <div className="p-3 flex justify-end border-b border-slate-800">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CollegeSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 md:hidden hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {tabTitles[activeTab]}
              </h1>
              <span className="text-[10px] text-purple-400 font-semibold hidden sm:inline-block">
                College Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Institutional Admin Mode</span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <CollegeAdminDashboard onNavigateTab={setActiveTab} />}
            {activeTab === 'executive' && <AnalyticsReportsView />}
            {activeTab === 'students' && <StudentReadinessRoster />}
            {activeTab === 'departments' && <DepartmentAnalytics />}
            {activeTab === 'batches' && <BatchAnalytics />}
            {activeTab === 'readiness' && <SkillReadinessAnalytics />}
            {activeTab === 'assessments' && <AssessmentAnalytics />}
            {activeTab === 'placements' && <PlacementAnalytics />}
            {activeTab === 'industry' && <IndustryEngagement />}
            {activeTab === 'evaluations' && <CollegeFeedbackAnalyticsView />}
            {activeTab === 'reports' && <InstitutionalReports />}
          </div>
        </main>
      </div>
    </div>
  );
};
