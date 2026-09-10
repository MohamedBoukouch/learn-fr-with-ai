import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Bot, BrainCircuit, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLandingTheme } from './useLandingTheme';

const MarketingSection = () => {
  const { t } = useTranslation();
  const { isLight } = useLandingTheme();

  const highlights = [
    {
      icon: <Bot className="w-5 h-5" />,
      title: t('landing_benefit_1_title'),
      desc: t('landing_benefit_1_desc'),
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: <BrainCircuit className="w-5 h-5" />,
      title: t('landing_benefit_2_title'),
      desc: t('landing_benefit_2_desc'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: t('landing_benefit_3_title'),
      desc: t('landing_benefit_3_desc'),
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: t('landing_benefit_4_title'),
      desc: t('landing_benefit_4_desc'),
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const shellClasses = isLight ? 'relative py-16 sm:py-20 lg:py-24 bg-slate-50 overflow-hidden' : 'relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden';
  const badgeClasses = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';
  const badgeText = isLight ? 'text-slate-700' : 'text-gray-300';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subtitleText = isLight ? 'text-slate-600' : 'text-gray-400';
  const cardClasses = isLight ? 'bg-white border-slate-200 hover:bg-slate-50 hover:border-violet-200 shadow-sm' : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]';
  const ctaCardClasses = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-black border-white/10';
  const ctaText = isLight ? 'text-slate-600' : 'text-gray-300';

  return (
    <section className={shellClasses}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,119,198,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${badgeClasses}`}>
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className={`text-sm ${badgeText}`}>{t('landing_benefits_badge')}</span>
            </div>

            <div className="space-y-4">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${headingText}`}>
                {t('landing_benefits_title')}
              </h2>
              <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${subtitleText}`}>
                {t('landing_benefits_subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${cardClasses}`}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h3 className={`text-base font-semibold mb-1.5 ${headingText}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${subtitleText}`}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-4xl bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 p-0.5">
              <div className={`rounded-[1.9rem] p-6 sm:p-8 lg:p-10 ${ctaCardClasses}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                      {t('landing_benefits_cta_label')}
                    </p>
                    <h3 className={`mt-2 text-xl sm:text-2xl font-bold ${headingText}`}>
                      {t('landing_benefits_cta_title')}
                    </h3>
                  </div>
                  <div className="shrink-0 h-14 w-14 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                    <span className={`text-sm ${ctaText}`}>{t('landing_benefits_cta_point_1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                    <span className={`text-sm ${ctaText}`}>{t('landing_benefits_cta_point_2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                    <span className={`text-sm ${ctaText}`}>{t('landing_benefits_cta_point_3')}</span>
                  </li>
                </ul>

                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
                >
                  {t('landing_benefits_cta')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-linear-to-br from-violet-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MarketingSection;