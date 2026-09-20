import React, { useState, useEffect } from 'react';
import { Application } from '../../types';
import { api } from '../../services/api';
import { CandidateProfileModal } from './CandidateProfileModal';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Calendar,
  GraduationCap,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Award,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  FolderGit2,
  FileCheck
} from 'lucide-react';

interface ApplicationPipelineProps {
  initialFilterPostingId?: string;
  onRefreshStats?: () => void;
}

export const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({
  initialFilterPostingId,
  onRefreshStats
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'internship'>('all');
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'highest_match' | 'latest' | 'name'>('highest_match');

  // Candidate Modal
  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);

  // Status message
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.industry.getApplications();
      setApplications(res.applications);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setBannerMsg({ type: 'error', text: err.message || 'Failed to load applications' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: Application['status'],
    notes?: string
  ) => {
    try {
      const res = await api.industry.updateApplicationStatus(applicationId, newStatus, notes);
      setApplications(prev => prev.map(a => (a.id === applicationId ? res.application : a)));
      if (selectedAppForModal && selectedAppForModal.id === applicationId) {
        setSelectedAppForModal(res.application);
      }
      setBannerMsg({ type: 'success', text: `Application status updated to "${newStatus}"` });
      if (onRefreshStats) onRefreshStats();
      setTimeout(() => setBannerMsg(null), 3500);
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: err.message || 'Failed to update application status' });
    }
  };

  const filteredApplications = applications.filter((app) => {
    const studentName = app.student?.full_name?.toLowerCase() || '';
    const studentDept = app.student?.department?.toLowerCase() || '';
    const studentCollege = app.student?.college_name?.toLowerCase() || '';
    const oppTitle = app.opportunity_title?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      studentName.includes(q) ||
      studentDept.includes(q) ||
      studentCollege.includes(q) ||
      oppTitle.includes(q);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.opportunity_type === typeFilter;

    let matchesMatch = true;
    const score = app.match_score ?? 0;
    if (matchFilter === 'strong') matchesMatch = score >= 80;
    else if (matchFilter === 'good') matchesMatch = score >= 60;
    else if (matchFilter === 'developing') matchesMatch = score >= 40;

    return matchesSearch && matchesStatus && matchesType && matchesMatch;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'highest_match') {
      const scoreA = a.match_score ?? 0;
      const scoreB = b.match_score ?? 0;
      return scoreB - scoreA;
    } else if (sortBy === 'latest') {
      return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
    } else if (sortBy === 'name') {
      return (a.student?.full_name || '').localeCompare(b.student?.full_name || '');
    }
    return 0;
  });

  const getStatusBadgeClass = (status: Application['status']) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Selected':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'In Progress':
        return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'Completed':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Under Review':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'Rejected':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getMatchTierBadge = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 80) {
      return { label: 'Strong Fit', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
    } else if (score >= 60) {
      return { label: 'Good Fit', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
    } else if (score >= 40) {
      return { label: 'Developing', color: 'bg-amber-950 text-amber-300 border-amber-800' };
    } else {
      return { label: 'Low Fit', color: 'bg-rose-950 text-rose-300 border-rose-800' };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Candidate Pipeline & Matching Dossiers
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review student candidates, inspect multi-factor AI match scores, evaluate verified assessment benchmarks, and advance candidates through hiring stages.
          </p>
        </div>
      </div>

      {/* Messages */}
      {bannerMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 shadow-sm ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3.5 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="applicant-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, department, university, or position title..."
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <button
                id="pipeline-type-all-btn"
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Types
              </button>
              <button
                id="pipeline-type-jobs-btn"
                type="button"
                onClick={() => setTypeFilter('job')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  typeFilter === 'job'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jobs
              </button>
              <button
                id="pipeline-type-internships-btn"
                type="button"
                onClick={() => setTypeFilter('internship')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  typeFilter === 'internship'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Internships
              </button>
            </div>

            {/* Match Tier Filter */}
            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Match Scores</option>
              <option value="strong">80%+ (Strong Match)</option>
              <option value="good">60%+ (Good Match)</option>
              <option value="developing">40%+ (Developing)</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="highest_match">Highest Match %</option>
              <option value="latest">Latest Applications</option>
              <option value="name">Candidate Name</option>
            </select>
          </div>
        </div>

        {/* Status Stage Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
          {[
            { id: 'all', label: 'All Statuses', count: applications.length },
            { id: 'Applied', label: 'Applied', count: applications.filter(a => a.status === 'Applied').length },
            { id: 'Under Review', label: 'Under Review', count: applications.filter(a => a.status === 'Under Review').length },
            { id: 'Shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'Shortlisted').length },
            { id: 'Selected', label: 'Selected / Hired', count: applications.filter(a => a.status === 'Selected').length },
            { id: 'In Progress', label: 'In Progress', count: applications.filter(a => a.status === 'In Progress').length },
            { id: 'Completed', label: 'Completed', count: applications.filter(a => a.status === 'Completed').length },
            { id: 'Rejected', label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length }
          ].map((item) => (
            <button
              key={item.id}
              id={`pipeline-status-btn-${item.id}`}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === item.id
                  ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                  : 'bg-slate-800/60 text-slate-400 border-slate-750 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 font-bold">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications Pipeline Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading candidate dossiers...</p>
        </div>
      ) : sortedApplications.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Candidates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || matchFilter !== 'all'
              ? 'No applicant profiles match the selected filters.'
              : 'Candidate applications will appear here as university students apply to your active postings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedApplications.map((app) => {
            const tierInfo = getMatchTierBadge(app.match_score);

            return (
              <div
                key={app.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition-all space-y-3 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-indigo-600/20">
                      {app.student?.full_name ? app.student.full_name.charAt(0).toUpperCase() : 'S'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {app.student?.full_name || 'Student Candidate'}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>

                        {/* Explicit Job vs Internship Distinction Badge */}
                        {app.opportunity_type === 'job' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-blue-400" />
                            <span>Career Job</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-teal-400" />
                            <span>Mentored Internship</span>
                          </span>
                        )}

                        {/* Evidence Indicator Badge */}
                        {(app.certificate_url || app.certificate_reference || app.portfolio_link) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                            <Award className="w-3 h-3 text-purple-400" />
                            <span>Evidence Attached</span>
                          </span>
                        )}

                        {app.match_score !== undefined && tierInfo && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${tierInfo.color}`}>
                            <Sparkles className="w-3 h-3" />
                            <span>{app.match_score}% Match • {tierInfo.label}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">
                        {app.student?.department || 'Department'} •{' '}
                        {app.student?.college_name || 'Institution'} •{' '}
                        <span className="text-indigo-400">{app.student?.year_of_study || 'Year'}</span>
                        {app.student?.cgpa && (
                          <span className="text-emerald-400 font-semibold ml-2">
                            • CGPA: {app.student.cgpa}/10
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="font-semibold text-emerald-400">
                          Role: {app.opportunity_title}
                        </span>
                        <span>•</span>
                        <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Quick Select */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center">
                    <button
                      id={`applicant-review-btn-${app.id}`}
                      type="button"
                      onClick={() => setSelectedAppForModal(app)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Dossier & Fit</span>
                    </button>

                    <button
                      id={`applicant-shortlist-btn-${app.id}`}
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        app.status === 'Shortlisted'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Shortlist</span>
                    </button>

                    <button
                      id={`applicant-select-btn-${app.id}`}
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, 'Selected')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        app.status === 'Selected'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Select / Hire</span>
                    </button>

                    {app.opportunity_type === 'internship' && app.status === 'Selected' && (
                      <button
                        id={`applicant-progress-btn-${app.id}`}
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'In Progress')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800 hover:bg-teal-900 transition-all flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>Start Internship</span>
                      </button>
                    )}

                    {app.opportunity_type === 'internship' && app.status === 'In Progress' && (
                      <button
                        id={`applicant-complete-btn-${app.id}`}
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'Completed')}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 transition-all flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Evidence Showcase Bar (if present) */}
                {(app.certificate_url || app.certificate_reference || app.portfolio_link) && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/60 text-xs text-purple-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold flex items-center gap-1.5 text-purple-300">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>Internship Completion Evidence:</span>
                      </span>
                      {app.certificate_reference && (
                        <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-800 text-[10px] font-mono">
                          ID: {app.certificate_reference}
                        </span>
                      )}
                      {app.completion_date && (
                        <span className="text-[11px] text-slate-300">
                          Completed: {app.completion_date}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.certificate_url && (
                        <a
                          href={app.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-[11px] font-semibold flex items-center gap-1 border border-purple-700 transition-colors"
                        >
                          <FileCheck className="w-3 h-3" />
                          <span>View Certificate</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {app.portfolio_link && (
                        <a
                          href={app.portfolio_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-750 transition-colors"
                        >
                          <FolderGit2 className="w-3 h-3 text-emerald-400" />
                          <span>Project Portfolio</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Cover note preview if exists */}
                {app.cover_note && (
                  <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="italic line-clamp-1">"{app.cover_note}"</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedAppForModal && (
        <CandidateProfileModal
          application={selectedAppForModal}
          onClose={() => setSelectedAppForModal(null)}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </div>
  );
};
