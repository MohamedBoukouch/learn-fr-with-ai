import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import PreA1Flashcard from '../components/PreA1Flashcard';
import MatchingGame from '../components/MatchingGame';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { PRE_A1_DOMAINS, PRE_A1_QUIZ_QUESTIONS } from '../content/pre-a1-content';

const PreA1Learning = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';
  
  const [activeDomain, setActiveDomain] = useState('alphabet');
  const [mode, setMode] = useState('flashcard'); // flashcard or match
  const [completedDomains, setCompletedDomains] = useState([]);

  const domain = PRE_A1_DOMAINS.find(d => d.id === activeDomain);
  
  const handleComplete = () => {
    setCompletedDomains([...completedDomains, activeDomain]);
    const nextDomain = PRE_A1_DOMAINS.find((d, i) => !completedDomains.includes(d.id));
    if (nextDomain) {
      setActiveDomain(nextDomain.id);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSwitchMode = () => {
    setMode(mode === 'flashcard' ? 'match' : 'flashcard');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={24} className={isRtl ? 'rotate-180' : ''} />
              </button>
              <div>
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <span className="text-5xl">🌟</span>
                  {t('pre_a1_title')}
                </h1>
                <p className="text-gray-500 mt-2 text-lg">{t('pre_a1_subtitle')}</p>
              </div>
            </div>

            {/* Domain Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
              {PRE_A1_DOMAINS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setActiveDomain(d.id); setMode('flashcard'); }}
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    activeDomain === d.id
                      ? 'bg-pink-500 text-white shadow-lg'
                      : completedDomains.includes(d.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="hidden sm:inline">{t(d.nameKey)}</span>
                </button>
              ))}
            </div>
          </header>

          {/* Mode Toggle */}
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-2xl shadow border border-gray-100 flex gap-1">
              <button
                onClick={() => setMode('flashcard')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  mode === 'flashcard' 
                    ? 'bg-pink-500 text-white shadow-lg' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t('pre_a1_flashcards')}
              </button>
              <button
                onClick={() => setMode('match')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  mode === 'match' 
                    ? 'bg-pink-500 text-white shadow-lg' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t('pre_a1_match')}
              </button>
            </div>
          </div>

          {/* Learning Area */}
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeDomain}-${mode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {mode === 'flashcard' ? (
                  <PreA1Flashcard 
                    phrases={domain.phrases} 
                    onComplete={handleComplete}
                  />
                ) : (
                  <MatchingGame 
                    pairs={domain.phrases} 
                    onComplete={handleComplete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PreA1Learning;