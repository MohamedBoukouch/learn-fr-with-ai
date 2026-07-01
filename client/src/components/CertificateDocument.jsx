// CertificateDocument.jsx
// ============================================================
// E-Formation Maroc - Premium Professional Certificate Document
// Optimized for A4 Landscape print & high-fidelity PDF output
// ============================================================

import React from "react";
import cachetSvgText from "../assets/images/cachet_eformationmaroc.svg?raw";

const CERT_COLORS = {
  A1: { primary: "#0F2C59", light: "#F3F6FA", dark: "#0A1E3F" },
  A2: { primary: "#0B4A2C", light: "#F2F7F4", dark: "#062E1B" },
  B1: { primary: "#6D4C13", light: "#FAF7F2", dark: "#4D350B" },
  B2: { primary: "#802C1A", light: "#FDF5F2", dark: "#5C1D0F" },
  C1: { primary: "#2D0F4E", light: "#F6F2FC", dark: "#1D0A33" },
  C2: { primary: "#8B0000", light: "#FCF2F2", dark: "#5A0000" },
  DEFAULT: { primary: "#0F2C59", light: "#F3F6FA", dark: "#0A1E3F" },
};

const LEVEL_TITLES = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Intermédiaire Avancé",
  C1: "Avancé",
  C2: "Maîtrise",
};

const GOLD_COLOR = "#C5A880";
const TITLE_FONT = '"Playfair Display", "Georgia", serif';
const BODY_FONT = '"Inter", "Helvetica", "Arial", sans-serif';

// Custom vector corner ornaments
const CornerOrnament = ({ position, color = GOLD_COLOR }) => {
  const isTop = position.includes("top");
  const isLeft = position.includes("left");

  const style = {
    position: "absolute",
    width: "45px",
    height: "45px",
    [isTop ? "top" : "bottom"]: "10px",
    [isLeft ? "left" : "right"]: "10px",
    opacity: 0.85,
    pointerEvents: "none",
    zIndex: 5,
  };

  // Calculate rotation angle based on corner
  let angle = 0;
  if (isTop && !isLeft) angle = 90;      // top-right
  if (!isTop && !isLeft) angle = 180;    // bottom-right
  if (!isTop && isLeft) angle = 270;     // bottom-left

  return (
    <svg style={style} viewBox="0 0 40 40" fill="none">
      <g transform={`rotate(${angle} 20 20)`}>
        <path d="M 0 0 L 40 0 M 0 0 L 0 40" stroke={color} strokeWidth="3" />
        <path d="M 6 6 L 30 6 M 6 6 L 6 30" stroke={color} strokeWidth="1" />
        <circle cx="16" cy="16" r="3.5" fill={color} />
      </g>
    </svg>
  );
};

// Custom laurel wreath shield watermark
const CrestWatermark = ({ color }) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "520px",
      height: "520px",
      opacity: 0.035,
      pointerEvents: "none",
      zIndex: 0,
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
      <path d="M50 5 L85 20 C85 65 50 92 50 92 C50 92 15 65 15 20 Z" stroke={color} strokeWidth="2" />
      <path d="M50 10 L80 24 C80 60 50 85 50 85 C50 85 20 60 20 24 Z" stroke={color} strokeWidth="0.75" strokeDasharray="2,2" />
      <path d="M50 32 L72 42 L50 52 L28 42 Z" fill={color} />
      <path d="M37 46 L37 57 C37 62 50 66 50 66 C50 66 63 62 63 57 L63 46" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="50" cy="42" r="2.5" fill="#ffffff" />
      <path d="M 22 55 Q 30 75 50 78 Q 70 75 78 55" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  </div>
);

// Academy Crest at the top
const AcademyCrest = ({ primaryColor, goldColor = GOLD_COLOR }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "16px", zIndex: 2 }}>
    <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
      <path
        d="M50 8 L82 22 C82 62 50 88 50 88 C50 88 18 62 18 22 Z"
        fill={primaryColor}
        stroke={goldColor}
        strokeWidth="2.5"
      />
      <path
        d="M50 13 L77 25 C77 58 50 81 50 81 C50 81 23 58 23 25 Z"
        fill="none"
        stroke={goldColor}
        strokeWidth="1"
        strokeDasharray="2,2"
      />
      <path d="M50 30 L70 38 L50 46 L30 38 Z" fill={goldColor} />
      <path d="M36 41 L36 51 C36 55 50 59 50 59 C50 59 64 55 64 51 L64 41" stroke={goldColor} strokeWidth="2.5" fill="none" />
      <circle cx="50" cy="21" r="2" fill={goldColor} />
      <circle cx="42" cy="22" r="1.5" fill={goldColor} />
      <circle cx="58" cy="22" r="1.5" fill={goldColor} />
    </svg>
  </div>
);

