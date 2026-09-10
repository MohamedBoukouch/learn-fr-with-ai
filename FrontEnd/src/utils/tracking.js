// Générer un fingerprint simple pour les visiteurs anonymes
const getFingerprint = () => {
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  return btoa(`${screen}|${timezone}|${language}`).substring(0, 32);
};

// Session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};

// Détecter le type d'appareil
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Détecter le navigateur
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};

// Chronomètre
let pageStartTime = Date.now();
let currentPage = window.location.pathname;

// Envoyer au backend
export const sendVisit = async () => {
  const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);

  try {
    await fetch('https://api.eformationmaroc.com/api/tracking/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: currentPage,
        sessionId: getSessionId(),
        fingerprint: getFingerprint(),
        duration: timeSpent,
        referrer: document.referrer || null,
        deviceType: getDeviceType(),
        browser: getBrowser()
      })
    });
  } catch (err) {
    // Silencieux - ne pas bloquer l'utilisateur
  }
};

// Changer de page
export const trackPageView = (newPage) => {
  sendVisit();
  currentPage = newPage;
  pageStartTime = Date.now();
};

// Quitter le site
window.addEventListener('beforeunload', () => {
  sendVisit();
});

// Envoyer périodiquement (toutes les 30s)
setInterval(() => sendVisit(), 30000);