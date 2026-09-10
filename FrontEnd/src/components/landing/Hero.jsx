import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Star, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLandingTheme } from './useLandingTheme';

const Hero = () => {
  const { t } = useTranslation();
  const { isLight } = useLandingTheme();
  const shellClasses = isLight ? 'relative min-h-screen flex items-center bg-slate-50 overflow-hidden' : 'relative min-h-screen flex items-center bg-black overflow-hidden';
  const badgeClasses = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';
  const badgeText = isLight ? 'text-slate-700' : 'text-gray-300';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subtitleText = isLight ? 'text-slate-600' : 'text-gray-400';
  const cardClasses = isLight ? 'bg-slate-100/80' : 'bg-white/[0.02]';
  const statText = isLight ? 'text-slate-600' : 'text-gray-500';
  const buttonSecondaryClasses = isLight
    ? 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
    : 'bg-white/5 text-white border-white/10 hover:bg-white/10';

  return (
    <section className={shellClasses}>
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.3),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 ${badgeClasses}`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className={`text-sm ${badgeText}`}>{t('landing_badge')}</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1] ${headingText}`}
          >
            {t('landing_title')}
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {t('landing_title_highlight')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg mb-10 max-w-2xl mx-auto leading-relaxed ${subtitleText}`}
          >
            {t('landing_subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-20"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors"
            >
              {t('landing_cta_primary')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold border transition-colors ${buttonSecondaryClasses}`}
            >
              {t('landing_cta_secondary')}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/5'}`}
          >
            {[
              { value: '6', label: t('landing_stat_levels'), icon: <Zap className="w-4 h-4" /> },
              { value: '6,000+', label: t('landing_stat_phrases'), icon: <Star className="w-4 h-4" /> },
              { value: '500+', label: t('landing_stat_quizzes'), icon: <Shield className="w-4 h-4" /> },
              { value: '4.9', label: t('landing_stat_ai'), icon: <Sparkles className="w-4 h-4" /> },
            ].map((stat, index) => (
              <div key={index} className={`p-6 ${cardClasses}`}>
                <div className="flex items-center justify-center gap-2 text-violet-400 mb-2">
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold mb-1 ${headingText}`}>{stat.value}</div>
                <div className={`text-xs ${statText}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${isLight ? 'from-slate-50 to-transparent' : 'from-black to-transparent'}`} />
    </section>
  );
};

export default Hero;