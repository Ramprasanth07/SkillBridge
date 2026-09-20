import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { SkillDemandSupplyAnalytics, SkillDemandItem } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SkillDemandReportProps {
  dateRange: string;
  department: string;
  batch: string;
}

export const SkillDemandReport: React.FC<SkillDemandReportProps> = ({
  dateRange,
  department,
  batch
}) => {
  const [data, setData] = useState<SkillDemandSupplyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'soft'>('all');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [sortField, setSortField] = useState<'demand' | 'supply' | 'ratio' | 'gap'>('demand');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchDemandReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.analytics.getSkills({ dateRange, department, batch });
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch skill demand & supply data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandReport();
  }, [dateRange, department, batch]);

  // Filtering & Sorting
  const filteredSkills = useMemo(() => {
    if (!data) return [];
    let list = [...data.skills];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => s.skill_name.toLowerCase().includes(q));
    }

    if (selectedCategory !== 'all') {
      list = list.filter(s => s.category === selectedCategory);
    }

    if (selectedQuadrant !== 'all') {
      list = list.filter(s => s.classification === selectedQuadrant);
    }

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'demand') {
        valA = a.industry_demand_count;
        valB = b.industry_demand_count;
      } else if (sortField === 'supply') {
        valA = a.student_supply_count;
        valB = b.student_supply_count;
      } else if (sortField === 'ratio') {
        valA = a.demand_supply_ratio;
        valB = b.demand_supply_ratio;
      } else if (sortField === 'gap') {
        valA = a.gap_count;
        valB = b.gap_count;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [data, searchTerm, selectedCategory, selectedQuadrant, sortField, sortAsc]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredSkills.length) return;

    const headers = [
      'Skill Name',
      'Category',
      'Industry Demand Count',
      'Campus Supply Count',
      'Verified Test Supply',
      'Demand/Supply Ratio',
      'Campus Readiness %',
      'Net Talent Deficit (Gap)',
      'Quadrant Classification'
    ];

    const rows = filteredSkills.map(s => [
      `"${s.skill_name.replace(/"/g, '""')}"`,
      s.category,
      s.industry_demand_count,
      s.student_supply_count,
      s.verified_supply_count,
      s.demand_supply_ratio,
      `${s.readiness_percentage}%`,
      s.gap_count,
      `"${s.classification}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SkillBridge_Industry_Demand_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getQuadrantBadge = (classification: SkillDemandItem['classification']) => {
    switch (classification) {
      case 'High Demand / Low Supply':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Critical Deficit
          </span>
        );
      case 'High Demand / High Supply':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Core Strength
          </span>
        );
      case 'Emerging Skills':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Emerging
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Surplus
          </span>
        );
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-300 font-medium">Synthesizing real-time industry demand vs campus supply...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs text-slate-200 font-semibold">{error}</p>
        <button
          onClick={fetchDemandReport}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Skills In Scope</p>
            <p className="text-2xl font-black text-white mt-1">{data?.total_skills_analyzed ?? 0}</p>
            <p className="text-[11px] text-purple-400 mt-1">Cross-Matched Catalog</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-800 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-300 font-medium">Critical Talent Deficits</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{data?.high_demand_low_supply_count ?? 0}</p>
            <p className="text-[11px] text-rose-400/80 mt-1">High Demand / Low Supply</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-300 font-medium">Core Institutional Strengths</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{data?.high_demand_high_supply_count ?? 0}</p>
            <p className="text-[11px] text-emerald-400/80 mt-1">High Demand & High Supply</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-300 font-medium">Emerging Tech Adoption</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{data?.emerging_skills_count ?? 0}</p>
            <p className="text-[11px] text-indigo-400/80 mt-1">Specialized Market Roles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/70 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Critical Deficit Action Alert */}
      {data && data.critical_deficits.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/60">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
              Urgent Curricular Deficit Alert
            </h3>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Corporate recruiters have listed high demand for the following skills, but campus supply is below placement benchmarks. Fast-track roadmap workshops are recommended:
          </p>
          <div className="flex flex-wrap gap-2">
            {data.critical_deficits.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2"
              >
                <span>{item.skill_name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/90 text-rose-300">
                  {item.industry_demand_count} open roles vs {item.student_supply_count} students
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Controls & Filters */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Skill Inventory Matrix & Demand Ratios
            </h3>
            <p className="text-xs text-slate-400">
              Comparing live corporate vacancies vs verified student competencies.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              Export CSV
            </button>
            <button
              onClick={fetchDemandReport}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800">
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search skill by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedQuadrant}
              onChange={e => setSelectedQuadrant(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Quadrants (All Classifications)</option>
              <option value="High Demand / Low Supply">High Demand / Low Supply (Critical Deficit)</option>
              <option value="High Demand / High Supply">High Demand / High Supply (Core Strength)</option>
              <option value="Low Demand / High Supply">Low Demand / High Supply (Campus Surplus)</option>
              <option value="Emerging Skills">Emerging Skills</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            {(['all', 'technical', 'soft'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 select-none">
              <tr>
                <th className="py-3 px-3 font-bold">Skill Name</th>
                <th className="py-3 px-3 font-bold">Category</th>
                <th
                  onClick={() => {
                    if (sortField === 'demand') setSortAsc(!sortAsc);
                    else {
                      setSortField('demand');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Industry Demand</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'supply') setSortAsc(!sortAsc);
                    else {
                      setSortField('supply');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Campus Supply</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-bold">Verified Supply</th>
                <th
                  onClick={() => {
                    if (sortField === 'ratio') setSortAsc(!sortAsc);
                    else {
                      setSortField('ratio');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Demand/Supply</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-bold">Readiness %</th>
                <th
                  onClick={() => {
                    if (sortField === 'gap') setSortAsc(!sortAsc);
                    else {
                      setSortField('gap');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Net Deficit</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-bold">Quadrant Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No matching skills found for the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white">{item.skill_name}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-300">
                      {item.industry_demand_count}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {item.student_supply_count}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">
                      {item.verified_supply_count}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={
                          item.demand_supply_ratio > 1.5
                            ? 'text-rose-400 font-bold'
                            : item.demand_supply_ratio >= 0.8
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }
                      >
                        {item.demand_supply_ratio}x
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${item.readiness_percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{item.readiness_percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {item.gap_count > 0 ? (
                        <span className="text-rose-400 font-bold">-{item.gap_count}</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3">{getQuadrantBadge(item.classification)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
