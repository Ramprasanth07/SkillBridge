import React, { useState, useEffect } from 'react';
import { Job, Application } from '../../types';
import { api } from '../../services/api';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye
} from 'lucide-react';

interface JobManagerProps {
  onSelectApplicationForJob?: (jobId: string) => void;
  openCreateModalDirectly?: boolean;
  onModalClose?: () => void;
}

export const JobManager: React.FC<JobManagerProps> = ({
  onSelectApplicationForJob,
  openCreateModalDirectly = false,
  onModalClose
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(openCreateModalDirectly);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employment_type: 'Full-time' as Job['employment_type'],
    location: '',
    work_arrangement: 'Remote' as Job['work_arrangement'],
    required_skills_input: '',
    min_qualification: 'Bachelor’s in Computer Science / Engineering or related IT field',
    experience_level: '0-1 Years (Entry Level)',
    application_deadline: '',
    number_of_openings: 2,
    responsibilities_input: '',
    preferred_skills_input: '',
    status: 'active' as Job['status']
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.industry.getJobs();
      setJobs(res.jobs);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      setMsg({ type: 'error', text: err.message || 'Failed to load job listings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (openCreateModalDirectly) {
      handleOpenCreate();
    }
  }, [openCreateModalDirectly]);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      employment_type: 'Full-time',
      location: 'Remote / Hybrid',
      work_arrangement: 'Remote',
      required_skills_input: 'React, TypeScript, Node.js, REST APIs',
      min_qualification: 'Bachelor’s in Computer Science / Engineering or related IT field',
      experience_level: '0-1 Years (Entry Level)',
      application_deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      number_of_openings: 2,
      responsibilities_input: 'Build responsive web apps with modern React\nImplement scalable backend APIs in Node.js\nCollaborate in agile sprint ceremonies',
      preferred_skills_input: 'Docker, AWS/GCP, Tailwind CSS',
      status: 'active'
    });
    setShowModal(true);
    setMsg(null);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      employment_type: job.employment_type,
      location: job.location,
      work_arrangement: job.work_arrangement,
      required_skills_input: job.required_skills.join(', '),
      min_qualification: job.min_qualification,
      experience_level: job.experience_level,
      application_deadline: job.application_deadline,
      number_of_openings: job.number_of_openings,
      responsibilities_input: job.responsibilities.join('\n'),
      preferred_skills_input: job.preferred_skills.join(', '),
      status: job.status
    });
    setShowModal(true);
    setMsg(null);
  };

  const handleToggleStatus = async (jobId: string) => {
    try {
      const res = await api.industry.toggleJobStatus(jobId);
      setJobs(prev => prev.map(j => (j.id === jobId ? res.job : j)));
      setMsg({ type: 'success', text: `Job status updated to ${res.job.status}` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to toggle job status' });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting and its associated applications?')) {
      return;
    }

    try {
      await api.industry.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setMsg({ type: 'success', text: 'Job posting deleted successfully' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete job posting' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!formData.title.trim()) {
      setMsg({ type: 'error', text: 'Job Title is required' });
      return;
    }
    if (!formData.description.trim()) {
      setMsg({ type: 'error', text: 'Job Description is required' });
      return;
    }

    const cleanSkills = formData.required_skills_input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (cleanSkills.length === 0) {
      setMsg({ type: 'error', text: 'Please specify at least one required skill tag' });
      return;
    }

    const cleanResponsibilities = formData.responsibilities_input
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const cleanPreferred = formData.preferred_skills_input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      employment_type: formData.employment_type,
      location: formData.location.trim(),
      work_arrangement: formData.work_arrangement,
      required_skills: cleanSkills,
      min_qualification: formData.min_qualification.trim(),
      experience_level: formData.experience_level.trim(),
      application_deadline: formData.application_deadline,
      number_of_openings: Number(formData.number_of_openings) || 1,
      responsibilities: cleanResponsibilities,
      preferred_skills: cleanPreferred,
      status: formData.status
    };

    try {
      setSaving(true);
      if (editingJob) {
        const res = await api.industry.updateJob(editingJob.id, payload);
        setJobs(prev => prev.map(j => (j.id === editingJob.id ? res.job : j)));
        setMsg({ type: 'success', text: 'Job posting updated successfully!' });
      } else {
        const res = await api.industry.createJob(payload);
        setJobs(prev => [res.job, ...prev]);
        setMsg({ type: 'success', text: 'New job posting created successfully!' });
      }

      setShowModal(false);
      if (onModalClose) onModalClose();
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save job posting' });
    } finally {
      setSaving(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Job Postings Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, update, and manage verified full-time, part-time, and graduate engineering positions.
          </p>
        </div>

        <button
          id="job-manager-create-btn"
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Messages */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 shadow-sm ${
            msg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="job-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job titles, skills (e.g. React, Python), locations..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
          <button
            id="job-filter-all-btn"
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            id="job-filter-active-btn"
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({jobs.filter(j => j.status === 'active').length})
          </button>
          <button
            id="job-filter-closed-btn"
            type="button"
            onClick={() => setFilterStatus('closed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'closed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Closed ({jobs.filter(j => j.status === 'closed').length})
          </button>
        </div>
      </div>

      {/* Jobs List Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading company job postings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Job Postings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No job listings match your search keywords or filter criteria.'
              : 'Create your first job listing to connect with verified candidates.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Create Job Posting
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">{job.title}</h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        job.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                      {job.employment_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location} ({job.work_arrangement})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {job.number_of_openings} Openings
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {job.application_deadline}
                    </span>
                  </div>
                </div>

                {/* Card Top Actions */}
                <div className="flex items-center gap-2 self-start">
                  <button
                    id={`job-toggle-status-btn-${job.id}`}
                    type="button"
                    onClick={() => handleToggleStatus(job.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    {job.status === 'active' ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                        <span>Close</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`job-edit-btn-${job.id}`}
                    type="button"
                    onClick={() => handleOpenEdit(job)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Job"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`job-delete-btn-${job.id}`}
                    type="button"
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {job.description}
              </p>

              {/* Required Skills Badges */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-indigo-400" />
                  <span>Required Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.preferred_skills?.map((skill, idx) => (
                    <span
                      key={`pref-${idx}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-750 text-xs text-slate-400 italic"
                      title="Preferred Skill"
                    >
                      +{skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Applicants count & Review Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                    {job.applications_count || 0} Applicants
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Experience: {job.experience_level}
                  </span>
                </div>

                {onSelectApplicationForJob && (
                  <button
                    type="button"
                    onClick={() => onSelectApplicationForJob(job.id)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>View Candidates</span>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define technical criteria, qualifications, and student hiring requirements.
                  </p>
                </div>
              </div>

              <button
                id="job-modal-close-btn"
                type="button"
                onClick={() => {
                  setShowModal(false);
                  if (onModalClose) onModalClose();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="job-form-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Associate Full-Stack Cloud Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Employment Type */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Employment Type</label>
                  <select
                    id="job-form-employment-type"
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Work Arrangement */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Work Arrangement</label>
                  <select
                    id="job-form-work-arrangement"
                    value={formData.work_arrangement}
                    onChange={(e) => setFormData({ ...formData, work_arrangement: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="job-form-location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Openings */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Number of Openings</label>
                  <input
                    id="job-form-openings"
                    type="number"
                    min={1}
                    value={formData.number_of_openings}
                    onChange={(e) => setFormData({ ...formData, number_of_openings: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Required Skills */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Required Skills (Comma separated) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="job-form-skills"
                    type="text"
                    required
                    value={formData.required_skills_input}
                    onChange={(e) => setFormData({ ...formData, required_skills_input: e.target.value })}
                    placeholder="React, TypeScript, Node.js, Docker, SQL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    These skills will be matched against candidate profiles and verified assessment badges.
                  </p>
                </div>

                {/* Preferred Skills */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Preferred / Nice-to-Have Skills (Comma separated)
                  </label>
                  <input
                    id="job-form-pref-skills"
                    type="text"
                    value={formData.preferred_skills_input}
                    onChange={(e) => setFormData({ ...formData, preferred_skills_input: e.target.value })}
                    placeholder="Tailwind CSS, Cloud Computing (AWS/GCP), Git"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Min Qualification */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Minimum Qualification</label>
                  <input
                    id="job-form-qualification"
                    type="text"
                    value={formData.min_qualification}
                    onChange={(e) => setFormData({ ...formData, min_qualification: e.target.value })}
                    placeholder="B.Tech / B.E in CS / IT"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Experience Level</label>
                  <input
                    id="job-form-experience"
                    type="text"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    placeholder="0-1 Years (Entry Level / Freshers)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Application Deadline</label>
                  <input
                    id="job-form-deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Post Status</label>
                  <select
                    id="job-form-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active (Accepting Applications)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Job Description */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Job Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="job-form-description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe role responsibilities, team vision, and engineering expectations..."
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Key Responsibilities */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Key Responsibilities (One item per line)
                  </label>
                  <textarea
                    id="job-form-responsibilities"
                    rows={3}
                    value={formData.responsibilities_input}
                    onChange={(e) => setFormData({ ...formData, responsibilities_input: e.target.value })}
                    placeholder="Develop responsive web components in React & TypeScript&#10;Implement backend RESTful microservices&#10;Participate in sprint retrospectives"
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  id="job-form-cancel-btn"
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onModalClose) onModalClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  id="job-form-submit-btn"
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : editingJob ? 'Save Job Changes' : 'Publish Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
