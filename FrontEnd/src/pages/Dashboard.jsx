import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import {
  ChevronRight,
  BookOpen,
  Flame,
  Trophy,
  Target,
  LayoutGrid,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  Activity,
  Award,
  Zap,
  BarChart3,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getLevelStyle } from "../utils/constants";

const StatCard = ({ label, value, icon: Icon, trend, color, subtitle }) => (
  <motion.div
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    }}
    className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-${color}-50`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      {trend && (
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            trend > 0
              ? "text-green-600"
              : trend < 0
                ? "text-red-600"
                : "text-gray-400"
          }`}
        >
          {trend > 0 ? (
            <ArrowUp size={12} />
          ) : trend < 0 ? (
            <ArrowDown size={12} />
          ) : null}
          {trend !== 0 ? `${Math.abs(trend)}%` : ""}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </motion.div>
);

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem("userName") || "Student";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, statsRes, userStatsRes] = await Promise.all([
          api.get("/learning/levels"),
          api.get("/student/stats"),
          api.get("/student/stats/detailed"), // New endpoint for detailed personal stats
        ]);
        setLevels(levelsRes.data);
        setStats(statsRes.data);
        setUserStats(userStatsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Calculate trends (mock - you'd get these from backend)
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <Layout>
      <motion.div
        dir={isRtl ? "rtl" : "ltr"}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-12 pb-20"
      >
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t("welcome_back")},{" "}
              <span className="text-blue-600">{userName}</span>!
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {t("choose_level_desc")}
            </p>
          </motion.div>
        </header>

        {/* Prominent Emma Chat Integration Banner */}
        <motion.div variants={itemVariants}>
          <Link
            to="/dashboard/chat"
            className="block p-8 md:p-10 rounded-[3rem] bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/20 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
          >
            <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
            <div className="absolute -bottom-10 ltr:left-1/3 rtl:right-1/3 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                  <Sparkles size={12} className="animate-pulse" />
                  {t("new_ai_module")}
                </span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {t("emma_banner_title")}
                </h3>
                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
                  {t("emma_banner_desc")}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="px-6 py-4 bg-indigo-600 group-hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/10 flex items-center gap-2 group-hover:scale-105 transition-all">
                  <MessageSquare size={16} />
                  {t("emma_banner_btn")}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Pre-A1 Spotlight Banner */}
        <motion.div variants={itemVariants}>
          <Link
            to="/dashboard/pre-a1"
            className="block p-8 md:p-10 rounded-[3rem] bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-pink-500/20 transition-all"
          >
            <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
            <div className="absolute -bottom-10 ltr:left-1/3 rtl:right-1/3 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full">
                  <Sparkles size={14} className="animate-pulse" />
                  {t("absolute_beginners")}
                </span>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                  <span className="text-5xl">🌟</span>
                  {t("pre_a1_level_label")}
                </h3>
                <p className="text-pink-100 text-lg font-medium leading-relaxed">
                  {t("pre_a1_banner_desc")}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="px-8 py-4 bg-white text-pink-600 font-black text-lg rounded-2xl shadow-xl flex items-center gap-3 group-hover:scale-105 transition-all">
                  {t("start_learning")}
                  <ChevronRight size={24} className="rtl:rotate-180" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Personal Statistics Section */}
        {userStats && (
          <section className="space-y-8">
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <BarChart3 className="text-purple-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">
                {t("my_statistics")} 
              </h2>
            </motion.div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label={t("phrases_learned")}
                value={userStats.totalPhrasesLearned || 0}
                icon={BookOpen}
                color="blue"
                subtitle={t("total")}
              />
              <StatCard
                label={t("completed_quizzes")}
                value={userStats.totalQuizzesCompleted || 0}
                icon={Award}
                color="purple"
                subtitle={t("success_rate", {
                  rate: userStats.quizPassRate || 0,
                })}
              />
              <StatCard
                label={t("average_score")}
                value={`${userStats.averageQuizScore || 0}%`}
                icon={Target}
                color="green"
                trend={calculateTrend(
                  userStats.averageQuizScore,
                  userStats.previousAverageScore,
                )}
              />
              <StatCard
                label={t("active_days")}
                value={userStats.activeDays || 0}
                icon={Zap}
                color="orange"
                subtitle={t("this_month")}
              />
            </div>

            {/* Weekly vs Monthly Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last 7 Days */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="text-blue-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("last_7_days")}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Award className="text-blue-600" size={18} />
                      <span className="text-sm font-medium text-gray-700">
                        {t("completed_quizzes")}
                      </span>
                    </div>
                    <span className="font-bold text-blue-900">
                      {userStats.last7Days?.quizzesCompleted || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-gray-700">
                        {t("phrases_learned")}
                      </span>
                    </div>
                    <span className="font-bold text-green-900">
                      {userStats.last7Days?.phrasesLearned || 0}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Activity className="text-purple-600" size={18} />
                      <span className="text-sm font-medium text-gray-700">Minutes d'étude</span>
                    </div>
                    <span className="font-bold text-purple-900">{userStats.last7Days?.studyMinutes || 0} min</span>
                  </div> */}
                </div>
              </motion.div>

              {/* Last 30 Days */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("last_30_days")}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Award className="text-indigo-600" size={18} />
                      <span className="text-sm font-medium text-gray-700">
                        {t("completed_quizzes")}
                      </span>
                    </div>
                    <span className="font-bold text-indigo-900">
                      {userStats.last30Days?.quizzesCompleted || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-teal-600" size={18} />
                      <span className="text-sm font-medium text-gray-700">
                        {t("phrases_learned")}
                      </span>
                    </div>
                    <span className="font-bold text-teal-900">
                      {userStats.last30Days?.phrasesLearned || 0}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center p-3 bg-pink-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Activity className="text-pink-600" size={18} />
                      <span className="text-sm font-medium text-gray-700">Minutes d'étude</span>
                    </div>
                    <span className="font-bold text-pink-900">{userStats.last30Days?.studyMinutes || 0} min</span>
                  </div> */}
                </div>
              </motion.div>
            </div>

            {/* Level Progress Breakdown */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-emerald-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">
                  {t("progress_by_level")}
                </h3>
              </div>
              {userStats.levelProgress &&
              Object.keys(userStats.levelProgress).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(userStats.levelProgress).map(
                    ([levelName, progress]) => (
                      <div
                        key={levelName}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {levelName}
                          </h4>
                          <span className="text-sm font-bold text-blue-600">
                            {progress.percentage || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${progress.percentage || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {t("phrases_count_short", {
                              count: progress.phrasesLearned || 0,
                            })}
                          </span>
                          <span>
                            {t("passed_quizzes_count", {
                              count: progress.quizzesPassed || 0,
                            })}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  {t("start_learning_to_see_progress")}
                </p>
              )}
            </motion.div>

            {/* Learning Insights */}
            {userStats.insights && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-amber-600" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("personal_overview")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("best_quiz_score")}
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      {userStats.insights.bestQuizScore || 0}%
                    </p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("longest_streak")}
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      {t("days_count", {
                        count: userStats.insights.longestStreak || 0,
                      })}
                    </p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("learning_pace")}
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      {userStats.insights.phrasesPerDay || 0}{" "}
                      <span className="text-sm font-normal">
                        {t("per_day")}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* Level Selection Grid */}
        <section className="space-y-8">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <LayoutGrid className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {t("explore_cefr")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Link
                    to={`/dashboard/levels/${level.id}`}
                    className={`block p-8 rounded-[2.5rem] border-2 ${style.bg} shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}
                    style={{
                      borderColor: dbColor ? `${dbColor}20` : undefined,
                    }}
                  >
                    <div className="relative z-10">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6 shadow-lg`}
                        style={{ backgroundColor: dbColor || style.primary }}
                      >
                        {level.name}
                      </div>
                      <h3
                        className={`text-2xl font-black mb-2`}
                        style={{ color: dbColor || style.primary }}
                      >
                        {t("level")} {level.name}
                      </h3>
                      <p className="text-gray-600 font-medium mb-6">
                        {t("level_card_desc")}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span>{t("progress")}</span>
                          <span>
                            {Math.round(stats?.levelProgress?.[level.id] || 0)}%
                          </span>
                        </div>
                        <div className="h-3 bg-white/50 rounded-full overflow-hidden border border-white/20">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${stats?.levelProgress?.[level.id] || 0}%`,
                            }}
                            className="h-full"
                            style={{
                              backgroundColor: dbColor || style.primary,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className="absolute bottom-8 ltr:right-8 rtl:left-8 opacity-20 group-hover:opacity-100 ltr:group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180 transition-all"
                      size={32}
                      style={{ color: dbColor || style.primary }}
                    />

                    <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
