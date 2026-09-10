import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  Check,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeech } from "../hooks/useSpeech";

const Quiz = () => {
  const { domainId, quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const { speak, stop, isSpeaking } = useSpeech("fr-FR");
  const [submitting, setSubmitting] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [levelId, setLevelId] = useState(null);
  const fromLevelId = location.state?.fromLevelId ?? null;

  useEffect(() => {
    const fetchQuizAndDomain = async () => {
      try {
        let response;
        try {
          if (quizId) {
            response = await api.get(`/quizzes/${quizId}`);
          } else if (domainId) {
            response = await api.get(`/quizzes/domain/${domainId}`);
          }
          if (response) {
            setQuiz(response.data);
          }
        } catch (err) {
          console.error("Failed to fetch quiz", err);
        }

        if (domainId) {
          const domainRes = await api.get(
            `/student/domains/${domainId}/details`,
          );
          setLevelId(domainRes.data.levelId);
        }
      } catch (err) {
        console.error("Failed to load quiz/domain info", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndDomain();
  }, [domainId, quizId]);

  useEffect(() => {
    stop();
  }, [currentIndex, stop]);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    stop();
    if (currentIndex < quiz.questions.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    stop();
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    stop();
    // Check if all questions are answered
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(t("fill_blank_alert"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/quizzes/${quiz.id}/submit`, answers);
      setResult(response.data);
    } catch (err) {
      console.error("Submission failed", err);
      alert(t("submission_err"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setDirection(1);
    setShowCorrection(false);
  };

  const getReturnPath = () => {
    if (domainId) {
      return `/dashboard/domains/${domainId}`;
    }

    if (fromLevelId || levelId) {
      return `/dashboard/quizzes/levels/${fromLevelId ?? levelId}`;
    }

    return "/dashboard/quizzes";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-blue-600 uppercase tracking-widest text-xs">
            {t("eval_prep")}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!quiz) {
    const hasDomain = !!domainId;

    return (
      <Layout>
        <div
          className="max-w-md mx-auto text-center py-16 bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 relative overflow-hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-blue-50 blur-3xl opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-indigo-50 blur-3xl opacity-60" />

          {hasDomain ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 border border-green-100 shadow-md"
              >
                <CheckCircle2 size={36} />
              </motion.div>

              <h2 className="text-3xl font-black text-gray-900 mb-3">
                {t("lesson_completed")}
              </h2>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed text-sm">
                {t("domain_complete_desc")}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/dashboard/domains/${domainId}`)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  {t("re_practice")}
                </button>

                <button
                  onClick={() =>
                    navigate(
                      levelId ? `/dashboard/levels/${levelId}` : "/dashboard",
                    )
                  }
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-850 transition-colors active:scale-95"
                >
                  {t("go_to_domains")}
                </button>
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-100 shadow-md"
              >
                <HelpCircle size={36} />
              </motion.div>

              <h2 className="text-3xl font-black text-gray-900 mb-3">
                {t("no_quiz_title")}
              </h2>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed text-sm">
                {t("no_quiz_desc")}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {t("go_back")}
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-850 transition-colors active:scale-95"
                >
                  {t("dashboard")}
                </button>
              </div>
            </>
          )}
        </div>
      </Layout>
    );
  }

  const question = quiz.questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / quiz.questions.length) * 100;
  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  // Animation variants for sliding questions
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir) => ({
      x: dir < 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  if (result) {
    if (showCorrection) {
      return (
        <Layout>
          <div
            className="max-w-3xl mx-auto py-8 sm:py-12 px-3 sm:px-4 space-y-6 sm:space-y-8 animate-fadeIn"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="rounded-[1.75rem] sm:rounded-[2.5rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-violet-500" />
              <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => setShowCorrection(false)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold group"
                  >
                    <ArrowLeft
                      size={20}
                      className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform"
                    />
                    {t("back_to_results")}
                  </button>
                  <span className="text-xs sm:text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 sm:px-4 py-2 rounded-2xl self-start sm:self-auto">
                    {t("correction_score", { score: result.score })}
                  </span>
                </header>

                <div className="space-y-6">
                  {quiz.questions.map((q, idx) => {
                    const userAns = answers[q.id];
                    const correctAns = q.correctAnswer;
                    const isCorrect = userAns === correctAns;

                    return (
                      <div
                        key={q.id}
                        className="bg-white p-4 sm:p-6 md:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-5 sm:space-y-6 relative overflow-hidden"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider sm:tracking-widest bg-gray-50 px-3 py-1 rounded-lg self-start">
                            {t("question_label", { index: idx + 1 })}
                          </span>
                          <span
                            className={`text-[10px] sm:text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider self-start sm:self-auto ${
                              isCorrect
                                ? "bg-green-50 text-green-600 border border-green-100"
                                : "bg-red-50 text-red-500 border border-red-100"
                            }`}
                          >
                            {isCorrect ? t("correct") : t("incorrect")}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {t("question_label", { index: idx + 1 })}
                          </p>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 leading-snug sm:leading-relaxed break-words">
                            {q.frenchText}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                          {q.options.map((option, optIdx) => {
                            const isUserSelected = userAns === option;
                            const isCorrectOption = correctAns === option;

                            let cardStyle =
                              "border-gray-100 bg-gray-50/20 text-gray-600";
                            let icon = null;

                            if (isUserSelected) {
                              if (isCorrectOption) {
                                cardStyle =
                                  "border-green-600 bg-green-50 text-green-950";
                                icon = (
                                  <CheckCircle2
                                    className="text-green-600"
                                    size={18}
                                  />
                                );
                              } else {
                                cardStyle =
                                  "border-red-600 bg-red-50/50 text-red-950";
                                icon = (
                                  <XCircle className="text-red-500" size={18} />
                                );
                              }
                            } else if (isCorrectOption) {
                              cardStyle =
                                "border-green-500 border-dashed bg-green-50/20 text-green-950";
                              icon = (
                                <CheckCircle2
                                  className="text-green-500 opacity-60"
                                  size={18}
                                />
                              );
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all font-bold flex items-start justify-between gap-3 ${cardStyle}`}
                              >
                                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                                  <span
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 ${
                                      isUserSelected
                                        ? isCorrectOption
                                          ? "bg-green-600 text-white"
                                          : "bg-red-500 text-white"
                                        : isCorrectOption
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="text-sm sm:text-base leading-snug sm:leading-relaxed break-words whitespace-normal min-w-0">
                                    {option}
                                  </span>
                                </div>
                                {icon}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowCorrection(false)}
                  className="w-full py-4 sm:py-5 bg-gray-950 text-white rounded-[1.5rem] sm:rounded-[2rem] text-sm sm:text-base font-bold hover:bg-gray-800 transition-colors shadow-xl"
                >
                  {t("back_to_results")}
                </button>
              </div>
            </div>
          </div>
        </Layout>
      );
    }

    const isSuccess = result.passed;
    return (
      <Layout>
        <div
          className="max-w-2xl mx-auto py-8 sm:py-12 px-3 sm:px-4"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="rounded-[2rem] sm:rounded-[2.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 shadow-2xl shadow-slate-200/60 overflow-hidden">
            <div
              className={`h-1.5 bg-gradient-to-r ${isSuccess ? "from-emerald-500 via-green-500 to-teal-500" : "from-amber-500 via-orange-500 to-rose-500"}`}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="p-5 sm:p-8 md:p-16 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] flex flex-col items-center relative overflow-hidden"
            >
              {/* Background decoration */}
              <div
                className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-10 ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
              />
              <div
                className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-10 ${isSuccess ? "bg-blue-500" : "bg-orange-500"}`}
              />

              {isSuccess ? (
                <div className="flex flex-col items-center text-center w-full">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="bg-green-50 p-4 sm:p-6 rounded-full mb-5 sm:mb-6 border border-green-100 shadow-lg relative"
                  >
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1 -right-1 bg-yellow-400 p-1.5 rounded-full"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
                    {t("congrats")}
                  </h1>
                  <p className="text-sm sm:text-lg text-gray-500 mb-6 sm:mb-8 max-w-md leading-relaxed">
                    {t("congrats_desc")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center w-full">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-50 p-4 sm:p-6 rounded-full mb-5 sm:mb-6 border border-red-100 shadow-lg"
                  >
                    <Award className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                  </motion.div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
                    {t("almost_there")}
                  </h1>
                  <p className="text-sm sm:text-lg text-gray-500 mb-6 sm:mb-8 max-w-md leading-relaxed">
                    {t("almost_there_desc")}
                  </p>
                </div>
              )}

              {/* Score Ring / Card */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="bg-white/90 backdrop-blur border border-white/80 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-3xl text-center shadow-lg shadow-slate-200/50">
                  <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                    {t("your_score")}
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-black ${isSuccess ? "text-green-600" : "text-red-500"}`}
                  >
                    {result.score}%
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur border border-white/80 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-3xl text-center shadow-lg shadow-slate-200/50">
                  <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                    {t("correct_count")}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-gray-800">
                    {result.correctCount}
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur border border-white/80 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-3xl text-center shadow-lg shadow-slate-200/50">
                  <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                    {t("total_questions")}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-gray-800">
                    {result.totalQuestions}
                  </p>
                </div>
              </div>

              {/* See Correction Button */}
              <button
                onClick={() => setShowCorrection(true)}
                className="w-full py-4 sm:py-5 mb-5 sm:mb-6 rounded-[1.5rem] sm:rounded-[2rem] text-sm sm:text-base font-bold bg-white/90 backdrop-blur hover:bg-indigo-50 text-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 border border-indigo-100 shadow-lg shadow-indigo-100/50"
              >
                <CheckCircle2 size={20} />
                {t("see_correction")}
              </button>

              {/* Action Buttons */}
              <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleRetake}
                  className="w-full flex-1 flex items-center justify-center gap-3 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-sm sm:text-base font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  <RotateCcw size={20} />
                  {t("retake_quiz")}
                </button>

                <button
                  onClick={() => navigate(getReturnPath())}
                  className="w-full flex-1 flex items-center justify-center py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-sm sm:text-base font-bold text-white shadow-xl hover:opacity-90 transition-all active:scale-95"
                  style={{ backgroundColor: isSuccess ? "#10B981" : "#3B82F6" }}
                >
                  {isSuccess ? t("practice_phrases") : t("review_lesson")}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="max-w-3xl mx-auto pb-32 md:pb-20 px-3 sm:px-4"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Top bar with back button & overall progress indicator */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate(getReturnPath())}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform"
            />
            {t("quit")}
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 sm:px-4 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
              {t("question_label", { index: currentIndex + 1 })} /{" "}
              {quiz.questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 sm:h-3 bg-gray-100 rounded-full mb-6 sm:mb-10 overflow-hidden border border-gray-200/50 p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm"
          />
        </div>

        {/* Animated Question Container */}
        <div className="relative overflow-hidden min-h-[520px] sm:min-h-[460px] md:min-h-[420px] mb-6 sm:mb-8">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white p-4 sm:p-6 md:p-14 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
                  <span className="text-[10px] sm:text-xs font-black text-indigo-500 uppercase tracking-wider sm:tracking-widest bg-indigo-50 px-2.5 sm:px-3 py-1 rounded-lg max-w-[70%] break-words">
                    {question.type === "FILL_BLANK"
                      ? t("fill_blank")
                      : t("multiple_choice")}
                  </span>

                  <button
                    onClick={() =>
                      speak(question.frenchText, {
                        id: `quiz-q-${question.id}`,
                        rate: 0.9,
                      })
                    }
                    aria-label={
                      isSpeaking(`quiz-q-${question.id}`)
                        ? t("stop_audio")
                        : t("speak")
                    }
                    className={`p-3 sm:p-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95 flex-shrink-0 ${
                      isSpeaking(`quiz-q-${question.id}`)
                        ? "bg-red-50 text-red-600 ring-2 ring-red-200"
                        : "bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {isSpeaking(`quiz-q-${question.id}`) ? (
                      <VolumeX size={20} className="animate-pulse" />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-snug sm:leading-relaxed tracking-tight mb-6 sm:mb-8 break-words">
                  {question.frenchText}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {question.options.map((option, idx) => {
                  const isSelected = answers[question.id] === option;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(question.id, option)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all font-bold flex items-start justify-between gap-3 group relative overflow-hidden min-h-[76px] sm:min-h-[84px] ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-md shadow-indigo-100"
                          : "border-gray-100 hover:border-gray-300 bg-gray-50/20 text-gray-600 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4 z-10 min-w-0 flex-1">
                        <span
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-all flex-shrink-0 ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm sm:text-base leading-snug sm:leading-relaxed break-words whitespace-normal min-w-0">
                          {option}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="bg-indigo-600 text-white p-1 rounded-full z-10 shadow-sm flex-shrink-0 self-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 z-30 md:static md:z-auto bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-slate-200 md:border-t-0 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] md:shadow-none">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 md:py-0">
            <div className="flex items-center gap-3 justify-between mt-0 md:mt-8">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="min-w-[110px] sm:min-w-[132px] px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-20 flex items-center justify-center gap-1.5 group bg-slate-50 border border-slate-200"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:ltr:-translate-x-0.5 group-hover:rtl:translate-x-0.5 rtl:rotate-180 transition-transform"
                />
                {t("previous")}
              </button>

              {currentIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!answers[question.id]}
                  className="flex-1 sm:flex-none sm:min-w-[180px] px-5 sm:px-10 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {t("next")}
                  <ChevronRight size={20} className="rtl:rotate-180" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="flex-1 sm:flex-none sm:min-w-[220px] px-5 sm:px-10 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {submitting ? t("calculating_score") : t("submit_answers")}
                  <CheckCircle2 size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
