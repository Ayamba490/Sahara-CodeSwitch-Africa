import React, { useState } from 'react';
import {
  KeyRound,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Activity,
  AlertCircle,
  Settings2,
} from 'lucide-react';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(currentKey);
  const [endpointInput, setEndpointInput] = useState<string>('https://voice.intron.io/api/v1/transcribe');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    pingMs?: number;
    endpoint?: string;
  } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({
        tested: true,
        valid: false,
        message: 'Please paste your Sahara API key or access token first.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/sahara/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim(),
          endpointUrl: endpointInput.trim(),
        }),
      });

      const data = await res.json();
      setTestResult({
        tested: true,
        valid: Boolean(data.valid),
        message: data.message || (data.valid ? 'Sahara Voice API connection verified!' : 'Connection rejected.'),
        pingMs: data.pingMs,
        endpoint: data.endpointVerified,
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        valid: false,
        message: `Network verification failed: ${err?.message || 'Server error'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveKey(apiKeyInput.trim());
    if (typeof window !== 'undefined' && endpointInput.trim()) {
      localStorage.setItem('sahara_endpoint_override', endpointInput.trim());
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-lg w-full p-6 space-y-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FAF8F5] border border-black/20 flex items-center justify-center text-[#F27D26]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black italic text-black">
              Sahara Voice API Gateway
            </h3>
            <p className="text-xs text-stone-600">
              Official Intron Health Token & Live Pipeline Verification
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-stone-700 bg-[#FAF8F5] p-3 border border-black/10">
          <div className="flex items-center space-x-1.5 text-black font-bold uppercase tracking-wider text-[10px]">
            <Activity className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>End-to-End Execution Notice</span>
          </div>
          <p className="leading-relaxed">
            When an API token is provided, the application routes audio directly to Intron Health’s cloud ASR cluster (<code className="font-mono text-[11px] bg-white px-1 border border-black/10">voice.intron.io</code>) for live transcription.
          </p>
          <p className="text-stone-500 text-[11px]">
            Without an API token, the platform runs in <strong>Calibrated Afriswitch Evaluation Mode</strong>, serving pre-recorded empirical test splits with exact word-level Levenshtein alignments.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700 block">
                Sahara Access Token / API Key
              </label>
              <a
                href="https://voice.intron.io"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#F27D26] font-bold hover:underline inline-flex items-center"
              >
                voice.intron.io <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="sh_live_..."
              className="w-full bg-[#FAF8F5] border border-black/30 p-2.5 text-xs text-black font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          {/* Test connection row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-bold uppercase tracking-wider text-stone-600 hover:text-black flex items-center space-x-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Advanced URL' : 'Advanced Endpoint'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-black/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
            >
              <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#F27D26]' : 'text-stone-700'}`} />
              <span>{isTesting ? 'Pinging Sahara...' : 'Test API Connection'}</span>
            </button>
          </div>

          {/* Advanced Endpoint Config */}
          {showAdvanced && (
            <div className="space-y-1.5 p-3 bg-stone-50 border border-black/15 animate-fadeIn">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-600 block">
                ASR Endpoint URL Override
              </label>
              <input
                type="text"
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="https://voice.intron.io/api/v1/transcribe"
                className="w-full bg-white border border-black/20 p-2 text-[11px] text-stone-900 font-mono focus:outline-none focus:border-black"
              />
              <span className="text-[10px] text-stone-500 block">
                Default: <code className="font-mono">https://voice.intron.io/api/v1/transcribe</code> (auto-fallbacks to <code className="font-mono">speech.intron.health</code>).
              </span>
            </div>
          )}

          {/* Diagnostic Result Banner */}
          {testResult && (
            <div
              className={`p-3 border text-xs leading-relaxed ${
                testResult.valid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {testResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {testResult.valid ? 'Handshake Successful' : 'Verification Diagnostic'}
                    {testResult.pingMs ? ` (${testResult.pingMs}ms latency)` : ''}
                  </div>
                  <p className="text-[11px] mt-0.5">{testResult.message}</p>
                  {testResult.endpoint && (
                    <div className="text-[10px] font-mono text-emerald-700 mt-1">
                      Endpoint: {testResult.endpoint}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-black/10">
          <button
            onClick={() => {
              setApiKeyInput('');
              onSaveKey('');
              setTestResult(null);
            }}
            className="text-[11px] font-bold text-red-600 hover:underline uppercase tracking-wider"
          >
            Clear Token
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-black"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_0px_#F27D26]"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
