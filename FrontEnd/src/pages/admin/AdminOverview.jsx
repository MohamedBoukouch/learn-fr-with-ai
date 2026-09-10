import React, { useEffect, useState } from 'react';
import api from '../../api';
import Layout from '../../components/Layout';
import { 
  Users, BookOpen, MessageSquare, Award, Activity, Calendar, Flame, 
  TrendingUp, Clock, Eye, Globe, Smartphone, UserCheck, UserX 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ label, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className="text-sm text-gray-500 mt-1">{trend}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-${color}-50`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
    {children}
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    totalLevels: 0,
    totalDomains: 0,
    totalPhrases: 0,
    totalQuizzes: 0,
    totalQuizResults: 0,
    totalVocabulary: 0,
    totalPhraseProgress: 0,
    emmaAccessUsers: 0,
    quizResultsLast7Days: 0,
    phrasesLearnedLast7Days: 0,
    activeUsersLast7Days: 0,
    quizResultsLast30Days: 0,
    phrasesLearnedLast30Days: 0,
    activeUsersLast30Days: 0
  });
  
  const [quizStats, setQuizStats] = useState({
    averageScore: 0,
    passedQuizzes: 0
  });
  
  const [levelDistribution, setLevelDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [visitStats, setVisitStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [statsRes, quizRes, levelRes, activityRes, visitRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/stats/quiz-averages'),
          api.get('/admin/stats/level-distribution'),
          api.get('/admin/stats/recent-activity'),
          api.get('/tracking/stats').catch(() => ({ data: null })) // Ne pas bloquer si l'API n'est pas encore prête
        ]);
        
        const statsData = statsRes.data || {};
        setStats({
          totalUsers: Number(statsData.totalUsers) || 0,
          pendingUsers: Number(statsData.pendingUsers) || 0,
          approvedUsers: Number(statsData.approvedUsers) || 0,
          totalLevels: Number(statsData.totalLevels) || 0,
          totalDomains: Number(statsData.totalDomains) || 0,
          totalPhrases: Number(statsData.totalPhrases) || 0,
          totalQuizzes: Number(statsData.totalQuizzes) || 0,
          totalQuizResults: Number(statsData.totalQuizResults) || 0,
          totalVocabulary: Number(statsData.totalVocabulary) || 0,
          totalPhraseProgress: Number(statsData.totalPhraseProgress) || 0,
          emmaAccessUsers: Number(statsData.emmaAccessUsers) || 0,
          quizResultsLast7Days: Number(statsData.quizResultsLast7Days) || 0,
          phrasesLearnedLast7Days: Number(statsData.phrasesLearnedLast7Days) || 0,
          activeUsersLast7Days: Number(statsData.activeUsersLast7Days) || 0,
          quizResultsLast30Days: Number(statsData.quizResultsLast30Days) || 0,
          phrasesLearnedLast30Days: Number(statsData.phrasesLearnedLast30Days) || 0,
          activeUsersLast30Days: Number(statsData.activeUsersLast30Days) || 0
        });
        
        const quizData = quizRes.data || {};
        setQuizStats({
          averageScore: Number(quizData.averageScore) || 0,
          passedQuizzes: Number(quizData.passedQuizzes) || 0
        });
        
        setLevelDistribution(levelRes.data || []);
        setRecentActivity(activityRes.data || []);
        setVisitStats(visitRes.data || null);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err.response?.status, err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllStats();
  }, []);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const formatDuration = (str) => str || '0s';

  const passRate = stats.totalQuizResults > 0 
    ? Math.round((quizStats.passedQuizzes / stats.totalQuizResults) * 100) 
    : 0;

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre plateforme</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Utilisateurs"
            value={formatNumber(stats.totalUsers)}
            icon={Users}
            color="blue"
            trend={`${stats.approvedUsers} approuvés`}
          />
          <StatCard
            label="Quiz Complétés"
            value={formatNumber(stats.totalQuizResults)}
            icon={Award}
            color="purple"
            trend={`${passRate}% de réussite`}
          />
          <StatCard
            label="Phrases Apprises"
            value={formatNumber(stats.totalPhraseProgress)}
            icon={MessageSquare}
            color="green"
            trend={`${formatNumber(stats.totalPhrases)} disponibles`}
          />
          <StatCard
            label="Contenu"
            value={formatNumber(stats.totalLevels + stats.totalDomains)}
            icon={BookOpen}
            color="orange"
            trend={`${stats.totalLevels} niveaux • ${stats.totalDomains} thèmes`}
          />
        </div>

        {/* ==================== STATISTIQUES VISITEURS ==================== */}
        {visitStats && (
          <>
            {/* Cartes visiteurs */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Trafic du Site
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Visites (30j)"
                  value={formatNumber(visitStats.visits30Days)}
                  icon={Eye}
                  color="blue"
                  trend={`${formatNumber(visitStats.visitsToday)} aujourd'hui`}
                />
                <StatCard
                  label="Visiteurs Uniques"
                  value={formatNumber(visitStats.uniqueVisitors30d)}
                  icon={Users}
                  color="green"
                  trend={`${formatNumber(visitStats.uniqueUsers30d)} connectés`}
                />
                <StatCard
                  label="Temps Moyen"
                  value={formatDuration(visitStats.avgDurationFormatted)}
                  icon={Clock}
                  color="orange"
                  trend={`Total: ${formatDuration(visitStats.totalDurationFormatted)}`}
                />
                <StatCard
                  label="Visites/Jour"
                  value={Math.round(visitStats.visits30Days / 30)}
                  icon={TrendingUp}
                  color="purple"
                  trend="Moyenne quotidienne"
                />
              </div>
            </div>

            {/* Graphiques visiteurs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visites par jour */}
              <Section title="📅 Visites par Jour (30 jours)">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={visitStats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => d?.substring(5)} fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Section>

              {/* Visiteurs uniques */}
              <Section title="👥 Visiteurs Uniques par Jour">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={visitStats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => d?.substring(5)} fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="uniqueSessions" stroke="#10B981" strokeWidth={2} dot={false} name="Sessions" />
                    <Line type="monotone" dataKey="uniqueUsers" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Connectés" />
                  </LineChart>
                </ResponsiveContainer>
              </Section>
            </div>

            {/* Camemberts + Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Type visiteurs */}
              <Section title="👥 Type de Visiteurs">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Anonymes', value: visitStats.visitsAnonymous30d },
                        { name: 'Connectés', value: visitStats.visitsAuthenticated30d }
                      ]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      <Cell fill="#F59E0B" />
                      <Cell fill="#3B82F6" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Section>

              {/* Appareils */}
              <Section title="📱 Appareils">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={Object.entries(visitStats.devices || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {Object.entries(visitStats.devices || {}).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Section>

              {/* Top Pages */}
              <Section title="🌐 Pages Populaires">
                <div className="space-y-3">
                  {visitStats.topPages?.slice(0, 6).map((page, i) => {
                    const max = visitStats.topPages[0]?.count || 1;
                    const width = (page.count / max) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate">{page.page}</span>
                          <span className="font-bold text-gray-800">{page.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {(!visitStats.topPages || visitStats.topPages.length === 0) && (
                    <p className="text-gray-400 text-center py-4">Aucune donnée</p>
                  )}
                </div>
              </Section>
            </div>
          </>
        )}

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Last 7 Days */}
          <Section title="7 Derniers Jours">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Quiz</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(stats.quizResultsLast7Days)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Phrases apprises</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(stats.phrasesLearnedLast7Days)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Utilisateurs actifs</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(stats.activeUsersLast7Days)}</span>
              </div>
            </div>
          </Section>

          {/* Last 30 Days */}
          <Section title="30 Derniers Jours">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Quiz</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(stats.quizResultsLast30Days)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Phrases apprises</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(stats.phrasesLearnedLast30Days)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Utilisateurs actifs</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(stats.activeUsersLast30Days)}</span>
              </div>
            </div>
          </Section>

          {/* Quiz Performance */}
          <Section title="Performance Quiz">
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Score Moyen</p>
                <p className="text-4xl font-bold text-blue-600">
                  {Math.round(quizStats.averageScore || 0)}%
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quiz réussis</span>
                  <span className="font-semibold">{formatNumber(quizStats.passedQuizzes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                  <span className="font-semibold">{passRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Moyenne par utilisateur</span>
                  <span className="font-semibold">
                    {stats.totalUsers > 0 ? (stats.totalQuizResults / stats.totalUsers).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Level Distribution */}
        <Section title="Apprentissage par Niveau">
          {levelDistribution.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelDistribution.map((item, i) => {
                const [level, phrasesCount, studentsCount] = item;
                const avgPerStudent = studentsCount > 0 ? (phrasesCount / studentsCount).toFixed(1) : '0';
                const progressPercent = studentsCount > 0 ? Math.min((phrasesCount / (studentsCount * 10)) * 100, 100) : 0;
                
                return (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{level || 'N/A'}</h3>
                      <span className="text-sm text-gray-500">{studentsCount} étudiants</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phrases apprises</span>
                        <span className="font-semibold">{formatNumber(phrasesCount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Moyenne par étudiant</span>
                        <span className="font-semibold">{avgPerStudent}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Recent Activity */}
        <Section title="Activité Récente">
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune activité récente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Utilisateur</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quiz</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.slice(0, 10).map((activity, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {activity.user?.name || activity.user?.email || 'Anonyme'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{activity.quiz?.title || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900">{activity.score}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          activity.isPassed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {activity.isPassed ? 'Réussi' : 'Échoué'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(activity.completedAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </Layout>
  );
};

export default AdminOverview;