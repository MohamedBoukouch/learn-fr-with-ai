import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingApproval = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center"
      >
        <div className="bg-amber-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('account_pending')}</h1>
        <p className="text-gray-600 leading-relaxed">
          {t('pending_approval')}
        </p>
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 italic">
            {t('pending_email_notice')}
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="mt-6 text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          {t('back_to_login')}
        </button>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
