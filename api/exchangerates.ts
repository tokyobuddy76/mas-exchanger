const MAS_API_BASE =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

export interface ExchangeRatesApiResponse {
  success: boolean;
  status: 'live' | 'config_required' | 'error';
  message?: string;
  end_of_day: string;
  source: string;
  masApiConfigured: boolean;
  data?: unknown;
  records?: unknown[];
}

export default async function handler(req: any, res: any) {
  // Extract query parameters from URL
  const host = req.headers?.host || 'localhost';
  const urlObj = new URL(req.url || '', `http://${host}`);
  const queryParams = Object.fromEntries(urlObj.searchParams.entries());

  // Default to query param end_of_day or requested default date
  const endOfDay = queryParams.end_of_day || req.query?.end_of_day || '2026-10-14';

  // Read MAS KeyId from environment variable or request headers (do not hardcode)
  const headerKey =
    (req.headers?.['keyid'] as string) ||
    (req.headers?.['key-id'] as string) ||
    (req.headers?.['x-api-key'] as string) ||
    queryParams.key_id ||
    '';

  const masKeyId = (process.env.MAS_KEY_ID || process.env.MAS_API_KEY || headerKey).trim();

  // Helper function to respond
  const sendResponse = (statusCode: number, data: ExchangeRatesApiResponse) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      res.status(statusCode).json(data);
      return;
    }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.end(JSON.stringify(data));
  };

  // If KeyId is not configured, inform caller cleanly without failing abruptly
  if (!masKeyId) {
    return sendResponse(200, {
      success: false,
      status: 'config_required',
      masApiConfigured: false,
      message:
        'MAS_KEY_ID is not configured. Please set the MAS_KEY_ID environment variable in your server environment or .env file, or provide the KeyId header.',
      end_of_day: endOfDay,
      source: 'MAS Exchange Rates End of Period Daily View',
    });
  }

  // Construct MAS target URL
  const masUrl = new URL(MAS_API_BASE);
  masUrl.searchParams.set('end_of_day', endOfDay);
  const limit = queryParams.limit || req.query?.limit;
  if (limit) {
    masUrl.searchParams.set('limit', String(limit));
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const masResponse = await fetch(masUrl.toString(), {
      method: 'GET',
      headers: {
        KeyId: masKeyId,
        Accept: 'application/json',
        'User-Agent': 'SingaRate-MAS-Client/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      return sendResponse(masResponse.status, {
        success: false,
        status: 'error',
        masApiConfigured: true,
        message: `MAS API responded with HTTP ${masResponse.status}: ${errorText || masResponse.statusText}`,
        end_of_day: endOfDay,
        source: masUrl.toString(),
      });
    }

    const payload: any = await masResponse.json();

    return sendResponse(200, {
      success: true,
      status: 'live',
      masApiConfigured: true,
      end_of_day: endOfDay,
      source: masUrl.toString(),
      data: payload,
      records: payload?.result?.records || payload?.data || payload?.records || [],
    });
  } catch (error: any) {
    const isAbort = error?.name === 'AbortError';
    return sendResponse(502, {
      success: false,
      status: 'error',
      masApiConfigured: true,
      message: isAbort
        ? 'Connection to MAS API timed out after 10 seconds.'
        : `Network error connecting to MAS API: ${error?.message || 'Unknown error'}`,
      end_of_day: endOfDay,
      source: masUrl.toString(),
    });
  }
}
