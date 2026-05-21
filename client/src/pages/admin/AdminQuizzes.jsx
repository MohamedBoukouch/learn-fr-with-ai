import React, { useEffect, useState } from 'react';
import api from '../../api';
import Layout from '../../components/Layout';
import { Search, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLevelStyle } from '../../utils/constants';

const AdminQuizzes = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await api.get('/learning/levels');
      const sorted = response.data.sort((a, b) => a.orderIndex - b.orderIndex);
      setLevels(sorted);
    } catch (err) {
      console.error('Failed to fetch levels', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLevels = levels.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Quizzes</h1>
            <p className="text-gray-500">Configure level assessment quizzes, create manually, or generate using AI.</p>
          </div>
        </header>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-gray-500 font-bold">Loading Levels...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredLevels.map((level, i) => {
              const dbColor = level.color;
              const style = getLevelStyle(level.name);
              
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border-2 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  style={{ borderColor: dbColor ? `${dbColor}20` : undefined }}
                  onClick={() => navigate(`/admin/quizzes/levels/${level.id}`)}
                >
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-bl-[5rem] -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: dbColor || style.primary }}
                  ></div>
                  
                  <div className="relative z-10">
                    <div 
                      className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                      style={{ backgroundColor: `${dbColor || style.primary}15`, color: dbColor || style.primary }}
                    >
                      CEFR Level
                    </div>
                    <h3 
                      className="text-5xl font-black mb-2"
                      style={{ color: dbColor || style.primary }}
                    >
                      {level.name}
                    </h3>
                    
                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <HelpCircle size={18} style={{ color: dbColor || style.primary }} />
                        Configure Quizzes
                      </span>
                      <div 
                        className="p-2 rounded-full group-hover:translate-x-1 transition-transform"
                        style={{ backgroundColor: `${dbColor || style.primary}15`, color: dbColor || style.primary }}
                      >
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminQuizzes;
