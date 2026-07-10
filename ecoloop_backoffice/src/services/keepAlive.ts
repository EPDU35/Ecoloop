/**
 * keepAlive.ts
 * Ping les services Render toutes les 10 minutes pour réduire les cold starts.
 * ⚠️  LIMITATION : ce ping ne fonctionne que si le backoffice est ouvert dans
 *     un navigateur. Pour une garantie permanente, configurer un cron externe :
 *     UptimeRobot (gratuit) ou GitHub Actions schedule.
 * Render Free suspend un service après 15 min d'inactivité.
 */

const SERVICES = [
  'https://ecoloop-backend-s1vd.onrender.com/health',
  'https://ecoloop-ai-s1vd.onrender.com/api/health',
];

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let intervalId: ReturnType<typeof setInterval> | null = null;

async function pingAll() {
  await Promise.allSettled(
    SERVICES.map((url) =>
      fetch(url, { method: 'GET', mode: 'no-cors' }).catch(() => null)
    )
  );
}

export function startKeepAlive() {
  if (intervalId) return;
  pingAll(); // ping immédiat au démarrage
  intervalId = setInterval(pingAll, INTERVAL_MS);
}

export function stopKeepAlive() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
