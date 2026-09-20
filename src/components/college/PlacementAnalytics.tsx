import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegePlacementAnalytics } from '../../types';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Building2,
  ChevronRight,
  Target,
  Layers
} from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';

export const PlacementAnalytics: React.FC = () => {
  const [data, setData] = useState<CollegePlacementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setLoading(true);
        const res = await api.college.getPlacements();
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch placement analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Compiling Recruitment & Placement Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error || 'Placement data unavailable.'}</p>
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
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Placement & Hiring Outcomes</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            {data.total_applications} Total Applications
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Monitor the recruitment pipeline, candidate interview conversion rates, top hiring corporate partners, and departmental placement metrics.
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Applications</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.total_applications}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {data.by_opportunity_type.jobs_count} Jobs • {data.by_opportunity_type.internships_count} Internships
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Shortlisted</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">{data.shortlisted_count}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Under Active Interviewing</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Selected & Hired</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{data.selected_count}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Official Offers Extended</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{data.conversion_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Selected / Applications</div>
        </div>
      </div>

      {/* Row 2: Department Placements & Top Hiring Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department Placement Comparison */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-white tracking-tight">Department Placement Conversion</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Applied</th>
                  <th className="py-2.5 px-3 text-center">Shortlisted</th>
                  <th className="py-2.5 px-3 text-center">Selected</th>
                  <th className="py-2.5 px-3 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.department_placements.map((dp, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">{dp.department}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{dp.applied_count}</td>
                    <td className="py-3 px-3 text-center text-indigo-300">{dp.shortlisted_count}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">{dp.selected_count}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold text-[10px] border border-purple-800">
                        {dp.conversion_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Hiring Corporate Partners */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-white tracking-tight">Top Hiring Corporate Partners</h2>

          <div className="space-y-2.5">
            {data.top_hiring_partners.map((partner, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{partner.company_name}</div>
                    <div className="text-[11px] text-slate-400">{partner.industry}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">{partner.selected_count} Selected</div>
                  <div className="text-[10px] text-slate-500">
                    {partner.shortlisted_count} Shortlisted • {partner.applications_count} Total Apps
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: All Applications List */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Institutional Recruitment Application Log</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Company & Opportunity</th>
                <th className="py-3 px-3 text-center">Type</th>
                <th className="py-3 px-3 text-center">Fit Match</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data.applications_list.map((app, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setSelectedStudentId(app.student_id)}
                      className="font-bold text-white hover:text-purple-300 text-left block truncate"
                    >
                      {app.student_name}
                    </button>
                    <span className="text-[10px] text-slate-400">{app.student_department}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200 truncate max-w-xs">{app.opportunity_title}</div>
                    <div className="text-[11px] text-slate-400">{app.company_name}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                      {app.opportunity_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-400">
                    {app.match_score ? `${app.match_score}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        app.status === 'Selected'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : app.status === 'Shortlisted'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : app.status === 'Rejected'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
