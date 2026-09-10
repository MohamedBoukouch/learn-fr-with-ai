import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, MapPin, ArrowLeft, Moon, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../../api';
import { useLandingTheme } from './useLandingTheme';

const ContactPage = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({ whatsapp_number: '' });
  const { theme, isLight, setTheme } = useLandingTheme();

  useEffect(() => {
    const fetchGeneralSettings = async () => {
      try {
        const res = await api.get('/admin/settings/general');
        setSettings(res.data || { whatsapp_number: '' });
      } catch (err) {
        console.error('Failed to fetch general settings', err);
      }
    };

    fetchGeneralSettings();
  }, []);

  const handleWhatsAppClick = () => {
    if (settings.whatsapp_number) {
      window.open(`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`, '_blank');
    }
  };

  const shellClasses = isLight ? 'min-h-screen bg-slate-50 text-slate-900' : 'min-h-screen bg-slate-950 text-slate-100';
  const buttonClasses = isLight
    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white';
  const cardClasses = isLight
    ? 'border-slate-200 bg-white shadow-slate-200/70'
    : 'border-white/10 bg-white/5 shadow-black/20';
  const panelClasses = isLight
    ? 'border-slate-200 bg-slate-100/80'
    : 'border-white/10 bg-slate-900/60';
  const mutedText = isLight ? 'text-slate-600' : 'text-slate-300';
  const headingText = isLight ? 'text-slate-900' : 'text-white';

  return (
    <div className={shellClasses}>
      {/* <Header /> */}

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${buttonClasses}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('legal_back_home')}
          </Link>

          <button
            type="button"
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${buttonClasses}`}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            {isLight ? t('landing_theme_toggle_dark') : t('landing_theme_toggle_light')}
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`rounded-3xl border p-8 shadow-2xl shadow-black/10 backdrop-blur ${cardClasses}`}>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-500">{t('legal_contact_page')}</p>
            <h1 className={`mt-3 text-3xl font-semibold ${headingText}`}>{t('legal_contact_title')}</h1>
            <p className={`mt-3 ${mutedText}`}>{t('legal_contact_desc')}</p>

            <div className="mt-8 space-y-4">
              <div className={`flex items-start gap-3 rounded-2xl border p-4 ${panelClasses}`}>
                <Mail className="mt-0.5 h-5 w-5 text-violet-300" />
                <div>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('legal_contact_email')}</p>
                  <a href="mailto:contact@eformationmaroc.com" className={isLight ? 'text-slate-900 hover:text-violet-600' : 'text-white hover:text-violet-300'}>
                      contact@eformationmaroc.com
                  </a>
                </div>
              </div>
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${panelClasses}`}
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="mt-0.5 h-5 w-5 text-violet-300" />
                <div>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('legal_contact_whatsapp')}</p>
                  {settings.whatsapp_number ? (
                    <div className={`text-sm transition-colors truncate ${isLight ? 'text-slate-700 hover:text-violet-600' : 'text-gray-300 hover:text-white'}`}>
                      {settings.whatsapp_number}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{t('landing_footer_coming_soon')}</p>
                  )}
                </div>
              </div>
              <div className={`flex items-start gap-3 rounded-2xl border p-4 ${panelClasses}`}>
                <MapPin className="mt-0.5 h-5 w-5 text-violet-300" />
                <div>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('legal_contact_location')}</p>
                  <p className={isLight ? 'text-slate-900' : 'text-white'}>{t('legal_contact_location_value')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border border-violet-500/20 bg-linear-to-br p-8 ${isLight ? 'from-violet-100 to-white' : 'from-violet-500/10 to-slate-900/80'}`}>
            <h2 className={`text-2xl font-semibold ${headingText}`}>{t('legal_contact_cta_title')}</h2>
            <p className={`mt-3 ${mutedText}`}>{t('legal_contact_cta_desc')}</p>
            <a
              href="mailto:contact@eformationmaroc.com"
              className="mt-6 inline-flex items-center rounded-full bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
            >
              {t('legal_contact_cta_button')}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
