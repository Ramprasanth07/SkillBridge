import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { api } from '../../services/api';
import {
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Sparkles,
  AlertCircle,
  FileCheck,
  Send,
  Eye,
  Calendar,
  Search,
  Filter,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Award,
  ExternalLink,
  FolderGit2,
  UploadCloud,
  FileText,
  X,
  PlusCircle,
  Check
} from 'lucide-react';

interface ApplicationTrackerProps {
  applications: Application[];
  loading: boolean;
  onRefresh: () => void;
  onBrowse: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  loading,
  onRefresh,
  onBrowse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'internship'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Evidence submission state
  const [evidenceModalApp, setEvidenceModalApp] = useState<Application | null>(null);
  const [completionDate, setCompletionDate] = useState('');
  const [certReference, setCertReference] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [appStatus, setAppStatus] = useState<ApplicationStatus>('Completed');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [evidenceSuccess, setEvidenceSuccess] = useState<string | null>(null);

  const openEvidenceModal = (app: Application) => {
    setEvidenceModalApp(app);
    setCompletionDate(app.completion_date || new Date().toISOString().split('T')[0]);
    setCertReference(app.certificate_reference || '');
    setCertUrl(app.certificate_url || '');
    setPortfolioLink(app.portfolio_link || '');
    setCompletionNotes(app.completion_notes || '');
    setAppStatus(app.status === 'Completed' ? 'Completed' : 'In Progress');
    setEvidenceError(null);
    setEvidenceSuccess(null);
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalApp) return;

    if (!certUrl.trim() && !portfolioLink.trim() && !certReference.trim()) {
      setEvidenceError('Please provide at least a Certificate Link, Certificate Reference ID, or Portfolio Link.');
      return;
    }

