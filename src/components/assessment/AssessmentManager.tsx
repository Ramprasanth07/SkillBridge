import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentStats
} from '../../types';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Code2,
  Server,
  Layers,
  Cloud,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  X,
  FileCheck2,
  BarChart2
} from 'lucide-react';

export const AssessmentManager: React.FC = () => {
  // State
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  // Active Assessment State
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number }>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Completed Attempt Result View
  const [latestAttempt, setLatestAttempt] = useState<AssessmentAttempt | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [inspectAttempt, setInspectAttempt] = useState<AssessmentAttempt | null>(null);

  // Fetch Assessments & History
  const loadAssessmentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resAssessments, resHistory] = await Promise.all([
        api.assessments.getAll(),
        api.assessments.getHistory()
      ]);

      setAssessments(resAssessments.assessments || []);
      setStats(resAssessments.stats || resHistory.stats || null);
      setHistory(resHistory.history || []);
    } catch (err: any) {
      console.error('Failed to load assessment data:', err);
      setError(err.message || 'Unable to load skill assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentsData();
  }, []);

  // Timer logic when test is active
  useEffect(() => {
    if (activeAssessment && questions.length > 0 && !showResultModal) {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAssessment, questions, showResultModal]);

  // Start Assessment Flow
  const handleStartAssessment = async (assessment: Assessment) => {
    try {
      setLoadingQuestions(true);
      setError(null);
      const res = await api.assessments.getQuestions(assessment.id);
      
      setActiveAssessment(assessment);
      setQuestions(res.questions || []);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setTimeRemainingSeconds(assessment.time_limit_minutes * 60);
      setTimeSpentSeconds(0);
      setShowResultModal(false);
      setLatestAttempt(null);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      setError(err.message || 'Failed to initialize assessment questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Answer selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit test
  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;

    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        selected_option_index: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1
      }));

      const res = await api.assessments.submit(activeAssessment.id, {
        time_taken_seconds: timeSpentSeconds,
        answers: formattedAnswers
      });

      setLatestAttempt(res.attempt);
      setShowResultModal(true);
      setActiveAssessment(null);
      setQuestions([]);

      // Reload list & history
      await loadAssessmentsData();
    } catch (err: any) {
      console.error('Failed to submit assessment:', err);
      setError(err.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitAssessment();
  };

  const handleCancelTest = () => {
    if (window.confirm('Are you sure you want to exit? Your progress in this assessment will be discarded.')) {
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveAssessment(null);
      setQuestions([]);
      setUserAnswers({});
    }
  };

  // Category Filter
  const categories = ['All', 'Frontend', 'Backend', 'Full Stack', 'Cloud'];
  const filteredAssessments = selectedCategory === 'All'
    ? assessments
    : assessments.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase());

  // Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Icon Helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Frontend':
        return <Code2 className="w-5 h-5 text-indigo-600" />;
      case 'Backend':
        return <Server className="w-5 h-5 text-emerald-600" />;
      case 'Full Stack':
        return <Layers className="w-5 h-5 text-purple-600" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-blue-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getDifficultyBadgeColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // ==========================================
  // ACTIVE TEST VIEW
  // ==========================================
  if (activeAssessment && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const isAnswered = currentQ && userAnswers[currentQ.id] !== undefined;
    const answeredCount = Object.keys(userAnswers).length;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isTimeUrgent = timeRemainingSeconds < 120; // under 2 mins

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-2">
        {/* Test Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              {getCategoryIcon(activeAssessment.category)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{activeAssessment.title}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadgeColor(activeAssessment.difficulty)}`}>
                  {activeAssessment.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Question {currentQuestionIndex + 1} of {questions.length} • {answeredCount} answered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Pill */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              isTimeUrgent
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={handleCancelTest}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Exit Test
            </button>
          </div>
        </div>

        {/* Question Selector Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-700">Question Navigation</span>
            <span className="text-slate-400 font-medium">
              Progress: <strong className="text-indigo-600">{Math.round((answeredCount / questions.length) * 100)}%</strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const answered = userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : answered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1}
                </span>
                <span className="text-xs text-slate-400">Multiple Choice Question</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question_text}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                const optionLetters = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      {optionLetters[optIdx]}
                    </div>
                    <span className="text-sm font-medium pt-0.5 leading-relaxed flex-1">
                      {optionText}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation & Submit controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-3">
                {!isLastQuestion ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitAssessment}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{submitting ? 'Submitting & Evaluating...' : 'Submit Assessment'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RESULT VIEW MODAL
  // ==========================================
  const activeAttempt = inspectAttempt || latestAttempt;
  if (showResultModal && activeAttempt) {
    const passed = activeAttempt.passed;
    const filteredReviewAnswers = activeAttempt.answers?.filter(ans => {
      if (reviewFilter === 'correct') return ans.is_correct;
      if (reviewFilter === 'incorrect') return !ans.is_correct;
      return true;
    }) || [];

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-2">
        {/* Score Summary Card */}
        <div className={`rounded-2xl border p-6 sm:p-8 shadow-xs text-white relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 border-emerald-800/40'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 border-amber-800/40'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Assessment Completed</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeAttempt.assessment_title}
              </h1>
              <p className="text-xs text-slate-300">
                Track: <span className="font-semibold text-white">{activeAttempt.category}</span> • Completed on{' '}
                {new Date(activeAttempt.completed_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {activeAttempt.score_percentage}%
                </span>
                <span className="text-[11px] text-slate-300 block font-medium">Final Score</span>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block ${
                  passed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {activeAttempt.skill_level_awarded}
                </span>
                <span className="text-[11px] text-slate-300 block font-medium mt-1">Skill Badge</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block">Status</span>
              <span className={`font-bold ${passed ? 'text-emerald-300' : 'text-amber-300'}`}>
                {passed ? 'Passed (Verified)' : 'Needs Improvement'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Correct Answers</span>
              <span className="font-bold text-white">
                {activeAttempt.correct_answers_count} / {activeAttempt.total_questions}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Time Taken</span>
              <span className="font-bold text-white font-mono">
                {formatTime(activeAttempt.time_taken_seconds)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Profile Updated</span>
              <span className="font-bold text-emerald-300">
                {passed ? 'Skill Reinforced' : 'Saved to History'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Question-by-Question Review</h2>
              <p className="text-xs text-slate-500">
                Detailed explanations and answer rationales for your assessment attempt.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  reviewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({activeAttempt.answers?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  reviewFilter === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Correct ({activeAttempt.correct_answers_count})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  reviewFilter === 'incorrect' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Incorrect ({activeAttempt.total_questions - activeAttempt.correct_answers_count})
              </button>
            </div>
          </div>

          {/* Questions Review List */}
          <div className="space-y-4 pt-2">
            {filteredReviewAnswers.map((ans, idx) => {
              const optionLetters = ['A', 'B', 'C', 'D'];
              return (
                <div
                  key={ans.question_id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    ans.is_correct
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        ans.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        ans.is_correct ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {ans.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    {ans.is_correct ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> +1 Mark
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> 0 Marks
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 mb-3">{ans.question_text}</p>

                  {/* Options */}
                  <div className="space-y-1.5 text-xs mb-3">
                    {ans.options?.map((opt, optIdx) => {
                      const isCandidateChoice = ans.selected_option_index === optIdx;
                      const isCorrectChoice = ans.correct_option_index === optIdx;

                      let optClasses = 'border-slate-200 bg-white text-slate-700';
                      if (isCorrectChoice) {
                        optClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                      } else if (isCandidateChoice && !ans.is_correct) {
                        optClasses = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${optClasses}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{optionLetters[optIdx]}.</span>
                            <span>{opt}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isCandidateChoice && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-800">
                                Your Choice
                              </span>
                            )}
                            {isCorrectChoice && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-600 text-white">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Note */}
                  {ans.explanation && (
                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Explanation & Rationale</span>
                      </div>
                      <p className="leading-relaxed pl-5">{ans.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowResultModal(false);
                setInspectAttempt(null);
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Assessments Catalog
            </button>

            {assessments.find(a => a.id === activeAttempt.assessment_id) && (
              <button
                type="button"
                onClick={() => {
                  const targetAsmt = assessments.find(a => a.id === activeAttempt.assessment_id);
                  if (targetAsmt) {
                    setShowResultModal(false);
                    setInspectAttempt(null);
                    handleStartAssessment(targetAsmt);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Assessment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CATALOG & HISTORY OVERVIEW
  // ==========================================
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Skill Assessments & Certifications
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrate your engineering competencies through timed, industry-standard technical assessments.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Attempts</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.total_attempts ?? history.length}
          </div>
          <span className="text-[11px] text-slate-400">Total exams submitted</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Verified Badges</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {stats?.verified_badges_count ?? history.filter(h => h.passed).length}
          </div>
          <span className="text-[11px] text-slate-400">Mastery tracks passed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Highest Score</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.highest_score ? `${stats.highest_score}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-400">Top performance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Score</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.average_score ? `${stats.average_score}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-400">Across all tests</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'All'
            ? assessments.length
            : assessments.filter(a => a.category.toLowerCase() === cat.toLowerCase()).length;

          return (
            <button
              key={cat}
              id={`assessment-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Assessment Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Available Assessments ({filteredAssessments.length})
          </h2>
          <span className="text-xs text-slate-400">Auto-evaluated MCQ exams</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-56 bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No assessments found for category "{selectedCategory}"</p>
            <p className="text-[11px] text-slate-400">Try selecting "All" to view all available tracks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssessments.map(asmt => {
              const hasAttempted = asmt.attempts_count > 0;
              const isPassed = asmt.passed;

              return (
                <div
                  key={asmt.id}
                  id={`assessment-card-${asmt.id}`}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Card Header Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          {getCategoryIcon(asmt.category)}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{asmt.category} Track</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadgeColor(asmt.difficulty)}`}>
                          {asmt.difficulty}
                        </span>
                        {isPassed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Passed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {asmt.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {asmt.description}
                      </p>
                    </div>

                    {/* Specs / Meta Badges */}
                    <div className="flex flex-wrap gap-3 text-xs pt-1">
                      <div className="flex items-center gap-1 text-slate-600">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{asmt.total_questions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{asmt.time_limit_minutes} Mins</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pass: {asmt.passing_percentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Performance or CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {hasAttempted ? (
                        <div className="text-xs">
                          <span className="text-slate-400">Best Score: </span>
                          <strong className={isPassed ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
                            {asmt.best_score}%
                          </strong>
                          {asmt.best_skill_level && (
                            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                              {asmt.best_skill_level}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Not attempted yet</span>
                      )}
                    </div>

                    <button
                      id={`start-assessment-btn-${asmt.id}`}
                      type="button"
                      onClick={() => handleStartAssessment(asmt)}
                      disabled={loadingQuestions}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-50"
                    >
                      <span>{hasAttempted ? 'Retake Assessment' : 'Start Assessment'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Attempt History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Assessment Attempt History ({history.length})
          </h2>
          <span className="text-xs text-slate-400">Verified performance logs</span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No assessment attempts recorded yet</p>
            <p className="text-[11px] text-slate-400">
              Start one of the technical assessment tracks above to earn verified skill badges.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {history.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      attempt.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {attempt.passed ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{attempt.assessment_title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          attempt.passed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {attempt.skill_level_awarded}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Track: {attempt.category} • Completed on{' '}
                        {new Date(attempt.completed_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} • Time: {formatTime(attempt.time_taken_seconds)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className={`text-base font-extrabold ${
                        attempt.passed ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {attempt.score_percentage}%
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {attempt.correct_answers_count} / {attempt.total_questions} Correct
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setInspectAttempt(attempt);
                        setShowResultModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      View Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
