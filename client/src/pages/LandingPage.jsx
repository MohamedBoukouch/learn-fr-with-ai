import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import CertificateShowcase from '../components/landing/CertificateShowcase';
import MarketingSection from '../components/landing/MarketingSection';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';
import Levels from '../components/landing/Levels';

const LandingPage = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language === 'ar' ? 'ar' : i18n.language === 'fr' ? 'fr' : 'en';
    const title = `${t('landing_title')} ${t('landing_title_highlight')} | ${t('app_title')}`;
    const description = t('landing_subtitle');

    document.title = title;
    document.documentElement.lang = lang;

    const setMeta = (selector, attr, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/`);
  }, [i18n.language, t]);

  return (
    <div className="min-h-screen">
      <Header />

      <div id="top">
        <Hero />
        <Levels />
        <Features id="features" />
        <CertificateShowcase />
        <MarketingSection />
        <Pricing id="pricing" />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
