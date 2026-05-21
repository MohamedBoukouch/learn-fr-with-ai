import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import Layout from '../components/Layout';
import { ChevronRight, BookOpen, Flame, Trophy, Target, LayoutGrid } from 'lucide-react';
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
            <p className="text-gray-500 mt-2 text-lg">Choisissez votre niveau et commencez à apprendre.</p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="bg-orange-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-orange-100 shadow-sm">
              <Flame className="text-orange-500" size={20} />
              <div>
                <p className="text-[10px] uppercase font-black text-orange-600 leading-none mb-1">{t('streak')}</p>
                <p className="text-lg font-bold text-orange-900 leading-none">{stats?.currentStreak || 0} Jours</p>
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

        {/* Level Selection Grid */}
        <section className="space-y-8">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <LayoutGrid className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Explorez les Niveaux CEFR</h2>
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
                        Niveau {level.name}
                      </h3>
                      <p className="text-gray-600 font-medium mb-6">Découvrez les domaines et quizzes pour ce niveau.</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span>Progression</span>
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
                      className="absolute bottom-8 right-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" 
                      size={32} 
                      style={{ color: dbColor || style.primary }}
                    />
                    
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
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
