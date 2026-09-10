import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Target } from 'lucide-react';

const MatchingGame = ({ pairs, onComplete }) => {
  const [leftItems, setLeftItems] = useState(
    pairs.map((p, i) => ({ ...p, id: i, matched: false }))
  );
  const [rightItems, setRightItems] = useState(
    pairs.map((p, i) => ({ id: i, french: p.french, arabic: p.arabic, matched: false })).sort(() => Math.random() - 0.5)
  );
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const checkMatch = (leftId, rightId) => {
    if (leftId === rightId) {
      setLeftItems(prev => prev.map(l => l.id === leftId ? { ...l, matched: true } : l));
      setRightItems(prev => prev.map(r => r.id === leftId ? { ...r, matched: true } : r));
      setFeedback({ type: 'correct', message: 'Excellent!' });
      
      const allMatched = leftItems.every(l => l.matched || l.id === leftId);
      if (allMatched) {
        setTimeout(() => onComplete && onComplete(), 1000);
      }
      setTimeout(() => setFeedback(null), 1000);
    } else {
      setFeedback({ type: 'incorrect', message: 'Try again!' });
      setTimeout(() => setFeedback(null), 1000);
    }
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleSelect = (item, side) => {
    if (side === 'left') {
      setSelectedLeft(item.id);
    } else {
      setSelectedRight(item.id);
    }
  };

  // Check for match when both selections are made
  React.useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      checkMatch(selectedLeft, selectedRight);
    }
  }, [selectedLeft, selectedRight]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900">Match the Pairs!</h2>
        <p className="text-gray-500 font-medium">Tap a French word, then tap its translation</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - French */}
        <div className="space-y-4">
          {leftItems.map((item) => (
<motion.button
               key={`left-${item.id}`}
               whileTap={{ scale: 0.95 }}
               onClick={() => !item.matched && handleSelect(item, 'left')}
               disabled={item.matched}
               className={`w-full p-6 rounded-3xl border-2 transition-all font-black text-2xl ${
                 item.matched 
                   ? 'border-green-500 bg-green-50 text-green-700' 
                   : selectedLeft === item.id
                   ? 'border-pink-500 bg-pink-50 text-pink-700'
                   : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50/30'
               }`}
             >
              {item.french}
            </motion.button>
          ))}
        </div>

        {/* Right Column - Arabic */}
        <div className="space-y-4">
          {rightItems.map((item) => (
<motion.button
               key={`right-${item.id}`}
               whileTap={{ scale: 0.95 }}
               onClick={() => !item.matched && handleSelect(item, 'right')}
               disabled={item.matched}
               className={`w-full p-6 rounded-3xl border-2 transition-all font-bold text-2xl text-right ${
                 item.matched 
                   ? 'border-green-500 bg-green-50 text-green-700' 
                   : selectedRight === item.id
                   ? 'border-pink-500 bg-pink-50 text-pink-700'
                   : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50/30'
               }`}
               dir="rtl"
             >
              {item.arabic}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-center py-4 px-6 rounded-2xl font-black text-lg ${
              feedback.type === 'correct' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
          >
            {feedback.type === 'correct' ? <Check className="inline mr-2 -mb-1" /> : <X className="inline mr-2 -mb-1" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchingGame;