import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Building2,
  Landmark,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [roleTab, setRoleTabState] = useState<'student' | 'industry' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('skillbridge_login_tab');
      if (saved === 'industry' || saved === 'admin' || saved === 'student') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'student';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setRoleTab = (tab: 'student' | 'industry' | 'admin') => {
    setRoleTabState(tab);
    try {
      localStorage.setItem('skillbridge_login_tab', tab);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both your email address and password');
      return;
    }

    try {
      setLoading(true);
      await login({ email: cleanEmail, password });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudentDemo = () => {
    setRoleTab('student');
    setEmail('alex.chen@university.edu');
    setPassword('password123');
    setErrorMsg(null);
  };

  const handleQuickIndustryDemo = (companyEmail: string = 'recruiting@cloudscale.tech') => {
    setRoleTab('industry');
    setEmail(companyEmail);
    setPassword('password123');
    setErrorMsg(null);
  };

  const handleQuickAdminDemo = () => {
    setRoleTab('admin');
    setEmail('admin@university.edu');
    setPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Skill<span className="text-indigo-400">Bridge</span>
          </h2>
          <p className="text-xs text-slate-400">
            Academia-Industry Collaboration Portal
          </p>
        </div>

        {/* Card */}
        <div className="mt-6 bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
            <button
              id="login-role-student-btn"
              type="button"
              onClick={() => {
                setRoleTab('student');
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                roleTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              id="login-role-industry-btn"
              type="button"
              onClick={() => {
                setRoleTab('industry');
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                roleTab === 'industry'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Industry</span>
            </button>

            <button
              id="login-role-admin-btn"
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                roleTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>College Admin</span>
            </button>
          </div>

          <div className="text-center">
            <h3 className="text-base font-bold text-white">
              {roleTab === 'student'
                ? 'Student Sign In'
                : roleTab === 'industry'
                ? 'Employer / Industry Sign In'
                : 'College / Institutional Admin'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {roleTab === 'student'
                ? 'Access skill profile, verified assessments, gap analytics & internships'
                : roleTab === 'industry'
                ? 'Post jobs, recruit verified talent & manage applicant pipelines'
                : 'Institutional analytics, student readiness rosters, batch & department metrics'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {roleTab === 'student'
                  ? 'Student Email'
                  : roleTab === 'industry'
                  ? 'Work Email Address'
                  : 'Administrator Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    roleTab === 'student'
                      ? 'alex.chen@university.edu'
                      : roleTab === 'industry'
                      ? 'recruiting@cloudscale.tech'
                      : 'admin@university.edu'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 ${
                roleTab === 'industry'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : roleTab === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>
                    {roleTab === 'student'
                      ? 'Sign In to Student Dashboard'
                      : roleTab === 'industry'
                      ? 'Sign In to Industry Portal'
                      : 'Sign In to College Admin'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="pt-3 border-t border-slate-700/60 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Demo Accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                id="demo-student-fill-btn"
                type="button"
                onClick={handleQuickStudentDemo}
                className="text-left p-2 rounded-xl bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 transition-all text-xs group"
              >
                <div className="flex items-center justify-between font-bold text-indigo-300 group-hover:text-indigo-200 text-[11px]">
                  <span className="truncate flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 shrink-0" /> Alex Chen
                  </span>
                  <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1 py-0.2 rounded border border-indigo-800 shrink-0">Student</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">alex.chen@university.edu</div>
              </button>

              <button
                id="demo-industry-fill-btn"
                type="button"
                onClick={() => handleQuickIndustryDemo('recruiting@cloudscale.tech')}
                className="text-left p-2 rounded-xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 transition-all text-xs group"
              >
                <div className="flex items-center justify-between font-bold text-emerald-300 group-hover:text-emerald-200 text-[11px]">
                  <span className="truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 shrink-0" /> CloudScale
                  </span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800 shrink-0">Partner</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">recruiting@cloudscale.tech</div>
              </button>

              <button
                id="demo-admin-fill-btn"
                type="button"
                onClick={handleQuickAdminDemo}
                className="text-left p-2 rounded-xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 transition-all text-xs group"
              >
                <div className="flex items-center justify-between font-bold text-purple-300 group-hover:text-purple-200 text-[11px]">
                  <span className="truncate flex items-center gap-1">
                    <Landmark className="w-3 h-3 shrink-0" /> College Admin
                  </span>
                  <span className="text-[9px] bg-purple-950 text-purple-300 px-1 py-0.2 rounded border border-purple-800 shrink-0">Dean</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">admin@university.edu</div>
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <button
                id="login-register-switch-btn"
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors ml-1"
              >
                Create an Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
