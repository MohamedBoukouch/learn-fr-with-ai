import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Search, ArrowLeft, Layers } from 'lucide-react';
import { getLevelStyle } from '../utils/constants';

const LearnPhrases = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get('/learning/levels');
        setLevels(response.data);
      } catch (err) {
        console.error('Failed to fetch levels', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    setSearchTerm('');
    setDomainsLoading(true);
    try {
      const res = await api.get(`/learning/levels/${level.id}/domains`);
      setDomains(res.data);
    } catch (err) {
      console.error('Failed to fetch domains', err);
    } finally {
      setDomainsLoading(false);
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="space-y-4">
          <button
            onClick={() => {
              if (selectedLevel) {
                setSelectedLevel(null);
                setDomains([]);
              } else {
                navigate('/dashboard');
              }
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold group"
          >
            <ArrowLeft size={20} className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform" />
            {selectedLevel ? t('levels') : t('back_to_dashboard')}
          </button>

          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <BookOpen className="text-blue-600" />
              {selectedLevel ? `${t('level')} ${selectedLevel.name}` : t('learn_phrases')}
            </h1>
            <p className="text-gray-500 text-lg mt-2">
              {selectedLevel ? t('tab_learn') : t('learn_phrases_desc')}
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedLevel ? (
            <motion.div
              key="levels"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {levels.map((level) => {
                const style = getLevelStyle(level.name);
                const dbColor = level.color;

                return (
                  <motion.div key={level.id} variants={itemVariants} whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}>
                    <div
                      onClick={() => handleLevelSelect(level)}
                      className={`block p-8 rounded-[2.5rem] border-2 ${style.bg} shadow-sm hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer`}
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

                        <div className="flex items-center gap-2 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: dbColor || style.primary }}>
                          <Layers size={16} />
                          {t('tab_learn')}
                        </div>
                      </div>

                      <ChevronRight
                        className="absolute bottom-8 ltr:right-8 rtl:left-8 opacity-20 group-hover:opacity-100 ltr:group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180 transition-all"
                        size={32}
                        style={{ color: dbColor || style.primary }}
                      />

                      <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-10 rtl:-ml-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="domains"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {domainsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="relative max-w-md">
                    <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder={t('search_domain')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>

                  {domains.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <div className="p-12 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
                      <p className="text-gray-400 font-bold">{t('no_domains_available')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {domains
                        .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((domain) => (
                          <motion.div key={domain.id} variants={itemVariants} whileHover={{ y: -5 }}>
                            <div
                              onClick={() => navigate(`/dashboard/domains/${domain.id}`)}
                              className="block bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all overflow-hidden group cursor-pointer"
                            >
                              <div className="h-48 relative overflow-hidden">
                                {domain.imageUrl ? (
                                  <img
                                    src={`${api.defaults.baseURL.replace('/api', '')}${domain.imageUrl}`}
                                    alt={domain.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                    <BookOpen className="text-gray-200" size={48} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                  <h3 className="text-white text-xl font-bold">{domain.name}</h3>
                                </div>
                              </div>
                              <div className="p-6">
                                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                                  {t('learn')}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default LearnPhrases;
