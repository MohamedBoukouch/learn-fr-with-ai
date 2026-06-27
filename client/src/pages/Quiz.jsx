import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import Layout from '../components/Layout';
import { 
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, Trophy, RotateCcw, 
  Volume2, Sparkles, HelpCircle, ArrowLeft, Check, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Quiz = () => {
  const { domainId, quizId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [speaking, setSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [levelId, setLevelId] = useState(null);
  
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
          console.error('Failed to fetch quiz', err);
        }

        if (domainId) {
          const domainRes = await api.get(`/student/domains/${domainId}/details`);
          setLevelId(domainRes.data.levelId);
        }
      } catch (err) {
        console.error('Failed to load quiz/domain info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndDomain();
  }, [domainId, quizId]);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const speak = useCallback((text) => {
    if (speaking) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [speaking]);

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(t('fill_blank_alert'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/quizzes/${quiz.id}/submit`, answers);
      setResult(response.data);
    } catch (err) {
      console.error('Submission failed', err);
      alert(t('submission_err'));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-blue-600 uppercase tracking-widest text-xs">{t('eval_prep')}</p>
        </motion.div>
      </div>
    );
  }

  if (!quiz) {
    const hasDomain = !!domainId;

    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
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

              <h2 className="text-3xl font-black text-gray-900 mb-3">{t('lesson_completed')}</h2>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed text-sm">
                {t('domain_complete_desc')}
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate(`/dashboard/domains/${domainId}`)} 
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  {t('re_practice')}
                </button>
                
                <button 
                  onClick={() => navigate(levelId ? `/dashboard/levels/${levelId}` : '/dashboard')} 
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-850 transition-colors active:scale-95"
                >
                  {t('go_to_domains')}
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

              <h2 className="text-3xl font-black text-gray-900 mb-3">{t('no_quiz_title')}</h2>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed text-sm">
                {t('no_quiz_desc')}
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {t('go_back')}
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-850 transition-colors active:scale-95"
                >
                  {t('dashboard')}
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
  const allAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

  // Animation variants for sliding questions
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir) => ({
      x: dir < 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  if (result) {
    if (showCorrection) {
      return (
        <Layout>
          <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="flex items-center justify-between">
              <button 
                onClick={() => setShowCorrection(false)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold group"
              >
                <ArrowLeft size={20} className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform" />
                {t('back_to_results')}
              </button>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
                {t('correction_score', { score: result.score })}
              </span>
            </header>

            <div className="space-y-6">
              {quiz.questions.map((q, idx) => {
                const userAns = answers[q.id];
                const correctAns = q.correctAnswer;
                const isCorrect = userAns === correctAns;

                return (
                  <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                        {t('question_label', { index: idx + 1 })}
                      </span>
                      <span className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                        isCorrect ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                      }`}>
                        {isCorrect ? t('correct') : t('incorrect')}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-relaxed">
                      {q.frenchText}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option, optIdx) => {
                        const isUserSelected = userAns === option;
                        const isCorrectOption = correctAns === option;

                        let cardStyle = 'border-gray-100 bg-gray-50/20 text-gray-600';
                        let icon = null;

                        if (isUserSelected) {
                          if (isCorrectOption) {
                            cardStyle = 'border-green-600 bg-green-50 text-green-950';
                            icon = <CheckCircle2 className="text-green-600" size={18} />;
                          } else {
                            cardStyle = 'border-red-600 bg-red-50/50 text-red-950';
                            icon = <XCircle className="text-red-500" size={18} />;
                          }
                        } else if (isCorrectOption) {
                          cardStyle = 'border-green-500 border-dashed bg-green-50/20 text-green-950';
                          icon = <CheckCircle2 className="text-green-500 opacity-60" size={18} />;
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-5 rounded-2xl border-2 transition-all font-bold flex items-center justify-between ${cardStyle}`}
                          >
                            <div className="flex items-center gap-4">
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                                isUserSelected 
                                  ? (isCorrectOption ? 'bg-green-600 text-white' : 'bg-red-500 text-white')
                                  : (isCorrectOption ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500')
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-base leading-snug">{option}</span>
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
              className="w-full py-5 bg-gray-950 text-white rounded-[2rem] font-bold hover:bg-gray-800 transition-colors shadow-xl"
            >
              {t('back_to_results')}
            </button>
          </div>
        </Layout>
      );
    }

    const isSuccess = result.passed;
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white p-8 md:p-16 rounded-[3.5rem] shadow-2xl border border-gray-100 flex flex-col items-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-10 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-10 ${isSuccess ? 'bg-blue-500' : 'bg-orange-500'}`} />

            {isSuccess ? (
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="bg-green-50 p-6 rounded-full mb-6 border border-green-100 shadow-lg relative"
                >
                  <Trophy className="w-16 h-16 text-green-600" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 bg-yellow-400 p-1.5 rounded-full"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{t('congrats')}</h1>
                <p className="text-gray-500 text-lg mb-8 max-w-md">{t('congrats_desc')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="bg-red-50 p-6 rounded-full mb-6 border border-red-100 shadow-lg"
                >
                  <Award className="w-16 h-16 text-red-500" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{t('almost_there')}</h1>
                <p className="text-gray-500 text-lg mb-8 max-w-md">{t('almost_there_desc')}</p>
              </div>
            )}

            {/* Score Ring / Card */}
            <div className="w-full grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl text-center">
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">{t('your_score')}</p>
                <p className={`text-4xl font-black ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>{result.score}%</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl text-center">
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">{t('correct_count')}</p>
                <p className="text-4xl font-black text-gray-800">{result.correctCount}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl text-center">
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">{t('total_questions')}</p>
                <p className="text-4xl font-black text-gray-800">{result.totalQuestions}</p>
              </div>
            </div>

            {/* See Correction Button */}
            <button
              onClick={() => setShowCorrection(true)}
              className="w-full py-5 mb-6 rounded-[2rem] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 border border-indigo-100 shadow-sm"
            >
              <CheckCircle2 size={20} />
              {t('see_correction')}
            </button>

            {/* Action Buttons */}
            <div className="w-full flex flex-col md:flex-row gap-4">
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                <RotateCcw size={20} />
                {t('retake_quiz')}
              </button>
              
              <button
                onClick={() => {
                  if (domainId) {
                    navigate(`/dashboard/domains/${domainId}`);
                  } else {
                    navigate(-1);
                  }
                }}
                className="flex-1 flex items-center justify-center py-5 rounded-[2rem] font-bold text-white shadow-xl hover:opacity-90 transition-all active:scale-95"
                style={{ backgroundColor: isSuccess ? '#10B981' : '#3B82F6' }}
              >
                {isSuccess ? t('practice_phrases') : t('review_lesson')}
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-20 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Top bar with back button & overall progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold group"
          >
            <ArrowLeft size={20} className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform" />
            {t('quit')}
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-black text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl shadow-sm">
              {t('question_label', { index: currentIndex + 1 })} / {quiz.questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full mb-10 overflow-hidden border border-gray-200/50 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm"
          />
        </div>

        {/* Animated Question Container */}
        <div className="relative overflow-hidden min-h-[420px] mb-8">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white p-8 md:p-14 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">
                    {question.type === 'FILL_BLANK' ? t('fill_blank') : t('multiple_choice')}
                  </span>
                  
                  <button 
                    onClick={() => speak(question.frenchText)}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Volume2 size={20} className={speaking ? 'animate-pulse' : ''} />
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-relaxed tracking-tight mb-8">
                  {question.frenchText}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, idx) => {
                  const isSelected = answers[question.id] === option;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(question.id, option)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold flex items-center justify-between group relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-md shadow-indigo-100'
                          : 'border-gray-100 hover:border-gray-300 bg-gray-50/20 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4 z-10">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-base leading-snug">{option}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="bg-indigo-600 text-white p-1 rounded-full z-10 shadow-sm">
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
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-20 flex items-center gap-1 group"
          >
            <ChevronLeft size={20} className="group-hover:ltr:-translate-x-0.5 group-hover:rtl:translate-x-0.5 rtl:rotate-180 transition-transform" />
            {t('previous')}
          </button>

          {currentIndex < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="px-10 py-5 rounded-[2rem] font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              {t('next')}
              <ChevronRight size={20} className="rtl:rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-10 py-5 rounded-[2rem] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              {submitting ? t('calculating_score') : t('submit_answers')}
              <CheckCircle2 size={20} />
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
