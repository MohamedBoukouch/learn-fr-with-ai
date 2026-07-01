import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Star, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSpeech } from '../hooks/useSpeech';

const PreA1Flashcard = ({ phrases, onComplete }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { speak, stop, isSpeaking } = useSpeech('fr-FR');

  const speechId = `pre-a1-${currentIndex}`;

  useEffect(() => {
    stop();
  }, [currentIndex, stop]);

  const handleNext = () => {
    stop();
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      onComplete && onComplete();
    }
  };

  const handlePrevious = () => {
    stop();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const currentItem = phrases[currentIndex];
  const progress = ((currentIndex + 1) / phrases.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:p-6 space-y-4 sm:space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
          <span>{t('pre_a1_title')}</span>
          <span>{currentIndex + 1} / {phrases.length}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-pink-500 rounded-full"
          />
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className="relative h-[280px] sm:h-[380px] cursor-pointer perspective-1000"
        onClick={() => setFlipped(!flipped)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${flipped}`}
            initial={{ rotateY: flipped ? -180 : 0, opacity: 0, scale: 0.95 }}
            animate={{ rotateY: flipped ? 180 : 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: flipped ? -180 : 180, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front - French with Visual */}
            <div 
              className={`absolute inset-0 bg-white rounded-[3rem] border-4 border-pink-200 flex flex-col items-center justify-center p-10 shadow-2xl ${flipped ? 'invisible' : ''}`}
              style={{ backfaceVisibility: "hidden" }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-pink-600 mb-4 sm:mb-6"
              >
                {currentItem.french}
              </motion.div>
              
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                <Star className="text-yellow-400" size={20} sm:size={28} />
                {t('pre_a1_tap_reveal')}
              </div>

              <button
              onClick={(e) => { e.stopPropagation(); speak(currentItem.french, { id: speechId, rate: 0.8 }); }}
              aria-label={isSpeaking(speechId) ? t('stop_audio') : t('speak')}
              className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform ${
                isSpeaking(speechId) ? 'bg-red-500 ring-4 ring-red-200' : 'bg-pink-500'
              }`}
            >
              {isSpeaking(speechId) ? (
                <VolumeX size={28} sm:size={36} className="animate-pulse" />
              ) : (
                <Volume2 size={28} sm:size={36} />
              )}
            </button>
            <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mt-3">
              {isSpeaking(speechId) ? t('stop_audio') : t('speak')}
            </p>
            </div>

            {/* Back - Translation */}
<div 
        className={`absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100 rounded-[3rem] border-4 border-pink-200 flex flex-col items-center justify-center p-8 sm:p-10 shadow-2xl ${!flipped ? 'invisible' : ''}`}
              style={{ 
                backfaceVisibility: "hidden", 
                transform: "rotateY(180deg)" 
              }}
            >
              <p className="text-4xl font-bold text-pink-900 mb-4" dir="rtl">
                {currentItem.arabic}
              </p>
              <p className="text-xl text-gray-500 font-medium">
                {currentItem.french}
              </p>
              
              <div className="flex gap-3 mt-8">
                <Heart className="text-red-400" size={24} />
                <span className="text-pink-700 font-bold">{t('pre_a1_excellent')}</span>
                <Zap className="text-yellow-400" size={24} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-400 font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} className={`inline -mb-1 ${isRtl ? 'ml-2 rtl:rotate-180' : 'mr-2'}`} />
          {t('previous')}
        </button>

        {currentIndex < phrases.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex-[2] py-4 rounded-2xl bg-pink-500 text-white font-bold uppercase tracking-widest hover:bg-pink-600 shadow-lg active:scale-95 transition-all"
          >
            {t('next')}
            <ChevronRight size={24} className={`inline -mb-1 ${isRtl ? 'mr-2 rtl:rotate-180' : 'ml-2'}`} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-[2] py-4 rounded-2xl bg-green-500 text-white font-bold uppercase tracking-widest hover:bg-green-600 shadow-lg active:scale-95 transition-all"
          >
            <Star size={24} className="inline mr-2 -mb-1" />
            {t('finish_and_quiz')}
          </button>
        )}
      </div>
    </div>
    );
};

export default PreA1Flashcard;