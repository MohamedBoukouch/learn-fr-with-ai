import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Phone, Mail, MapPin, Heart, MessageCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

const Footer = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    instagram_url: '',
    linkedin_url: '',
    facebook_url: ''
  });

  useEffect(() => {
    fetchGeneralSettings();
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      const res = await api.get('/admin/settings/general');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch general settings', err);
    }
  };

  const handleWhatsAppClick = () => {
    if (settings.whatsapp_number) {
      window.open(`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`, '_blank');
    }
  };

  // Icônes SVG simples pour les réseaux sociaux
  const SocialIcons = {
    Instagram: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" />
      </svg>
    ),
    Facebook: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    LinkedIn: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )
  };

  const socialLinks = [
    {
      name: 'Instagram',
      url: settings.instagram_url,
      icon: <SocialIcons.Instagram />,
      gradient: 'hover:from-pink-500 hover:to-purple-500'
    },
    {
      name: 'LinkedIn',
      url: settings.linkedin_url,
      icon: <SocialIcons.LinkedIn />,
      gradient: 'hover:from-blue-500 hover:to-blue-600'
    },
    {
      name: 'Facebook',
      url: settings.facebook_url,
      icon: <SocialIcons.Facebook />,
      gradient: 'hover:from-blue-600 hover:to-blue-700'
    }
  ];

  return (
    <footer className="relative bg-black border-t border-white/[0.06]">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">E-Formation</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {t('landing_footer_brand_desc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>{t('landing_footer_made_with')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              {t('landing_footer_quick_links')}
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/signup', label: t('landing_footer_signup') },
                { to: '/login', label: t('landing_footer_login') },
                { href: '#features', label: t('landing_footer_features') },
                { href: '#pricing', label: t('landing_footer_pricing') },
              ].map((link, index) => (
                <li key={index}>
                  {link.to ? (
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              {t('landing_footer_contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group cursor-pointer" onClick={handleWhatsAppClick}>
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                  <MessageCircle className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">{t('landing_footer_whatsapp')}</div>
                  {settings.whatsapp_number ? (
                    <div className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {settings.whatsapp_number}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">{t('landing_footer_coming_soon')}</span>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">{t('landing_footer_email')}</div>
                  <a href="mailto:contact@eformationmaroc.com" className="text-sm text-gray-300 hover:text-white transition-colors truncate block">
                    contact@eformationmaroc.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t('landing_footer_location')}</div>
                  <span className="text-sm text-gray-300">{t('landing_footer_location_value')}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              {t('landing_footer_social')}
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                social.url ? (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                    title={social.name}
                  >
                    {social.icon}
                    <ArrowUpRight className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                  </a>
                ) : null
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">
              {t('landing_footer_social_desc')}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} E-Formation Maroc. {t('landing_footer_rights')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {t('landing_footer_privacy')}
              </a>
              <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {t('landing_footer_terms')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;