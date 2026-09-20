import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ProfileView } from './components/profile/ProfileView';
import { SkillsManager } from './components/skills/SkillsManager';
import { ProjectsManager } from './components/projects/ProjectsManager';
import { CertificationsManager } from './components/certifications/CertificationsManager';
import { AssessmentManager } from './components/assessment/AssessmentManager';
import { SkillGapManager } from './components/skillgap/SkillGapManager';
import { StudentOpportunities } from './components/opportunities/StudentOpportunities';
import { StudentFeedbackView } from './components/feedback/StudentFeedbackView';
import { StudentPersonalAnalyticsView } from './components/analytics/StudentPersonalAnalyticsView';
import { LearningRoadmapView } from './components/roadmap/LearningRoadmapView';
import { IndustryPortal } from './components/industry/IndustryPortal';
import { CollegeAdminPortal } from './components/college/CollegeAdminPortal';
import { ActiveTab } from './types';
import { GraduationCap, Loader2, Building2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, loading, isIndustry, company, isAdmin, user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Initializing SkillBridge Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginForm onSwitchToRegister={() => setAuthView('register')} />;
    }
    return <RegisterForm onSwitchToLogin={() => setAuthView('login')} />;
  }

  // Phase 7: College / Institutional Admin Portal
  if (isAdmin || user?.role === 'admin') {
    return <CollegeAdminPortal />;
  }

  // Phase 5: Industry / Employer Portal
  if (isIndustry || !!company) {
    return <IndustryPortal />;
  }

  // Student Portal (Phases 1, 2, 3, 4, 6)
  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
      {activeTab === 'profile' && <ProfileView setActiveTab={setActiveTab} />}
      {activeTab === 'skills' && <SkillsManager />}
      {activeTab === 'assessments' && <AssessmentManager />}
      {activeTab === 'skillgap' && <SkillGapManager onNavigateToTab={setActiveTab} />}
      {activeTab === 'analytics' && <StudentPersonalAnalyticsView />}
      {activeTab === 'roadmap' && <LearningRoadmapView setActiveTab={setActiveTab} />}
      {activeTab === 'opportunities' && <StudentOpportunities />}
      {activeTab === 'feedback' && <StudentFeedbackView onNavigateToOpportunities={() => setActiveTab('opportunities')} />}
      {activeTab === 'projects' && <ProjectsManager />}
      {activeTab === 'certifications' && <CertificationsManager />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
