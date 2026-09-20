import React, { useState, useEffect } from 'react';
import { Company } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Users,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Camera
} from 'lucide-react';

interface CompanyProfileManagerProps {
  company: Company | null;
  onRefresh: () => Promise<void>;
}

export const CompanyProfileManager: React.FC<CompanyProfileManagerProps> = ({
  company,
  onRefresh
}) => {
  const { updateCompanyLocally } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    location: '',
    website: '',
    company_size: '51-200 employees',
    contact_email: '',
    contact_phone: '',
    description: '',
    logo: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || '',
        industry: company.industry || '',
        location: company.location || '',
        website: company.website || '',
        company_size: company.company_size || '51-200 employees',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        description: company.description || '',
        logo: company.logo || ''
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.company_name.trim()) {
      setErrorMsg('Company Name cannot be empty');
      return;
    }
    if (!formData.industry.trim()) {
      setErrorMsg('Industry Domain is required');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMsg('Location / Headquarters is required');
      return;
    }

    try {
      setSaving(true);
      const res = await api.industry.updateProfile(formData);
      updateCompanyLocally(res.company);
      setSuccessMsg('Company profile updated successfully!');
      await onRefresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Company Profile & Brand Identity
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your organization's verified profile, recruiter contacts, and student-facing introduction.
          </p>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Organization Information</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="company-name-input"
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Industry Domain */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Industry / Domain <span className="text-rose-400">*</span>
                </label>
                <input
                  id="company-industry-input"
                  type="text"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Cloud Infrastructure, AI & Data Systems"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Company Size */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Organization Size
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    id="company-size-select"
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1-10 employees">1-10 employees (Seed Startup)</option>
                    <option value="11-50 employees">11-50 employees (Early Growth)</option>
                    <option value="51-200 employees">51-200 employees (Scaleup)</option>
                    <option value="201-500 employees">201-500 employees (Mid-market)</option>
                    <option value="500+ employees">500+ employees (Enterprise)</option>
                  </select>
                </div>
              </div>

              {/* Headquarters / Location */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Headquarters / Locations <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="company-location-input"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA & Bengaluru"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Official Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="company-website-input"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Recruiter Email */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Primary Contact / Recruiter Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="company-contact-email-input"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="recruiting@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="company-contact-phone-input"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Company Logo Image URL
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="company-logo-input"
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://images.unsplash.com/... or image link"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Description / About */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  About Company / What We Build
                </label>
                <textarea
                  id="company-description-input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your company's product, mission, engineering culture, and the type of university student talent you are looking to hire..."
                  className="w-full p-3.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="company-profile-save-btn"
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving changes...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Company Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Student-Facing Brand Preview (1 col) */}
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Student-Facing Employer Card Preview</span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-750 shadow-xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt={formData.company_name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{formData.company_name ? formData.company_name.charAt(0).toUpperCase() : 'C'}</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {formData.company_name || 'CloudScale Technologies'}
                </h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  {formData.industry || 'Cloud & Enterprise SaaS'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Corporate Partner</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{formData.location || 'San Francisco & Remote'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formData.company_size}</span>
              </div>
              {formData.website && (
                <div className="flex items-center gap-2 text-[11px]">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline truncate"
                  >
                    {formData.website}
                  </a>
                </div>
              )}
            </div>

            {formData.description && (
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                "{formData.description}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
