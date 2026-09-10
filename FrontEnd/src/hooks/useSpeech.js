import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeech(lang = 'fr-FR') {
  const [activeId, setActiveId] = useState(null);
  const activeIdRef = useRef(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    activeIdRef.current = null;
    setActiveId(null);
  }, []);

  const speak = useCallback((text, options = {}) => {
    const { rate = 1, id = text } = typeof options === 'number'
      ? { rate: options, id: text }
      : options;

    if (activeIdRef.current === id) {
      stop();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    utterance.onstart = () => {
      activeIdRef.current = id;
      setActiveId(id);
    };
    utterance.onend = () => {
      if (activeIdRef.current === id) {
        activeIdRef.current = null;
        setActiveId(null);
      }
    };
    utterance.onerror = () => {
      if (activeIdRef.current === id) {
        activeIdRef.current = null;
        setActiveId(null);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [lang, stop]);

  const isSpeaking = useCallback((id) => activeId === id, [activeId]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, isSpeaking, speaking: activeId !== null, activeId };
}
