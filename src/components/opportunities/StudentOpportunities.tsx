import React, { useState, useEffect } from 'react';
import { Job, Internship, Application, MatchedOpportunityItem, OpportunityMatchBreakdown } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { SmartApplyModal } from './SmartApplyModal';
import { ApplicationTracker } from './ApplicationTracker';
import {
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  ArrowUpDown,
  Send,
  Eye,
  Check
} from 'lucide-react';

export const StudentOpportunities: React.FC = () => {
  const { student } = useAuth();

  const [activeTab, setActiveTab] = useState<'browse' | 'my_applications'>('browse');
  const [matchedItems, setMatchedItems] = useState<MatchedOpportunityItem[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'jobs' | 'internships'>('all');
  const [arrangementFilter, setArrangementFilter] = useState<string>('all');
  const [matchScoreFilter, setMatchScoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'best_match' | 'latest' | 'deadline' | 'company'>('best_match');

  // Modals
  const [detailModalItem, setDetailModalItem] = useState<{
    item: Job | Internship;
    type: 'job' | 'internship';
    match: OpportunityMatchBreakdown | null;
    hasApplied: boolean;
  } | null>(null);

  const [applyModalItem, setApplyModalItem] = useState<{
    item: Job | Internship;
    type: 'job' | 'internship';
    match: OpportunityMatchBreakdown | null;
  } | null>(null);

  // Global Toast / Banner message
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOpportunitiesData = async () => {
    try {
      setLoading(true);
      const [matchedRes, appRes] = await Promise.all([
        api.matching.getOpportunities(),
        api.matching.getMyApplications()
      ]);
      setMatchedItems(matchedRes.opportunities);
      setMyApplications(appRes.applications);
    } catch (err: any) {
      console.error('Failed to load matched opportunities:', err);
      setBannerMsg({ type: 'error', text: err.message || 'Failed to evaluate job matching' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunitiesData();
  }, []);

  const handleSmartApplySubmit = async (coverNote: string) => {
    if (!applyModalItem) return;

    try {
      const res = await api.matching.smartApply(
        applyModalItem.item.id,
        applyModalItem.type,
        coverNote
      );

      setBannerMsg({
        type: 'success',
        text: `Application submitted successfully to ${applyModalItem.item.title}! (Match: ${res.match?.overall_match_percentage || 0}%)`
      });

      // Update state locally and re-fetch
      await fetchOpportunitiesData();
      setTimeout(() => setBannerMsg(null), 5000);
    } catch (err: any) {
      throw err;
    }
  };

  // Filter & Sort Logic
  const filteredOpportunities = matchedItems.filter((item) => {
    const opp = item.opportunity;
    const company = opp.company;
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      opp.title.toLowerCase().includes(q) ||
      (company?.company_name || '').toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q) ||
      opp.required_skills.some((s) => s.toLowerCase().includes(q));

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'jobs' && item.type === 'job') ||
      (typeFilter === 'internships' && item.type === 'internship');

    const matchesArrangement =
      arrangementFilter === 'all' || opp.work_arrangement === arrangementFilter;

    let matchesMatchFilter = true;
    if (matchScoreFilter === 'strong') {
      matchesMatchFilter = item.match_score >= 80;
    } else if (matchScoreFilter === 'good') {
      matchesMatchFilter = item.match_score >= 60;
    } else if (matchScoreFilter === 'developing') {
      matchesMatchFilter = item.match_score >= 40;
    }

    return matchesSearch && matchesType && matchesArrangement && matchesMatchFilter;
  });

  // Sort
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === 'best_match') {
      return b.match_score - a.match_score;
    } else if (sortBy === 'latest') {
      return new Date(b.opportunity.created_at).getTime() - new Date(a.opportunity.created_at).getTime();
    } else if (sortBy === 'deadline') {
      return new Date(a.opportunity.application_deadline).getTime() - new Date(b.opportunity.application_deadline).getTime();
    } else if (sortBy === 'company') {
      const nameA = a.opportunity.company?.company_name || '';
      const nameB = b.opportunity.company?.company_name || '';
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Strong Match':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'Good Match':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'Developing Match':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Intelligent Job & Internship Matching
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated multi-factor matching engine linking your real academic standing, verified test scores, and projects to open corporate vacancies.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            id="student-opp-tab-browse"
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Matched Postings ({matchedItems.length})</span>
          </button>

          <button
            id="student-opp-tab-applications"
            type="button"
            onClick={() => setActiveTab('my_applications')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my_applications'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Applications ({myApplications.length})</span>
          </button>
        </div>
      </div>

      {/* Banner / Feedback Message */}
      {bannerMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 shadow-sm ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* BROWSE TAB */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Search, Filters, and Sorting Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="student-opp-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search role title, company name, required skill (e.g. React, Node.js), or location..."
                  className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Work Arrangement Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Arrangement:</span>
                <select
                  id="student-opp-arrangement-select"
                  value={arrangementFilter}
                  onChange={(e) => setArrangementFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Modes</option>
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Match Score Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Match Tier:</span>
                <select
                  id="student-opp-match-select"
                  value={matchScoreFilter}
                  onChange={(e) => setMatchScoreFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Match Scores</option>
                  <option value="strong">80%+ (Strong Match)</option>
                  <option value="good">60%+ (Good Match)</option>
                  <option value="developing">40%+ (Developing)</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Sort By:</span>
                <select
                  id="student-opp-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="best_match">Highest Match %</option>
                  <option value="latest">Latest Postings</option>
                  <option value="deadline">Application Deadline</option>
                  <option value="company">Company Name</option>
                </select>
              </div>
            </div>

            {/* Type Quick Selector */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                    : 'bg-slate-800/60 text-slate-400 border-slate-750 hover:text-white'
                }`}
              >
                All Opportunities ({matchedItems.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('jobs')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  typeFilter === 'jobs'
                    ? 'bg-blue-900/60 text-blue-200 border-blue-700 shadow-xs'
                    : 'bg-slate-800/60 text-slate-400 border-slate-750 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>Full-time Jobs ({matchedItems.filter(i => i.type === 'job').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('internships')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  typeFilter === 'internships'
                    ? 'bg-teal-900/60 text-teal-200 border-teal-700 shadow-xs'
                    : 'bg-slate-800/60 text-slate-400 border-slate-750 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                <span>Mentored Internships ({matchedItems.filter(i => i.type === 'internship').length})</span>
              </button>
            </div>
          </div>

          {/* Matched Opportunities Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Running matching engine across active vacancies...</p>
            </div>
          ) : sortedOpportunities.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Matched Vacancies</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active postings match your search filters. Try adjusting your search query, location filter, or match tier criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedOpportunities.map((matchedItem) => {
                const item = matchedItem.opportunity;
                const company = item.company;
                const isJob = matchedItem.type === 'job';
                const job = isJob ? (item as Job) : null;
                const internship = !isJob ? (item as Internship) : null;
                const match = matchedItem.match;
                const hasApplied = matchedItem.has_applied;

                return (
                  <div
                    key={`${matchedItem.type}-${item.id}`}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm group hover:shadow-md"
                  >
                    <div className="space-y-3.5">
                      {/* Card Header: Company Logo, Match Tier & Type */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={company?.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company?.company_name || 'Employer')}`}
                            alt={company?.company_name || 'Company'}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 bg-slate-800 shrink-0 group-hover:ring-indigo-500/40 transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company?.company_name || 'Corp')}`;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              {isJob ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1 uppercase tracking-wider">
                                  <Briefcase className="w-3 h-3 text-blue-400" />
                                  <span>Job • {job?.employment_type || 'Full-Time'}</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1 uppercase tracking-wider">
                                  <GraduationCap className="w-3 h-3 text-teal-400" />
                                  <span>Internship • {internship?.duration || '3-6 Months'}</span>
                                </span>
                              )}
                              {isJob && job?.min_cgpa !== undefined && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-750">
                                  Min CGPA: {job.min_cgpa}
                                </span>
                              )}
                              {!isJob && internship?.stipend && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  {internship.stipend}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{company?.company_name || 'Corporate Partner'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Match Percentage Badge */}
                        <div className="flex flex-col items-end shrink-0">
                          <div className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 shadow-xs ${getTierBadgeStyle(matchedItem.match_tier)}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{matchedItem.match_score}% Match</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                            {matchedItem.match_tier}
                          </span>
                        </div>
                      </div>

                      {/* Location, Work Arrangement & Compensation */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{item.location}</span>
                        </span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                          {item.work_arrangement}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">
                          {isJob ? job?.employment_type : internship?.stipend}
                        </span>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Skills Summary with Match Status */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold">Skills Fit:</span>
                          {match && (
                            <span className="text-indigo-300 text-[10px] font-semibold">
                              {match.skills_analysis.matching_count} / {item.required_skills.length} matching
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {item.required_skills.slice(0, 4).map((skill, idx) => {
                            const isMatch = match?.skills_analysis.matching_skills.some(
                              (m) => m.name.toLowerCase() === skill.toLowerCase()
                            );
                            const isWeak = match?.skills_analysis.weak_skills.some(
                              (w) => w.name.toLowerCase() === skill.toLowerCase()
                            );

                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${
                                  isMatch
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                    : isWeak
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isMatch && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                                <span>{skill}</span>
                              </span>
                            );
                          })}
                          {item.required_skills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500">
                              +{item.required_skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assessment Verification Highlight */}
                      {match && match.verified_assessments.length > 0 && (
                        <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-900/50 flex items-center justify-between text-[10px] text-indigo-300">
                          <span className="flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{match.verified_assessments[0].title} Verified</span>
                          </span>
                          <span className="font-bold text-emerald-400">
                            {match.verified_assessments[0].badge} ({match.verified_assessments[0].score_percentage}%)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        id={`view-details-btn-${item.id}`}
                        type="button"
                        onClick={() =>
                          setDetailModalItem({
                            item,
                            type: matchedItem.type,
                            match: matchedItem.match,
                            hasApplied: hasApplied
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Why You Match</span>
                      </button>

                      {hasApplied ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab('my_applications')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 hover:bg-emerald-900/80"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button
                          id={`quick-apply-btn-${item.id}`}
                          type="button"
                          onClick={() =>
                            setApplyModalItem({
                              item,
                              type: matchedItem.type,
                              match: matchedItem.match
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Apply Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY APPLICATIONS TAB */}
      {activeTab === 'my_applications' && (
        <ApplicationTracker
          applications={myApplications}
          loading={loading}
          onRefresh={fetchOpportunitiesData}
          onBrowse={() => setActiveTab('browse')}
        />
      )}

      {/* Opportunity Detail & Match Modal */}
      {detailModalItem && (
        <OpportunityDetailModal
          item={detailModalItem.item}
          type={detailModalItem.type}
          match={detailModalItem.match}
          hasApplied={detailModalItem.hasApplied}
          onClose={() => setDetailModalItem(null)}
          onApply={(item, type) => {
            setDetailModalItem(null);
            setApplyModalItem({
              item,
              type,
              match: detailModalItem.match
            });
          }}
        />
      )}

      {/* Smart Apply Modal */}
      {applyModalItem && (
        <SmartApplyModal
          item={applyModalItem.item}
          type={applyModalItem.type}
          match={applyModalItem.match}
          onClose={() => setApplyModalItem(null)}
          onSubmit={handleSmartApplySubmit}
        />
      )}
    </div>
  );
};
