interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  masApiConfigured: boolean;
  environment: string;
  uptimeSeconds: number;
}

export default async function handler(req: any, res: any) {
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';
  const isMasConfigured = masKeyId.trim().length > 0;

  const data: HealthResponse = {
    status: 'ok',
    service: 'singarate-mas-api',
    timestamp: new Date().toISOString(),
    masApiConfigured: isMasConfigured,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(200).json(data);
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(JSON.stringify(data));
}
