import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Quiz = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/domain/${domainId}`);
        setQuiz(response.data);
      } catch (err) {
        console.error('Failed to fetch quiz', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [domainId]);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/quizzes/${quiz.id}/submit`, answers);
      setResult(response.data);
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Chargement du quiz...</div>;
  if (!quiz) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-gray-500">Aucun quiz disponible pour ce domaine.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">Retour</button>
      </div>
    </Layout>
  );

  if (result) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100"
          >
            {result.passed ? (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-6 rounded-full mb-6">
                  <Trophy className="w-16 h-16 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Félicitations !</h1>
                <p className="text-gray-500 text-lg mb-8">Vous avez réussi le quiz avec un score de {result.score}%</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-red-100 p-6 rounded-full mb-6">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Presque !</h1>
                <p className="text-gray-500 text-lg mb-8">Votre score est de {result.score}%. Le score de passage est de 80%.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-sm text-gray-400">Correctes</p>
                <p className="text-2xl font-bold text-gray-900">{result.correctCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900">{result.totalQuestions}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <RotateCcw size={20} />
                Réessayer
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Retour au tableau de bord
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const question = quiz.questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-bold text-gray-900">Quiz: {quiz.title || 'Validation du domaine'}</h1>
          <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            {currentIndex + 1} / {quiz.questions.length}
          </div>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100"
        >
          <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-4">Question</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-relaxed">
            {question.frenchText}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium flex items-center justify-between ${
                  answers[question.id] === option
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                }`}
              >
                {option}
                {answers[question.id] === option && <CheckCircle2 className="text-blue-600" size={20} />}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-between mt-12">
          <button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-8 py-4 rounded-2xl font-bold text-gray-400 disabled:opacity-30"
          >
            Précédent
          </button>

          {currentIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={!answers[question.id]}
              className="px-10 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              Suivant
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!answers[question.id]}
              className="px-10 py-4 rounded-2xl font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              Terminer le Quiz
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
