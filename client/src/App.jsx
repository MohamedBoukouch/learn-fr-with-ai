import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PendingApproval from "./pages/PendingApproval";
import DomainStudy from "./pages/DomainStudy";
import Quiz from "./pages/Quiz";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminContentManager from "./pages/admin/AdminContentManager";
import AdminLevelDetail from "./pages/admin/AdminLevelDetail";
import AdminDomainDetail from "./pages/admin/AdminDomainDetail";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminLevelQuizDetail from "./pages/admin/AdminLevelQuizDetail";
import LevelDetail from "./pages/LevelDetail";
import UnderConstruction from "./pages/UnderConstruction";
import EmmaChat from "./pages/EmmaChat";
import LearnPhrases from "./pages/LearnPhrases";
import PreA1Learning from "./pages/PreA1Learning";
import Quizzes from "./pages/Quizzes";
import Certificates from "./pages/Certificates";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminGeneralSettings from "./pages/admin/AdminGeneralSettings";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const isAdmin = localStorage.getItem("userRole") === "ROLE_ADMIN";
  const isApproved = localStorage.getItem("isApproved") === "true" || isAdmin;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isApproved) return <Navigate to="/pending" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const isAdmin = localStorage.getItem("userRole") === "ROLE_ADMIN";

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const RootRoute = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  const isAdmin = localStorage.getItem("userRole") === "ROLE_ADMIN";
  const isApproved = localStorage.getItem("isApproved") === "true" || isAdmin;

  if (!isAuthenticated) return <LandingPage />;
  if (!isApproved) return <Navigate to="/pending" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Language Switcher */}
        <div className="fixed top-4 ltr:right-4 rtl:left-4 z-50 flex gap-2">
          {["fr", "ar", "en"].map((lng) => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className="px-2 py-1 text-xs font-bold rounded bg-white shadow hover:bg-gray-100 uppercase"
            >
              {lng}
            </button>
          ))}
        </div>

        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending" element={<PendingApproval />} />

          {/* Learner Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/learn"
            element={
              <ProtectedRoute>
                <LearnPhrases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pre-a1"
            element={
              <ProtectedRoute>
                <PreA1Learning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/chat"
            element={
              <ProtectedRoute>
                <EmmaChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/quizzes"
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/levels/:levelId"
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/levels/:levelId"
            element={
              <ProtectedRoute>
                <LevelDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/domains/:domainId"
            element={
              <ProtectedRoute>
                <DomainStudy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/domains/:domainId/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/:quizId"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminOverview />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <AdminRoute>
                <AdminContentManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/content/levels/:levelId"
            element={
              <AdminRoute>
                <AdminLevelDetail />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/content/domains/:domainId"
            element={
              <AdminRoute>
                <AdminDomainDetail />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <AdminRoute>
                <AdminQuizzes />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminGeneralSettings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes/levels/:levelId"
            element={
              <AdminRoute>
                <AdminLevelQuizDetail />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/certificates"
            element={
              <AdminRoute>
                <AdminCertificates />
              </AdminRoute>
            }
          />

          {/* Fallbacks */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="*" element={<UnderConstruction />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
