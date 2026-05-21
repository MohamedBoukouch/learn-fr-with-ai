import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Award, User, LogOut, LayoutDashboard, ShieldCheck, Users, BookMarked, FileCheck, HelpCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'ROLE_ADMIN';
  const userName = localStorage.getItem('userName') || 'Utilisateur';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const learnerItems = [
    { icon: <LayoutDashboard size={20} />, label: t('dashboard'), path: '/dashboard' },
    { icon: <Award size={20} />, label: t('certificates'), path: '/dashboard/certificates' },
    { icon: <User size={20} />, label: 'Profil', path: '/dashboard/profile' },
  ];

  const adminItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <BookMarked size={20} />, label: 'Manage Content', path: '/admin/content' },
    { icon: <HelpCircle size={20} />, label: 'Manage Quizzes', path: '/admin/quizzes' },
    { icon: <Users size={20} />, label: 'Manage Users', path: '/admin/users' },
    { icon: <FileCheck size={20} />, label: 'Certificates', path: '/admin/certificates' },
  ];

  const navItems = isAdmin ? adminItems : learnerItems;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            E-Formation
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Bienvenue, {userName}</h2>
            {isAdmin && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-40">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
