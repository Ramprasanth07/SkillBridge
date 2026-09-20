import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Certification } from '../../types';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react';

export const CertificationsManager: React.FC = () => {
  const { student, updateStudentLocally } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  const [formData, setFormData] = useState({
    certificate_name: '',
    issuing_organization: '',
    issue_date: new Date().toISOString().split('T')[0],
    certificate_link: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const res = await api.student.getCertifications();
      setCertifications(res.certifications);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const openCreateModal = () => {
    setEditingCert(null);
    setFormData({
      certificate_name: '',
      issuing_organization: '',
      issue_date: new Date().toISOString().split('T')[0],
      certificate_link: ''
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      certificate_name: cert.certificate_name,
      issuing_organization: cert.issuing_organization,
      issue_date: cert.issue_date || new Date().toISOString().split('T')[0],
      certificate_link: cert.certificate_link
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.certificate_name.trim()) {
      setErrorMsg('Certificate name is required');
      return;
    }
    if (!formData.issuing_organization.trim()) {
      setErrorMsg('Issuing organization is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCert) {
        // Update
        const res = await api.student.updateCertification(editingCert.id, {
          certificate_name: formData.certificate_name,
          issuing_organization: formData.issuing_organization,
          issue_date: formData.issue_date,
          certificate_link: formData.certificate_link
        });
        setCertifications(prev => prev.map(c => (c.id === editingCert.id ? res.certification : c)));
        setSuccessMsg('Certification record updated successfully.');
      } else {
        // Create
        const res = await api.student.createCertification({
          certificate_name: formData.certificate_name,
          issuing_organization: formData.issuing_organization,
          issue_date: formData.issue_date,
          certificate_link: formData.certificate_link
        });
        setCertifications(prev => [res.certification, ...prev]);
        setSuccessMsg('Certification successfully recorded.');

        if (student) {
          updateStudentLocally({
            profile_completion: res.profile_completion,
            stats: {
              skills_count: student.stats?.skills_count || 0,
              technical_skills_count: student.stats?.technical_skills_count || 0,
              soft_skills_count: student.stats?.soft_skills_count || 0,
              projects_count: student.stats?.projects_count || 0,
              certifications_count: certifications.length + 1
            }
          });
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove certification "${name}"?`)) return;

    try {
      const res = await api.student.deleteCertification(id);
      setCertifications(prev => prev.filter(c => c.id !== id));
      setSuccessMsg(`Certification "${name}" removed.`);

      if (student) {
        updateStudentLocally({
          profile_completion: res.profile_completion,
          stats: {
            skills_count: student.stats?.skills_count || 0,
            technical_skills_count: student.stats?.technical_skills_count || 0,
            soft_skills_count: student.stats?.soft_skills_count || 0,
            projects_count: student.stats?.projects_count || 0,
            certifications_count: Math.max(0, certifications.length - 1)
          }
        });
      }

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete certification');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic & Professional Certifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validate your coursework, industry badges, and professional exam qualifications
          </p>
        </div>

        <button
          id="add-certification-btn"
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Certifications List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 p-6"></div>
          ))}
        </div>
      ) : certifications.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Certifications Recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-5">
            Add your AWS, Microsoft, Google Cloud, Coursera, NPTEL, or Oracle certifications to strengthen your technical credibility.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Add Your First Certificate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{cert.certificate_name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{cert.issuing_organization}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(cert)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit certificate"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cert.id, cert.certificate_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issued: {cert.issue_date || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Credential</span>
                  </div>
                </div>
              </div>

              {cert.certificate_link && (
                <div className="mt-3 pt-2">
                  <a
                    href={cert.certificate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Verify Credential Certificate</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCert ? 'Edit Certification' : 'Add Certification Record'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Certificate Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Certificate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cert-name-input"
                  type="text"
                  required
                  value={formData.certificate_name}
                  onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Issuing Organization */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Issuing Organization <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cert-org-input"
                  type="text"
                  required
                  value={formData.issuing_organization}
                  onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                  placeholder="e.g. Amazon Web Services / Google / Coursera / NPTEL"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Issue Date
                </label>
                <input
                  id="cert-date-input"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Certificate Link */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Verification / Credential URL
                </label>
                <input
                  id="cert-link-input"
                  type="url"
                  value={formData.certificate_link}
                  onChange={(e) => setFormData({ ...formData, certificate_link: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="cert-submit-modal-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCert ? 'Update Record' : 'Save Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
