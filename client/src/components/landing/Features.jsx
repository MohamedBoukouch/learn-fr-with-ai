import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, BookOpen, FileCheck, Award, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: t('landing_feature_emma_title'),
      description: t('landing_feature_emma_desc'),
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      text: 'text-violet-600'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t('landing_feature_phrases_title'),
      description: t('landing_feature_phrases_desc'),
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: t('landing_feature_quizzes_title'),
      description: t('landing_feature_quizzes_desc'),
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: t('landing_feature_certificates_title'),
      description: t('landing_feature_certificates_desc'),
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    }
  ];

  return (
    <section id="features" className="relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-gray-300">{t('landing_features_badge')}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            {t('landing_features_title')}
          </h2>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            {t('landing_features_subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <div className={feature.text}>{feature.icon}</div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient dot */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 p-6 sm:p-8 lg:p-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-bold text-white mb-1">
                {t('landing_coming_soon_title')}
              </h4>
              <p className="text-sm text-gray-400">
                {t('landing_coming_soon_desc')}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm font-medium text-violet-400">
                <Sparkles className="w-4 h-4" />
                {t('landing_coming_soon_badge')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;