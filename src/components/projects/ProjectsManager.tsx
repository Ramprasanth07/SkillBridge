import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Project } from '../../types';
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  Code2,
  Globe,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export const ProjectsManager: React.FC = () => {
  const { student, updateStudentLocally } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    project_link: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.student.getProjects();
      setProjects(res.projects);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      technologies: '',
      project_link: ''
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      project_link: project.project_link
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.title.trim()) {
      setErrorMsg('Project title is required');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Project description is required');
      return;
    }

    try {
      setSubmitting(true);
      const techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (editingProject) {
        // Update
        const res = await api.student.updateProject(editingProject.id, {
          title: formData.title,
          description: formData.description,
          technologies: techArray,
          project_link: formData.project_link
        });
        setProjects(prev => prev.map(p => (p.id === editingProject.id ? res.project : p)));
        setSuccessMsg('Project updated successfully.');
      } else {
        // Create
        const res = await api.student.createProject({
          title: formData.title,
          description: formData.description,
          technologies: techArray,
          project_link: formData.project_link
        });
        setProjects(prev => [res.project, ...prev]);
        setSuccessMsg('Project created and added to your portfolio.');

        if (student) {
          updateStudentLocally({
            profile_completion: res.profile_completion,
            stats: {
              skills_count: student.stats?.skills_count || 0,
              technical_skills_count: student.stats?.technical_skills_count || 0,
              soft_skills_count: student.stats?.soft_skills_count || 0,
              projects_count: projects.length + 1,
              certifications_count: student.stats?.certifications_count || 0
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

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await api.student.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setSuccessMsg(`Project "${title}" deleted.`);

      if (student) {
        updateStudentLocally({
          profile_completion: res.profile_completion,
          stats: {
            skills_count: student.stats?.skills_count || 0,
            technical_skills_count: student.stats?.technical_skills_count || 0,
            soft_skills_count: student.stats?.soft_skills_count || 0,
            projects_count: Math.max(0, projects.length - 1),
            certifications_count: student.stats?.certifications_count || 0
          }
        });
      }

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showcase your academic capstones, hackathon projects, and live prototypes to industry reviewers
          </p>
        </div>

        <button
          id="add-project-btn"
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
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

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 p-6"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Projects Added Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-5">
            Add coursework projects, personal repositories, or team hackathon builds to showcase practical software development experience.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xs transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                    {project.project_link && (
                      <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                        title="View Live Link / Repository"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => openEditModal(project)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id, project.title)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Technologies Pill Group */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Stack:</span>
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Live Link Button if available */}
              {project.project_link && (
                <div className="pt-2">
                  <a
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{project.project_link}</span>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
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
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="project-title-input"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. EduCollab - Peer Learning Network"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="project-description-input"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the core problem solved, architecture, and features..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Technologies Used <span className="text-[10px] text-slate-400 font-normal">(Comma separated)</span>
                </label>
                <input
                  id="project-tech-input"
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Project Link */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Project URL / Repository Link
                </label>
                <input
                  id="project-link-input"
                  type="url"
                  value={formData.project_link}
                  onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
                  placeholder="https://github.com/username/project"
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
                  id="project-submit-modal-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
