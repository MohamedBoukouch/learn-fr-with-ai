import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Moon, SunMedium } from 'lucide-react';
import { useLandingTheme } from './useLandingTheme';

const Header = () => {
  const { t } = useTranslation();
  const [showHeader, setShowHeader] = useState(false);
  const { theme, isLight, setTheme } = useLandingTheme();

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgClasses = isLight ? 'bg-white/90 border-slate-200' : 'bg-black/80 border-white/6';
  const textClasses = isLight ? 'text-slate-700' : 'text-white';
  const mutedTextClasses = isLight ? 'text-slate-600' : 'text-gray-400';
  const buttonClasses = isLight
    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/8 border-white/8';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        showHeader 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      }`}
    >
      {/* Header Background */}
      <div className={`absolute inset-0 backdrop-blur-xl border-b ${bgClasses}`} />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Left */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-bold hidden sm:block ${textClasses}`}>
              E-Formation
            </span>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {[
              { href: '#levels', label: t('landing_header_levels') },
              { href: '#features', label: t('landing_header_features') },
              { href: '#pricing', label: t('landing_header_pricing') },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${mutedTextClasses} hover:${isLight ? 'text-slate-900 bg-slate-100' : 'text-white bg-white/5'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA - Right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile nav links */}
            <div className="flex md:hidden items-center gap-2">
              <a href="#levels" className={`text-xs transition-colors ${mutedTextClasses} hover:${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t('landing_header_levels')}
              </a>
              <a href="#features" className={`text-xs transition-colors ${mutedTextClasses} hover:${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t('landing_header_features')}
              </a>
            </div>
            
            <button
              type="button"
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all font-medium ${buttonClasses}`}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            </button>

            <Link
              to="/login"
              className={`text-sm px-4 py-2 rounded-lg border transition-all font-medium ${buttonClasses}`}
            >
              {t('landing_header_login')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;