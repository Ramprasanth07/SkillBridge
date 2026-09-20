import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CollegeIndustryAnalytics } from '../../types';
import {
  Building2,
  Briefcase,
  Layers,
  Users,
  MapPin,
  Globe,
  Mail,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const IndustryEngagement: React.FC = () => {
  const [data, setData] = useState<CollegeIndustryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);

  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        setLoading(true);
        const res = await api.college.getIndustry();
        setData(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch corporate industry engagement analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchIndustry();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Loading Corporate Industry Partnerships...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-200">{error || 'Industry data unavailable.'}</p>
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
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Industry & Employer Engagement</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            {data.total_partners} Active Corporate Partners
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Monitor university-industry collaboration, active corporate recruiting pipelines, open roles, and candidate application volumes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Corporate Partners</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{data.total_partners}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verified Institutional Employers</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Postings</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">{data.active_jobs_count + data.active_internships_count}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {data.active_jobs_count} Jobs • {data.active_internships_count} Internships
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Applications Received</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{data.total_applications_received}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Student Applications Tracked</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Industry Sectors</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{data.industry_domain_distribution.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Diverse Market Verticals</div>
        </div>
      </div>

      {/* Domain Distribution */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Recruiting Industry Domains</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {data.industry_domain_distribution.map((d, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2 text-xs"
            >
              <span className="font-bold text-white">{d.domain}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                {d.count} Partners ({d.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight">Active Partner Directory</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.partners_list.map((partner) => (
            <div
              key={partner.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={partner.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                      alt={partner.company_name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{partner.company_name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{partner.industry}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {partner.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {partner.company_size || 'Mid-size'}
                  </span>
                </div>

                {/* Partner Stats Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-semibold">Active Posts</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {partner.active_jobs_count + partner.active_internships_count}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-semibold">Applicants</div>
                    <div className="text-xs font-bold text-indigo-400 mt-0.5">{partner.total_applicants_count}</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-semibold">Selections</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">{partner.selected_count}</div>
                  </div>
                </div>

                {/* Active Postings List */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Featured Open Postings
                  </div>
                  <div className="space-y-1">
                    {[...partner.jobs, ...partner.internships].slice(0, 3).map((post: any) => (
                      <div
                        key={post.id}
                        className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/40 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-200 truncate">{post.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700 capitalize shrink-0">
                          {post.location_type || 'Full Time'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-purple-300 flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </a>
                  )}
                  {partner.contact_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{partner.contact_email}</span>
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Active Partner
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
