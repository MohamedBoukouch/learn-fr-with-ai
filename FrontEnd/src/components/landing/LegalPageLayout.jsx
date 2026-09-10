import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, Mail, ShieldCheck, Moon, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useLandingTheme } from './useLandingTheme';

const icons = {
  privacy: ShieldCheck,
  terms: FileText,
  contact: Mail,
};

const LegalPageLayout = ({ pageKey, titleKey, descriptionKey, sections, type = 'privacy' }) => {
  const { t } = useTranslation();
  const Icon = icons[type] || ShieldCheck;
  const { theme, isLight, setTheme } = useLandingTheme();
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

        <div className={`mt-8 rounded-3xl border p-8 shadow-2xl backdrop-blur ${cardClasses}`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-500">{t(pageKey)}</p>
              <h1 className={`text-3xl font-semibold ${headingText}`}>{t(titleKey)}</h1>
              <p className={`mt-2 ${mutedText}`}>{t(descriptionKey)}</p>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {sections.map((section, index) => (
              <section key={index} className={`rounded-2xl border p-6 ${panelClasses}`}>
                <h2 className={`text-xl font-semibold ${headingText}`}>{t(section.titleKey)}</h2>
                <div className={`mt-3 space-y-3 text-sm leading-7 ${mutedText}`}>
                  {section.bodyKeys.map((bodyKey) => (
                    <p key={bodyKey}>{t(bodyKey)}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;
