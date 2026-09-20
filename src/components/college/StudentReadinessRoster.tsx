import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { CollegeStudentRosterItem, CollegeReadinessTier } from '../../types';
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowUpDown,
  ExternalLink,
  Target,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';

export const StudentReadinessRoster: React.FC = () => {
  const [students, setStudents] = useState<CollegeStudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [assessmentFilter, setAssessmentFilter] = useState('All');
  const [placementFilter, setPlacementFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'readiness' | 'cgpa' | 'assessment' | 'applications'>('readiness');

  // Selected Student for Dossier
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await api.college.getStudents();
        setStudents(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student readiness roster.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = s.full_name.toLowerCase().includes(term);
          const matchEmail = (s.email || '').toLowerCase().includes(term);
          const matchId = s.id.toLowerCase().includes(term);
          const matchDept = s.department.toLowerCase().includes(term);
          const matchSkill = s.top_skills?.some((sk) => sk.name.toLowerCase().includes(term));
          if (!matchName && !matchEmail && !matchId && !matchDept && !matchSkill) return false;
        }

        // Department filter
        if (departmentFilter !== 'All' && s.department !== departmentFilter) return false;

        // Batch filter
        if (batchFilter !== 'All' && s.year_of_study !== batchFilter) return false;

        // Tier filter
        if (tierFilter !== 'All' && s.readiness.tier !== tierFilter) return false;

        // Assessment filter
        if (assessmentFilter !== 'All' && s.assessment_status !== assessmentFilter) return false;

        // Placement filter
        if (placementFilter !== 'All' && !s.placement_status.toLowerCase().includes(placementFilter.toLowerCase())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'readiness') {
          return b.readiness.total_score - a.readiness.total_score;
        }
        if (sortBy === 'cgpa') {
          return (b.cgpa || 0) - (a.cgpa || 0);
        }
        if (sortBy === 'assessment') {
          return (b.average_assessment_score || 0) - (a.average_assessment_score || 0);
        }
        if (sortBy === 'applications') {
          return b.applications_count - a.applications_count;
        }
        return 0;
      });
  }, [students, searchTerm, departmentFilter, batchFilter, tierFilter, assessmentFilter, placementFilter, sortBy]);

  // Unique departments and batches
  const departments = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.department))).filter(Boolean);
    return ['All', ...list];
  }, [students]);

  const batches = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.year_of_study))).filter(Boolean);
    return ['All', ...list];
  }, [students]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Aggregating Student Readiness Rosters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Student Readiness Roster</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              {students.length} Total Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect institutional student dossiers, verified standardized assessment metrics, and placement pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Showing:</span>
          <strong className="text-white font-bold">{filteredStudents.length} Students</strong>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="student-roster-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID, department, or skill (e.g. React)..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              id="filter-department-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              id="filter-batch-select"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Year Batches</option>
              {batches.filter((b) => b !== 'All').map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filters & Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Readiness Tier */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Readiness Tier
            </label>
            <select
              id="filter-tier-select"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg bg-slate-800/60 border border-slate-700/80 text-white focus:outline-hidden"
            >
              <option value="All">All Tiers</option>
              <option value="Job Ready">Job Ready (≥75)</option>
              <option value="High Potential">High Potential (60-74)</option>
              <option value="Developing">Developing (40-59)</option>
              <option value="Needs Foundation">Needs Foundation (&lt;40)</option>
            </select>
          </div>

          {/* Assessment Status */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Assessments
            </label>
            <select
              id="filter-assessment-select"
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg bg-slate-800/60 border border-slate-700/80 text-white focus:outline-hidden"
            >
              <option value="All">All Test States</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>

          {/* Placement Status */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Placement Status
            </label>
            <select
              id="filter-placement-select"
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg bg-slate-800/60 border border-slate-700/80 text-white focus:outline-hidden"
            >
              <option value="All">All Placements</option>
              <option value="Selected">Selected / Hired</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Applied">Applied</option>
              <option value="Not Applied">Not Applied</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Sort Order
            </label>
            <select
              id="roster-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-2.5 text-xs rounded-lg bg-slate-800/60 border border-slate-700/80 text-white focus:outline-hidden"
            >
              <option value="readiness">Highest Readiness Score</option>
              <option value="cgpa">Highest Academic CGPA</option>
              <option value="assessment">Highest Assessment Score</option>
              <option value="applications">Most Job Applications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-300">No student records match the active filters.</p>
            <p className="text-[11px] text-slate-500">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student & Cohort</th>
                  <th className="py-3 px-3 text-center">CGPA</th>
                  <th className="py-3 px-3">Top Skills</th>
                  <th className="py-3 px-3 text-center">Assessments</th>
                  <th className="py-3 px-3 text-center">Readiness Index</th>
                  <th className="py-3 px-3 text-center">Placement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Student Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={st.full_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <button
                            onClick={() => setSelectedStudentId(st.id)}
                            className="text-xs font-bold text-white hover:text-purple-300 transition-colors text-left truncate block"
                          >
                            {st.full_name}
                          </button>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {st.department} • {st.year_of_study}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CGPA */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-white">
                        {st.cgpa ? st.cgpa.toFixed(2) : 'N/A'}
                      </span>
                    </td>

                    {/* Top Skills */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {st.top_skills.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60"
                          >
                            {sk.name}
                          </span>
                        ))}
                        {st.top_skills.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{st.top_skills.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Assessments */}
                    <td className="py-3.5 px-3 text-center">
                      {st.assessments_attempted > 0 ? (
                        <div>
                          <span className="text-xs font-bold text-white">
                            {st.average_assessment_score}% Avg
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {st.assessments_passed}/{st.assessments_attempted} Passed
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">Not Attempted</span>
                      )}
                    </td>

                    {/* Readiness Tier & Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${st.readiness.badge_color}`}>
                        {st.readiness.tier} ({st.readiness.total_score})
                      </span>
                    </td>

                    {/* Placement Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          st.placement_status.includes('Selected')
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : st.placement_status.includes('Shortlisted')
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : st.placement_status.includes('Applied')
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {st.placement_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`view-dossier-${st.id}-btn`}
                        onClick={() => setSelectedStudentId(st.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 text-xs font-bold transition-all inline-flex items-center gap-1"
                      >
                        <span>Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Dossier Modal */}
      {selectedStudentId && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
};
