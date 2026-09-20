import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ActiveTab, StudentReadinessScore } from '../../types';
import { PlacementReadinessCard } from '../dashboard/PlacementReadinessCard';
import {
  UserCircle2,
  Building2,
  GraduationCap,
  Phone,
  Mail,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  RefreshCw,
  Code2
} from 'lucide-react';

interface ProfileViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ setActiveTab }) => {
  const { student, user, updateStudentLocally } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    college_name: '',
    department: '',
    year_of_study: '1st Year',
    cgpa: '',
    profile_photo: '',
    bio: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [readiness, setReadiness] = useState<StudentReadinessScore | null>(null);

  const fetchReadiness = async () => {
    try {
      const res = await api.student.getPlacementReadiness();
      if (res && res.readiness) {
        setReadiness(res.readiness);
      }
    } catch (err) {
      console.error('Failed to load readiness in profile:', err);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        phone: student.phone || '',
        college_name: student.college_name || '',
        department: student.department || '',
        year_of_study: student.year_of_study || '1st Year',
        cgpa: student.cgpa !== null && student.cgpa !== undefined ? student.cgpa.toString() : '',
        profile_photo: student.profile_photo || '',
        bio: student.bio || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.full_name.trim()) {
      setErrorMessage('Full Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Phone number is required');
      return;
    }
    if (!formData.college_name.trim()) {
      setErrorMessage('College Name is required');
      return;
    }
    if (!formData.department.trim()) {
      setErrorMessage('Department is required');
      return;
    }
    if (formData.cgpa) {
      const val = parseFloat(formData.cgpa);
      if (isNaN(val) || val < 0 || val > 10) {
        setErrorMessage('CGPA must be a valid number between 0.0 and 10.0');
        return;
      }
    }

    try {
      setSaving(true);
      const res = await api.student.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        college_name: formData.college_name,
        department: formData.department,
        year_of_study: formData.year_of_study,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        profile_photo: formData.profile_photo,
        bio: formData.bio
      });

      updateStudentLocally({
        ...res.student,
        profile_completion: res.profile_completion,
        missing_fields: res.missing_fields
      });

      setSuccessMessage('Student profile has been saved successfully!');
      fetchReadiness();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetSelect = (url: string) => {
    setFormData(prev => ({ ...prev, profile_photo: url }));
    setShowAvatarPicker(false);
  };

  const handleGenerateDicebear = () => {
    const dicebear = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(formData.full_name || 'student') + Date.now()}`;
    setFormData(prev => ({ ...prev, profile_photo: dicebear }));
    setShowAvatarPicker(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Profile Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your official academic records, contact info, and portfolio credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Manage Skills</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Real Calculated Placement Readiness Score Card */}
      <PlacementReadinessCard
        readiness={readiness}
        onRefresh={fetchReadiness}
        onNavigate={setActiveTab}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card & Photo Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserCircle2 className="w-4 h-4 text-indigo-600" />
            Profile Identity & Photo
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <img
                src={formData.profile_photo || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(formData.full_name || 'student')}`}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm bg-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(formData.full_name || 'student')}`;
                }}
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Profile Image URL</label>
              <div className="flex items-center gap-2">
                <input
                  id="profile-photo-input"
                  type="url"
                  value={formData.profile_photo}
                  onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Choose Preset
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Provide an image URL or choose from academic avatar presets.
              </p>
            </div>
          </div>

          {/* Preset Selector Popover */}
          {showAvatarPicker && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Select an Avatar Preset</span>
                <button
                  type="button"
                  onClick={handleGenerateDicebear}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate Abstract Avatar
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetSelect(url)}
                    className="p-1 rounded-xl hover:ring-2 hover:ring-indigo-500 focus:outline-hidden bg-white border border-slate-200 transition-all"
                  >
                    <img src={url} alt={`Preset ${i + 1}`} className="w-full h-14 rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Personal & Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            Personal & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="profile-fullname-input"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Alex Chen"
              />
            </div>

            {/* Email (Read Only connected to user auth) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Connected Email <span className="text-[10px] text-slate-400 font-normal">(Primary Auth ID)</span>
              </label>
              <input
                id="profile-email-input"
                type="email"
                disabled
                value={user?.email || student?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-phone-input"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Student Bio / Career Aspiration
              </label>
              <input
                id="profile-bio-input"
                type="text"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Aspiring Software Engineer interested in Cloud Systems"
              />
            </div>
          </div>
        </div>

        {/* Academic Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Institutional & Academic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                College / University Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-college-input"
                  type="text"
                  required
                  value={formData.college_name}
                  onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Institute of Technology"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Department / Major <span className="text-rose-500">*</span>
              </label>
              <input
                id="profile-department-input"
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Computer Science and Engineering"
              />
            </div>

            {/* Year of Study */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Year of Study <span className="text-rose-500">*</span>
              </label>
              <select
                id="profile-year-select"
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate (Master's / Ph.D.)</option>
              </select>
            </div>

            {/* CGPA */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cumulative CGPA <span className="text-[10px] text-slate-400 font-normal">(Scale: 0.0 - 10.0)</span>
              </label>
              <div className="relative">
                <Award className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-cgpa-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. 8.95"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="profile-save-btn"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
