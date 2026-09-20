import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CompetencyRadarData } from '../../types';
import {
  X,
  Target,
  Award,
  ShieldCheck,
  FileCheck,
  Briefcase,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CompetencyRadarModalProps {
  studentId: string;
  onClose: () => void;
}

export const CompetencyRadarModal: React.FC<CompetencyRadarModalProps> = ({ studentId, onClose }) => {
  const [data, setData] = useState<{ radar: CompetencyRadarData; roadmap: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        setLoading(true);
        const res = await api.analytics.getStudentRadar(studentId);
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student competency radar.');
      } finally {
        setLoading(false);
      }
    };
    fetchRadar();
  }, [studentId]);

  // SVG Radar Dimensions
  const size = 320;
  const center = size / 2;
  const radius = 105;
  const numAxes = 5;

  const getCoordinates = (axisIndex: number, value: number) => {
    const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / numAxes;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getPolygonPoints = (values: number[]) => {
    return values
      .map((val, idx) => {
        const coords = getCoordinates(idx, val);
        return `${coords.x},${coords.y}`;
      })
      .join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 flex items-center justify-center font-black">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Phase 9 Competency Radar
                </span>
                <span className="text-xs text-slate-400">Multi-Dimensional Skill Matrix</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {data?.radar.student_name || 'Student Competency Profile'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Synthesizing 5-axis competency model...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300 font-medium">{error}</p>
            </div>
          )}

          {data && data.radar && (
            <>
              {/* Top Banner Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <p className="text-[11px] text-slate-400">Department</p>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">{data.radar.department}</p>
                  <p className="text-[10px] text-slate-400">{data.radar.year_of_study}</p>
                </div>

                <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <p className="text-[11px] text-slate-400">Composite Score</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-purple-300">{data.radar.overall_score}</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                  <p className="text-[10px] text-purple-400 font-medium">Weighted Index</p>
                </div>

                <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <p className="text-[11px] text-slate-400">Academic Standing</p>
                  <p className="text-lg font-black text-white mt-0.5">
                    {data.radar.cgpa !== null ? data.radar.cgpa.toFixed(2) : 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400">Cumulative GPA</p>
                </div>

                <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <p className="text-[11px] text-slate-400">Roadmap Progress</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-emerald-300">{data.roadmap?.overall_progress ?? 0}%</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 truncate">{data.roadmap?.stage_title || 'Active Stage'}</p>
                </div>
              </div>

              {/* Spider Chart & Legend */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                {/* SVG Radar */}
                <div className="md:col-span-6 flex flex-col items-center justify-center">
                  <svg width={size} height={size} className="overflow-visible select-none">
                    {/* Concentric grid webs */}
                    {[20, 40, 60, 80, 100].map(level => {
                      const points = getPolygonPoints([level, level, level, level, level]);
                      return (
                        <polygon
                          key={level}
                          points={points}
                          fill="none"
                          stroke="#334155"
                          strokeWidth="1"
                          strokeDasharray={level < 100 ? '2,2' : undefined}
                          opacity={level === 100 ? 0.8 : 0.4}
                        />
                      );
                    })}

                    {/* Radial axis lines */}
                    {data.radar.axes.map((_, idx) => {
                      const outer = getCoordinates(idx, 100);
                      return (
                        <line
                          key={idx}
                          x1={center}
                          y1={center}
                          x2={outer.x}
                          y2={outer.y}
                          stroke="#334155"
                          strokeWidth="1"
                          opacity={0.6}
                        />
                      );
                    })}

                    {/* Benchmark Polygon */}
                    <polygon
                      points={getPolygonPoints(data.radar.axes.map(a => a.benchmark))}
                      fill="#3b82f6"
                      fillOpacity="0.1"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />

                    {/* Student Performance Polygon */}
                    <polygon
                      points={getPolygonPoints(data.radar.axes.map(a => a.score))}
                      fill="#8b5cf6"
                      fillOpacity="0.35"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                    />

                    {/* Interactive Vertex Dots */}
                    {data.radar.axes.map((axis, idx) => {
                      const coords = getCoordinates(idx, axis.score);
                      const isHovered = hoveredAxis === idx;
                      return (
                        <g key={idx} onMouseEnter={() => setHoveredAxis(idx)} onMouseLeave={() => setHoveredAxis(null)}>
                          <circle
                            cx={coords.x}
                            cy={coords.y}
                            r={isHovered ? 6 : 4}
                            fill="#c084fc"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="transition-all cursor-pointer"
                          />
                        </g>
                      );
                    })}

                    {/* Labels */}
                    {data.radar.axes.map((axis, idx) => {
                      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / numAxes;
                      const labelDist = radius + 22;
                      const lx = center + labelDist * Math.cos(angle);
                      const ly = center + labelDist * Math.sin(angle);
                      const isHovered = hoveredAxis === idx;

                      return (
                        <text
                          key={idx}
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`text-[10px] font-bold cursor-pointer transition-colors ${
                            isHovered ? 'fill-purple-300' : 'fill-slate-300'
                          }`}
                          onMouseEnter={() => setHoveredAxis(idx)}
                          onMouseLeave={() => setHoveredAxis(null)}
                        >
                          {axis.axis} ({axis.score})
                        </text>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-purple-500/50 border border-purple-400" />
                      <span className="text-slate-300 font-semibold">Student Competency</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-blue-400 border-b border-dashed border-blue-400" />
                      <span className="text-slate-400">Institutional Benchmark</span>
                    </div>
                  </div>
                </div>

                {/* Axes Breakdown Cards */}
                <div className="md:col-span-6 space-y-2.5">
                  <p className="text-xs font-bold text-white tracking-wide uppercase">
                    5-Axis Competency Breakdown
                  </p>
                  {data.radar.axes.map((axis, idx) => {
                    const isHovered = hoveredAxis === idx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredAxis(idx)}
                        onMouseLeave={() => setHoveredAxis(null)}
                        className={`p-3 rounded-xl border transition cursor-default ${
                          isHovered
                            ? 'bg-purple-950/40 border-purple-600/70 shadow-sm'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-200">{axis.axis}</span>
                          <span className="font-mono font-black text-purple-300">
                            {axis.score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${axis.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">{axis.evidence}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Source: {axis.source}</span>
                          <span>Target: {axis.benchmark}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mentor Evidence Callout if available */}
              {data.radar.mentor_evidence && (
                <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">Verified Industry Mentor Review</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      {data.radar.mentor_evidence.overall_rating} / 5.0 Rating
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic mb-2">
                    Evaluated by {data.radar.mentor_evidence.evaluator}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-0.5">Demonstrated Strengths</span>
                      <p className="text-slate-300">{data.radar.mentor_evidence.strengths}</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      <span className="text-amber-400 font-bold block mb-0.5">Growth Focus Areas</span>
                      <p className="text-slate-300">{data.radar.mentor_evidence.areas_for_improvement}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Source records synthesized from verified student activities and evaluations.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