    try {
      setSubmittingEvidence(true);
      setEvidenceError(null);
      await api.opportunities.submitApplicationEvidence(evidenceModalApp.id, {
        completion_date: completionDate || undefined,
        certificate_reference: certReference.trim() || undefined,
        certificate_url: certUrl.trim() || undefined,
        portfolio_link: portfolioLink.trim() || undefined,
        completion_notes: completionNotes.trim() || undefined,
        status: appStatus
      });

      setEvidenceSuccess('Internship completion evidence saved successfully! Placement readiness updated.');
      onRefresh();
      setTimeout(() => {
        setEvidenceModalApp(null);
        setEvidenceSuccess(null);
      }, 1500);
    } catch (err: any) {
      setEvidenceError(err.message || 'Failed to submit internship evidence');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const filtered = applications.filter((app) => {
    const opp = app.opportunity;
    const title = (opp?.title || app.opportunity_title || '').toLowerCase();
    const company = (app.company?.company_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = title.includes(q) || company.includes(q);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.opportunity_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Application['status']) => {
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

  const getStageIndex = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 0;
      case 'Under Review':
        return 1;
      case 'Shortlisted':
        return 2;
      case 'Selected':
        return 3;
      case 'In Progress':
        return 4;
      case 'Completed':
        return 5;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Search & Status Filters */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="tracker-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your applications by role title or company name..."
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Quick Switcher: All / Jobs / Internships */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs shrink-0">
            <button
              type="button"
              id="filter-type-all"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                typeFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              type="button"
              id="filter-type-jobs"
              onClick={() => setTypeFilter('job')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'job' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Jobs ({applications.filter((a) => a.opportunity_type === 'job').length})</span>
            </button>
            <button
              type="button"
              id="filter-type-internships"
              onClick={() => setTypeFilter('internship')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'internship' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Internships ({applications.filter((a) => a.opportunity_type === 'internship').length})</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-800/80">
          {['all', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'In Progress', 'Completed', 'Rejected'].map((st) => (
            <button
              key={st}
              type="button"
              id={`tracker-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                  : 'bg-slate-800/60 text-slate-400 border-slate-750 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading your submitted applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800 text-indigo-400 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No Matching Applications Found'
                : 'No Applications Submitted Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Explore open job & internship opportunities with AI Match scores, then submit verified applications directly to hiring partners.
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowse}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            Browse Matched Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const opp = app.opportunity;
            const company = app.company;
            const isJob = app.opportunity_type === 'job';
            const isInternship = app.opportunity_type === 'internship';
            const stageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'Rejected';
            const hasEvidence = !!(app.certificate_url || app.certificate_reference || app.portfolio_link);

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Opportunity & Company Info */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={company?.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company?.company_name || 'Employer')}`}
                      alt={company?.company_name || 'Company'}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 bg-slate-800 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company?.company_name || 'Corp')}`;
                      }}
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {opp?.title || app.opportunity_title || 'Position'}
                        </h4>

                        {/* Explicit Job vs Internship Distinction Badge */}
                        {isJob ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-blue-400" />
                            <span>Career Job</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-teal-400" />
                            <span>Internship Training</span>
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>

                        {hasEvidence && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                            <Award className="w-3 h-3 text-purple-400" />
                            <span>Evidence Attached</span>
                          </span>
                        )}

                        {app.match_score !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>{app.match_score}% Match at Application</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          {company?.company_name || 'Corporate Partner'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {company?.location || 'Location specified'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Submitted {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: View Record & Submit Evidence */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                    {/* If Internship or Selected/In Progress/Completed: allow submitting evidence */}
                    {isInternship && (
                      <button
                        type="button"
                        id={`submit-evidence-btn-${app.id}`}
                        onClick={() => openEvidenceModal(app)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white border border-purple-500 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5 text-purple-200" />
                        <span>{hasEvidence ? 'Update Certificate / Portfolio' : 'Attach Internship Evidence'}</span>
                      </button>
                    )}

                    <button
                      id={`view-application-btn-${app.id}`}
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Dossier</span>
                    </button>
                  </div>
                </div>

                {/* Status Timeline / Hiring & Completion Pipeline Progression */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {isInternship ? 'Internship & Training Lifecycle:' : 'Career Hiring Progression:'}
                  </div>

                  {!isRejected ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { title: '1. Applied', desc: 'Dossier sent' },
                        { title: '2. Review', desc: 'Recruiter evaluating' },
                        { title: '3. Shortlisted', desc: 'Interview round' },
                        { title: '4. Selected', desc: 'Offer confirmed' },
                        { title: '5. In Progress', desc: 'Active internship' },
                        { title: '6. Completed', desc: 'Certificate verified' }
                      ].map((stage, idx) => {
                        const isDone = stageIdx >= idx;
                        const isCurrent = stageIdx === idx;

                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border text-xs transition-all ${
                              isCurrent
                                ? 'bg-indigo-950/60 border-indigo-600 text-white font-bold ring-1 ring-indigo-500/40'
                                : isDone
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                : 'bg-slate-800/30 border-slate-800 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {isDone ? (
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : 'text-emerald-400'} shrink-0`} />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              )}
                              <span className="truncate text-[11px]">{stage.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5 pl-5">
                              {stage.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>
                        Application concluded. The hiring partner has closed this application for the current opening.
                      </span>
                    </div>
                  )}
                </div>

                {/* Evidence Showcase Bar (if attached) */}
                {hasEvidence && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/60 text-xs text-purple-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold flex items-center gap-1.5 text-purple-300">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span>Completion Evidence:</span>
                      </span>

                      {app.certificate_reference && (
                        <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-800 text-[11px]">
                          Ref: {app.certificate_reference}
                        </span>
                      )}

                      {app.completion_date && (
                        <span className="text-[11px] text-slate-300">
                          Completed on: {app.completion_date}
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
                          <span>Portfolio Showcase</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Recruiter Feedback or Cover Note */}
                {(app.notes || app.cover_note) && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3 text-xs">
                    {app.cover_note && (
                      <div className="flex-1 p-2.5 rounded-xl bg-slate-800/40 border border-slate-750 text-slate-300">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Your Cover Note:</span>
                        <p className="italic text-slate-400">"{app.cover_note}"</p>
                      </div>
                    )}
                    {app.notes && (
                      <div className="flex-1 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-900/60 text-indigo-200">
                        <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">Recruiter Message / Notes:</span>
                        <p>{app.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EVIDENCE SUBMISSION MODAL */}
      {evidenceModalApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="bg-slate-900 border border-purple-800/60 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Internship Completion & Certificate Evidence</h3>
                  <p className="text-[11px] text-slate-400">
                    {evidenceModalApp.opportunity?.title || evidenceModalApp.opportunity_title} • {evidenceModalApp.company?.company_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceModalApp(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvidence} className="p-5 space-y-4 text-xs text-slate-300 overflow-y-auto flex-1">
              {evidenceSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{evidenceSuccess}</span>
                </div>
              )}

              {evidenceError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{evidenceError}</span>
                </div>
              )}

              <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/60 text-slate-300 text-[11px] space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Direct Factor in Placement Readiness:
                </span>
                <p>
                  Attaching verified completion certificates and portfolio links contributes up to <strong>10%</strong> directly to your Placement Readiness score and displays on your recruiter-facing dossier.
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Current Internship Status
                </label>
                <select
                  id="evidence-status-select"
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="In Progress">In Progress (Active Internship)</option>
                  <option value="Completed">Completed (Internship Concluded)</option>
                </select>
              </div>

              {/* Completion Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Completion / Expected End Date
                </label>
                <input
                  type="date"
                  id="evidence-completion-date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Certificate Reference / Credential ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Certificate ID / Credential Reference Number
                </label>
                <input
                  type="text"
                  id="evidence-cert-ref"
                  placeholder="e.g. CERT-INTERN-2026-8821 or IN-CORP-492"
                  value={certReference}
                  onChange={(e) => setCertReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Certificate URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Certificate URL / Verification Link
                </label>
                <input
                  type="url"
                  id="evidence-cert-url"
                  placeholder="https://credentials.skillbridge.edu/verify/cert-123 or Cloud Drive link"
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Portfolio / Project Demo Link */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Project Portfolio / GitHub Showcase Link
                </label>
                <input
                  type="url"
                  id="evidence-portfolio-link"
                  placeholder="https://github.com/username/project or portfolio demo site"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Completion Notes / Deliverables summary */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Summary of Deliverables & Learning Outcomes
                </label>
                <textarea
                  id="evidence-completion-notes"
                  rows={3}
                  placeholder="Briefly describe key tasks accomplished, technologies practiced, and projects shipped during the internship..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-2 -mx-5 -mb-5">
                <button
                  type="button"
                  onClick={() => setEvidenceModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-evidence-btn"
                  disabled={submittingEvidence}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  {submittingEvidence ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Save Evidence & Sync</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Application Record Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Application Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300 overflow-y-auto flex-1">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Position</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedApp.opportunity?.title || selectedApp.opportunity_title}
                </div>
                <div className="text-xs text-indigo-400 font-semibold">
                  {selectedApp.company?.company_name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                <div>
                  <span className="text-slate-500 text-[10px] block">Opportunity Type</span>
                  <span className="font-bold text-white capitalize">
                    {selectedApp.opportunity_type}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Current Status</span>
                  <span className={`font-bold ${
                    selectedApp.status === 'Completed' ? 'text-purple-400' :
                    selectedApp.status === 'In Progress' ? 'text-teal-400' :
                    selectedApp.status === 'Selected' ? 'text-emerald-400' :
                    selectedApp.status === 'Shortlisted' ? 'text-amber-400' :
                    selectedApp.status === 'Under Review' ? 'text-indigo-400' : 'text-slate-300'
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Applied Date</span>
                  <span className="font-semibold text-white">
                    {new Date(selectedApp.applied_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Calculated Fit</span>
                  <span className="font-bold text-emerald-400">
                    {selectedApp.match_score !== undefined ? `${selectedApp.match_score}% Match` : 'Computed at Submission'}
                  </span>
                </div>
              </div>

              {/* Evidence Details inside modal */}
              {(selectedApp.certificate_url || selectedApp.certificate_reference || selectedApp.portfolio_link) && (
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-300 text-xs">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Internship Completion Evidence</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {selectedApp.certificate_reference && (
                      <div>
                        <span className="text-slate-400 text-[10px] block">Certificate Ref ID:</span>
                        <span className="font-mono text-white font-semibold">{selectedApp.certificate_reference}</span>
                      </div>
                    )}
                    {selectedApp.completion_date && (
                      <div>
                        <span className="text-slate-400 text-[10px] block">Completion Date:</span>
                        <span className="text-white">{selectedApp.completion_date}</span>
                      </div>
                    )}
                    {selectedApp.completion_notes && (
                      <div>
                        <span className="text-slate-400 text-[10px] block">Summary of Work:</span>
                        <p className="text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          {selectedApp.completion_notes}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedApp.certificate_url && (
                        <a
                          href={selectedApp.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-semibold flex items-center gap-1.5 border border-purple-700 transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>View Certificate Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedApp.portfolio_link && (
                        <a
                          href={selectedApp.portfolio_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-705 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Project Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedApp.cover_note && (
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Your Submitted Cover Note</div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750 text-slate-300 leading-relaxed italic">
                    "{selectedApp.cover_note}"
                  </div>
                </div>
              )}

              {selectedApp.notes && (
                <div>
                  <div className="text-[10px] text-indigo-400 uppercase font-bold mb-1">Feedback from Recruiter</div>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900 text-indigo-200 leading-relaxed">
                    {selectedApp.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-between items-center">
              {selectedApp.opportunity_type === 'internship' && (
                <button
                  type="button"
                  onClick={() => {
                    const app = selectedApp;
                    setSelectedApp(null);
                    openEvidenceModal(app);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Update Evidence</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
