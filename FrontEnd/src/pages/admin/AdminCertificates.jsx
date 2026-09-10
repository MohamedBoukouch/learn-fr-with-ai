import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import api from "../../api";
import Layout from "../../components/Layout";
import CertificateDocument from "../../components/CertificateDocument";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock3,
  Download,
  Eye,
  X,
  Search,
  Filter,
  GraduationCap,
  User,
  Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const STATUS_CONFIG = {
  PENDING: { label: "En attente", color: "amber", Icon: Clock3 },
  APPROVED: { label: "Approuvé", color: "emerald", Icon: CheckCircle2 },
  REJECTED: { label: "Refusé", color: "rose", Icon: XCircle },
};

const STATUS_BADGE = {
  PENDING: "bg-amber-50  text-amber-700  border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50   text-rose-700   border-rose-200",
};

export default function AdminCertificates() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [previewReq, setPreviewReq] = useState(null);
  const [actionLoading, setActLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/certificates");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch certificate requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setActLoading(id + "-approve");
    try {
      await api.put(`/admin/certificates/${id}/approve`);
      await fetchRequests();
    } finally {
      setActLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActLoading(id + "-reject");
    try {
      await api.put(`/admin/certificates/${id}/reject`);
      await fetchRequests();
    } finally {
      setActLoading(null);
    }
  };

  const formatDateFr = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  const handleDownloadPDF = async (req) => {
    const host = document.createElement("div");
    host.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1123px;height:794px;overflow:visible;z-index:-9999;pointer-events:none;";
    document.body.appendChild(host);
    const portalRoot = createRoot(host);
    try {
      await new Promise((resolve) => {
        portalRoot.render(
          <CertificateDocument
            learnerName={req.learnerName}
            levelName={req.levelName}
            completionDate={formatDateFr(req.approvedAt || req.requestedAt)}
            certificateId={req.certificateId}
          />,
        );
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await document.fonts.ready;

      const certEl = host.firstElementChild;
      const canvas = await html2canvas(certEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 1123,
        height: 794,
        onclone: (clonedDoc) => {
          // Keep Google Fonts (Playfair Display etc.), remove only Tailwind (oklch)
          clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
            const href = el.getAttribute("href") || "";
            if (
              !href.includes("fonts.googleapis.com") &&
              !href.includes("fonts.gstatic.com")
            ) {
              el.remove();
            }
          });
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1123, 794],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 1123, 794);
      pdf.save(`Certificat-${req.levelName}-${req.learnerName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      portalRoot.unmount();
      if (document.body.contains(host)) document.body.removeChild(host);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.learnerName?.toLowerCase().includes(q) ||
      r.userName?.toLowerCase().includes(q) ||
      r.levelName?.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={32} />
            Certificats
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les demandes de certificat des apprenants.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = requests.filter((r) => r.status === s).length;
            return (
              <div
                key={s}
                className={`bg-${cfg.color}-50 border border-${cfg.color}-200 rounded-2xl p-4 flex items-center gap-4`}
              >
                <cfg.Icon className={`text-${cfg.color}-600`} size={24} />
                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-wider text-${cfg.color}-600`}
                  >
                    {cfg.label}
                  </p>
                  <p className={`text-3xl font-black text-${cfg.color}-900`}>
                    {count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email, niveau..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "ALL" ? "Tous" : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold">Aucune demande trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Apprenant",
                      "Nom certificat",
                      "Niveau",
                      "Statut",
                      "Demandé le",
                      "Validé le",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-black text-gray-400 uppercase tracking-wider px-6 py-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, i) => {
                    const cfg =
                      STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                    return (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm">
                              {req.userName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {req.userName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {req.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800 text-sm">
                            {req.learnerName}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {req.certificateId}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black text-white"
                            style={{ backgroundColor: "#1A3A5C" }}
                          >
                            {req.levelName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_BADGE[req.status]}`}
                          >
                            <cfg.Icon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(req.requestedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(req.approvedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewReq(req)}
                              className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="Aperçu"
                            >
                              <Eye size={16} />
                            </button>
                            {req.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  disabled={!!actionLoading}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                >
                                  {actionLoading === req.id + "-approve"
                                    ? "..."
                                    : "Approuver"}
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={!!actionLoading}
                                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50 transition-colors"
                                >
                                  {actionLoading === req.id + "-reject"
                                    ? "..."
                                    : "Refuser"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewReq(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Aperçu du certificat
                  </h3>
                  <p className="text-sm text-gray-400">
                    {previewReq.learnerName} — Niveau {previewReq.levelName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {previewReq.status === "APPROVED" && (
                    <button
                      onClick={() => handleDownloadPDF(previewReq)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      <Download size={16} />
                      Télécharger PDF
                    </button>
                  )}
                  <button
                    onClick={() => setPreviewReq(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Certificate preview (scaled to fit modal) */}
              <div className="p-6 bg-gray-50 flex justify-center items-center overflow-auto">
                <div
                  style={{
                    transform: "scale(0.72)",
                    transformOrigin: "top center",
                    height: "572px",
                  }}
                >
                  <CertificateDocument
                    learnerName={previewReq.learnerName}
                    levelName={previewReq.levelName}
                    completionDate={new Date(
                      previewReq.approvedAt || previewReq.requestedAt,
                    ).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    certificateId={previewReq.certificateId}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
