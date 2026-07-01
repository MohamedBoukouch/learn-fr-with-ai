import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import certifExample from '../../assets/images/certif_example.png';
import { useLandingTheme } from './useLandingTheme';

const CertificateShowcase = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { isLight } = useLandingTheme();

  const shellClasses = isLight ? 'relative py-16 sm:py-20 lg:py-24 bg-slate-50 overflow-hidden lg:min-h-[120vh] lg:flex lg:items-center' : 'relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden lg:min-h-[120vh] lg:flex lg:items-center';
  const badgeClasses = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';
  const badgeText = isLight ? 'text-slate-700' : 'text-gray-300';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subtitleText = isLight ? 'text-slate-600' : 'text-gray-400';
  const cardClasses = isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/[0.08] bg-white/[0.03] backdrop-blur-sm';
  const panelClasses = isLight ? 'border-slate-200' : 'border-white/[0.06]';

  return (
    <section className={shellClasses} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 ${badgeClasses}`}>
            <Award className="w-4 h-4 text-violet-400" />
            <span className={`text-sm ${badgeText}`}>{t('landing_certificate_badge')}</span>
          </div>
          
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${headingText}`}>
            {t('landing_certificate_title')}
          </h2>
          
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${subtitleText}`}>
            {t('landing_certificate_subtitle')}
          </p>
        </motion.div>

        {/* Certificate Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={`overflow-hidden rounded-2xl sm:rounded-[2rem] border max-w-5xl mx-auto ${cardClasses}`}>
            {/* Preview Header */}
            <div className={`border-b p-4 sm:p-6 ${panelClasses}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                    {t('landing_certificate_preview_label')}
                  </p>
                  <h3 className={`mt-1 text-lg sm:text-xl lg:text-2xl font-bold ${headingText}`}>
                    {t('landing_certificate_preview_title')}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t('landing_certificate_preview_badge')}</span>
                </div>
              </div>
            </div>

            {/* Certificate Image */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className={`overflow-hidden rounded-xl sm:rounded-2xl border ${panelClasses}`}>
                <img 
                  src={certifExample} 
                  alt={t('landing_certificate_preview_title')}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 sm:mt-8 lg:mt-10 text-center"
        >
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            {t('landing_certificate_footer_note')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificateShowcase;