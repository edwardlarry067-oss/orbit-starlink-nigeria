export default async function handler(req, res) {
  const BACKEND = 'https://orbit-starlink-nigeria--edwardlarry067.replit.app';

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(BACKEND + '/api/healthz', {
      signal: controller.signal,
      headers: { 'User-Agent': 'OrbitFuture-KeepAlive/1.0' }
    });
    clearTimeout(timeout);

    const data = await response.json();
    const latency = Date.now() - start;

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true,
      latency_ms: latency,
      backend: data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    const latency = Date.now() - start;
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: false,
      latency_ms: latency,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
