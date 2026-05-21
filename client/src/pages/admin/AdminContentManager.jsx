import React, { useEffect, useState } from 'react';
import api from '../../api';
import Layout from '../../components/Layout';
import { Plus, Search, ChevronRight, Settings2, Trash2, X, Palette, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLevelStyle } from '../../utils/constants';

const AdminContentManager = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6', orderIndex: 0 });
  const navigate = useNavigate();

  const colorPresets = [
    '#EC4899', // Pink
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#F97316', // Orange
    '#8B5CF6', // Purple
    '#FFD700', // Gold
    '#6366F1', // Indigo
    '#EF4444', // Red
    '#6B7280', // Gray
  ];

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await api.get('/learning/levels');
      // Sort by orderIndex
      const sorted = response.data.sort((a, b) => a.orderIndex - b.orderIndex);
      setLevels(sorted);
    } catch (err) {
      console.error('Failed to fetch levels', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (level = null) => {
    if (level) {
      setEditingLevel(level);
      setFormData({ name: level.name, color: level.color || '#3B82F6', orderIndex: level.orderIndex });
    } else {
      setEditingLevel(null);
      setFormData({ name: '', color: '#3B82F6', orderIndex: levels.length });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLevel) {
        await api.put(`/admin/levels/${editingLevel.id}`, formData);
      } else {
        await api.post('/learning/levels', formData);
      }
      setIsModalOpen(false);
      fetchLevels();
    } catch (err) {
      alert('Error saving level');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure? This will delete all domains and phrases in this level!')) {
      try {
        await api.delete(`/admin/levels/${id}`);
        fetchLevels();
      } catch (err) {
        alert('Error deleting level');
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Content</h1>
            <p className="text-gray-500">Explore and edit CEFR levels, domains, and phrases.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} />
            Add Level
          </button>
        </header>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredLevels.map((level, i) => {
            // Use DB color if exists, else fallback to name mapping
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
                onClick={() => navigate(`/admin/content/levels/${level.id}`)}
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
                  <p className="text-gray-400 font-medium">{level.domains?.length || 0} Domains</p>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Manage Domains</span>
                    <div 
                      className="p-2 rounded-full group-hover:translate-x-1 transition-transform"
                      style={{ backgroundColor: `${dbColor || style.primary}15`, color: dbColor || style.primary }}
                    >
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-1 transition-opacity">
                  <button 
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(level); }}
                  >
                    <Settings2 size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    onClick={(e) => handleDelete(level.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal for Add/Edit Level */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingLevel ? 'Edit Level' : 'New Level'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Level Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pre-A1"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Palette size={14} /> Level Color
                    </label>
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      {colorPresets.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({...formData, color})}
                          className={`h-10 rounded-xl transition-all ${formData.color === color ? 'ring-4 ring-offset-2 ring-gray-200 scale-110 shadow-lg' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                       <input 
                         type="color" 
                         value={formData.color}
                         onChange={(e) => setFormData({...formData, color: e.target.value})}
                         className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                       />
                       <input 
                         type="text"
                         value={formData.color}
                         onChange={(e) => setFormData({...formData, color: e.target.value})}
                         className="flex-1 bg-transparent font-mono text-sm uppercase outline-none"
                       />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Order Index</label>
                    <input
                      type="number"
                      required
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 mt-4"
                  >
                    <Save size={20} />
                    {editingLevel ? 'Save Changes' : 'Create Level'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminContentManager;
