import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Company } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  company: Company | null;
  loading: boolean;
  isAuthenticated: boolean;
  isIndustry: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (formData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    collegeName: string;
    department: string;
    yearOfStudy: string;
  }) => Promise<void>;
  registerCompany: (formData: {
    companyName: string;
    email: string;
    password: string;
    industry: string;
    location: string;
    website?: string;
    companySize?: string;
    contactPhone?: string;
    description?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshStudent: () => Promise<void>;
  refreshCompany: () => Promise<void>;
  updateStudentLocally: (updated: Partial<Student>) => void;
  updateCompanyLocally: (updated: Partial<Company>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setStudent(null);
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      if (data.user.role === 'industry' && data.company) {
        setCompany(data.company);
        setStudent(null);
      } else if (data.student) {
        setStudent(data.student);
        setCompany(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      removeStoredToken();
      setUser(null);
      setStudent(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    setStoredToken(res.token);
    setUser(res.user);
    if (res.user.role === 'industry' && res.company) {
      setCompany(res.company);
      setStudent(null);
    } else if (res.student) {
      setStudent(res.student);
      setCompany(null);
    }
  };

  const register = async (formData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    collegeName: string;
    department: string;
    yearOfStudy: string;
  }) => {
    const res = await api.auth.register(formData);
    setStoredToken(res.token);
    setUser(res.user);
    setStudent(res.student);
    setCompany(null);
  };

  const registerCompany = async (formData: {
    companyName: string;
    email: string;
    password: string;
    industry: string;
    location: string;
    website?: string;
    companySize?: string;
    contactPhone?: string;
    description?: string;
  }) => {
    const res = await api.auth.registerCompany(formData);
    setStoredToken(res.token);
    setUser(res.user);
    setCompany(res.company);
    setStudent(null);
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setStudent(null);
    setCompany(null);
  };

  const refreshStudent = async () => {
    try {
      const data = await api.student.getProfile();
      setStudent(data.student);
    } catch (err) {
      console.error('Failed to refresh student profile:', err);
    }
  };

  const refreshCompany = async () => {
    try {
      const data = await api.industry.getProfile();
      setCompany(data.company);
    } catch (err) {
      console.error('Failed to refresh company profile:', err);
    }
  };

  const updateStudentLocally = (updated: Partial<Student>) => {
    setStudent(prev => (prev ? { ...prev, ...updated } : null));
  };

  const updateCompanyLocally = (updated: Partial<Company>) => {
    setCompany(prev => (prev ? { ...prev, ...updated } : null));
  };

  const isIndustry = user?.role === 'industry';
  const isStudent = user?.role === 'student' || (!user?.role && !!student);
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        company,
        loading,
        isAuthenticated,
        isIndustry,
        isStudent,
        isAdmin,
        login,
        register,
        registerCompany,
        logout,
        refreshStudent,
        refreshCompany,
        updateStudentLocally,
        updateCompanyLocally
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

