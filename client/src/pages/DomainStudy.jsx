import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';
import { 
  Volume2, ChevronLeft, ChevronRight, 
  Info, Award, CheckCircle, RotateCcw, 
  Music, BookOpen, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLevelStyle } from '../utils/constants';

const DomainStudy = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const [phrases, setPhrases] = useState([]);
  const [domainInfo, setDomainInfo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showVocab, setShowVocab] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phrasesRes, domainRes] = await Promise.all([
          api.get(`/learning/domains/${domainId}/phrases`),
          api.get(`/student/domains/${domainId}/details`)
        ]);
        setPhrases(phrasesRes.data);
        setDomainInfo(domainRes.data);
        
        // Resume from last index if provided
        if (domainRes.data.lastIndex !== undefined) {
          setCurrentIndex(domainRes.data.lastIndex);
        }
        
        // Mark current phrase as seen if exists
        if (phrasesRes.data.length > 0) {
          const initialIndex = domainRes.data.lastIndex || 0;
          markAsComplete(phrasesRes.data[initialIndex].id);
        }
      } catch (err) {
        console.error('Failed to fetch study data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [domainId]);

  const markAsComplete = async (phraseId) => {
    try {
      await api.post(`/student/phrases/${phraseId}/complete`);
    } catch (err) {
      console.error('Failed to mark phrase as complete', err);
    }
  };

  const speak = useCallback((text, rate = 1) => {
    if (speaking) window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = rate;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [speaking]);

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setShowVocab(false);
      markAsComplete(phrases[nextIndex].id);
    } else {
      navigate(`/dashboard/domains/${domainId}/quiz`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowVocab(false);
    }
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
          <p className="font-black text-blue-600 uppercase tracking-widest text-xs">{t('lesson_prep')}</p>
        </motion.div>
      </div>
    );
  }

  if (phrases.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="text-gray-300" size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{t('no_content_yet')}</h2>
          <p className="text-gray-500 mb-8 max-w-sm">{t('domain_no_content_desc')}</p>
          <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold">
            {t('back')}
          </button>
        </div>
      </Layout>
    );
  }

  const currentPhrase = phrases[currentIndex];
  const levelStyle = getLevelStyle(domainInfo?.levelName);
  const themeColor = domainInfo?.levelColor || levelStyle.primary;
  const progress = ((currentIndex + 1) / phrases.length) * 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold group"
          >
            <ChevronLeft size={20} className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform" />
            {t('quit')}
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
              <Layers size={16} style={{ color: themeColor }} />
              {domainInfo?.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {currentIndex + 1} {t('out_of')} {phrases.length}
              </span>
            </div>
          </div>

          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className="h-full"
               style={{ backgroundColor: themeColor }}
             />
          </div>
        </div>

        {/* Main Learning Card */}
        <div className="relative min-h-[500px] flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="w-full bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-12 md:p-20 flex flex-col items-center text-center space-y-12"
            >
              {/* French Phrase */}
              <div className="space-y-8 w-full">
                <motion.h1 
                  className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight"
                >
                  {currentPhrase.frenchText}
                </motion.h1>

                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => speak(currentPhrase.frenchText)}
                    className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all group"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Volume2 size={32} className={speaking ? 'animate-pulse' : ''} />
                  </button>
                  <button 
                    onClick={() => speak(currentPhrase.frenchText, 0.6)}
                    className="px-6 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Music size={16} />
                    {t('slowly')}
                  </button>
                </div>
              </div>

              {/* Arabic Translation */}
              <div className="w-full pt-12 border-t border-gray-50">
                <p 
                  className="text-2xl md:text-3xl font-bold text-gray-500 italic opacity-80"
                  dir="rtl"
                >
                  {currentPhrase.arabicTranslation}
                </p>
              </div>

              {/* Vocabulary Button */}
              <button 
                onClick={() => setShowVocab(!showVocab)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors"
              >
                <Info size={16} />
                {showVocab ? t('hide_vocab') : t('show_vocab')}
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Vocabulary Slide-over/Dropdown */}
          <AnimatePresence>
            {showVocab && currentPhrase.vocabularyList && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {currentPhrase.vocabularyList.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => speak(v.frenchWord)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"
                      >
                        <Volume2 size={16} />
                      </button>
                      <span className="text-lg font-black text-gray-900">{v.frenchWord}</span>
                    </div>
                    <span className="text-gray-400 font-bold italic" dir="rtl">{v.arabicMeaning}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center gap-6 pt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 py-5 rounded-[2rem] bg-white border border-gray-100 text-gray-400 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} className="rtl:rotate-180" />
            {t('previous')}
          </button>

          <button
            onClick={handleNext}
            className="flex-[2] py-5 rounded-[2rem] text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 group"
            style={{ backgroundColor: themeColor }}
          >
            {currentIndex < phrases.length - 1 ? (
              <>
                {t('next')}
                <ChevronRight size={24} className="group-hover:ltr:translate-x-1 group-hover:rtl:-translate-x-1 rtl:rotate-180 transition-transform" />
              </>
            ) : (
              <>
                {t('finish_and_quiz')}
                <Award size={24} className="group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DomainStudy;
