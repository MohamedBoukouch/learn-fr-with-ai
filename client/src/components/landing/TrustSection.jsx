import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLandingTheme } from './useLandingTheme';

const TrustSection = ({ whatsappNumber, onWhatsAppContact }) => {
  const { t } = useTranslation();
  const { isLight } = useLandingTheme();
  const outerClasses = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/3 border-white/8';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const bodyText = isLight ? 'text-slate-600' : 'text-gray-400';
  const cardClasses = isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto"
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Border gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20" />
        
        {/* Content */}
        <div className={`relative m-px rounded-2xl backdrop-blur-sm p-6 sm:p-8 lg:p-10 ${outerClasses}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                <Shield className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-400">{t('landing_trust_badge')}</span>
              </div>
              
              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${headingText}`}>
                {t('landing_trust_title')}
              </h3>
              
              <p className={`text-sm sm:text-base leading-relaxed ${bodyText}`}>
                {t('landing_trust_subtitle')}
              </p>
            </div>

            {/* Right Card */}
            <div className="shrink-0">
              <div className={`rounded-xl border p-5 sm:p-6 ${cardClasses}`}>
                <div className={`flex items-center gap-2 text-sm mb-3 ${bodyText}`}>
                  <MessageCircle className="w-4 h-4 text-violet-400" />
                  <span>{t('landing_trust_whatsapp_label')}</span>
                </div>
                
                <div className={`text-xl font-bold mb-4 ${headingText}`}>
                  {whatsappNumber || t('landing_trust_number_placeholder')}
                </div>
                
                <button
                  onClick={onWhatsAppContact}
                  className="group inline-flex items-center gap-2 w-full justify-center px-5 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('landing_trust_cta')}
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrustSection;