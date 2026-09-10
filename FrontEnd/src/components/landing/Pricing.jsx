import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, MessageCircle, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api';
import TrustSection from './TrustSection';
import { useLandingTheme } from './useLandingTheme';

const Pricing = () => {
  const { t } = useTranslation();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const { isLight } = useLandingTheme();

  useEffect(() => {
    fetchGeneralSettings();
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      const res = await api.get('/admin/settings/general');
      setWhatsappNumber(res.data.whatsapp_number || '');
    } catch (err) {
      console.error('Failed to fetch general settings', err);
    }
  };

  const handleWhatsAppContact = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, '_blank');
    }
  };

  const shellClasses = isLight ? 'relative py-16 sm:py-20 lg:py-24 bg-slate-50 overflow-hidden' : 'relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden';
  const badgeClasses = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';
  const badgeText = isLight ? 'text-slate-700' : 'text-gray-300';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subtitleText = isLight ? 'text-slate-600' : 'text-gray-400';
  const cardClasses = isLight
    ? 'bg-white ring-slate-200 shadow-sm'
    : 'bg-white/3 ring-white/8';
  const secondaryButtonClasses = isLight
    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-200'
    : 'bg-white/5 text-gray-300 hover:bg-white/8 ring-white/8';

  const plans = [
    {
      name: t('landing_plan_normal_name'),
      price: t('landing_plan_normal_price'),
      description: t('landing_plan_normal_desc'),
      features: [
        t('landing_plan_normal_feature_1'),
        t('landing_plan_normal_feature_2'),
        t('landing_plan_normal_feature_3'),
        t('landing_plan_normal_feature_4'),
        t('landing_plan_normal_feature_5'),
      ],
      cta: t('landing_plan_normal_cta'),
      ctaLink: '/signup',
      popular: false,
      icon: <Sparkles className="w-5 h-5" />,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      name: t('landing_plan_premium_name'),
      price: t('landing_plan_premium_price'),
      description: t('landing_plan_premium_desc'),
      features: [
        t('landing_plan_premium_feature_1'),
        t('landing_plan_premium_feature_2'),
        t('landing_plan_premium_feature_3'),
        t('landing_plan_premium_feature_4'),
        t('landing_plan_premium_feature_5'),
        t('landing_plan_premium_feature_6'),
      ],
      cta: t('landing_plan_premium_cta'),
      ctaAction: handleWhatsAppContact,
      popular: true,
      icon: <Crown className="w-5 h-5" />,
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <section id="pricing" className={shellClasses}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 ${badgeClasses}`}>
            <Crown className="w-4 h-4 text-violet-400" />
            <span className={`text-sm ${badgeText}`}>{t('landing_pricing_badge')}</span>
          </div>
          
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${headingText}`}>
            {t('landing_pricing_title')}
          </h2>
          
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${subtitleText}`}>
            {t('landing_pricing_subtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold shadow-lg shadow-orange-500/25">
                    <Crown className="w-3.5 h-3.5" />
                    {t('landing_plan_popular')}
                  </span>
                </div>
              )}

              {/* Card */}
              <div className={`relative h-full rounded-2xl p-6 sm:p-8 ring-1 ${
                plan.popular
                  ? 'bg-linear-to-b from-violet-600/20 to-purple-600/20 ring-violet-500/50'
                  : cardClasses
              }`}>
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-white/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br ${plan.gradient}`}>
                      <div className="text-white">{plan.icon}</div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${headingText}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm mt-0.5 ${subtitleText}`}>{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className={`mb-6 pb-6 border-b ${isLight ? 'border-slate-200' : 'border-white/6'}`}>
                    <span className={`text-4xl font-bold ${headingText}`}>{plan.price}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.popular ? 'bg-violet-500/20' : 'bg-white/5'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-violet-400' : 'text-emerald-400'}`} />
                        </div>
                        <span className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.ctaLink ? (
                    <Link
                      to={plan.ctaLink}
                      className={`group/btn relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                        plan.popular
                          ? 'bg-linear-to-r from-violet-500 to-purple-500 text-white hover:from-violet-400 hover:to-purple-400 shadow-lg shadow-violet-500/25'
                          : 'bg-white/5 text-gray-300 hover:bg-white/8 ring-1 ring-white/8'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      onClick={plan.ctaAction}
                      disabled={!whatsappNumber}
                      className={`group/btn relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-linear-to-r from-violet-500 to-purple-500 text-white hover:from-violet-400 hover:to-purple-400 shadow-lg shadow-violet-500/25'
                          : 'bg-white/5 text-gray-300 hover:bg-white/8 ring-1 ring-white/8'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <TrustSection whatsappNumber={whatsappNumber} onWhatsAppContact={handleWhatsAppContact} />
      </div>
    </section>
  );
};

export default Pricing;