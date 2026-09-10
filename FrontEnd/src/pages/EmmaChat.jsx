import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Settings,
  Sparkles,
  Send,
  RotateCcw,
  Volume2,
  Compass,
  Award,
  Lightbulb,
  BookOpen,
  AlertCircle,
  HelpCircle,
  User,
  CheckCircle,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  Headphones,
  GraduationCap,
  Zap,
  Star,
} from "lucide-react";

const EmmaChat = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  // Configuration State
  const [domain, setDomain] = useState("daily_life");
  const [customDomain, setCustomDomain] = useState("");
  const [level, setLevel] = useState("B1");
  const [chatActive, setChatActive] = useState(false);

  // Conversation & AI State
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // Mobile layout & inline feedback state
  const [activeTab, setActiveTab] = useState("chat");
  const [hasNewFeedback, setHasNewFeedback] = useState(false);
  const [expandedFeedbackIds, setExpandedFeedbackIds] = useState({});
  const [showMobileFeedback, setShowMobileFeedback] = useState(false);

  // Speech Recognition (Speech-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const transcriptRef = useRef("");

  const toggleMessageFeedback = (msgId) => {
    setExpandedFeedbackIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // MediaRecorder Fallback State
  const [useMediaRecorder, setUseMediaRecorder] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);

  const predefinedDomains = [
    {
      key: "daily_life",
      label: t("emma_domain_daily_life"),
      icon: "🏠",
      desc: t("emma_domain_daily_life_desc"),
    },
    {
      key: "travel",
      label: t("emma_domain_travel"),
      icon: "✈️",
      desc: t("emma_domain_travel_desc"),
    },
    {
      key: "work",
      label: t("emma_domain_work"),
      icon: "💼",
      desc: t("emma_domain_work_desc"),
    },
    {
      key: "job_interview",
      label: t("emma_domain_job_interview"),
      icon: "👔",
      desc: t("emma_domain_job_interview_desc"),
    },
    {
      key: "school_studies",
      label: t("emma_domain_school"),
      icon: "🎓",
      desc: t("emma_domain_school_desc"),
    },
    {
      key: "it",
      label: t("emma_domain_it"),
      icon: "💻",
      desc: t("emma_domain_it_desc"),
    },
  ];

  const levelsList = [
    {
      code: "A1",
      name: "A1",
      fullName: t("emma_level_a1"),
      desc: t("emma_level_a1_desc"),
      color: "from-emerald-400 to-teal-500",
    },
    {
      code: "A2",
      name: "A2",
      fullName: t("emma_level_a2"),
      desc: t("emma_level_a2_desc"),
      color: "from-blue-400 to-cyan-500",
    },
    {
      code: "B1",
      name: "B1",
      fullName: t("emma_level_b1"),
      desc: t("emma_level_b1_desc"),
      color: "from-indigo-400 to-purple-500",
    },
    {
      code: "B2",
      name: "B2",
      fullName: t("emma_level_b2"),
      desc: t("emma_level_b2_desc"),
      color: "from-purple-400 to-pink-500",
    },
    {
      code: "C1",
      name: "C1",
      fullName: t("emma_level_c1"),
      desc: t("emma_level_c1_desc"),
      color: "from-orange-400 to-red-500",
    },
    {
      code: "C2",
      name: "C2",
      fullName: t("emma_level_c2"),
      desc: t("emma_level_c2_desc"),
      color: "from-red-400 to-rose-500",
    },
  ];

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const isEdge = navigator.userAgent.toLowerCase().includes("edg");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !isEdge) {
      setSpeechSupported(true);
      setUseMediaRecorder(false);
    } else {
      setSpeechSupported(true);
      setUseMediaRecorder(true);
    }

    // Initialize AudioContext after first user interaction (iOS fix)
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });

    return () => {
      document.removeEventListener('click', initAudioContext);
      document.removeEventListener('touchstart', initAudioContext);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingResponse]);

  // Handle Speech-to-Text start/stop dynamically on-demand
  const toggleListening = async () => {
    if (useMediaRecorder) {
      handleMediaRecorderToggle();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setSpeechError("");
    transcriptRef.current = "";

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "fr-FR";
      rec.onstart = () => {
        setIsListening(true);
        setSpeechError("");
      };
      rec.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i] && event.results[i][0])
            transcript += event.results[i][0].transcript;
        }
        setUserInput(transcript);
        transcriptRef.current = transcript;
      };
      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setSpeechError(e.error || t("emma_unknown_error"));
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      setSpeechError(t("emma_mic_error"));
      setIsListening(false);
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' });
      if (status.state === 'denied') {
        setSpeechError(t("emma_mic_blocked"));
        return false;
      }
      return true;
    } catch (e) {
      // Fallback for browsers that don't support permissions.query
      return true;
    }
  };

  const handleMediaRecorderToggle = async () => {
    if (isListening) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Check microphone permission before requesting access
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    try {
      setSpeechError("");
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstart = () => setIsListening(true);
      mediaRecorder.onstop = async () => {
        setIsListening(false);
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(",")[1];
          try {
            setIsTranscribing(true);
            const res = await api.post("/student/chat/transcribe", {
              audioData: base64data,
              mimeType: "audio/webm",
            });
            setUserInput((prev) => prev + (prev ? " " : "") + res.data.text);
          } catch (err) {
            setSpeechError(t("emma_audio_transcription_error"));
          } finally {
            setIsTranscribing(false);
          }
        };
      };
      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone error:", err);
      if (err.name === 'NotAllowedError') {
        setSpeechError(t("emma_mic_blocked"));
      } else if (err.name === 'NotFoundError') {
        setSpeechError(t("emma_mic_not_found"));
      } else if (err.name === 'NotReadableError') {
        setSpeechError(t("emma_mic_in_use"));
      } else {
        setSpeechError(t("emma_mic_error"));
      }
      setIsListening(false);
    }
  };

  // Handle TTS
  const speakText = (text, messageId) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95;

    utterance.onstart = () => setSpeakingMessageId(messageId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  const startConversation = async () => {
    const finalDomain = domain === "custom" ? customDomain : domain;
    if (!finalDomain.trim()) {
      alert(t("emma_enter_conversation_domain"));
      return;
    }

    setChatActive(true);
    setLoadingResponse(true);

    try {
      const response = await api.post("/student/chat", {
        domain: finalDomain,
        level: level,
        message: t("emma_start_prompt"),
        history: [],
      });

      setMessages([
        {
          id: 1,
          role: "assistant",
          content: response.data.reply,
        },
      ]);
      speakText(response.data.reply, 1);
      if (response.data.feedback) {
        setLastFeedback(response.data.feedback);
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("emma_connection_error");
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: errMsg,
        },
      ]);
    } finally {
      setLoadingResponse(false);
    }
  };

  const sendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride !== null ? textOverride : userInput;
    if (!textToSend.trim() || loadingResponse) return;

    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    transcriptRef.current = "";

    const userMsgText = textToSend;
    setUserInput("");

    const userMsgId = Date.now();

    const newMessages = [
      ...messages,
      { id: userMsgId, role: "user", content: userMsgText },
    ];
    setMessages(newMessages);
    setLoadingResponse(true);

    const historyPayload = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const finalDomain = domain === "custom" ? customDomain : domain;

    try {
      const response = await api.post("/student/chat", {
        domain: finalDomain,
        level: level,
        message: userMsgText,
        history: historyPayload,
      });

      const replyId = Date.now() + 1;

      setMessages((prev) =>
        prev
          .map((msg) => {
            if (msg.id === userMsgId) {
              return { ...msg, feedback: response.data.feedback };
            }
            return msg;
          })
          .concat([
            { id: replyId, role: "assistant", content: response.data.reply },
          ]),
      );

      speakText(response.data.reply, replyId);
      if (response.data.feedback) {
        setLastFeedback(response.data.feedback);
        if (activeTab !== "feedback") {
          setHasNewFeedback(true);
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("emma_reply_error");
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: errMsg },
      ]);
    } finally {
      setLoadingResponse(false);
    }
  };

  const resetChat = () => {
    setChatActive(false);
    setMessages([]);
    setLastFeedback(null);
    setActiveTab("chat");
    setHasNewFeedback(false);
    setExpandedFeedbackIds({});
    setShowMobileFeedback(false);
    window.speechSynthesis.cancel();
    if (isListening) recognitionRef.current.stop();
  };

  return (
    <Layout>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {!chatActive ? (
            /* CONFIGURATION SCREEN */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-10 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                      <GraduationCap size={40} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                        {t("emma_practice_title")}
                      </h1>
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                        {t("emma_practice_desc")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-10 space-y-8">
                  {/* Domain Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Compass size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {t("emma_choose_context")}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {t("emma_select_theme")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {predefinedDomains.map((d) => (
                        <button
                          key={d.key}
                          onClick={() => {
                            setDomain(d.key);
                            setCustomDomain("");
                          }}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                            domain === d.key
                              ? "border-indigo-600 bg-indigo-50 shadow-indigo-100"
                              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
                          }`}
                        >
                          <div className="flex flex-col items-start gap-2">
                            <span className="text-2xl">{d.icon}</span>
                            <div className="text-left">
                              <p className="font-semibold text-sm text-slate-900">
                                {d.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {d.desc}
                              </p>
                            </div>
                          </div>
                          {domain === d.key && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 bg-white text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {t("or_customize")}
                        </span>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={t("emma_custom_domain_placeholder")}
                      value={customDomain}
                      onChange={(e) => {
                        setDomain("custom");
                        setCustomDomain(e.target.value);
                      }}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl outline-none transition-all font-medium text-sm ${
                        domain === "custom"
                          ? "border-indigo-600 ring-4 ring-indigo-50"
                          : "border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                      }`}
                    />
                  </div>

                  {/* Level Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {t("emma_your_level")}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {t("emma_select_level")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {levelsList.map((lvl) => (
                        <button
                          key={lvl.code}
                          onClick={() => setLevel(lvl.code)}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            level === lvl.code
                              ? "border-transparent shadow-lg scale-[1.02]"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                          }`}
                        >
                          {level === lvl.code && (
                            <div
                              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${lvl.color} opacity-10`}
                            ></div>
                          )}
                          <div className="relative z-10">
                            <div
                              className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                                level === lvl.code
                                  ? `bg-gradient-to-br ${lvl.color} text-white shadow-lg`
                                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                              }`}
                            >
                              {lvl.code}
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {lvl.fullName}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-tight">
                              {lvl.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={startConversation}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Zap
                      size={20}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    {t("emma_start_conversation")}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex gap-6 h-[calc(100vh-5rem)]">
              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden min-w-0">
                {/* Chat Header */}
                <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={resetChat}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft size={18} className="text-slate-600" />
                      </button>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-xl">👩‍🏫</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                          Emma
                        </h2>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          <p className="text-xs text-slate-500">
                            {t("emma_online_teacher")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200">
                        <Award size={14} />
                        {level}
                      </span>
                      <button
                        onClick={() => {
                          setChatActive(false);
                          window.speechSynthesis.cancel();
                          if (isListening) recognitionRef.current.stop();
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={t("settings")}
                      >
                        <Settings size={18} className="text-slate-600" />
                      </button>
                      <button
                        onClick={() =>
                          setShowMobileFeedback(!showMobileFeedback)
                        }
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                      >
                        <BookOpen size={18} className="text-slate-600" />
                        {hasNewFeedback && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isAssistant = msg.role === "assistant";
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start gap-2 sm:gap-3 ${
                            isAssistant ? "" : "flex-row-reverse"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                              isAssistant
                                ? "bg-gradient-to-br from-indigo-400 to-purple-500"
                                : "bg-gradient-to-br from-slate-700 to-slate-800"
                            }`}
                          >
                            {isAssistant ? (
                              <span className="text-lg">👩‍🏫</span>
                            ) : (
                              <User size={16} className="text-white" />
                            )}
                          </div>

                          <div
                            className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isAssistant ? "" : "items-end"}`}
                          >
                            <div
                              className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm leading-relaxed ${
                                isAssistant
                                  ? "bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-sm"
                                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-md shadow-md"
                              }`}
                            >
                              {msg.content}
                            </div>

                            {isAssistant && (
                              <button
                                onClick={() => speakText(msg.content, msg.id)}
                                className={`mt-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                  speakingMessageId === msg.id
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                              >
                                <Volume2 size={12} />
                                {speakingMessageId === msg.id
                                  ? t("emma_playing")
                                  : t("speak")}
                              </button>
                            )}

                            {msg.role === "user" && msg.feedback && (
                              <button
                                onClick={() => toggleMessageFeedback(msg.id)}
                                className="mt-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors flex items-center gap-1.5 border border-amber-200"
                              >
                                <Sparkles size={12} />
                                {expandedFeedbackIds[msg.id]
                                  ? t("hide")
                                  : t("see_correction")}
                              </button>
                            )}

                            {expandedFeedbackIds[msg.id] && msg.feedback && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 w-full bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 space-y-3 text-xs"
                              >
                                {msg.feedback.comprehension && (
                                  <div>
                                    <p className="font-semibold text-emerald-700 mb-1">
                                      {t("emma_comprehension")}
                                    </p>
                                    <p className="text-slate-700">
                                      {msg.feedback.comprehension}
                                    </p>
                                  </div>
                                )}
                                {msg.feedback.reformulation && (
                                  <div>
                                    <p className="font-semibold text-indigo-700 mb-1">
                                      {t("emma_reformulation")}
                                    </p>
                                    <p className="text-slate-700">
                                      {msg.feedback.reformulation}
                                    </p>
                                  </div>
                                )}
                                {msg.feedback.suggestion && (
                                  <div>
                                    <p className="font-semibold text-amber-700 mb-1">
                                      {t("emma_suggestion")}
                                    </p>
                                    <p className="text-slate-700">
                                      {msg.feedback.suggestion}
                                    </p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {loadingResponse && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-lg">👩‍🏫</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <div
                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-white">
                  {isListening && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-indigo-600 font-medium">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      {t("emma_recording_in_progress")}
                    </div>
                  )}

                  {speechError && (
                    <div className="mb-2 text-xs text-red-600 font-medium flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      {speechError}
                    </div>
                  )}

                  <form
                    onSubmit={sendMessage}
                    className="flex items-center gap-2"
                  >
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2.5 sm:p-3 rounded-xl transition-all flex-shrink-0 ${
                          isListening
                            ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
                            : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                    )}

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={t("emma_write_message")}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={loadingResponse || isTranscribing}
                        className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none transition-all text-sm disabled:opacity-50
                          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white
                          placeholder:text-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !userInput.trim() || loadingResponse || isTranscribing
                      }
                      className="p-2.5 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Sidebar - Desktop */}
              <div className="hidden lg:flex flex-col w-80 xl:w-96 gap-4 flex-shrink-0">
                {/* Feedback Panel */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <Star size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {t("emma_feedback_title")}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {t("emma_realtime_corrections")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {lastFeedback ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Votre message
                          </p>
                          <p className="text-sm text-slate-700 italic">
                            "{lastFeedback.userMessage}"
                          </p>
                        </div>

                        {lastFeedback.comprehension && (
                          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <CheckCircle size={14} />
                              Compréhension
                            </p>
                            <p className="text-sm text-slate-700">
                              {lastFeedback.comprehension}
                            </p>
                          </div>
                        )}

                        {lastFeedback.reformulation && (
                          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Sparkles size={14} />
                              Reformulation
                            </p>
                            <p className="text-sm text-slate-700">
                              {lastFeedback.reformulation}
                            </p>
                          </div>
                        )}

                        {lastFeedback.suggestion && (
                          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Lightbulb size={14} />
                              Suggestion
                            </p>
                            <p className="text-sm text-slate-700">
                              {lastFeedback.suggestion}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                          <MessageSquare size={32} className="text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-700 mb-2">
                          En attente
                        </p>
                        <p className="text-sm text-slate-500 max-w-xs">
                          Envoyez un message pour recevoir des corrections et
                          suggestions personnalisées
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Zap size={20} className="text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-white">Astuces</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-sm text-slate-300">
                        <span className="text-indigo-400 font-bold">1.</span>
                        <span>
                          Utilisez des phrases complètes pour un meilleur
                          apprentissage
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm text-slate-300">
                        <span className="text-indigo-400 font-bold">2.</span>
                        <span>
                          N'ayez pas peur des erreurs, Emma est là pour vous
                          aider
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm text-slate-300">
                        <span className="text-indigo-400 font-bold">3.</span>
                        <span>
                          Utilisez le microphone pour pratiquer votre
                          prononciation
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mobile Feedback Modal */}
              <AnimatePresence>
                {showMobileFeedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setShowMobileFeedback(false)}
                  >
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 200,
                      }}
                      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Star size={20} className="text-indigo-600" />
                            <h3 className="font-bold text-slate-900">
                              Feedback d'Emma
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowMobileFeedback(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg"
                          >
                            <X size={20} className="text-slate-600" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        {lastFeedback ? (
                          <>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Votre message
                              </p>
                              <p className="text-sm text-slate-700 italic">
                                "{lastFeedback.userMessage}"
                              </p>
                            </div>

                            {lastFeedback.comprehension && (
                              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                                  Compréhension
                                </p>
                                <p className="text-sm text-slate-700">
                                  {lastFeedback.comprehension}
                                </p>
                              </div>
                            )}

                            {lastFeedback.reformulation && (
                              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                                  Reformulation
                                </p>
                                <p className="text-sm text-slate-700">
                                  {lastFeedback.reformulation}
                                </p>
                              </div>
                            )}

                            {lastFeedback.suggestion && (
                              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                                  Suggestion
                                </p>
                                <p className="text-sm text-slate-700">
                                  {lastFeedback.suggestion}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-slate-500">
                              Aucun feedback disponible pour le moment
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmmaChat;
