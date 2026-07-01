import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import {
  User,
  Mail,
  Lock,
  AlertTriangle,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Save,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/student/profile");
      setProfile(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setMessage({ type: "error", text: t("profile_fetch_error") });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/student/profile", { name });
      localStorage.setItem("userName", name);
      showMessage("success", t("profile_name_updated"));
    } catch (err) {
      showMessage("error", t("profile_update_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/student/profile/email", { newEmail });
      setEmail(newEmail);
      setNewEmail("");
      localStorage.setItem("isApproved", "false");
      showMessage("success", t("profile_email_updated"));
      setTimeout(() => {
        window.location.href = "/pending";
      }, 2000);
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || t("profile_email_error")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/student/profile/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      showMessage("success", t("profile_password_updated"));
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || t("profile_password_error")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmation !== "DELETE") {
      showMessage("error", t("profile_delete_confirm"));
      return;
    }
    setSaving(true);
    try {
      await api.delete("/student/profile", {
        data: { confirmation: deleteConfirmation },
      });
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      showMessage("error", t("profile_delete_error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("profile_title")}
          </h1>
          <p className="text-gray-600">{t("profile_subtitle")}</p>
        </motion.div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("profile_info")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {t("name")}
              </label>
              <p className="text-gray-900 font-medium">{profile.name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {t("email")}
              </label>
              <p className="text-gray-900 font-medium">{profile.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {t("profile_role")}
              </label>
              <p className="text-gray-900 font-medium capitalize">
                {profile.role === "ROLE_ADMIN" ? t("admin") : t("learner")}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {t("profile_status")}
              </label>
              <div className="flex items-center gap-2">
                {profile.isApproved ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`font-medium ${
                    profile.isApproved ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profile.isApproved ? t("profile_approved") : t("profile_pending")}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {t("profile_created")}
              </label>
              <p className="text-gray-900 font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {t("profile_emma_access")}
              </label>
              <div className="flex items-center gap-2">
                {profile.emmaAccess ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span
                  className={`font-medium ${
                    profile.emmaAccess ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {profile.emmaAccess ? t("profile_enabled") : t("profile_disabled")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Update Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("profile_update_name")}
          </h2>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? t("profile_saving") : t("profile_save")}
            </button>
          </form>
        </motion.div>

        {/* Change Email Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t("profile_change_email")}
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {t("profile_email_warning_title")}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {t("profile_email_warning")}
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile_current_email")}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile_new_email")}
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? t("profile_saving") : t("profile_save")}
            </button>
          </form>
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t("profile_change_password")}
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile_current_password")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile_new_password")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? t("profile_saving") : t("profile_save")}
            </button>
          </form>
        </motion.div>

        {/* Danger Zone - Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-50 rounded-2xl border-2 border-red-200 p-6"
        >
          <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t("profile_danger_zone")}
          </h2>
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              {t("profile_delete_warning")}
            </p>
          </div>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                {t("profile_delete_confirm_label")}
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={saving || deleteConfirmation !== "DELETE"}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {saving ? t("profile_deleting") : t("profile_delete_account")}
            </button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
