import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  BookOpen,
  Calendar,
  Globe,
  Users,
  FileText,
  MapPin,
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, registerCompany } = useAuth();
  const [roleTab, setRoleTab] = useState<'student' | 'industry'>('student');

  // Student Form State
  const [studentData, setStudentData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    collegeName: '',
    department: '',
    yearOfStudy: '1st Year'
  });

  // Industry Form State
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    password: '',
    industry: 'Software & Cloud Services',
    location: '',
    website: '',
    companySize: '51-200 employees',
    contactPhone: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentData.fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!studentData.email.trim() || !EMAIL_REGEX.test(studentData.email.trim())) {
      setErrorMsg('Please provide a valid student email address');
      return;
    }
    if (!studentData.password || studentData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (!studentData.phone.trim()) {
      setErrorMsg('Contact Phone Number is required');
      return;
    }
    if (!studentData.collegeName.trim()) {
      setErrorMsg('College / Institution Name is required');
      return;
    }
    if (!studentData.department.trim()) {
      setErrorMsg('Department / Major is required');
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: studentData.fullName.trim(),
        email: studentData.email.trim(),
        password: studentData.password,
        phone: studentData.phone.trim(),
        collegeName: studentData.collegeName.trim(),
        department: studentData.department.trim(),
        yearOfStudy: studentData.yearOfStudy
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyData.companyName.trim()) {
      setErrorMsg('Company Name is required');
      return;
    }
    if (!companyData.email.trim() || !EMAIL_REGEX.test(companyData.email.trim())) {
      setErrorMsg('Please provide a valid company email address');
      return;
    }
    if (!companyData.password || companyData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (!companyData.location.trim()) {
      setErrorMsg('Company Location / Headquarters is required');
      return;
    }
    if (!companyData.industry.trim()) {
      setErrorMsg('Industry Domain is required');
      return;
    }

    try {
      setLoading(true);
      await registerCompany({
        companyName: companyData.companyName.trim(),
        email: companyData.email.trim(),
        password: companyData.password,
        industry: companyData.industry.trim(),
        location: companyData.location.trim(),
        website: companyData.website.trim(),
        companySize: companyData.companySize,
        contactPhone: companyData.contactPhone.trim(),
        description: companyData.description.trim()
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Company registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillSample = () => {
    if (roleTab === 'student') {
      setStudentData({
        fullName: 'Sarah Jenkins',
        email: `sarah.jenkins.${Math.floor(Math.random() * 899 + 100)}@college.edu`,
        password: 'password123',
        phone: '+1 (555) 789-0123',
        collegeName: 'National Institute of Engineering & Technology',
        department: 'Information Science & Engineering',
        yearOfStudy: '2nd Year'
      });
    } else {
      setCompanyData({
        companyName: 'Nexis Systems Inc.',
        email: `recruiting.${Math.floor(Math.random() * 899 + 100)}@nexissystems.com`,
        password: 'password123',
        industry: 'Cloud Security & DevOps',
        location: 'Seattle, WA & Remote',
        website: 'https://nexissystems.io',
        companySize: '51-200 employees',
        contactPhone: '+1 (555) 890-1234',
        description: 'Nexis Systems delivers automated cloud security auditing and policy compliance engines for multi-cloud enterprise deployments.'
      });
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 mb-1">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Create an Account
          </h2>
          <p className="text-xs text-slate-400">
            Join the SkillBridge Academia-Industry Collaborative Ecosystem
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
            <button
              id="register-role-student-btn"
              type="button"
              onClick={() => {
                setRoleTab('student');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                roleTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Account</span>
            </button>

            <button
              id="register-role-industry-btn"
              type="button"
              onClick={() => {
                setRoleTab('industry');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                roleTab === 'industry'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company / Employer</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STUDENT REGISTRATION FORM */}
          {roleTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-fullname-input"
                      type="text"
                      required
                      value={studentData.fullName}
                      onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={studentData.email}
                      onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                      placeholder="sarah@college.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-password-input"
                      type="password"
                      required
                      value={studentData.password}
                      onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Contact Phone <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-phone-input"
                      type="tel"
                      required
                      value={studentData.phone}
                      onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                      placeholder="+1 (555) 789-0123"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Year of Study */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Year of Study <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      id="register-year-select"
                      value={studentData.yearOfStudy}
                      onChange={(e) => setStudentData({ ...studentData, yearOfStudy: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Postgraduate">Postgraduate / Masters</option>
                    </select>
                  </div>
                </div>

                {/* College Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    College / Institution Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-college-input"
                      type="text"
                      required
                      value={studentData.collegeName}
                      onChange={(e) => setStudentData({ ...studentData, collegeName: e.target.value })}
                      placeholder="e.g. National Institute of Technology"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Department / Degree Program <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-department-input"
                      type="text"
                      required
                      value={studentData.department}
                      onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
                      placeholder="e.g. Computer Science and Engineering"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span>Registering account...</span>
                ) : (
                  <>
                    <span>Complete Student Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* INDUSTRY REGISTRATION FORM */}
          {roleTab === 'industry' && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Company / Organization Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-name-input"
                      type="text"
                      required
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      placeholder="e.g. CloudScale Technologies"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Recruiter / Work Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-email-input"
                      type="email"
                      required
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      placeholder="recruiting@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-password-input"
                      type="password"
                      required
                      value={companyData.password}
                      onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Industry Sector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Industry Sector <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-industry-input"
                      type="text"
                      required
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                      placeholder="e.g. Cloud SaaS, AI & ML, Fintech"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Location / Headquarters <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-location-input"
                      type="text"
                      required
                      value={companyData.location}
                      onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA & Remote"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-website-input"
                      type="url"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Company Size
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      id="register-company-size-select"
                      value={companyData.companySize}
                      onChange={(e) => setCompanyData({ ...companyData, companySize: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="1-10 employees">1-10 employees (Startup)</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="500+ employees">500+ employees (Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Recruitment Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="register-company-phone-input"
                      type="tel"
                      value={companyData.contactPhone}
                      onChange={(e) => setCompanyData({ ...companyData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Company Overview & Mission
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      id="register-company-description-input"
                      rows={2}
                      value={companyData.description}
                      onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                      placeholder="Briefly describe what your organization builds and the talents you are looking to hire..."
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="register-company-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span>Registering company profile...</span>
                ) : (
                  <>
                    <span>Register Company & Start Hiring</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Sample Fill */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              id="register-sample-fill-btn"
              type="button"
              onClick={handleFillSample}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fill sample {roleTab === 'student' ? 'student' : 'company'} data</span>
            </button>

            <button
              id="register-login-switch-btn"
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              Already registered? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
