import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StudentSkill, SkillItem } from '../../types';
import {
  Code2,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Layers,
  Award,
  Zap,
  Info
} from 'lucide-react';

const SUGGESTED_TECHNICAL = [
  'Python', 'Java', 'SQL', 'React', 'JavaScript', 'TypeScript', 'Node.js', 
  'C++', 'Docker', 'Git & GitHub', 'REST APIs', 'Tailwind CSS', 'Machine Learning', 
  'Data Structures & Algorithms', 'Cloud Computing (AWS/GCP)', 'Next.js', 'PostgreSQL'
];

const SUGGESTED_SOFT = [
  'Communication', 'Teamwork & Collaboration', 'Problem Solving', 
  'Critical Thinking', 'Time Management', 'Leadership', 'Adaptability', 
  'Presentation Skills', 'Agile & Scrum', 'Public Speaking', 'Mentoring'
];

export const SkillsManager: React.FC = () => {
  const { student, updateStudentLocally } = useAuth();
  const [technicalSkills, setTechnicalSkills] = useState<StudentSkill[]>([]);
  const [softSkills, setSoftSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);

  // Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [category, setCategory] = useState<'technical' | 'soft'>('technical');
  const [proficiency, setProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.student.getSkills();
      setTechnicalSkills(res.technical);
      setSoftSkills(res.soft);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e?: React.FormEvent, customName?: string, customCategory?: 'technical' | 'soft') => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameToAdd = (customName || newSkillName).trim();
    const catToAdd = customCategory || category;

    if (!nameToAdd) {
      setErrorMsg('Please provide a skill name');
      return;
    }

    try {
      setAddingSkill(true);
      const res = await api.student.addSkill({
        skill_name: nameToAdd,
        category: catToAdd,
        proficiency_level: proficiency
      });

      setSuccessMsg(`"${nameToAdd}" added to your ${catToAdd} skills.`);
      setNewSkillName('');

      // Refresh list
      const updatedTech = res.all.filter(s => s.skill.category === 'technical');
      const updatedSoft = res.all.filter(s => s.skill.category === 'soft');
      setTechnicalSkills(updatedTech);
      setSoftSkills(updatedSoft);

      if (student) {
        updateStudentLocally({
          profile_completion: res.profile_completion,
          stats: {
            skills_count: res.all.length,
            technical_skills_count: updatedTech.length,
            soft_skills_count: updatedSoft.length,
            projects_count: student.stats?.projects_count || 0,
            certifications_count: student.stats?.certifications_count || 0
          }
        });
      }

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (studentSkillId: string, skillName: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.student.removeSkill(studentSkillId);
      setSuccessMsg(`"${skillName}" removed.`);

      const updatedTech = res.all.filter(s => s.skill.category === 'technical');
      const updatedSoft = res.all.filter(s => s.skill.category === 'soft');
      setTechnicalSkills(updatedTech);
      setSoftSkills(updatedSoft);

      if (student) {
        updateStudentLocally({
          profile_completion: res.profile_completion,
          stats: {
            skills_count: res.all.length,
            technical_skills_count: updatedTech.length,
            soft_skills_count: updatedSoft.length,
            projects_count: student.stats?.projects_count || 0,
            certifications_count: student.stats?.certifications_count || 0
          }
        });
      }

      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove skill');
    }
  };

  const isSkillAlreadyAdded = (name: string) => {
    const lower = name.toLowerCase().trim();
    return (
      technicalSkills.some(s => s.skill.name.toLowerCase() === lower) ||
      softSkills.some(s => s.skill.name.toLowerCase() === lower)
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Skills & Competency Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Catalog your technical stack and interpersonal soft skills to build an industry-ready portfolio
        </p>
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

      {/* Add Skill Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          Add a Skill
        </h2>

        <form onSubmit={handleAddSkill} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Skill Name Input */}
            <div className="sm:col-span-5">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Skill Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="skill-name-input"
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Python, SQL, React, Teamwork"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Select */}
            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category
              </label>
              <select
                id="skill-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'technical' | 'soft')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="technical">Technical Skill</option>
                <option value="soft">Soft Skill</option>
              </select>
            </div>

            {/* Proficiency Level */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Proficiency
              </label>
              <select
                id="skill-proficiency-select"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 flex items-end">
              <button
                id="skill-submit-btn"
                type="submit"
                disabled={addingSkill}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Quick Add Suggestions Pills */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Quick Suggestions (Click to add immediately):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(category === 'technical' ? SUGGESTED_TECHNICAL : SUGGESTED_SOFT).slice(0, 8).map((pill) => {
                const added = isSkillAlreadyAdded(pill);
                return (
                  <button
                    key={pill}
                    type="button"
                    disabled={added || addingSkill}
                    onClick={() => handleAddSkill(undefined, pill, category)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      added
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    {added ? `✓ ${pill}` : `+ ${pill}`}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Skills Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Skills Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Technical Skills</h3>
                <p className="text-[11px] text-slate-400">Languages, frameworks, tools & algorithms</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {technicalSkills.length} Total
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading skills...</div>
          ) : technicalSkills.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Code2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No technical skills added</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use the form above or pick from quick suggestions.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {technicalSkills.map((item) => (
                <div
                  key={item.id}
                  className="group px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 text-blue-900 text-xs font-medium flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-2xs"
                >
                  <span>{item.skill.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white font-bold text-blue-700 border border-blue-200/80">
                    {item.proficiency_level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(item.id, item.skill.name)}
                    className="text-blue-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-white"
                    title={`Remove ${item.skill.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Soft Skills Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Soft Skills</h3>
                <p className="text-[11px] text-slate-400">Collaboration, agility, problem solving & leadership</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {softSkills.length} Total
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading skills...</div>
          ) : softSkills.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No soft skills added</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Add interpersonal strengths like communication and teamwork.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {softSkills.map((item) => (
                <div
                  key={item.id}
                  className="group px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 text-xs font-medium flex items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-2xs"
                >
                  <span>{item.skill.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white font-bold text-emerald-700 border border-emerald-200/80">
                    {item.proficiency_level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(item.id, item.skill.name)}
                    className="text-emerald-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-white"
                    title={`Remove ${item.skill.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
