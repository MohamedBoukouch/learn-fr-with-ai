import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Header = () => {
  const { t } = useTranslation();
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        showHeader 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      }`}
    >
      {/* Header Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Left */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white hidden sm:block">
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
                className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA - Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile nav links */}
            <div className="flex md:hidden items-center gap-2">
              <a href="#levels" className="text-xs text-gray-400 hover:text-white transition-colors">
                {t('landing_header_levels')}
              </a>
              <a href="#features" className="text-xs text-gray-400 hover:text-white transition-colors">
                {t('landing_header_features')}
              </a>
            </div>
            
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-lg bg-white/[0.05] text-gray-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-all font-medium"
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