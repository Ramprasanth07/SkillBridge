import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeReportData } from '../../types';
import {
  FileText,
  Download,
  Printer,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Building2,
  Briefcase
} from 'lucide-react';

export const InstitutionalReports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('student-readiness');
  const [report, setReport] = useState<CollegeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportOptions = [
    {
      id: 'student-readiness',
      title: 'Student Placement Readiness Audit',
      description: 'Comprehensive roster with composite scores, CGPA, assessment benchmarks, and placement readiness tiers.'
    },
    {
      id: 'department-performance',
      title: 'Department Benchmarking Report',
      description: 'Departmental comparison of enrollment, average CGPA, assessment completion, and selection rates.'
    },
    {
      id: 'assessment-results',
      title: 'Standardized Assessment Audit',
      description: 'Evaluation metrics across all standardized Phase 2 engineering and domain skill assessments.'
    },
    {
      id: 'placement-summary',
      title: 'Placement & Selection Outcomes',
      description: 'Complete corporate recruitment application pipeline, interview statuses, and hiring offers.'
    },
    {
      id: 'industry-partners',
      title: 'Industry Partner Engagement',
      description: 'Corporate recruiters directory, active job/internship postings, and applicant volume analytics.'
    },
    {
      id: 'skill-gaps',
      title: 'Institutional Skill Gap Analysis',
      description: 'Detailed analysis of student skill supply versus active industry market job posting demand.'
    }
  ];

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.college.getReport(reportType);
        setReport(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to generate institutional report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!report || !report.rows || report.rows.length === 0) return;

    const headers = report.headers;
    const csvRows = [headers.join(',')];

    for (const row of report.rows) {
      const values = headers.map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        // Escape quotes
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Institutional Governance Reports</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Audit-Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Export real-time institutional analytics, cohort performance, and placement outcomes for academic councils and accreditation boards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={!report || loading}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            disabled={!report || loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Template Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportOptions.map((opt) => {
          const isSelected = reportType === opt.id;
          return (
            <button
              key={opt.id}
              id={`report-select-${opt.id}-btn`}
              onClick={() => setReportType(opt.id)}
              className={`p-4 rounded-2xl text-left border transition-all space-y-1.5 ${
                isSelected
                  ? 'bg-slate-900 border-purple-500 ring-1 ring-purple-500/40 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{opt.title}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400" />}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{opt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Preview Body */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Generating Real-Time Institutional Report...</p>
        </div>
      ) : error || !report ? (
        <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-200">{error || 'Report generation failed.'}</p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-6">
          {/* Report Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Official Institutional Report
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">{report.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{report.description}</p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 shrink-0">
              <div>Institution: <strong className="text-white">{report.institution_name}</strong></div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Generated on {new Date(report.generated_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {report.summary_metrics.map((metric, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                <div className="text-[11px] text-slate-400 font-semibold">{metric.label}</div>
                <div className="text-lg font-black text-white mt-1">{metric.value}</div>
              </div>
            ))}
          </div>

          {/* Tabular Data View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Report Data Rows ({report.rows.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">Standardized tabular view</span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-x-auto bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
                    {report.headers.map((h, idx) => (
                      <th key={idx} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {report.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      {report.headers.map((h, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                          {row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
