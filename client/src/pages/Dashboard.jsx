import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import Layout from '../components/Layout';
import { ChevronRight, BookOpen, Flame, Trophy, Target, LayoutGrid, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getLevelStyle } from '../utils/constants';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName') || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, statsRes] = await Promise.all([
          api.get('/learning/levels'),
          api.get('/student/stats')
        ]);
        setLevels(levelsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <motion.div 
        dir={isRtl ? 'rtl' : 'ltr'}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-12 pb-20"
      >
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('welcome_back')}, <span className="text-blue-600">{userName}</span>!
            </h1>
            <p className="text-gray-500 mt-2 text-lg">{t('choose_level_desc')}</p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="bg-orange-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-orange-100 shadow-sm">
              <Flame className="text-orange-500" size={20} />
              <div>
                <p className="text-[10px] uppercase font-black text-orange-600 leading-none mb-1">{t('streak')}</p>
                <p className="text-lg font-bold text-orange-900 leading-none">{stats?.currentStreak || 0} {t('days')}</p>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-blue-100 shadow-sm">
              <Trophy className="text-blue-600" size={20} />
              <div>
                <p className="text-[10px] uppercase font-black text-blue-600 leading-none mb-1">{t('xp')}</p>
                <p className="text-lg font-bold text-blue-900 leading-none">{stats?.totalPoints || 0}</p>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Prominent Emma Chat Integration Banner */}
        <motion.div variants={itemVariants}>
          <Link
            to="/dashboard/chat"
            className="block p-8 md:p-10 rounded-[3rem] bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/20 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
          >
            {/* Background design accents */}
            <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
            <div className="absolute -bottom-10 ltr:left-1/3 rtl:right-1/3 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                  <Sparkles size={12} className="animate-pulse" />
                  Nouveau Module IA
                </span>
                
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {t('emma_banner_title')}
                </h3>
                
                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
                  {t('emma_banner_desc')}
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="px-6 py-4 bg-indigo-600 group-hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/10 flex items-center gap-2 group-hover:scale-105 transition-all">
                  <MessageSquare size={16} />
                  {t('emma_banner_btn')}
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
            {/* Background design accents */}
            <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
            <div className="absolute -bottom-10 ltr:left-1/3 rtl:right-1/3 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full">
                  <Sparkles size={14} className="animate-pulse" />
                  Pour Débutants Absolu
                </span>
                
                <h3 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                  <span className="text-5xl">🌟</span>
                  Niveau Pré-A1
                </h3>
                
                <p className="text-pink-100 text-lg font-medium leading-relaxed">
                  Commencez votre voyage français avec des cartes mémoire ludiques et des jeux interactifs.
                  Parfait pour les tout débutants!
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="px-8 py-4 bg-white text-pink-600 font-black text-lg rounded-2xl shadow-xl flex items-center gap-3 group-hover:scale-105 transition-all">
                  Commencer l'apprentissage
                  <ChevronRight size={24} className="rtl:rotate-180" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Level Selection Grid */}
        <section className="space-y-8">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <LayoutGrid className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t('explore_cefr')}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {levels.map((level) => {
              const style = getLevelStyle(level.name);
              const dbColor = level.color;
              
              return (
                <motion.div key={level.id} variants={itemVariants} whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={`/dashboard/levels/${level.id}`}
                    className={`block p-8 rounded-[2.5rem] border-2 ${style.bg} shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}
                    style={{ borderColor: dbColor ? `${dbColor}20` : undefined }}
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
                        {t('level')} {level.name}
                      </h3>
                      <p className="text-gray-600 font-medium mb-6">{t('level_card_desc')}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span>{t('progress')}</span>
                          <span>{Math.round(stats?.levelProgress?.[level.id] || 0)}%</span>
                        </div>
                        <div className="h-3 bg-white/50 rounded-full overflow-hidden border border-white/20">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.levelProgress?.[level.id] || 0}%` }}
                            className="h-full"
                            style={{ backgroundColor: dbColor || style.primary }}
                          />
                        </div>
                      </div>
                    </div>

                    <ChevronRight 
                      className="absolute bottom-8 ltr:right-8 rtl:left-8 opacity-20 group-hover:opacity-100 ltr:group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180 transition-all" 
                      size={32} 
                      style={{ color: dbColor || style.primary }}
                    />
                    
                    {/* Background Pattern */}
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
