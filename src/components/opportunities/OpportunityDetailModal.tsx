import React from 'react';
import { Job, Internship, OpportunityMatchBreakdown, SkillMatchDetail } from '../../types';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  DollarSign,
  Send,
  Award,
  BookOpen,
  FolderGit2,
  FileCheck,
  ShieldCheck,
  Check,
  Flame,
  TrendingUp,
  Percent
} from 'lucide-react';

interface OpportunityDetailModalProps {
  item: Job | Internship | null;
  type: 'job' | 'internship';
  match: OpportunityMatchBreakdown | null;
  hasApplied: boolean;
  onClose: () => void;
  onApply: (item: Job | Internship, type: 'job' | 'internship') => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  item,
  type,
  match,
  hasApplied,
  onClose,
  onApply
}) => {
  if (!item) return null;

  const job = type === 'job' ? (item as Job) : null;
  const internship = type === 'internship' ? (item as Internship) : null;
  const company = item.company;

  const matchPct = match?.overall_match_percentage ?? 0;
  const matchTier = match?.match_tier ?? 'Developing Match';

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Strong Match':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'Good Match':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'Developing Match':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-850 gap-4">
          <div className="flex items-start gap-4">
            <img
              src={company?.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company?.company_name || 'Employer')}`}
              alt={company?.company_name || 'Company'}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-700 bg-slate-800 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company?.company_name || 'Corp')}`;
              }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
                  {item.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {type}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getTierBadgeStyle(matchTier)}`}>
                  <Sparkles className="w-3 h-3" />
                  <span>{matchPct}% • {matchTier}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {company?.company_name || 'Corporate Partner'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {item.location} ({item.work_arrangement})
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Deadline: {new Date(item.application_deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <button
            id="opportunity-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          
          {/* Intelligent Match Breakdown Banner */}
          {match && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/60 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Intelligent Fit Analysis</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Calculated from your verified profile, assessment test scores, projects, and coursework.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{match.overall_match_percentage}%</div>
                    <div className={`text-[10px] font-bold ${matchTier === 'Strong Match' ? 'text-emerald-400' : matchTier === 'Good Match' ? 'text-indigo-400' : 'text-amber-400'}`}>
                      {match.match_tier}
                    </div>
                  </div>
                </div>
              </div>

              {/* Natural Language Summary */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-indigo-300 mr-1.5">Match Assessment:</span>
                {match.why_you_match_summary}
              </div>

              {/* Match Factors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Tech Skills ({match.weights.technical_skills}%)</div>
                  <div className="text-sm font-bold text-white">{match.score_breakdown.technical_skills_score}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Assessments ({match.weights.assessment_competency}%)</div>
                  <div className="text-sm font-bold text-emerald-400">{match.score_breakdown.assessment_score}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Track Fit ({match.weights.role_alignment}%)</div>
                  <div className="text-sm font-bold text-indigo-400">{match.score_breakdown.role_alignment_score}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Projects ({match.weights.projects_experience}%)</div>
                  <div className="text-sm font-bold text-cyan-400">{match.score_breakdown.projects_score}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Certs ({match.weights.certifications}%)</div>
                  <div className="text-sm font-bold text-amber-400">{match.score_breakdown.certifications_score}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Academic ({match.weights.academic_eligibility}%)</div>
                  <div className="text-sm font-bold text-purple-400">{match.score_breakdown.academic_score}%</div>
                </div>
              </div>

              {/* Skills breakdown tabs/lists */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matching Skills ({match.skills_analysis.matching_count}):
                  </span>
                  {match.skills_analysis.matching_skills.length === 0 ? (
                    <span className="text-slate-500 font-normal italic">None registered</span>
                  ) : (
                    match.skills_analysis.matching_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[10px] flex items-center gap-1 font-mono"
                      >
                        {s.name} ({s.student_level})
                        {s.is_verified && <span className="text-emerald-400 font-bold">✓ Verified</span>}
                      </span>
                    ))
                  )}
                </div>

                {match.skills_analysis.weak_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Skills to Level Up ({match.skills_analysis.weak_count}):
                    </span>
                    {match.skills_analysis.weak_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px] flex items-center gap-1 font-mono"
                      >
                        {s.name} ({s.student_level || 'Low'} vs {s.required_level})
                      </span>
                    ))}
                  </div>
                )}

                {match.skills_analysis.missing_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="text-rose-400 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      Missing Requirements ({match.skills_analysis.missing_count}):
                    </span>
                    {match.skills_analysis.missing_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800 text-[10px] font-mono"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Openings</div>
              <div className="text-xs font-bold text-white mt-0.5">{item.number_of_openings} Seats Available</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {type === 'job' ? 'Employment Type' : 'Duration'}
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {type === 'job' ? job?.employment_type : internship?.duration}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {type === 'job' ? 'Experience Level' : 'Stipend'}
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {type === 'job' ? job?.experience_level : internship?.stipend}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {type === 'job' ? 'Min Qualification' : 'Eligibility'}
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {type === 'job' ? job?.min_qualification : internship?.eligibility}
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">About the Opportunity</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>

          {/* Responsibilities */}
          {item.responsibilities && item.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Core Responsibilities</h3>
              <ul className="space-y-1.5 list-none pl-0">
                {item.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills & Preferred Skills */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Required Technical Stack</h3>
            <div className="flex flex-wrap gap-2">
              {item.required_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>

            {type === 'job' && job?.preferred_skills && job.preferred_skills.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Nice to Have / Preferred:</div>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferred_skills.map((pref, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700 text-[11px]"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {type === 'internship' && internship?.learning_outcomes && internship.learning_outcomes.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-bold text-white">Mentorship & Learning Outcomes</h3>
                <ul className="space-y-1 list-none pl-0">
                  {internship.learning_outcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Company Profile Brief */}
          {company && (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">About {company.company_name}</h3>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-slate-400 text-xs">{company.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>Industry: <strong className="text-slate-300">{company.industry}</strong></span>
                <span>Size: <strong className="text-slate-300">{company.company_size}</strong></span>
                <span>Location: <strong className="text-slate-300">{company.location}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-850 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {hasApplied ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                You have submitted an application for this role.
              </span>
            ) : (
              <span>Your verified academic profile and assessment credentials will be included.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="opportunity-detail-dismiss-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            {!hasApplied ? (
              <button
                id="opportunity-detail-apply-btn"
                type="button"
                onClick={() => onApply(item, type)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply with SkillBridge</span>
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Applied</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
