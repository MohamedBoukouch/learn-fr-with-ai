import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { API_BASE_URL } from "../api";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { ChevronLeft, Search, BookOpen, PlayCircle } from "lucide-react";
import { getLevelStyle } from "../utils/constants";

const LevelDetail = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLevelDetails = async () => {
      try {
        const response = await api.get(`/student/levels/${levelId}/details`);
        setLevelData(response.data);
      } catch (err) {
        console.error("Failed to fetch level details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLevelDetails();
  }, [levelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!levelData)
    return (
      <div className="p-8 text-center font-bold text-gray-500">
        {t("level_not_found")}
      </div>
    );

  const style = getLevelStyle(levelData.name);
  const dbColor = levelData.color;

  const filteredDomains = levelData.domains.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Layout>
      <div
        className="max-w-6xl mx-auto space-y-10 pb-20"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header with Progress */}
        <header className="space-y-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold group"
          >
            <ChevronLeft
              size={20}
              className="group-hover:ltr:-translate-x-1 group-hover:rtl:translate-x-1 rtl:rotate-180 transition-transform"
            />
            {t("back_to_dashboard")}
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl"
                style={{ backgroundColor: dbColor || style.primary }}
              >
                {levelData.name}
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                  {t("level")} {levelData.name}
                </h1>
                <p className="text-gray-500 text-lg">{t("level_card_desc")}</p>
              </div>
            </div>

            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {t("progress_global")}
                </span>
                <span
                  className="text-lg font-black"
                  style={{ color: dbColor || style.primary }}
                >
                  {Math.round(levelData.overallProgress)}%
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelData.overallProgress}%` }}
                  className="h-full rounded-full shadow-sm"
                  style={{ backgroundColor: dbColor || style.primary }}
                />
              </div>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search
              className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t("search_domain")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-medium"
            />
          </div>

          {/* Domains Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDomains.map((domain) => (
              <motion.div key={domain.id} whileHover={{ y: -5 }}>
                <Link
                  to={`/dashboard/domains/${domain.id}`}
                  className="block bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all overflow-hidden group"
                >
                  <div className="h-48 relative overflow-hidden">
                    {domain.imageUrl ? (
                      <img
                        src={`${API_BASE_URL}${domain.imageUrl}`}
                        alt={domain.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <BookOpen className="text-gray-200" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <h3 className="text-white text-xl font-bold">
                        {domain.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>
                          {t("phrases_count", {
                            completed: domain.completedPhrases,
                            total: domain.totalPhrases,
                          })}
                        </span>
                        <span>{Math.round(domain.progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${domain.progress}%` }}
                          className="h-full"
                          style={{ backgroundColor: dbColor || style.primary }}
                        />
                      </div>
                    </div>
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                      <PlayCircle size={18} />
                      {t("learn")}
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LevelDetail;
