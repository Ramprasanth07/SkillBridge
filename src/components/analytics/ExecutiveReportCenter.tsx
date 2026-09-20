import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeReportData } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';

interface ExecutiveReportCenterProps {
  dateRange: string;
  department: string;
  batch: string;
}

export const ExecutiveReportCenter: React.FC<ExecutiveReportCenterProps> = ({
  dateRange,
  department,
  batch
}) => {
  const [activeReportType, setActiveReportType] = useState<string>('institutional');
  const [reportData, setReportData] = useState<CollegeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');

  const reportOptions = [
    { id: 'institutional', label: 'Institutional Performance', desc: 'Holistic synthesis of campus benchmarks' },
    { id: 'student_readiness', label: 'Student Readiness Roster', desc: 'Verified tiers, CGPA, and readiness scores' },
    { id: 'skill_demand_gap', label: 'Skill Demand & Gap', desc: 'Live vacancy requirements vs campus supply' },
    { id: 'assessment_performance', label: 'Assessment Analytics', desc: 'Standardized coding exam pass rates & tracks' },
    { id: 'placement_recruitment', label: 'Placement & Recruitment', desc: 'Corporate applicant funnel and hired counts' },
    { id: 'industry_engagement', label: 'Industry Engagement', desc: 'Partner companies, active jobs, and internships' },
    { id: 'mentor_feedback', label: 'Mentor Feedback & Reviews', desc: 'Phase 8 corporate evaluations & rubric scores' },
    { id: 'department_benchmark', label: 'Department Benchmark', desc: 'Cross-department comparison matrix' },
    { id: 'batch_performance', label: 'Batch Progression', desc: 'Year-of-study longitudinal metrics' }
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.analytics.getReport(activeReportType, { dateRange, department, batch });
      setReportData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReportType, dateRange, department, batch]);

  // Export CSV
  const handleExportCSV = () => {
    if (!reportData || !reportData.rows.length) return;

    const headers = reportData.headers;
    const rows = reportData.rows.map(row => {
      const keys = Object.keys(row);
      return keys.map(k => {
        const val = row[k];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeReportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Filtered rows for search
  const filteredRows = React.useMemo(() => {
    if (!reportData) return [];
    if (!tableSearch.trim()) return reportData.rows;

    const q = tableSearch.toLowerCase();
    return reportData.rows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [reportData, tableSearch]);

  return (
    <div className="space-y-6">
      {/* Report Selection Grid */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 print:hidden">
        <h3 className="text-sm font-bold text-white mb-1">Select Executive Report Template</h3>
        <p className="text-xs text-slate-400 mb-4">
          Accreditation, executive governance, and board-level compliance reports synthesized from live portal activity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {reportOptions.map(opt => {
            const isSelected = activeReportType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveReportType(opt.id)}
                className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-600 text-white shadow-md shadow-purple-950/40 ring-1 ring-purple-500/40'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Document Preview */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden print:border-none print:bg-white print:text-slate-900">
        {/* Document Header & Action Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 print:bg-white print:border-b-2 print:border-slate-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 print:text-black print:border-black">
                  Official Institutional Report
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600">
                  Ref: SB-{activeReportType.toUpperCase().slice(0, 4)}-{new Date().getFullYear()}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight print:text-slate-950">
                {reportData?.title || 'Executive Report'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl print:text-slate-700">
                {reportData?.description}
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                Print / Save PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Meta Info Strip */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 print:text-slate-600">
            <div className="flex items-center gap-4">
              <span><strong>Institution:</strong> {reportData?.institution_name}</span>
              <span><strong>Generated:</strong> {reportData?.generated_at ? new Date(reportData.generated_at).toLocaleString() : 'Live'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span><strong>Filter:</strong> {dateRange === 'all' ? 'All Time' : dateRange}</span>
              {department !== 'all' && <span><strong>Dept:</strong> {department}</span>}
              {batch !== 'all' && <span><strong>Batch:</strong> {batch}</span>}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Compiling executive record tables...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300 font-semibold">{error}</p>
            </div>
          )}

          {!loading && reportData && (
            <>
              {/* Executive Summary Metrics */}
              {reportData.summary_metrics && reportData.summary_metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:grid-cols-5">
                  {reportData.summary_metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl print:bg-slate-50 print:border-slate-300"
                    >
                      <p className="text-[11px] text-slate-400 print:text-slate-600">{metric.label}</p>
                      <p className="text-lg font-black text-white mt-0.5 print:text-slate-900">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Table Search Filter */}
              <div className="flex items-center justify-between gap-4 pt-2 print:hidden">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search report entries..."
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  Showing {filteredRows.length} of {reportData.rows.length} rows
                </span>
              </div>

              {/* Report Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl print:border-slate-300">
                <table className="w-full text-left text-xs text-slate-300 print:text-slate-800">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                    <tr>
                      {reportData.headers.map((head, idx) => (
                        <th key={idx} className="py-3 px-3.5 font-bold whitespace-nowrap">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={reportData.headers.length} className="py-8 text-center text-slate-400">
                          No matching records found in this report.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rIdx) => {
                        const values = Object.values(row);
                        return (
                          <tr key={rIdx} className="hover:bg-slate-800/40 print:hover:bg-transparent transition">
                            {values.map((val, cIdx) => (
                              <td key={cIdx} className="py-3 px-3.5 font-medium whitespace-nowrap">
                                {String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Formal Attestation Footer for Printing */}
              <div className="hidden print:block pt-8 border-t border-slate-300 mt-8 text-xs text-slate-600">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-bold text-slate-900">{reportData.institution_name}</p>
                    <p>SkillBridge Academia-Industry Collaboration Portal</p>
                    <p>Verified Institutional Analytics Engine (Phase 9)</p>
                  </div>
                  <div className="text-right">
                    <p className="border-t border-slate-400 pt-1 w-48 text-center">
                      Authorized Signatory / Dean
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
