import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "app_title": "E-Formation Maroc",
      "login": "Connexion",
      "signup": "Inscription",
      "email": "Email",
      "password": "Mot de passe",
      "name": "Nom complet",
      "pending_approval": "Votre compte est en attente d'approbation par l'administrateur.",
      "logout": "Déconnexion",
      "dashboard": "Tableau de bord",
      "levels": "Niveaux",
      "domains": "Domaines",
      "next": "Suivant",
      "previous": "Précédent",
      "favorite": "Favori",
      "quiz": "Quiz",
      "certificates": "Certificats",
      "welcome_back": "Bon retour parmi nous",
      "continue_learning": "Continuer l'apprentissage",
      "xp": "XP",
      "streak": "Série",
      "mastery": "Maîtrise",
      "learning_roadmap": "Parcours d'apprentissage"
    }
  },
  ar: {
    translation: {
      "app_title": "التكوين الإلكتروني المغرب",
      "login": "تسجيل الدخول",
      "signup": "إنشاء حساب",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "name": "الاسم الكامل",
      "pending_approval": "حسابك في انتظار موافقة المسؤول.",
      "logout": "تسجيل الخروج",
      "dashboard": "لوحة القيادة",
      "levels": "المستويات",
      "domains": "المجالات",
      "next": "التالي",
      "previous": "السابق",
      "favorite": "المفضلة",
      "quiz": "اختبار",
      "certificates": "الشهادات",
      "welcome_back": "مرحباً بك مجدداً",
      "continue_learning": "مواصلة التعلم",
      "xp": "نقاط الخبرة",
      "streak": "سلسلة",
      "mastery": "إتقان",
      "learning_roadmap": "مسار التعلم"
    }
  },
  en: {
    translation: {
      "app_title": "E-Formation Maroc",
      "login": "Login",
      "signup": "Sign Up",
      "email": "Email",
      "password": "Password",
      "name": "Full Name",
      "pending_approval": "Your account is pending admin approval.",
      "logout": "Logout",
      "dashboard": "Dashboard",
      "levels": "Levels",
      "domains": "Domains",
      "next": "Next",
      "previous": "Previous",
      "favorite": "Favorite",
      "quiz": "Quiz",
      "certificates": "Certificates",
      "welcome_back": "Welcome back",
      "continue_learning": "Continue Learning",
      "xp": "XP",
      "streak": "Streak",
      "mastery": "Mastery",
      "learning_roadmap": "Learning Roadmap"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
