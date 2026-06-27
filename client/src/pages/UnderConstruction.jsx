import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { ArrowLeft, Construction } from 'lucide-react';
import { motion } from 'framer-motion';

const UnderConstruction = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const isAdmin = localStorage.getItem('userRole') === 'ROLE_ADMIN';

  const handleGoHome = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-2xl shadow-gray-200/50 text-center relative overflow-hidden"
        >
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-indigo-100/40 blur-3xl" />

          <motion.div 
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              y: [0, -4, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner"
          >
            <Construction size={48} strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
            {t('under_construction')}
          </h1>
          
          <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm md:text-base">
            {t('under_construction_desc')}
          </p>

          <button
            onClick={handleGoHome}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-gray-950/10"
          >
            <ArrowLeft size={18} className="rtl:rotate-180" />
            {t('back_to_home')}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UnderConstruction;
