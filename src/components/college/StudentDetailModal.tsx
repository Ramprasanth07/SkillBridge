import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Code2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

interface StudentDetailModalProps {
  studentId: string;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ studentId, onClose }) => {
  const [dossier, setDossier] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'assessments' | 'readiness' | 'portfolio' | 'placements'>('profile');

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const res = await api.college.getStudentDossier(studentId);
        setDossier(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student dossier.');
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [studentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading Student Institutional Dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-200">{error || 'Student record not found.'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { student, skills, projects, certifications, assessment_stats, assessment_history, applications, readiness, skill_gap_summary } = dossier;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={student.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={student.full_name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{student.full_name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${readiness?.badge_color || 'bg-slate-800 text-slate-300'}`}>
                  {readiness?.tier || 'Assessing'} ({readiness?.total_score || 0}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {student.department} • {student.year_of_study} • CGPA: {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'profile', label: 'Academic Dossier', icon: GraduationCap },
            { id: 'skills', label: `Skills (${skills?.length || 0})`, icon: Zap },
            { id: 'assessments', label: `Assessments (${assessment_history?.length || 0})`, icon: CheckCircle2 },
            { id: 'readiness', label: 'Readiness Logic', icon: Target },
            { id: 'portfolio', label: `Portfolio (${(projects?.length || 0) + (certifications?.length || 0)})`, icon: BookOpen },
            { id: 'placements', label: `Placements (${applications?.length || 0})`, icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`modal-tab-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PROFILE & ACADEMIC */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-[11px] font-semibold text-slate-400">Institutional ID</div>
                  <div className="text-xs font-bold text-white font-mono mt-1">{student.id}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-[11px] font-semibold text-slate-400">Academic Standing (CGPA)</div>
                  <div className="text-xs font-bold text-white mt-1">
                    {student.cgpa ? `${student.cgpa.toFixed(2)} / 10.0` : 'Not provided'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-[11px] font-semibold text-slate-400">Year / Batch Cohort</div>
                  <div className="text-xs font-bold text-white mt-1">{student.year_of_study}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-[11px] font-semibold text-slate-400">College / Institution</div>
                  <div className="text-xs font-bold text-white mt-1 truncate">{student.college_name}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-[11px] font-semibold text-slate-400">Department</div>
                  <div className="text-xs font-bold text-white mt-1">{student.department}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-[11px] font-semibold text-slate-400">Contact Email</div>
                  <div className="text-xs font-bold text-white mt-1 truncate">{student.email || 'N/A'}</div>
                </div>
              </div>

              {student.bio && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div className="text-xs font-bold text-slate-300 mb-1">Student Biography & Focus</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{student.bio}</p>
                </div>
              )}

              {/* Data Integrity Notice */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 flex items-start gap-2.5 text-purple-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Institutional Audit Protection:</strong> Verified academic records, standardized assessment benchmarks, and candidate application histories are immutable and read-only.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Competencies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skills?.filter((s: any) => s.skill.category === 'technical').map((sk: any) => (
                    <div key={sk.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold text-white">{sk.skill.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {sk.proficiency_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Soft Skills & Leadership</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skills?.filter((s: any) => s.skill.category === 'soft').map((sk: any) => (
                    <div key={sk.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-white">{sk.skill.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {sk.proficiency_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASSESSMENTS */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Total Attempts</div>
                  <div className="text-base font-bold text-white mt-0.5">{assessment_stats?.total_attempts || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Tests Passed</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{assessment_stats?.passed_count || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Average Score</div>
                  <div className="text-base font-bold text-white mt-0.5">{assessment_stats?.average_score || 0}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Verified Badges</div>
                  <div className="text-base font-bold text-purple-400 mt-0.5">{assessment_stats?.verified_badges_count || 0}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attempt Records</h3>
                {assessment_history?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/30 text-center text-xs text-slate-400">
                    No assessments attempted by this student yet.
                  </div>
                ) : (
                  assessment_history?.map((att: any) => (
                    <div key={att.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{att.assessment_title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Category: {att.category} • Score: {att.correct_answers_count}/{att.total_questions} ({att.score_percentage}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          att.passed ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}>
                          {att.passed ? `Passed (${att.skill_level_awarded})` : 'Failed'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(att.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: READINESS LOGIC */}
          {activeTab === 'readiness' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-purple-300">Composite Institutional Placement Readiness</div>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${readiness?.badge_color}`}>
                    {readiness?.tier} ({readiness?.total_score}/100)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  Institutional readiness is calculated transparently from academic standings, standardized Phase 2 assessments, verified skill profile depth, portfolio engineering rigor, and live opportunity matching metrics.
                </p>
              </div>

              {/* Factors Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Academic Standing</span>
                    <span className="text-white">{readiness?.factors.academic_score || 0} / 20 pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${((readiness?.factors.academic_score || 0) / 20) * 100}%` }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Skill Assessments</span>
                    <span className="text-white">{readiness?.factors.assessment_score || 0} / 25 pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${((readiness?.factors.assessment_score || 0) / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Skill Competency Profile</span>
                    <span className="text-white">{readiness?.factors.skills_score || 0} / 20 pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${((readiness?.factors.skills_score || 0) / 20) * 100}%` }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Portfolio & Certifications</span>
                    <span className="text-white">{readiness?.factors.portfolio_score || 0} / 15 pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${((readiness?.factors.portfolio_score || 0) / 15) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Justification Reasons */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="text-xs font-bold text-slate-200 mb-2">Readiness Classification Audit Trail</div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {readiness?.reasons?.map((reason: string, idx: number) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Projects ({projects?.length || 0})</h3>
                {projects?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/30 text-center text-xs text-slate-400">No projects added.</div>
                ) : (
                  <div className="space-y-2">
                    {projects?.map((proj: any) => (
                      <div key={proj.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{proj.title}</span>
                          {proj.project_link && (
                            <a href={proj.project_link} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                              <span>Repository</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{proj.description}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          {proj.technologies?.map((tech: string, i: number) => (
                            <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Certifications ({certifications?.length || 0})</h3>
                {certifications?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/30 text-center text-xs text-slate-400">No certifications recorded.</div>
                ) : (
                  <div className="space-y-2">
                    {certifications?.map((cert: any) => (
                      <div key={cert.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{cert.certificate_name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Issued by {cert.issuing_organization} • {cert.issue_date}
                          </div>
                        </div>
                        {cert.certificate_link && (
                          <a href={cert.certificate_link} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                            <span>Verify</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PLACEMENTS */}
          {activeTab === 'placements' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications Pipeline ({applications?.length || 0})</h3>
              {applications?.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-800/30 text-center text-xs text-slate-400">
                  Student has not submitted any corporate job or internship applications yet.
                </div>
              ) : (
                applications?.map((app: any) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Application #{app.id.slice(0, 8)}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Type: <span className="capitalize">{app.opportunity_type}</span> • Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                      {app.match_score && (
                        <div className="text-[11px] text-indigo-400 mt-0.5">
                          Calculated Fit Match: {app.match_score}%
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        app.status === 'Selected'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : app.status === 'Shortlisted'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : app.status === 'Rejected'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Student Dossier • Institute of Technology & Science
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
