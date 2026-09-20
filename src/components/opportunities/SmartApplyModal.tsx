import React, { useState } from 'react';
import { Job, Internship, OpportunityMatchBreakdown, Student } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Send,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Award,
  Code2,
  FolderGit2,
  FileCheck,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface SmartApplyModalProps {
  item: Job | Internship;
  type: 'job' | 'internship';
  match: OpportunityMatchBreakdown | null;
  onClose: () => void;
  onSubmit: (coverNote: string) => Promise<void>;
}

export const SmartApplyModal: React.FC<SmartApplyModalProps> = ({
  item,
  type,
  match,
  onClose,
  onSubmit
}) => {
  const { student } = useAuth();
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const company = item.company;
  const matchPct = match?.overall_match_percentage ?? 0;
  const matchTier = match?.match_tier ?? 'Developing Match';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(coverNote.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Job Application</h3>
              <p className="text-xs text-slate-400">
                Applying to <span className="text-white font-semibold">{item.title}</span> at{' '}
                <span className="text-white font-semibold">{company?.company_name || 'Employer'}</span>
              </p>
            </div>
          </div>

          <button
            id="smart-apply-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-300 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Match Score Banner */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Application Fit Score</div>
                <div className="text-[11px] text-slate-400">
                  {match?.skills_analysis.matching_count || 0} matching skills • Verified credentials included
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-white">{matchPct}%</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                matchTier === 'Strong Match'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : matchTier === 'Good Match'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {matchTier}
              </span>
            </div>
          </div>

          {/* Verified Student Dossier Snapshot (Read-Only) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Candidate Dossier (Transmitted Automatically)</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Verified & Locked
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Student Name:</span>
                  <span className="font-semibold text-white">{student?.full_name || 'Candidate'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Institution:</span>
                  <span className="font-semibold text-white">{student?.college_name || 'University'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Department & Year:</span>
                  <span className="font-semibold text-white">{student?.department} • {student?.year_of_study}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Verified CGPA:</span>
                  <span className="font-semibold text-emerald-400">
                    {student?.cgpa !== null && student?.cgpa !== undefined ? `${student.cgpa} / 10.0` : 'Not provided'}
                  </span>
                </div>
              </div>

              {match && match.skills_analysis.matching_skills.length > 0 && (
                <div className="pt-2 border-t border-slate-750">
                  <span className="text-slate-500 text-[10px] block mb-1">Key Matching Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {match.skills_analysis.matching_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[10px]"
                      >
                        {s.name} ({s.student_level})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Note Input */}
          <div className="space-y-1.5">
            <label htmlFor="application-cover-note-input" className="text-xs font-bold text-slate-200">
              Message to Recruiter / Cover Note <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              id="application-cover-note-input"
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight your enthusiasm, relevant projects, or specific experience with the required tech stack..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500">
              Recruiters will evaluate your cover note alongside your verified assessment results and GitHub project links.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              id="smart-apply-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              id="smart-apply-submit-btn"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
