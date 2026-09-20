import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CompetencyRadarData } from '../../types';
import {
  Target,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  BookOpen
} from 'lucide-react';

export const StudentPersonalAnalyticsView: React.FC = () => {
  const [data, setData] = useState<{ radar: CompetencyRadarData; roadmap: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  const fetchMyAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.analytics.getMyRadar();
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your personal competency analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAnalytics();
  }, []);

  // Radar geometry
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

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Synthesizing your 5-axis competency model...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs text-slate-300 font-semibold">{error}</p>
        <button
          onClick={fetchMyAnalytics}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Personal Analytics
            </span>
            <span className="text-xs text-slate-400">• Multi-Dimensional Profile</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            5-Axis Competency Radar & Career Readiness
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            A comprehensive evaluation of your technical skills, assessment mastery, verified certifications, capstones, and corporate mentor feedback against institutional placement standards.
          </p>
        </div>

        <button
          onClick={fetchMyAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Profile
        </button>
      </div>

      {data && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">Competency Index</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-purple-300">{data.radar.overall_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-[10px] text-purple-400 mt-0.5">Weighted Score</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">Roadmap Progress</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-400">{data.roadmap?.overall_progress ?? 0}%</span>
              </div>
              <p className="text-[10px] text-emerald-400 truncate mt-0.5">{data.roadmap?.stage_title || 'Active Stage'}</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">Academic CGPA</p>
              <p className="text-2xl font-black text-white mt-1">
                {data.radar.cgpa !== null ? data.radar.cgpa.toFixed(2) : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Grade Point Average</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">Mentor Evaluation</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {data.radar.mentor_evidence ? `${data.radar.mentor_evidence.overall_rating} / 5.0` : 'Pending'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Industry Rating</p>
            </div>
          </div>

          {/* Spider Chart & Dimension Breakdown */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Radar Chart */}
              <div className="md:col-span-6 flex flex-col items-center justify-center">
                <svg width={size} height={size} className="overflow-visible select-none">
                  {/* Concentric rings */}
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

                  {/* Spokes */}
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

                  {/* Benchmark */}
                  <polygon
                    points={getPolygonPoints(data.radar.axes.map(a => a.benchmark))}
                    fill="#3b82f6"
                    fillOpacity="0.1"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />

                  {/* Student polygon */}
                  <polygon
                    points={getPolygonPoints(data.radar.axes.map(a => a.score))}
                    fill="#8b5cf6"
                    fillOpacity="0.35"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                  />

                  {/* Vertices */}
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
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-500/50 border border-purple-400" />
                    <span className="text-slate-200 font-bold">Your Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-blue-400 border-b border-dashed border-blue-400" />
                    <span className="text-slate-400">Campus Benchmark</span>
                  </div>
                </div>
              </div>

              {/* Axis Breakdown Cards */}
              <div className="md:col-span-6 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Detailed Dimension Scores
                </h3>
                {data.radar.axes.map((axis, idx) => {
                  const isHovered = hoveredAxis === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredAxis(idx)}
                      onMouseLeave={() => setHoveredAxis(null)}
                      className={`p-3 rounded-xl border transition ${
                        isHovered
                          ? 'bg-purple-950/40 border-purple-600/70 shadow-sm'
                          : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{axis.axis}</span>
                        <span className="font-mono font-black text-purple-300">
                          {axis.score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${axis.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">{axis.evidence}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mentor Feedback Review if available */}
          {data.radar.mentor_evidence && (
            <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-800/50 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Verified Industry Mentor Evaluation</h3>
                </div>
                <span className="text-xs font-black text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800">
                  {data.radar.mentor_evidence.overall_rating} / 5.0 Rating
                </span>
              </div>
              <p className="text-xs text-slate-300 italic mb-3">
                Evaluated by {data.radar.mentor_evidence.evaluator}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">Demonstrated Strengths</span>
                  <p className="text-slate-300">{data.radar.mentor_evidence.strengths}</p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">Recommended Growth Areas</span>
                  <p className="text-slate-300">{data.radar.mentor_evidence.areas_for_improvement}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
