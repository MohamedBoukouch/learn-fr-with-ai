import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import Layout from '../../components/Layout';
import { Phone, Globe, Link, Save, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminGeneralSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    instagram_url: '',
    linkedin_url: '',
    facebook_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings/general');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch general settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/admin/settings/general', settings);
      setMessage({ type: 'success', text: t('admin_settings_saved') });
    } catch (err) {
      setMessage({ type: 'error', text: t('admin_settings_error') });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t('loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <SettingsIcon className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin_general_settings_title')}</h1>
              <p className="text-gray-500 mt-1">{t('admin_general_settings_desc')}</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* WhatsApp Number */}
              <div className="p-6 border-b border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Phone className="w-4 h-4 text-green-600" />
                  {t('admin_whatsapp_number')}
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Instagram URL */}
              <div className="p-6 border-b border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Globe className="w-4 h-4 text-pink-600" />
                  {t('admin_instagram_url')}
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/youraccount"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* LinkedIn URL */}
              <div className="p-6 border-b border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Link className="w-4 h-4 text-blue-700" />
                  {t('admin_linkedin_url')}
                </label>
                <input
                  type="url"
                  value={settings.linkedin_url}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Facebook URL */}
              <div className="p-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Globe className="w-4 h-4 text-blue-600" />
                  {t('admin_facebook_url')}
                </label>
                <input
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('save_settings')}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminGeneralSettings;
