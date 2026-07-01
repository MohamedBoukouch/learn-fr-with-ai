import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Layers,
  Trophy,
  CirclePlay,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import api from "../api";
import Layout from "../components/Layout";
import { getLevelStyle } from "../utils/constants";

const Quizzes = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { levelId } = useParams();
  const isRtl = i18n.language === "ar";

  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get("/learning/levels");
        setLevels(response.data);
      } catch (err) {
        console.error("Failed to fetch quiz levels", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  useEffect(() => {
    if (!levelId) {
      setSelectedLevel(null);
      setLevelData(null);
      return;
    }

    const selected = levels.find((item) => String(item.id) === String(levelId));
    if (!selected) {
      setSelectedLevel(null);
      setLevelData(null);
      return;
    }

    setSelectedLevel(selected);
    setDetailsLoading(true);

    api
      .get(`/student/levels/${selected.id}/details`)
      .then((response) => setLevelData(response.data))
      .catch((err) => {
        console.error("Failed to fetch level quizzes", err);
        setLevelData(null);
      })
      .finally(() => setDetailsLoading(false));
  }, [levelId, levels]);

  const handleLevelSelect = (level) => {
    navigate(`/dashboard/quizzes/levels/${level.id}`);
  };

  const handleBack = () => {
    if (levelId) {
      navigate("/dashboard/quizzes");
      return;
    }

    navigate("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getQuizStatus = (quiz) => {
    if (quiz.passed) {
      return {
        label: t("quiz_passed"),
        icon: CheckCircle2,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconWrapClass: "bg-emerald-100 text-emerald-700",
        ctaClass: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200",
      };
    }

    if (quiz.completed) {
      return {
        label: t("quiz_completed"),
        icon: Trophy,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        iconWrapClass: "bg-amber-100 text-amber-700",
        ctaClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-200",
      };
    }

    return {
      label: t("quiz_ready"),
      icon: Clock3,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      iconWrapClass: "bg-blue-100 text-blue-700",
      ctaClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-200",
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="max-w-6xl mx-auto space-y-10 pb-20"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <header className="space-y-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform"
            />
            {selectedLevel ? t("quizzes_levels") : t("back_to_dashboard")}
          </button>

          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <HelpCircle className="text-blue-600" />
              {selectedLevel
                ? `${t("quiz")} - ${t("level")} ${selectedLevel.name}`
                : t("quizzes")}
            </h1>
            <p className="text-gray-500 text-lg mt-2">
              {selectedLevel ? t("quizzes_list_desc") : t("quizzes_desc")}
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedLevel ? (
            <motion.div
              key="quiz-levels"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {levels.map((level) => {
                const style = getLevelStyle(level.name);
                const dbColor = level.color;

                return (
                  <motion.div
                    key={level.id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleLevelSelect(level)}
                      className={`w-full text-left p-8 rounded-[2.5rem] border-2 ${style.bg} shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}
                      style={{
                        borderColor: dbColor ? `${dbColor}20` : undefined,
                      }}
                    >
                      <div className="relative z-10">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6 shadow-lg"
                          style={{ backgroundColor: dbColor || style.primary }}
                        >
                          {level.name}
                        </div>
                        <h3
                          className="text-2xl font-black mb-2"
                          style={{ color: dbColor || style.primary }}
                        >
                          {t("level")} {level.name}
                        </h3>
                        <p className="text-gray-600 font-medium mb-6">
                          {t("quizzes_level_card_desc")}
                        </p>

                        <div
                          className="flex items-center gap-2 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ color: dbColor || style.primary }}
                        >
                          <Layers size={16} />
                          {t("view_quizzes")}
                        </div>
                      </div>

                      <ChevronRight
                        className="absolute bottom-8 ltr:right-8 rtl:left-8 opacity-20 group-hover:opacity-100 ltr:group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180 transition-all"
                        size={32}
                        style={{ color: dbColor || style.primary }}
                      />

                      <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="level-quizzes"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-8"
            >
              {detailsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : levelData?.quizzes?.length ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {levelData.quizzes.map((quiz, index) => {
                    const status = getQuizStatus(quiz);
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/70 transition-all duration-300"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
                        <div className="absolute -top-16 ltr:right-0 rtl:left-0 w-40 h-40 bg-blue-50/70 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition-opacity" />

                        <div className="relative p-7 md:p-8 space-y-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${status.iconWrapClass}`}
                              >
                                <HelpCircle size={30} />
                              </div>

                              <div className="min-w-0 flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${status.badgeClass}`}
                                  >
                                    <StatusIcon size={14} />
                                    {status.label}
                                  </span>
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider">
                                    {t("quiz")} #{index + 1}
                                  </span>
                                </div>

                                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug break-words whitespace-normal">
                                  {quiz.title}
                                </h3>

                                <p className="text-sm md:text-base text-slate-500 leading-relaxed break-words whitespace-normal">
                                  {t("quiz_description_fallback", {
                                    level: selectedLevel.name,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                {t("quiz_status")}
                              </p>
                              <p className="text-sm font-bold text-slate-800">
                                {status.label}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                {t("quiz_result")}
                              </p>
                              <p className="text-sm font-bold text-slate-800 break-words whitespace-normal">
                                {quiz.completed
                                  ? t("last_score", { score: quiz.lastScore })
                                  : t("end_level_eval")}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                              <CirclePlay size={18} className="text-blue-600" />
                              <span>{t("quiz_ready_hint")}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/dashboard/quizzes/${quiz.id}`, {
                                  state: { fromLevelId: selectedLevel?.id ?? null },
                                })
                              }
                              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-2xl font-black transition-all shadow-lg focus:outline-none focus:ring-4 ${status.ctaClass}`}
                            >
                              <CirclePlay size={18} />
                              {quiz.completed
                                ? t("retake_quiz")
                                : t("start_quiz")}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-bold">
                    {t("no_quiz_available")}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Quizzes;
