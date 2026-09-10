import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock3,
  Download,
  AlertTriangle,
  Award,
  ChevronRight,
  X,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  FileCheck,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import api from "../api";
import Layout from "../components/Layout";
import CertificateDocument from "../components/CertificateDocument";
import { getLevelStyle } from "../utils/constants";

// Levels that have DB-backed content (Pre-A1 content is frontend-only)
const CERTIFIABLE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_TITLES_FR = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Intermédiaire Avancé",
  C1: "Avancé",
  C2: "Maîtrise",
};

const STATUS_BADGE = {
  PENDING: {
    bg: "bg-amber-50 border-amber-200 text-amber-700",
    Icon: Clock3,
    dot: "bg-amber-500",
  },
  APPROVED: {
    bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    Icon: CheckCircle2,
    dot: "bg-emerald-500",
  },
  REJECTED: {
    bg: "bg-rose-50 border-rose-200 text-rose-700",
    Icon: XCircle,
    dot: "bg-rose-500",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Certificates() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [levels, setLevels] = useState([]);
  const [certMap, setCertMap] = useState({}); // levelId → latest request
  const [loading, setLoading] = useState(true);

  // Detail panel state
  const [selected, setSelected] = useState(null); // level object
  const [levelData, setLevelData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [certRequest, setCertRequest] = useState(null); // latest request for selected level

  // Request form state
  const [learnerName, setLearnerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // PDF generation
  const [downloading, setDownloading] = useState(false);

  // ── Fetch all levels + certificate requests ────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const levelsRes = await api.get("/learning/levels");
      const filtered = levelsRes.data.filter((l) =>
        CERTIFIABLE_LEVELS.includes(l.name),
      );
      setLevels(filtered);
    } catch (err) {
      console.error("Failed to fetch levels", err);
    }

    try {
      const certsRes = await api.get("/student/certificates");
      const map = {};
      for (const cert of certsRes.data || []) {
        map[cert.levelId] = cert;
      }
      setCertMap(map);
    } catch (err) {
      console.warn("Certificate endpoint not available yet:", err.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Open level detail ──────────────────────────────────────────────────
  const openLevel = async (level) => {
    setSelected(level);
    setLevelData(null);
    setLoadingDetail(true);
    setSubmitted(false);
    setLearnerName(localStorage.getItem("userName") || "");

    setCertRequest(certMap[level.id] || null);

    const [levelRes, certRes] = await Promise.allSettled([
      api.get(`/student/levels/${level.id}/details`),
      api.get(`/student/certificates/level/${level.id}`),
    ]);

    if (levelRes.status === "fulfilled") {
      setLevelData(levelRes.value.data);
    } else {
      console.error("Failed to fetch level details", levelRes.reason);
      setLevelData({ domains: [], quizzes: [], overallProgress: 0 });
    }

    if (certRes.status === "fulfilled") {
      setCertRequest(certRes.value.data);
    }

    setLoadingDetail(false);
  };

  // ── Close panel ───────────────────────────────────────────────────────────
  const closePanel = () => {
    setSelected(null);
    setLevelData(null);
    setCertRequest(null);
    setSubmitted(false);
  };

  // ── Eligibility check ─────────────────────────────────────────────────────
  const getEligibility = (data) => {
    if (!data)
      return {
        eligible: false,
        contentOk: false,
        quizzesOk: false,
        hasContent: false,
      };
    const hasContent = data.domains && data.domains.length > 0;
    const contentOk = data.overallProgress >= 100;
    const quizzesOk =
      data.quizzes.length === 0 ||
      data.quizzes.every((q) => q.completed && q.lastScore >= 70);
    return {
      eligible: hasContent && contentOk && quizzesOk,
      contentOk,
      quizzesOk,
      hasContent,
    };
  };

  // ── Submit certificate request ────────────────────────────────────────────
  const handleSubmitRequest = async () => {
    if (!learnerName.trim() || !selected) return;
    setSubmitting(true);
    try {
      const res = await api.post("/student/certificates", {
        levelId: selected.id,
        learnerName: learnerName.trim(),
      });
      setCertRequest(res.data);
      setSubmitted(true);
      await fetchData();
    } catch (err) {
      console.error("Failed to submit certificate request", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!certRequest || !selected) return;
    setDownloading(true);

    const host = document.createElement("div");
    host.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1123px;height:794px;overflow:visible;z-index:-9999;pointer-events:none;";
    document.body.appendChild(host);
    const portalRoot = createRoot(host);

    try {
      // Render component and wait for images to load
      await new Promise((resolve) => {
        portalRoot.render(
          <CertificateDocument
            learnerName={certRequest.learnerName}
            levelName={selected.name}
            completionDate={formatDate(certRequest.approvedAt)}
            certificateId={certRequest.certificateId}
          />,
        );

        // Wait for all images to load
        const images = host.querySelectorAll("img");
        let loadedCount = 0;
        const totalImages = images.length;

        if (totalImages === 0) {
          resolve();
          return;
        }

        const checkAllLoaded = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            // Extra delay to ensure rendering is complete
            setTimeout(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
              });
            }, 200);
          }
        };

        images.forEach((img) => {
          if (img.complete) {
            checkAllLoaded();
          } else {
            img.onload = checkAllLoaded;
            img.onerror = checkAllLoaded; // Continue even if image fails
          }
        });
      });

      // Ensure fonts are loaded
      await document.fonts.ready;

      const certEl = host.firstElementChild;

      const canvas = await html2canvas(certEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 1123,
        height: 794,
        allowTaint: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Remove Tailwind stylesheets but keep Google Fonts
          clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
            const href = el.getAttribute("href") || "";
            if (
              !href.includes("fonts.googleapis.com") &&
              !href.includes("fonts.gstatic.com")
            ) {
              el.remove();
            }
          });

          // Fix image rendering in clone
          const clonedImages = clonedDoc.querySelectorAll("img");
          clonedImages.forEach((img) => {
            // Ensure crossOrigin is set
            img.crossOrigin = "anonymous";

            // Force the image to maintain aspect ratio
            img.style.objectFit = "contain";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.display = "block";

            // Find the cachet container and ensure proper sizing
            const parent = img.parentElement;
            if (parent) {
              parent.style.display = "flex";
              parent.style.alignItems = "center";
              parent.style.justifyContent = "center";
              parent.style.overflow = "hidden";
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1123, 794],
        hotfixes: ["px_scaling"],
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, 1123, 794, undefined, "FAST");
      pdf.save(`Certificat-${selected.name}-${certRequest.learnerName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      portalRoot.unmount();
      if (document.body.contains(host)) document.body.removeChild(host);
      setDownloading(false);
    }
  };

  // ── Format date ───────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const eligibility = getEligibility(levelData);

  return (
    <Layout>
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="max-w-6xl mx-auto pb-20 space-y-10"
      >
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <header className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={36} />
            {t("cert_page_title")}
          </h1>
          <p className="text-gray-500 text-lg">{t("cert_page_desc")}</p>
        </header>

        {/* ── Levels grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => {
            const style = getLevelStyle(level.name);
            const dbColor = level.color;
            const cert = certMap[level.id];
            const badge = cert ? STATUS_BADGE[cert.status] : null;
            const isApproved = cert?.status === "APPROVED";

            return (
              <motion.div
                key={level.id}
                whileHover={{ y: -8, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  onClick={() => openLevel(level)}
                  className={`w-full text-left p-7 rounded-[2rem] border-2 transition-all relative overflow-hidden group ${
                    isApproved
                      ? "bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/20 border-amber-300 shadow-md shadow-amber-100/50 hover:shadow-2xl hover:shadow-amber-200/70"
                      : `${style.bg} border-transparent shadow-sm hover:shadow-xl`
                  }`}
                  style={
                    !isApproved && dbColor
                      ? { borderColor: `${dbColor}25` }
                      : undefined
                  }
                >
                  {/* Watermarks & sparkles for approved cards */}
                  {isApproved && (
                    <>
                      <div className="absolute top-4 right-14 text-amber-300/40 pointer-events-none group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                        <Sparkles size={36} fill="currentColor" />
                      </div>
                      <div className="absolute bottom-10 left-6 text-emerald-300/30 pointer-events-none group-hover:-translate-y-2 transition-transform duration-500">
                        <Sparkles size={20} fill="currentColor" />
                      </div>
                      {/* Subtle diagonal stripe overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/[0.02] to-amber-500/0 pointer-events-none" />
                    </>
                  )}

                  {/* Level badge */}
                  <div className="relative mb-5 flex items-center justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg relative ${
                        isApproved ? "ring-4 ring-amber-200/50" : ""
                      }`}
                      style={{ backgroundColor: dbColor || style.primary }}
                    >
                      {level.name}
                      {isApproved && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-full p-0.5 shadow-md">
                          <Sparkles size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    {isApproved && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="text-amber-500 drop-shadow-sm opacity-95"
                      >
                        <Award size={32} className="fill-amber-100/40" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <h3
                      className="text-2xl font-black"
                      style={{ color: dbColor || style.primary }}
                    >
                      Niveau {level.name}
                    </h3>
                    {isApproved && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                        Réussi ! 🎉
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4 font-medium">
                    {LEVEL_TITLES_FR[level.name]}
                  </p>

                  {/* Certificate status pill */}
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-black text-white shadow-sm shadow-emerald-100 border-0">
                      <CheckCircle2 size={13} className="animate-pulse" />
                      Félicitations • Certifié
                    </span>
                  ) : badge ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${badge.bg}`}
                    >
                      <badge.Icon size={13} />
                      {t(`cert_status_${cert.status.toLowerCase()}`)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-gray-200 text-xs font-bold text-gray-500">
                      <Award size={13} />
                      Certificat disponible
                    </span>
                  )}

                  <ChevronRight
                    className="absolute bottom-7 ltr:right-7 rtl:left-7 opacity-20 group-hover:opacity-80 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all"
                    size={28}
                    style={{ color: dbColor || style.primary }}
                  />
                  <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:-mr-8 rtl:-ml-8 -mt-8 w-36 h-36 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Detail panel (full-screen modal) ─────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 0.99, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Modal header */}
              <div
                className="rounded-t-[2.5rem] p-7 text-white relative overflow-hidden"
                style={{ backgroundColor: selected.color || "#1A3A5C" }}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
                        {selected.name}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">
                          Niveau {selected.name}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {LEVEL_TITLES_FR[selected.name]}
                        </p>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">
                      Attestation de Réussite — E-Formation Maroc
                    </p>
                  </div>
                  <button
                    onClick={closePanel}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-7 space-y-6">
                {/* ── Loading ────────────────────────────────────────────── */}
                {loadingDetail && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2
                      className="animate-spin text-indigo-600"
                      size={32}
                    />
                  </div>
                )}

                {!loadingDetail &&
                  levelData &&
                  (() => {
                    // Case: no DB content for this level
                    if (!eligibility.hasContent) {
                      return (
                        <div className="text-center py-10">
                          <AlertTriangle
                            className="mx-auto mb-4 text-amber-500"
                            size={40}
                          />
                          <p className="font-bold text-gray-700">
                            {t("cert_no_domains")}
                          </p>
                        </div>
                      );
                    }

                    // Case: certificate APPROVED — show download
                    if (certRequest?.status === "APPROVED") {
                      return (
                        <div className="space-y-6">
                          {/* Success banner */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                            <CheckCircle2
                              className="text-emerald-600 flex-shrink-0 mt-0.5"
                              size={22}
                            />
                            <div>
                              <p className="font-bold text-emerald-800">
                                {t("cert_approved_title")}
                              </p>
                              <p className="text-emerald-700 text-sm mt-1">
                                {t("cert_approved_desc", {
                                  level: selected.name,
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Certificate preview (scaled) */}
                          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 flex justify-center">
                            <div
                              style={{
                                width: "1123px",
                                height: "794px",
                                transform: "scale(0.58)",
                                transformOrigin: "top center",
                                marginBottom: "-333px",
                              }}
                            >
                              <CertificateDocument
                                learnerName={certRequest.learnerName}
                                levelName={selected.name}
                                completionDate={formatDate(
                                  certRequest.approvedAt,
                                )}
                                certificateId={certRequest.certificateId}
                              />
                            </div>
                          </div>

                          {/* Download button */}
                          <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                          >
                            {downloading ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                {t("cert_downloading")}
                              </>
                            ) : (
                              <>
                                <Download size={20} />
                                {t("cert_download_btn")}
                              </>
                            )}
                          </button>
                        </div>
                      );
                    }

                    // Case: PENDING
                    if (certRequest?.status === "PENDING") {
                      return (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                          <Clock3
                            className="text-amber-600 flex-shrink-0 mt-0.5"
                            size={22}
                          />
                          <div>
                            <p className="font-bold text-amber-800">
                              {t("cert_pending_title")}
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                              {t("cert_pending_desc")}
                            </p>
                            <p className="text-xs text-amber-500 mt-2 font-mono">
                              {certRequest.certificateId}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // Case: REJECTED or no request yet
                    const isRejected = certRequest?.status === "REJECTED";

                    return (
                      <div className="space-y-6">
                        {/* Rejection banner */}
                        {isRejected && (
                          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                            <XCircle
                              className="text-rose-600 flex-shrink-0 mt-0.5"
                              size={20}
                            />
                            <div>
                              <p className="font-bold text-rose-800 text-sm">
                                {t("cert_rejected_title")}
                              </p>
                              <p className="text-rose-700 text-xs mt-1">
                                {t("cert_rejected_desc")}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Eligibility checklist */}
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                          <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4">
                            Conditions d'éligibilité
                          </h4>

                          {/* Content check */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl ${eligibility.contentOk ? "bg-emerald-50" : "bg-rose-50"}`}
                          >
                            {eligibility.contentOk ? (
                              <CheckCircle2
                                className="text-emerald-600 flex-shrink-0"
                                size={18}
                              />
                            ) : (
                              <XCircle
                                className="text-rose-500 flex-shrink-0"
                                size={18}
                              />
                            )}
                            <div>
                              <p
                                className={`text-sm font-semibold ${eligibility.contentOk ? "text-emerald-800" : "text-rose-800"}`}
                              >
                                {eligibility.contentOk
                                  ? t("cert_content_ok")
                                  : t("cert_content_incomplete")}
                              </p>
                              {!eligibility.contentOk && (
                                <p className="text-xs text-rose-500 mt-0.5">
                                  Progression :{" "}
                                  {Math.round(levelData.overallProgress)}%
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quizzes check */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl ${
                              levelData.quizzes.length === 0
                                ? "bg-slate-100"
                                : eligibility.quizzesOk
                                  ? "bg-emerald-50"
                                  : "bg-rose-50"
                            }`}
                          >
                            {levelData.quizzes.length === 0 ? (
                              <Award
                                className="text-slate-400 flex-shrink-0"
                                size={18}
                              />
                            ) : eligibility.quizzesOk ? (
                              <CheckCircle2
                                className="text-emerald-600 flex-shrink-0"
                                size={18}
                              />
                            ) : (
                              <XCircle
                                className="text-rose-500 flex-shrink-0"
                                size={18}
                              />
                            )}
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  levelData.quizzes.length === 0
                                    ? "text-slate-500"
                                    : eligibility.quizzesOk
                                      ? "text-emerald-800"
                                      : "text-rose-800"
                                }`}
                              >
                                {levelData.quizzes.length === 0
                                  ? t("cert_no_quizzes")
                                  : eligibility.quizzesOk
                                    ? t("cert_quizzes_ok")
                                    : t("cert_quizzes_incomplete")}
                              </p>
                              {levelData.quizzes.length > 0 &&
                                !eligibility.quizzesOk && (
                                  <div className="mt-1 space-y-0.5">
                                    {levelData.quizzes.map((q) => (
                                      <p
                                        key={q.id}
                                        className="text-xs text-rose-400"
                                      >
                                        {q.title} —{" "}
                                        {q.completed
                                          ? `${q.lastScore}%`
                                          : "Non tenté"}
                                      </p>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* ── Request form (eligible only) ─────────────────── */}
                        {eligibility.eligible && (
                          <div className="space-y-5">
                            {/* Price info */}
                            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles
                                  className="text-amber-600"
                                  size={18}
                                />
                                <p className="font-black text-amber-800 text-sm">
                                  {t("cert_price_title")}
                                </p>
                              </div>
                              <p className="text-amber-700 text-sm leading-relaxed">
                                {t("cert_price_desc")}
                              </p>
                            </div>

                            {/* Name input */}
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">
                                {t("cert_name_label")}
                              </label>

                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-3">
                                <AlertTriangle
                                  className="text-amber-600 flex-shrink-0 mt-0.5"
                                  size={15}
                                />
                                <p className="text-xs text-amber-700 leading-relaxed">
                                  {t("cert_name_warning")}
                                </p>
                              </div>

                              <input
                                type="text"
                                value={learnerName}
                                onChange={(e) => setLearnerName(e.target.value)}
                                placeholder={t("cert_name_placeholder")}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
                              />
                            </div>

                            {/* Submit / submitted */}
                            {submitted ? (
                              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
                                <FileCheck
                                  className="text-indigo-600 flex-shrink-0 mt-0.5"
                                  size={20}
                                />
                                <div>
                                  <p className="font-bold text-indigo-800">
                                    {t("cert_sent_title")}
                                  </p>
                                  <p className="text-indigo-600 text-sm mt-1">
                                    {t("cert_sent_desc")}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={handleSubmitRequest}
                                disabled={!learnerName.trim() || submitting}
                                className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl"
                                style={{
                                  backgroundColor: selected.color || "#1A3A5C",
                                }}
                              >
                                {submitting ? (
                                  <>
                                    <Loader2
                                      size={20}
                                      className="animate-spin"
                                    />
                                    Envoi en cours...
                                  </>
                                ) : (
                                  <>
                                    <GraduationCap size={20} />
                                    {t("cert_request_btn")}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}