const CertificateDocument = React.forwardRef(function CertificateDocument(
  { learnerName, levelName, completionDate, certificateId },
  ref
) {
  const colors = CERT_COLORS[levelName] || CERT_COLORS["DEFAULT"];
  const levelTitle = LEVEL_TITLES[levelName] || levelName;
  const primary = colors.primary;
  const primaryLight = colors.light;

  return (
    <div
      ref={ref}
      id="certificate-document"
      dir="ltr"
      style={{
        width: "1123px",
        height: "794px",
        backgroundColor: "#ffffff",
        border: `12px solid ${primary}`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: BODY_FONT,
        boxSizing: "border-box",
      }}
    >
      {/* Background Gradient & Watermark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle, #ffffff 60%, ${primaryLight} 100%)`,
          zIndex: 0,
        }}
      />
      <CrestWatermark color={primary} />

      {/* Decorative inner frame */}
      <div
        style={{
          margin: "12px",
          border: `2px solid ${GOLD_COLOR}`,
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 60px 40px",
          boxSizing: "border-box",
          zIndex: 1,
        }}
      >
        {/* Corner Ornaments */}
        <CornerOrnament position="top-left" />
        <CornerOrnament position="top-right" />
        <CornerOrnament position="bottom-left" />
        <CornerOrnament position="bottom-right" />

        {/* Header Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <AcademyCrest primaryColor={primary} />
          
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: GOLD_COLOR,
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "8px",
              fontFamily: BODY_FONT,
              zIndex: 2,
            }}
          >
            E-Formation Maroc
          </div>

          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: primary,
              letterSpacing: "3px",
              marginBottom: "12px",
              fontFamily: TITLE_FONT,
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            Attestation de Réussite
          </div>

          {/* Golden Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "280px",
              gap: "10px",
              marginBottom: "16px",
              zIndex: 2,
            }}
          >
            <div style={{ height: "1px", backgroundColor: GOLD_COLOR, flex: 1, opacity: 0.6 }} />
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <polygon points="5,0 10,5 5,10 0,5" fill={GOLD_COLOR} />
            </svg>
            <div style={{ height: "1px", backgroundColor: GOLD_COLOR, flex: 1, opacity: 0.6 }} />
          </div>
        </div>

        {/* Recipient & Achievement Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", zIndex: 2 }}>
          <div
            style={{
              fontSize: "16px",
              color: "#555",
              fontStyle: "italic",
              fontFamily: TITLE_FONT,
              marginBottom: "6px",
            }}
          >
            Cette attestation est fièrement décernée à
          </div>

          <div
            style={{
              fontSize: "44px",
              fontWeight: "700",
              color: primary,
              fontFamily: '"Cormorant Garamond", "Playfair Display", serif',
              marginBottom: "12px",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "8px",
              textAlign: "center",
              minWidth: "460px",
              maxWidth: "85%",
              wordBreak: "break-word",
            }}
          >
            {learnerName}
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#555",
              marginBottom: "12px",
              fontWeight: "400",
              lineHeight: "1.6",
              textAlign: "center",
              maxWidth: "750px",
            }}
          >
            pour avoir complété et validé avec succès l'ensemble des modules requis, ainsi que les épreuves d'évaluation pour le niveau d'apprentissage
          </div>

          {/* Level Badge Layout */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: primary,
                fontFamily: TITLE_FONT,
                letterSpacing: "1.5px",
              }}
            >
              Niveau {levelName}
            </div>
            <div
              style={{
                fontSize: "17px",
                color: GOLD_COLOR,
                fontWeight: "600",
                letterSpacing: "1px",
                marginTop: "2px",
              }}
            >
              — {levelTitle} —
            </div>
          </div>


        </div>

        {/* Footer, Verification, Stamp and Signatures Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            zIndex: 2,
            marginTop: "auto",
            padding: "0 10px",
            boxSizing: "border-box",
          }}
        >
          {/* Metadata Block (Left) */}
          <div
            style={{
              textAlign: "left",
              fontSize: "12px",
              color: "#666",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "250px",
            }}
          >
            <div>
              <span style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "10px", letterSpacing: "1px", color: primary, display: "block", marginBottom: "2px" }}>
                Date d'obtention
              </span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#333" }}>{completionDate}</span>
            </div>
            <div>
              <span style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "10px", letterSpacing: "1px", color: primary, display: "block", marginBottom: "2px" }}>
                Identifiant unique
              </span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.5px", color: "#444" }}>{certificateId}</span>
            </div>
          </div>

          {/* Verification Box / QR Code Placeholder (Center) */}
          {/* <div
            style={{
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "10px 14px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "280px",
              boxSizing: "border-box",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={GOLD_COLOR} strokeWidth="2" />
              <path d="M9 11l2 2 4-4" stroke={GOLD_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", color: GOLD_COLOR, letterSpacing: "0.5px" }}>
                Certificat Officiel
              </div>
              <div style={{ fontSize: "9px", color: "#888", lineHeight: "1.3" }}>
                Vérification en ligne disponible sur :<br />
                <span style={{ color: "#333", fontWeight: "500" }}>eformationmaroc.com/verify</span>
              </div>
            </div>
          </div> */}

          {/* Signature Block (Right) */}
          <div
            style={{
              textAlign: "center",
              width: "250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Elegant Vector Signature */}
            <div style={{ height: "45px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px" }}>
              <svg width="130" height="40" viewBox="0 0 130 40" fill="none">
                <path
                  d="M10 25 Q35 5 55 22 T95 17 T120 12 M28 32 Q48 12 73 27"
                  stroke={primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  style={{ opacity: 0.85 }}
                />
              </svg>
            </div>
            
            <div
              style={{
                width: "160px",
                height: "1px",
                backgroundColor: "#E2E8F0",
                marginBottom: "6px",
              }}
            />
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: primary,
                letterSpacing: "0.5px",
                fontFamily: BODY_FONT,
              }}
            >
              Direction Pédagogique
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#888",
                marginTop: "2px",
              }}
            >
              E-Formation Maroc
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* OFFICIAL CACHET (STAMP) - Vector Inline SVG */}
      {/* ============================================================ */}
      <div
        className="cachet-container"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "170px",
          width: "170px",
          height: "170px",
          opacity: 0.82,
          transform: "rotate(-12deg)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
        dangerouslySetInnerHTML={{
          __html: cachetSvgText
            .replace(/width="\d+"/, 'width="100%"')
            .replace(/height="\d+"/, 'height="100%"'),
        }}
      />
    </div>
  );
});

export default CertificateDocument;