import React, { useState, useEffect } from 'react';
import { Application, CandidateProfile } from '../../types';
import { api } from '../../services/api';
import {
  X,
  User,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  FolderGit2,
  FileCheck,
  Star,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';

interface CandidateProfileModalProps {
  application: Application | null;
  studentId?: string;
  onClose: () => void;
  onStatusChange?: (applicationId: string, newStatus: Application['status'], notes?: string) => Promise<void>;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  application,
  studentId: propStudentId,
  onClose,
  onStatusChange
}) => {
  const targetStudentId = propStudentId || application?.student_id || application?.student?.id;

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Status Action State
  const [selectedStatus, setSelectedStatus] = useState<Application['status']>(
    application?.status || 'Under Review'
  );
  const [notes, setNotes] = useState<string>(application?.notes || '');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!targetStudentId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.industry.getCandidateProfile(targetStudentId);
        setCandidate(data.candidate);
      } catch (err: any) {
        console.error('Failed to load candidate profile:', err);
        setError(err.message || 'Unable to load student candidate profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetStudentId]);

  const handleUpdateStatus = async () => {
    if (!application || !onStatusChange) return;

    try {
      setUpdating(true);
      setUpdateMsg(null);
      await onStatusChange(application.id, selectedStatus, notes);
      setUpdateMsg(`Candidate marked as "${selectedStatus}"`);
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  if (!targetStudentId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {candidate?.full_name || application?.student?.full_name || 'Candidate Profile'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {candidate?.department || application?.student?.department || 'Engineering Student'} •{' '}
                {candidate?.college_name || application?.student?.college_name || 'University'}
              </p>
            </div>
          </div>

          <button
            id="candidate-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Loading verified candidate dossier...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : candidate ? (
            <>
              {/* Application Context Banner (if viewing from application pipeline) */}
              {application && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Applied for:</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {application.opportunity_title || 'Position'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 capitalize">
                        {application.opportunity_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      {application.match_score !== undefined && (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          (application.match_score >= 80)
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : (application.match_score >= 60)
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>{application.match_score}% Match</span>
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">Applied on:</span>
                      <span className="font-semibold text-slate-300">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* If Match Breakdown exists */}
                  {application.match_breakdown && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/60 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Match Fit: {application.match_breakdown.match_tier} ({application.match_breakdown.overall_match_percentage}%)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {application.match_breakdown.skills_analysis.matching_count} / {application.match_breakdown.skills_analysis.total_required_count} required skills
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 italic">
                        "{application.match_breakdown.why_you_match_summary}"
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] text-slate-400">Tech Skills</div>
                          <div className="text-xs font-bold text-white">{application.match_breakdown.score_breakdown.technical_skills_score}%</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] text-slate-400">Assessments</div>
                          <div className="text-xs font-bold text-emerald-400">{application.match_breakdown.score_breakdown.assessment_score}%</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] text-slate-400">Track Fit</div>
                          <div className="text-xs font-bold text-indigo-400">{application.match_breakdown.score_breakdown.role_alignment_score}%</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] text-slate-400">Projects</div>
                          <div className="text-xs font-bold text-cyan-400">{application.match_breakdown.score_breakdown.projects_score}%</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] text-slate-400">Certs</div>
                          <div className="text-xs font-bold text-amber-400">{application.match_breakdown.score_breakdown.certifications_score}%</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] text-slate-400">Academic</div>
                          <div className="text-xs font-bold text-purple-400">{application.match_breakdown.score_breakdown.academic_score}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.cover_note && (
                    <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-indigo-400" /> Candidate Cover Note:
                      </div>
                      <p className="italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        "{application.cover_note}"
                      </p>
                    </div>
                  )}

                  {/* Internship Completion Evidence & Portfolio Submission */}
                  {(application.certificate_url || application.certificate_reference || application.portfolio_link || application.completion_notes) && (
                    <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span>Verified Internship Completion Evidence</span>
                        </div>
                        {application.completion_date && (
                          <span className="text-[11px] text-purple-300 font-medium">
                            Completed: {application.completion_date}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {application.certificate_reference && (
                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-900/60">
                            <span className="text-[10px] text-slate-400 block font-semibold">Certificate Reference / ID:</span>
                            <span className="text-xs font-mono font-bold text-purple-300">{application.certificate_reference}</span>
                          </div>
                        )}
                        {application.certificate_url && (
                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-900/60 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Completion Certificate:</span>
                              <span className="text-xs font-semibold text-white">Digital Credential</span>
                            </div>
                            <a
                              href={application.certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-md bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Verify</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                        {application.portfolio_link && (
                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-900/60 flex items-center justify-between sm:col-span-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Project Portfolio / Repository:</span>
                              <span className="text-xs font-semibold text-white truncate max-w-md block">{application.portfolio_link}</span>
                            </div>
                            <a
                              href={application.portfolio_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <FolderGit2 className="w-3.5 h-3.5" />
                              <span>Open Repo</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      {application.completion_notes && (
                        <div className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-purple-950 text-slate-300">
                          <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Student Reflection & Outcomes:</span>
                          <p className="italic">"{application.completion_notes}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Top Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Academic Profile */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Academic Dossier</span>
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Institution:</span>
                      <span className="font-semibold text-white">{candidate.college_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Department:</span>
                      <span className="font-semibold text-white">{candidate.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Year of Study:</span>
                        <span className="font-semibold text-white">{candidate.year_of_study}</span>
                      </div>
                      {candidate.cgpa && (
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">CGPA:</span>
                          <span className="font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-xs">
                            {candidate.cgpa} / 10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Contact Details</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email Address:</span>
                      <span className="font-semibold text-white">{candidate.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                      <span className="font-semibold text-white">{candidate.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Phase 2 Verified Assessment Badges */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verified Assessments</span>
                  </h4>
                  {candidate.assessment_stats ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Assessments Passed:</span>
                        <span className="font-bold text-white">
                          {candidate.assessment_stats.passed_count} Tests
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Highest Score:</span>
                        <span className="font-bold text-emerald-400">
                          {candidate.assessment_stats.highest_score}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Average Score:</span>
                        <span className="font-bold text-indigo-300">
                          {candidate.assessment_stats.average_score}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No assessments completed yet.</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {candidate.bio && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <h4 className="text-xs font-bold text-slate-300">Candidate Bio</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{candidate.bio}</p>
                </div>
              )}

              {/* Verified Skills Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Technical & Soft Skills ({candidate.skills?.length || 0})</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((s) => (
                      <div
                        key={s.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold text-white">{s.skill?.name || 'Skill'}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            s.proficiency_level === 'Expert' || s.proficiency_level === 'Advanced'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}
                        >
                          {s.proficiency_level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No skills listed.</p>
                  )}
                </div>
              </div>

              {/* Phase 2 Assessment History Badges */}
              {candidate.assessment_history && candidate.assessment_history.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>SkillBridge Standardized Assessment Performance</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {candidate.assessment_history.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{attempt.assessment_title}</div>
                          <div className="text-[10px] text-slate-400">
                            {attempt.category} • Completed on{' '}
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-black text-xs ${
                              attempt.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {attempt.score_percentage}%
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-indigo-300">
                            {attempt.skill_level_awarded}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Projects */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <span>Portfolio Projects ({candidate.projects?.length || 0})</span>
                </h4>

                <div className="space-y-2.5">
                  {candidate.projects && candidate.projects.length > 0 ? (
                    candidate.projects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-white">{p.title}</h5>
                          {p.project_link && (
                            <a
                              href={p.project_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <span>Repository / Live Demo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{p.description}</p>
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {p.technologies.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No projects added yet.</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              {candidate.certifications && candidate.certifications.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-400" />
                    <span>Industry Certifications ({candidate.certifications.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {candidate.certifications.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white">{c.certificate_name}</div>
                          <div className="text-[10px] text-slate-400">
                            Issued by {c.issuing_organization} • {c.issue_date}
                          </div>
                        </div>
                        {c.certificate_link && (
                          <a
                            href={c.certificate_link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Bottom: Recruiter Action Bar (If Application attached) */}
        {application && onStatusChange && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-850 space-y-3">
            {updateMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{updateMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Status Selector */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold text-[11px]">Update Pipeline Status:</span>
                <select
                  id="candidate-status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Application['status'])}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected / Hired</option>
                  <option value="In Progress">In Progress (Active Internship)</option>
                  <option value="Completed">Completed (Internship Finished)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Notes Input & Save */}
              <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                <input
                  id="candidate-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal hiring / feedback note..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  id="candidate-status-save-btn"
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {updating ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
