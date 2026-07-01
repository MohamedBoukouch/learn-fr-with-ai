import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Award,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookMarked,
  FileCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Layout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("userRole") === "ROLE_ADMIN";
  const userName = localStorage.getItem("userName") || "Utilisateur";

  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true",
  );

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebarCollapsed", String(nextState));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const learnerItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: t("dashboard"),
      path: "/dashboard",
    },
    {
      icon: <BookOpen size={20} />,
      label: t("learn_phrases"),
      path: "/dashboard/learn",
    },
    {
      icon: <HelpCircle size={20} />,
      label: t("quizzes"),
      path: "/dashboard/quizzes",
    },
    {
      icon: <MessageSquare size={20} />,
      label: t("chat_emma"),
      path: "/dashboard/chat",
    },
    {
      icon: <Award size={20} />,
      label: t("certificates"),
      path: "/dashboard/certificates",
    },
    {
      icon: <User size={20} />,
      label: t("profile"),
      path: "/dashboard/profile",
    },
  ];

  const adminItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: t("dashboard"),
      path: "/admin/dashboard",
    },
    {
      icon: <BookMarked size={20} />,
      label: t("manage_content"),
      path: "/admin/content",
    },
    {
      icon: <HelpCircle size={20} />,
      label: t("manage_quizzes"),
      path: "/admin/quizzes",
    },
    {
      icon: <Users size={20} />,
      label: t("manage_users"),
      path: "/admin/users",
    },
    {
      icon: <FileCheck size={20} />,
      label: t("certificates"),
      path: "/admin/certificates",
    },
    {
      icon: <Settings size={20} />,
      label: t("general_settings"),
      path: "/admin/settings",
    },
  ];

  const navItems = isAdmin ? adminItems : learnerItems;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="hidden md:flex flex-col bg-white ltr:border-r rtl:border-l border-slate-200 text-slate-600 relative z-30 select-none"
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute top-6 ltr:-right-3.5 rtl:-left-3.5 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-full border-2 border-slate-200 shadow-md transition-colors z-40 hidden md:block"
        >
          {isCollapsed ? (
            isRtl ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : isRtl ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>

        {/* Logo / Header */}
        <div
          className={`p-6 flex items-center gap-3 border-b border-slate-100 h-20 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
            <BookOpen size={22} />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap"
              >
                E-Formation
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User Card */}
        <div
          className={`p-4 border-b border-slate-100 flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/10 flex-shrink-0">
            {userInitial}
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-w-0"
            >
              <h4 className="text-sm font-bold text-slate-950 truncate leading-snug">
                {userName}
              </h4>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isAdmin ? t("admin") : t("learner")}
              </span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={
                item.path === "/dashboard" || item.path === "/admin/dashboard"
              }
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold group relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm whitespace-nowrap font-medium"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Tooltip on collapse hover */}
              {isCollapsed && (
                <div className="absolute ltr:left-full rtl:right-full ltr:ml-4 rtl:mr-4 px-3 py-2 bg-slate-950 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-slate-800 z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-bold text-rose-600 hover:bg-rose-50 group relative ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut size={20} className="flex-shrink-0" />

            {!isCollapsed && (
              <span className="text-sm font-medium">{t("logout")}</span>
            )}

            {isCollapsed && (
              <div className="absolute ltr:left-full rtl:right-full ltr:ml-4 rtl:mr-4 px-3 py-2 bg-rose-950 text-rose-200 text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-rose-900/30 z-50">
                {t("logout")}
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shadow-sm z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle (visible only on mobile) */}
            <button
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              onClick={() => {
                const drawer = document.getElementById("mobile-drawer");
                if (drawer) drawer.classList.toggle("hidden");
              }}
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">
                {t("welcome")}, {userName}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5 leading-none">
                {isAdmin ? t("admin_platform_sub") : t("learn_french")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={12} />
                {t("admin_panel")}
              </span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">{children}</div>
      </main>

      {/* Mobile Drawer (Overlay Drawer) */}
      <div
        id="mobile-drawer"
        className="hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden"
      >
        <div className="w-72 bg-white h-full flex flex-col text-slate-600 shadow-2xl ltr:border-r rtl:border-l border-slate-200">
          <div className="p-6 flex items-center justify-between border-b border-slate-100 h-20">
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-indigo-600" />
              E-Formation
            </h1>
            <button
              onClick={() =>
                document.getElementById("mobile-drawer").classList.add("hidden")
              }
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black">
              {userInitial}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {userName}
              </h4>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isAdmin ? t("admin") : t("learner")}
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path === "/dashboard" || item.path === "/admin/dashboard"
                }
                onClick={() =>
                  document
                    .getElementById("mobile-drawer")
                    .classList.add("hidden")
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => {
                document
                  .getElementById("mobile-drawer")
                  .classList.add("hidden");
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-bold text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">{t("logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
