import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLandingTheme } from './useLandingTheme';

const Levels = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { isLight } = useLandingTheme();

  const levels = [
    {
      level: 'A1',
      title: t('landing_levels_a1_title'),
      description: t('landing_levels_a1_desc'),
      gradient: 'from-sky-500 to-blue-500',
      accent: 'text-sky-400',
      border: 'border-sky-500/20',
      bg: 'bg-sky-500/10'
    },
    {
      level: 'A2',
      title: t('landing_levels_a2_title'),
      description: t('landing_levels_a2_desc'),
      gradient: 'from-emerald-500 to-green-500',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/10'
    },
    {
      level: 'B1',
      title: t('landing_levels_b1_title'),
      description: t('landing_levels_b1_desc'),
      gradient: 'from-amber-500 to-orange-500',
      accent: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/10'
    },
    {
      level: 'B2',
      title: t('landing_levels_b2_title'),
      description: t('landing_levels_b2_desc'),
      gradient: 'from-rose-500 to-red-500',
      accent: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/10'
    },
    {
      level: 'C1',
      title: t('landing_levels_c1_title'),
      description: t('landing_levels_c1_desc'),
      gradient: 'from-violet-500 to-purple-500',
      accent: 'text-violet-400',
      border: 'border-violet-500/20',
      bg: 'bg-violet-500/10'
    },
    {
      level: 'C2',
      title: t('landing_levels_c2_title'),
      description: t('landing_levels_c2_desc'),
      gradient: 'from-slate-500 to-zinc-500',
      accent: 'text-slate-400',
      border: 'border-slate-500/20',
      bg: 'bg-slate-500/10'
    },
  ];

  const shellClasses = isLight ? 'relative py-16 sm:py-20 lg:py-24 bg-slate-50 overflow-hidden' : 'relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden';
  const badgeClasses = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';
  const badgeText = isLight ? 'text-slate-700' : 'text-gray-300';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subtitleText = isLight ? 'text-slate-600' : 'text-gray-400';
  const cardClasses = isLight ? 'bg-white border-slate-200 hover:bg-slate-50 hover:border-violet-200 shadow-sm' : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]';

  return (
    <section id="levels" className={shellClasses} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 ${badgeClasses}`}>
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className={`text-sm ${badgeText}`}>{t('landing_levels_badge')}</span>
          </div>
          
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${headingText}`}>
            {t('landing_levels_title')}
          </h2>
          
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${subtitleText}`}>
            {t('landing_levels_subtitle')}
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {levels.map((item, index) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className={`group relative p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${cardClasses}`}
            >
              {/* Level Badge */}
              <div className="flex items-start justify-between mb-5">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.bg} border ${item.border} ${item.accent}`}>
                  {item.level}
                </span>
              </div>

              {/* Content */}
              <h4 className={`text-lg font-semibold mb-2 ${headingText}`}>
                {item.title}
              </h4>
              <p className={`text-sm leading-relaxed mb-5 ${subtitleText}`}>
                {item.description}
              </p>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{t('landing_levels_certificate_badge')}</span>
              </div>

              {/* Hover gradient dot */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Levels;