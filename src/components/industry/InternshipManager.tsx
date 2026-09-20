import React, { useState, useEffect } from 'react';
import { Internship, Application } from '../../types';
import { api } from '../../services/api';
import {
  GraduationCap,
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
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  DollarSign,
  BookOpen,
  Award
} from 'lucide-react';

interface InternshipManagerProps {
  onSelectApplicationForInternship?: (internshipId: string) => void;
  openCreateModalDirectly?: boolean;
  onModalClose?: () => void;
}

export const InternshipManager: React.FC<InternshipManagerProps> = ({
  onSelectApplicationForInternship,
  openCreateModalDirectly = false,
  onModalClose
}) => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(openCreateModalDirectly);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '3 Months',
    stipend: '₹25,000 / month ($1,200/mo)',
    location: 'Remote',
    work_arrangement: 'Remote' as Internship['work_arrangement'],
    required_skills_input: 'React, TypeScript, Tailwind CSS',
    eligibility: '2nd, 3rd or 4th Year Computer Science / IT / Circuit branch students',
    application_deadline: '',
    number_of_openings: 3,
    responsibilities_input: 'Build reusable UI component modules\nIntegrate frontend screens with REST endpoints\nParticipate in daily engineering standups',
    learning_outcomes_input: 'Production React & TypeScript proficiency\nMentorship from senior software architects\nReturn offer evaluation for full-time graduate role',
    status: 'active' as Internship['status']
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await api.industry.getInternships();
      setInternships(res.internships);
    } catch (err: any) {
      console.error('Failed to load internships:', err);
      setMsg({ type: 'error', text: err.message || 'Failed to load internship listings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    if (openCreateModalDirectly) {
      handleOpenCreate();
    }
  }, [openCreateModalDirectly]);

  const handleOpenCreate = () => {
    setEditingInternship(null);
    setFormData({
      title: '',
      description: '',
      duration: '3 Months',
      stipend: '₹25,000 / month ($1,200/mo)',
      location: 'Remote / Bengaluru',
      work_arrangement: 'Remote',
      required_skills_input: 'React, TypeScript, Tailwind CSS, Git & GitHub',
      eligibility: '2nd, 3rd or 4th Year Computer Science / IT / Circuit branch students',
      application_deadline: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      number_of_openings: 3,
      responsibilities_input: 'Build reusable UI component modules in React\nConnect client views to microservice endpoints\nParticipate in agile sprint ceremonies',
      learning_outcomes_input: 'Production code shipped to thousands of users\nMentorship from senior software architects\nDirect return offer evaluation for full-time graduate role',
      status: 'active'
    });
    setShowModal(true);
    setMsg(null);
  };

  const handleOpenEdit = (internship: Internship) => {
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      description: internship.description,
      duration: internship.duration,
      stipend: internship.stipend,
      location: internship.location,
      work_arrangement: internship.work_arrangement,
      required_skills_input: internship.required_skills.join(', '),
      eligibility: internship.eligibility,
      application_deadline: internship.application_deadline,
      number_of_openings: internship.number_of_openings,
      responsibilities_input: internship.responsibilities.join('\n'),
      learning_outcomes_input: internship.learning_outcomes.join('\n'),
      status: internship.status
    });
    setShowModal(true);
    setMsg(null);
  };

  const handleToggleStatus = async (internshipId: string) => {
    try {
      const res = await api.industry.toggleInternshipStatus(internshipId);
      setInternships(prev => prev.map(i => (i.id === internshipId ? res.internship : i)));
      setMsg({ type: 'success', text: `Internship status updated to ${res.internship.status}` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to toggle internship status' });
    }
  };

  const handleDeleteInternship = async (internshipId: string) => {
    if (!window.confirm('Are you sure you want to delete this internship posting and its candidate applications?')) {
      return;
    }

    try {
      await api.industry.deleteInternship(internshipId);
      setInternships(prev => prev.filter(i => i.id !== internshipId));
      setMsg({ type: 'success', text: 'Internship posting deleted successfully' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete internship posting' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!formData.title.trim()) {
      setMsg({ type: 'error', text: 'Internship Title is required' });
      return;
    }
    if (!formData.description.trim()) {
      setMsg({ type: 'error', text: 'Internship Description is required' });
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

    const cleanOutcomes = formData.learning_outcomes_input
      .split('\n')
      .map(o => o.trim())
      .filter(o => o.length > 0);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: formData.duration.trim(),
      stipend: formData.stipend.trim(),
      location: formData.location.trim(),
      work_arrangement: formData.work_arrangement,
      required_skills: cleanSkills,
      eligibility: formData.eligibility.trim(),
      application_deadline: formData.application_deadline,
      number_of_openings: Number(formData.number_of_openings) || 1,
      responsibilities: cleanResponsibilities,
      learning_outcomes: cleanOutcomes,
      status: formData.status
    };

    try {
      setSaving(true);
      if (editingInternship) {
        const res = await api.industry.updateInternship(editingInternship.id, payload);
        setInternships(prev => prev.map(i => (i.id === editingInternship.id ? res.internship : i)));
        setMsg({ type: 'success', text: 'Internship posting updated successfully!' });
      } else {
        const res = await api.industry.createInternship(payload);
        setInternships(prev => [res.internship, ...prev]);
        setMsg({ type: 'success', text: 'New internship posting created successfully!' });
      }

      setShowModal(false);
      if (onModalClose) onModalClose();
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save internship posting' });
    } finally {
      setSaving(false);
    }
  };

  const filteredInternships = internships.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.required_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Internship Programs & Training
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish mentored student internships, define stipends, eligibility criteria, and learning outcomes.
          </p>
        </div>

        <button
          id="internship-manager-create-btn"
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Internship</span>
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
            id="internship-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internship titles, required skills, locations..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
          <button
            id="internship-filter-all-btn"
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({internships.length})
          </button>
          <button
            id="internship-filter-active-btn"
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({internships.filter(i => i.status === 'active').length})
          </button>
          <button
            id="internship-filter-closed-btn"
            type="button"
            onClick={() => setFilterStatus('closed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'closed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Closed ({internships.filter(i => i.status === 'closed').length})
          </button>
        </div>
      </div>

      {/* Internships List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading internship programs...</p>
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Internship Postings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No internship listings match your search keywords or filter criteria.'
              : 'Launch your first campus internship program to mentor undergraduate engineering talent.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Post Internship Opportunity
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">{internship.title}</h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        internship.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {internship.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                      {internship.duration}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      {internship.stipend}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {internship.location} ({internship.work_arrangement})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {internship.number_of_openings} Openings
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {internship.application_deadline}
                    </span>
                  </div>
                </div>

                {/* Card Top Actions */}
                <div className="flex items-center gap-2 self-start">
                  <button
                    id={`internship-toggle-btn-${internship.id}`}
                    type="button"
                    onClick={() => handleToggleStatus(internship.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    {internship.status === 'active' ? (
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
                    id={`internship-edit-btn-${internship.id}`}
                    type="button"
                    onClick={() => handleOpenEdit(internship)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Internship"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`internship-delete-btn-${internship.id}`}
                    type="button"
                    onClick={() => handleDeleteInternship(internship.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Delete Internship"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {internship.description}
              </p>

              {/* Required Skills & Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 text-indigo-400" />
                    <span>Target Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {internship.required_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-teal-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Mentorship & Outcomes</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                    {internship.learning_outcomes?.slice(0, 2).map((outcome, idx) => (
                      <li key={idx} className="truncate">{outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                    {internship.applications_count || 0} Student Applicants
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Eligibility: {internship.eligibility}
                  </span>
                </div>

                {onSelectApplicationForInternship && (
                  <button
                    type="button"
                    onClick={() => onSelectApplicationForInternship(internship.id)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>Review Applicants</span>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT INTERNSHIP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingInternship ? 'Edit Internship Program' : 'Post New Campus Internship'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define student stipend, eligibility, skill learning roadmap, and openings.
                  </p>
                </div>
              </div>

              <button
                id="internship-modal-close-btn"
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
                    Internship Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="internship-form-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Summer Cloud & DevOps Intern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Program Duration</label>
                  <input
                    id="internship-form-duration"
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 Months / 6 Months"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Monthly Stipend */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Monthly Stipend</label>
                  <input
                    id="internship-form-stipend"
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="₹25,000 / month ($1,200/mo)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Work Arrangement */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Work Arrangement</label>
                  <select
                    id="internship-form-work-arrangement"
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
                    id="internship-form-location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru / Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Openings */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Number of Openings</label>
                  <input
                    id="internship-form-openings"
                    type="number"
                    min={1}
                    value={formData.number_of_openings}
                    onChange={(e) => setFormData({ ...formData, number_of_openings: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Application Deadline</label>
                  <input
                    id="internship-form-deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Required Skills */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Target Skills (Comma separated) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="internship-form-skills"
                    type="text"
                    required
                    value={formData.required_skills_input}
                    onChange={(e) => setFormData({ ...formData, required_skills_input: e.target.value })}
                    placeholder="React, TypeScript, Tailwind CSS, Docker"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Eligibility Criteria */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Eligibility Criteria</label>
                  <input
                    id="internship-form-eligibility"
                    type="text"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    placeholder="2nd, 3rd, or 4th Year Computer Science / IT undergraduate students"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Post Status</label>
                  <select
                    id="internship-form-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active (Accepting Applications)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Internship Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="internship-form-description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe program goals, team mentoring, and practical project deliverables..."
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Learning Outcomes */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Key Learning Outcomes & Benefits (One item per line)
                  </label>
                  <textarea
                    id="internship-form-outcomes"
                    rows={3}
                    value={formData.learning_outcomes_input}
                    onChange={(e) => setFormData({ ...formData, learning_outcomes_input: e.target.value })}
                    placeholder="Production React code deployed to production&#10;1-on-1 weekly mentorship from staff software engineers&#10;Full-time return offer evaluation upon completion"
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  id="internship-form-cancel-btn"
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
                  id="internship-form-submit-btn"
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : editingInternship ? 'Save Internship Changes' : 'Publish Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
