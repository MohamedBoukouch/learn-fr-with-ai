import React, { useEffect, useState } from 'react';
import api from '../../api';
import Layout from '../../components/Layout';
import { Users, BookOpen, MessageSquare, TrendingUp, UserCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalLevels: 0,
    totalDomains: 0,
    totalPhrases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: <Users />, color: 'blue' },
    { label: 'En attente', value: stats.pendingUsers, icon: <UserCheck />, color: 'red' },
    { label: 'Niveaux CEFR', value: stats.totalLevels, icon: <TrendingUp />, color: 'purple' },
    { label: 'Thématiques', value: stats.totalDomains, icon: <BookOpen />, color: 'indigo' },
    { label: 'Phrases', value: stats.totalPhrases, icon: <MessageSquare />, color: 'green' },
  ];

  return (
    <Layout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500">Vue d'ensemble de la croissance et du contenu.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((card, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${card.color}-50 text-${card.color}-600`}>
                {card.icon}
              </div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : card.value}
              </h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Activité récente</h2>
            <div className="flex items-center justify-center h-48 text-gray-400 italic">
               <Clock className="mr-2" size={20} /> Bientôt disponible...
            </div>
          </section>
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Distribution des niveaux</h2>
            <div className="flex items-center justify-center h-48 text-gray-400 italic">
               <TrendingUp className="mr-2" size={20} /> Bientôt disponible...
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOverview;
