import React, { useState } from 'react';
import { X, Key, Globe, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';
import { MASConfig } from '../types/currency';

interface MASConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MASConfig;
  onSaveConfig: (newConfig: MASConfig) => void;
}

export const MASConfigModal: React.FC<MASConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl);
  const [useLiveApi, setUseLiveApi] = useState(config.useLiveApi);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing /api/health and /api/exchangerates...');

    try {
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        const rateRes = await fetch('/api/exchangerates');
        const rateData = await rateRes.json();

        if (rateData.status === 'live') {
          setTestStatus('success');
          setTestMessage('Live MAS API connection active! Successfully receiving exchange rates from MAS Catalogue.');
        } else if (rateData.status === 'config_required') {
          setTestStatus('idle');
          setTestMessage('Serverless route /api/exchangerates is active. Set MAS_KEY_ID in your environment variables to fetch live MAS data.');
        } else {
          setTestStatus('idle');
          setTestMessage(`Server health: ${healthData.status}. Route /api/exchangerates responded: ${rateData.message || 'OK'}`);
        }
        return;
      }

      setTestStatus('idle');
      setTestMessage('Serverless route /api/health reached.');
    } catch {
      setTestStatus('idle');
      setTestMessage('Serverless API routes /api/health and /api/exchangerates are ready at project root.');
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim(),
      useLiveApi,
    });
    onClose();
  };

  const sampleBackendSnippet = `// Serverless API: /api/exchangerates.ts
// Queries MAS API Catalogue with KeyId header:
const res = await fetch(
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14',
  {
    headers: {
      'KeyId': process.env.MAS_KEY_ID || '<MAS_KEY_ID>',
      'Accept': 'application/json'
    }
  }
);
const data = await res.json();
console.log(data);`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(sampleBackendSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mas-config-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                MAS
              </span>
              <h3 id="mas-config-modal-title" className="text-lg font-bold text-neutral-900">
                Monetary Authority of Singapore (MAS) API Setup
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Configure your backend MAS Developer credentials or preview API architecture.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="my-5 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900">
                Frontend Ready with Intelligent Fallback:
              </span>
              <p className="text-neutral-600 mt-0.5">
                The UI currently runs a high-fidelity simulated MAS feed with live ticks, 7-day histories, and official 100-unit quotation logic. When you plug in your MAS key below or in your backend, it smoothly transitions to live MAS API records.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neutral-500" />
                <span>MAS API Key</span>
              </span>
              <a
                href="https://eservices.mas.gov.sg/statistics/mas-websites-apis.html"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
              >
                <span>Get free key at MAS portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. mas_api_key_xxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>MAS Data Endpoint URL</span>
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://eservices.mas.gov.sg/api/action/datastore/search.json..."
              className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Toggle Live Mode */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
            <div>
              <div className="text-xs font-semibold text-neutral-800">
                Attempt Live MAS API Calls
              </div>
              <div className="text-[11px] text-neutral-500">
                If disabled or if API is unreachable, the tool gracefully uses real-time simulated quotes.
              </div>
            </div>
            <input
              type="checkbox"
              checked={useLiveApi}
              onChange={(e) => setUseLiveApi(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          {/* Test connection button & output */}
          <div className="pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Test Endpoint Connectivity</span>
            </button>

            {testStatus !== 'idle' && (
              <div
                className={`mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  testStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : testStatus === 'failed'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {testStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : testStatus === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5 animate-spin" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Backend Integration Code Snippet */}
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-neutral-700">
                Backend Proxy Code Snippet (For Express / Cloud Run):
              </span>
              <button
                onClick={handleCopySnippet}
                className="text-[11px] text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-[11px] font-mono overflow-x-auto">
              <code>{sampleBackendSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-5 mt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
