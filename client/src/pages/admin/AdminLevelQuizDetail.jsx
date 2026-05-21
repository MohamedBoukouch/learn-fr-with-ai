import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';
import { Plus, Sparkles, ChevronLeft, Trash2, Edit2, Loader2, X, Search, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelStyle } from '../../utils/constants';

const AdminLevelQuizDetail = () => {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  // AI Preview state
  const [isAiPreviewOpen, setIsAiPreviewOpen] = useState(false);
  const [aiPreviewQuiz, setAiPreviewQuiz] = useState({ title: '', questions: [] });
  const [aiConfig, setAiConfig] = useState({ questionCount: 5, description: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', questions: [] });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLevelData();
  }, [levelId]);

  const fetchLevelData = async () => {
    try {
      const levelsRes = await api.get('/learning/levels');
      const currentLevel = levelsRes.data.find(l => l.id.toString() === levelId);
      setLevel(currentLevel);
      
      const quizzesRes = await api.get(`/admin/levels/${levelId}/quizzes`);
      setQuizzes(quizzesRes.data);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await api.post('/admin/ai/generate-quizzes', { 
        levelId,
        count: aiConfig.questionCount,
        guide: aiConfig.description
      });
      let generated = response.data;
      if (typeof generated === 'string') {
        generated = JSON.parse(generated);
      }
      
      // Setup preview quiz
      const nextQuizNum = quizzes.length + 1;
      setAiPreviewQuiz({
        title: `Quiz ${nextQuizNum}`,
        questions: generated.map(q => ({
          frenchText: q.frenchText || '',
          type: q.type || 'MCQ',
          options: q.options || ['', '', '', ''],
          correctAnswer: q.correctAnswer || ''
        }))
      });
      
      setIsAiModalOpen(false);
      setIsAiPreviewOpen(true);
    } catch (err) {
      alert('AI Generation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAiPreview = async () => {
    try {
      if (!aiPreviewQuiz.title.trim()) {
        alert('Quiz title is required');
        return;
      }
      // Check that all questions have non-empty values and at least 2 options
      for (let i = 0; i < aiPreviewQuiz.questions.length; i++) {
        const q = aiPreviewQuiz.questions[i];
        if (!q.frenchText.trim()) {
          alert(`Question ${i + 1} text is empty`);
          return;
        }
        if (!q.correctAnswer.trim()) {
          alert(`Question ${i + 1} correct answer is empty`);
          return;
        }
        if (!q.options.includes(q.correctAnswer)) {
          alert(`Question ${i + 1} correct answer must match one of the options`);
          return;
        }
      }

      await api.post(`/admin/levels/${levelId}/quizzes`, aiPreviewQuiz);
      setIsAiPreviewOpen(false);
      fetchLevelData();
    } catch (err) {
      alert('Error saving quiz: ' + err.message);
    }
  };

  const handleManualAddOrEdit = async (e) => {
    e.preventDefault();
    try {
      if (!quizForm.title.trim()) {
        alert('Title is required');
        return;
      }

      if (quizForm.questions.length === 0) {
        alert('At least one question is required');
        return;
      }

      for (let i = 0; i < quizForm.questions.length; i++) {
        const q = quizForm.questions[i];
        if (!q.frenchText.trim()) {
          alert(`Question ${i + 1} text is empty`);
          return;
        }
        if (!q.correctAnswer.trim()) {
          alert(`Question ${i + 1} correct answer is empty`);
          return;
        }
        if (!q.options.includes(q.correctAnswer)) {
          alert(`Question ${i + 1} correct answer must match one of the options`);
          return;
        }
      }

      if (editingQuiz) {
        await api.put(`/admin/quizzes/${editingQuiz.id}`, quizForm);
      } else {
        await api.post(`/admin/levels/${levelId}/quizzes`, quizForm);
      }

      setIsManualModalOpen(false);
      setQuizForm({ title: '', questions: [] });
      setEditingQuiz(null);
      fetchLevelData();
    } catch (err) {
      alert('Error saving quiz: ' + err.message);
    }
  };

  const handleOpenEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title || '',
      questions: quiz.questions ? quiz.questions.map(q => ({
        frenchText: q.frenchText,
        type: q.type,
        options: [...q.options],
        correctAnswer: q.correctAnswer
      })) : []
    });
    setIsManualModalOpen(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All results for this quiz will be lost.')) return;
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      fetchLevelData();
    } catch (err) {
      alert('Error deleting quiz');
    }
  };

  const addEmptyQuestion = (preview = false) => {
    const newQ = {
      frenchText: '',
      type: 'MCQ',
      options: ['', '', '', ''],
      correctAnswer: ''
    };
    if (preview) {
      setAiPreviewQuiz({ ...aiPreviewQuiz, questions: [...aiPreviewQuiz.questions, newQ] });
    } else {
      setQuizForm({ ...quizForm, questions: [...quizForm.questions, newQ] });
    }
  };

  const removeQuestion = (index, preview = false) => {
    if (preview) {
      const updated = aiPreviewQuiz.questions.filter((_, i) => i !== index);
      setAiPreviewQuiz({ ...aiPreviewQuiz, questions: updated });
    } else {
      const updated = quizForm.questions.filter((_, i) => i !== index);
      setQuizForm({ ...quizForm, questions: updated });
    }
  };

  const updateQuestionField = (index, field, val, preview = false) => {
    if (preview) {
      const updated = [...aiPreviewQuiz.questions];
      updated[index][field] = val;
      setAiPreviewQuiz({ ...aiPreviewQuiz, questions: updated });
    } else {
      const updated = [...quizForm.questions];
      updated[index][field] = val;
      setQuizForm({ ...quizForm, questions: updated });
    }
  };

  const updateOptionVal = (qIndex, optIndex, val, preview = false) => {
    if (preview) {
      const updated = [...aiPreviewQuiz.questions];
      updated[qIndex].options[optIndex] = val;
      setAiPreviewQuiz({ ...aiPreviewQuiz, questions: updated });
    } else {
      const updated = [...quizForm.questions];
      updated[qIndex].options[optIndex] = val;
      setQuizForm({ ...quizForm, questions: updated });
    }
  };

  if (loading || !level) return <Layout><div className="p-8">Loading...</div></Layout>;

  const style = getLevelStyle(level.name);

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/quizzes')}
              className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Quizzes for Level {level.name}</h1>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600" style={{ backgroundColor: level.color + '20', color: level.color }}>
                  Assessment
                </span>
              </div>
              <p className="text-gray-500">View and manage multiple level quizzes.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[250px] font-medium"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
              >
                <Sparkles size={20} className="text-yellow-400" />
                AI Generate Quiz
              </button>
              <button 
                onClick={() => {
                  const nextNum = quizzes.length + 1;
                  setQuizForm({
                    title: `Quiz ${nextNum}`,
                    questions: [{
                      frenchText: '',
                      type: 'MCQ',
                      options: ['', '', '', ''],
                      correctAnswer: ''
                    }]
                  });
                  setEditingQuiz(null);
                  setIsManualModalOpen(true);
                }}
                className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-white shadow-lg transition-all"
                style={{ backgroundColor: level.color }}
              >
                <Plus size={20} />
                Add Quiz
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem] opacity-5 -mr-4 -mt-4 transition-transform"
                style={{ backgroundColor: level.color }}
              ></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h3>
                  <p className="text-sm font-medium text-gray-400">{quiz.questions?.length || 0} Questions</p>
                </div>
                <div className="flex gap-1">
                   <button 
                     onClick={() => handleOpenEditQuiz(quiz)}
                     className="p-2 bg-gray-50 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button 
                     onClick={() => handleDeleteQuiz(quiz.id)}
                     className="p-2 bg-gray-50 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-50 pt-4">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Questions Sample</span>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 font-medium">
                  {quiz.questions?.slice(0, 3).map((q, idx) => (
                    <li key={idx} className="truncate">• {q.frenchText}</li>
                  ))}
                  {quiz.questions?.length > 3 && (
                    <li className="text-gray-400 text-xs italic">+ {quiz.questions.length - 3} more questions</li>
                  )}
                </ul>
              </div>
            </motion.div>
          ))}

          {filteredQuizzes.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-gray-400">
               {searchTerm ? `No quizzes matching "${searchTerm}"` : 'No quizzes yet. Click "AI Generate Quiz" or "Add Quiz" to begin.'}
            </div>
          )}
        </div>
      </div>

      {/* AI Generate Prompt Confirmation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAiModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="text-yellow-500" /> AI Quiz Generator
                </h2>
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                <p className="text-gray-500 text-sm">
                  This will scan all learning phrases belonging to domains in level <strong>{level.name}</strong>, and generate a customized multiple choice French assessment.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Number of Questions</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20"
                      value={aiConfig.questionCount}
                      onChange={(e) => setAiConfig({ ...aiConfig, questionCount: parseInt(e.target.value) || 5 })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Custom Rules / Context (Optional)</label>
                    <textarea 
                      placeholder="e.g., Focus on grammar, use specific verbs..."
                      value={aiConfig.description}
                      onChange={(e) => setAiConfig({ ...aiConfig, description: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl font-bold border border-gray-100 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                  Context: Level {level.name} Content
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsAiModalOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAiGenerate}
                    disabled={generating}
                    className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles className="text-yellow-400" size={18} />}
                    {generating ? 'Generating...' : 'Start Generation'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Preview Validation Modal */}
      <AnimatePresence>
        {isAiPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] p-8 shadow-2xl my-8 z-10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Sparkles className="text-yellow-500" /> Validate AI Generated Quiz
                  </h2>
                  <p className="text-gray-400 text-sm">Please review, edit if necessary, and approve the generated content.</p>
                </div>
                <button onClick={() => setIsAiPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Quiz Title</label>
                  <input 
                    type="text" 
                    required
                    value={aiPreviewQuiz.title}
                    onChange={(e) => setAiPreviewQuiz({ ...aiPreviewQuiz, title: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Questions list ({aiPreviewQuiz.questions.length})</h3>
                    <button 
                      type="button" 
                      onClick={() => addEmptyQuestion(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {aiPreviewQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                      <button 
                        type="button" 
                        onClick={() => removeQuestion(qIdx, true)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div>
                        <span className="text-xs font-black text-gray-400 uppercase">Question {qIdx + 1}</span>
                        <input 
                          type="text"
                          required
                          value={q.frenchText}
                          onChange={(e) => updateQuestionField(qIdx, 'frenchText', e.target.value, true)}
                          placeholder="French question text or statement with ___ for blanks"
                          className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center justify-between">
                              Option {optIdx + 1}
                              <button
                                type="button"
                                onClick={() => updateQuestionField(qIdx, 'correctAnswer', opt, true)}
                                className={`text-[10px] font-black px-2 py-0.5 rounded transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              >
                                {q.correctAnswer === opt && opt !== '' ? 'Correct Option' : 'Mark Correct'}
                              </button>
                            </label>
                            <input 
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => updateOptionVal(qIdx, optIdx, e.target.value, true)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="w-full p-3 bg-white border border-gray-100 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Correct Answer:</span>
                        <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                          {q.correctAnswer || 'None selected (Click "Mark Correct" above)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 flex-shrink-0">
                <button 
                  onClick={() => setIsAiPreviewOpen(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveAiPreview}
                  className="flex-1 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl"
                  style={{ backgroundColor: level.color }}
                >
                  <Save size={18} />
                  Validate & Save to DB
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add / Edit Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualModalOpen(false)} className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] p-8 shadow-2xl my-8 z-10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-2xl font-black">{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</h2>
                <button onClick={() => setIsManualModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>

              <form onSubmit={handleManualAddOrEdit} className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Quiz Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Quiz de Niveau A1 - Section 1"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Questions list ({quizForm.questions.length})</h3>
                    <button 
                      type="button" 
                      onClick={() => addEmptyQuestion(false)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {quizForm.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                      <button 
                        type="button" 
                        onClick={() => removeQuestion(qIdx, false)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div>
                        <span className="text-xs font-black text-gray-400 uppercase">Question {qIdx + 1}</span>
                        <input 
                          type="text"
                          required
                          value={q.frenchText}
                          onChange={(e) => updateQuestionField(qIdx, 'frenchText', e.target.value, false)}
                          placeholder="French question text or statement with ___ for blanks"
                          className="w-full mt-2 p-3 bg-white border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center justify-between">
                              Option {optIdx + 1}
                              <button
                                type="button"
                                onClick={() => updateQuestionField(qIdx, 'correctAnswer', opt, false)}
                                className={`text-[10px] font-black px-2 py-0.5 rounded transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              >
                                {q.correctAnswer === opt && opt !== '' ? 'Correct Option' : 'Mark Correct'}
                              </button>
                            </label>
                            <input 
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => updateOptionVal(qIdx, optIdx, e.target.value, false)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="w-full p-3 bg-white border border-gray-100 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Correct Answer:</span>
                        <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                          {q.correctAnswer || 'None selected (Click "Mark Correct" above)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl"
                    style={{ backgroundColor: level.color }}
                  >
                    <Save size={18} />
                    {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminLevelQuizDetail;
