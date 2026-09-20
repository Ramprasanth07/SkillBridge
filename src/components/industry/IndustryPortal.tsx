import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IndustryActiveTab, IndustryDashboardData, Application } from '../../types';
import { IndustryNavbar } from './IndustryNavbar';
import { IndustrySidebar } from './IndustrySidebar';
import { IndustryDashboardOverview } from './IndustryDashboardOverview';
import { CompanyProfileManager } from './CompanyProfileManager';
import { JobManager } from './JobManager';
import { InternshipManager } from './InternshipManager';
import { ApplicationPipeline } from './ApplicationPipeline';
import { CandidateProfileModal } from './CandidateProfileModal';
import { MentorFeedbackManager } from './MentorFeedbackManager';
import { IndustryAnalyticsView } from '../analytics/IndustryAnalyticsView';

export const IndustryPortal: React.FC = () => {
  const { company } = useAuth();
  const [activeTab, setActiveTab] = useState<IndustryActiveTab>('dashboard');
  const [dashboardData, setDashboardData] = useState<IndustryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal flags
  const [openJobCreate, setOpenJobCreate] = useState(false);
  const [openInternshipCreate, setOpenInternshipCreate] = useState(false);
  const [selectedCandidateApp, setSelectedCandidateApp] = useState<Application | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.industry.getDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load employer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenJobCreate = () => {
    setOpenJobCreate(true);
    setActiveTab('jobs');
  };

  const handleOpenInternshipCreate = () => {
    setOpenInternshipCreate(true);
    setActiveTab('internships');
  };

  const handleSelectApplicationFromDashboard = (app: Application) => {
    setSelectedCandidateApp(app);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <IndustryNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setOpenJobCreate(false);
          setOpenInternshipCreate(false);
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <IndustrySidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setOpenJobCreate(false);
            setOpenInternshipCreate(false);
          }}
          stats={
            dashboardData
              ? {
                  active_jobs: dashboardData.active_jobs_count,
                  active_internships: dashboardData.active_internships_count,
                  total_applications: dashboardData.total_applications_count,
                  shortlisted_count: dashboardData.shortlisted_candidates_count
                }
              : undefined
          }
        />

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-950 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <IndustryDashboardOverview
              data={dashboardData}
              loading={loading}
              onTabChange={(tab) => setActiveTab(tab)}
              onSelectApplication={handleSelectApplicationFromDashboard}
              onOpenCreateJob={handleOpenJobCreate}
              onOpenCreateInternship={handleOpenInternshipCreate}
            />
          )}

          {activeTab === 'profile' && (
            <CompanyProfileManager
              company={company}
              onRefresh={fetchDashboardData}
            />
          )}

          {activeTab === 'jobs' && (
            <JobManager
              openCreateModalDirectly={openJobCreate}
              onModalClose={() => setOpenJobCreate(false)}
              onSelectApplicationForJob={() => {
                setActiveTab('applications');
              }}
            />
          )}

          {activeTab === 'internships' && (
            <InternshipManager
              openCreateModalDirectly={openInternshipCreate}
              onModalClose={() => setOpenInternshipCreate(false)}
              onSelectApplicationForInternship={() => {
                setActiveTab('applications');
              }}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationPipeline
              onRefreshStats={fetchDashboardData}
            />
          )}

          {activeTab === 'evaluations' && (
            <MentorFeedbackManager
              onRefreshParentStats={fetchDashboardData}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="p-6 max-w-7xl mx-auto">
              <IndustryAnalyticsView />
            </div>
          )}
        </main>
      </div>

      {/* Candidate Modal triggered from Dashboard */}
      {selectedCandidateApp && (
        <CandidateProfileModal
          application={selectedCandidateApp}
          onClose={() => setSelectedCandidateApp(null)}
          onStatusChange={async (appId, newStatus, notes) => {
            await api.industry.updateApplicationStatus(appId, newStatus, notes);
            await fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
