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
  Sparkles,
  Cpu,
  Mic,
} from 'lucide-react';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey?: string;
  onSaveKey?: (key: string) => void;
  currentGrokKey?: string;
  onSaveGrokKey?: (key: string) => void;
  initialTab?: 'sahara' | 'openrouter' | 'grok';
}

const DEFAULT_OR_KEY = '';

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  currentKey = '',
  onSaveKey,
  currentGrokKey = '',
  onSaveGrokKey,
  initialTab = 'sahara',
}) => {
  const [activeTab, setActiveTab] = useState<'sahara' | 'openrouter' | 'grok'>(initialTab);

  // OpenRouter Key State
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openrouter_api_key') || DEFAULT_OR_KEY;
    }
    return DEFAULT_OR_KEY;
  });
  const [isTestingOpenRouter, setIsTestingOpenRouter] = useState<boolean>(false);
  const [openRouterTestResult, setOpenRouterTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    pingMs?: number;
    models?: string[];
  } | null>(null);
  
  // Grok Key State
  const [grokKeyInput, setGrokKeyInput] = useState<string>(
    currentGrokKey || (typeof window !== 'undefined' ? localStorage.getItem('grok_api_key') || '' : '')
  );
  const [isTestingGrok, setIsTestingGrok] = useState<boolean>(false);
  const [grokTestResult, setGrokTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    pingMs?: number;
    models?: string[];
  } | null>(null);

  // Sahara Key State
  const [saharaKeyInput, setSaharaKeyInput] = useState<string>(currentKey);
  const [endpointInput, setEndpointInput] = useState<string>('https://infer.voice.intron.io/file/v1/upload/sync');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isTestingSahara, setIsTestingSahara] = useState<boolean>(false);
  const [saharaTestResult, setSaharaTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    pingMs?: number;
    endpoint?: string;
  } | null>(null);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  // Test OpenRouter Connection
  const handleTestOpenRouterConnection = async () => {
    if (!openRouterKeyInput.trim()) {
      setOpenRouterTestResult({
        tested: true,
        valid: false,
        message: 'Please provide an OpenRouter API key (sk-or-v1-...).',
      });
      return;
    }

    setIsTestingOpenRouter(true);
    setOpenRouterTestResult(null);

    try {
      const res = await fetch('/api/openrouter/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: openRouterKeyInput.trim(),
        }),
      });

      const data = await res.json();
      setOpenRouterTestResult({
        tested: true,
        valid: Boolean(data.valid),
        message: data.message || (data.valid ? 'OpenRouter AI connection verified!' : 'Connection rejected.'),
        pingMs: data.pingMs,
        models: ['meta-llama/llama-3.3-70b-instruct', 'qwen/qwen-2.5-72b-instruct', 'deepseek/deepseek-chat'],
      });
    } catch (err: any) {
      setOpenRouterTestResult({
        tested: true,
        valid: false,
        message: `Network verification failed: ${err?.message || 'Server error'}`,
      });
    } finally {
      setIsTestingOpenRouter(false);
    }
  };

  // Test Grok Connection
  const handleTestGrokConnection = async () => {
    if (!grokKeyInput.trim()) {
      setGrokTestResult({
        tested: true,
        valid: false,
        message: 'Please paste your xAI Grok API key (e.g. xai-...) first.',
      });
      return;
    }

    setIsTestingGrok(true);
    setGrokTestResult(null);

    try {
      const res = await fetch('/api/grok/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: grokKeyInput.trim(),
        }),
      });

      const data = await res.json();
      setGrokTestResult({
        tested: true,
        valid: Boolean(data.valid),
        message: data.message || (data.valid ? 'xAI Grok connection verified!' : 'Connection rejected.'),
        pingMs: data.pingMs,
        models: data.modelsAvailable,
      });
    } catch (err: any) {
      setGrokTestResult({
        tested: true,
        valid: false,
        message: `Network verification failed: ${err?.message || 'Server error'}`,
      });
    } finally {
      setIsTestingGrok(false);
    }
  };

  // Test Sahara Connection
  const handleTestSaharaConnection = async () => {
    if (!saharaKeyInput.trim()) {
      setSaharaTestResult({
        tested: true,
        valid: false,
        message: 'Please paste your Sahara API key or access token first.',
      });
      return;
    }

    setIsTestingSahara(true);
    setSaharaTestResult(null);

    try {
      const res = await fetch('/api/sahara/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: saharaKeyInput.trim(),
          endpointUrl: endpointInput.trim(),
        }),
      });

      const data = await res.json();
      setSaharaTestResult({
        tested: true,
        valid: Boolean(data.valid),
        message: data.message || (data.valid ? 'Sahara Voice API connection verified!' : 'Connection rejected.'),
        pingMs: data.pingMs,
        endpoint: data.endpointVerified,
      });
    } catch (err: any) {
      setSaharaTestResult({
        tested: true,
        valid: false,
        message: `Network verification failed: ${err?.message || 'Server error'}`,
      });
    } finally {
      setIsTestingSahara(false);
    }
  };

  const handleSave = () => {
    // Save OpenRouter Key
    if (typeof window !== 'undefined') {
      if (openRouterKeyInput.trim()) {
        localStorage.setItem('openrouter_api_key', openRouterKeyInput.trim());
      } else {
        localStorage.removeItem('openrouter_api_key');
      }
    }

    // Save Sahara Key
    if (onSaveKey) {
      onSaveKey(saharaKeyInput.trim());
    }
    if (typeof window !== 'undefined' && endpointInput.trim()) {
      localStorage.setItem('sahara_endpoint_override', endpointInput.trim());
    }

    // Save Grok Key
    if (typeof window !== 'undefined') {
      if (grokKeyInput.trim()) {
        localStorage.setItem('grok_api_key', grokKeyInput.trim());
      } else {
        localStorage.removeItem('grok_api_key');
      }
    }
    if (onSaveGrokKey) {
      onSaveGrokKey(grokKeyInput.trim());
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-xl w-full p-6 space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black border border-black flex items-center justify-center text-[#F27D26] shadow-[2px_2px_0px_0px_#F27D26]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black italic text-black flex items-center space-x-2">
              <span>Model Architecture & API Gateways</span>
            </h3>
            <p className="text-xs text-stone-600">
              <strong className="text-black">Sahara-v2.4 Voice</strong> is the Major Model &bull; Supported by OpenRouter AI & xAI Grok
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Sahara Voice is Major Model */}
        <div className="flex border-b-2 border-black">
          <button
            type="button"
            onClick={() => setActiveTab('sahara')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'sahara'
                ? 'bg-black text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Mic className="w-4 h-4 text-[#F27D26]" />
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] text-[#F27D26] font-extrabold tracking-widest">MAJOR MODEL</span>
              <span className="text-[11px]">Sahara-v2.4 Voice</span>
            </div>
            {saharaKeyInput.trim() ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Afriswitch Calibrated Fallback Mode Active"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('openrouter')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'openrouter'
                ? 'bg-black text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F27D26]" />
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] text-stone-400 font-bold tracking-widest">SUPPORTING LLM</span>
              <span className="text-[11px]">OpenRouter AI</span>
            </div>
            {openRouterKeyInput.trim() && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grok')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'grok'
                ? 'bg-black text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#F27D26]" />
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] text-stone-400 font-bold tracking-widest">SUPPORTING LLM</span>
              <span className="text-[11px]">xAI Grok</span>
            </div>
            {grokKeyInput.trim() && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* TAB 0: OpenRouter AI (Supporting LLM) */}
        {activeTab === 'openrouter' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2 text-xs text-stone-700 bg-[#FAF8F5] p-3.5 border border-black/10">
              <div className="flex items-center space-x-1.5 text-black font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Supporting Semantic & Translation Coprocessor</span>
              </div>
              <p className="leading-relaxed">
                OpenRouter supports the major model (<strong>Sahara-v2.4</strong>) with high-parameter polyglot reasoning (<strong>Llama 3.3 70B Instruct</strong>, <strong>Qwen 2.5 72B Instruct</strong>, and <strong>DeepSeek Chat</strong>) for intra-sentential dialect translations, cultural entity synthesis, and clinical SOAP actions.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Default API Key active on server and client for continuous uptime.</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700 block">
                  OpenRouter API Key
                </label>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#F27D26] font-bold hover:underline inline-flex items-center"
                >
                  openrouter.ai/keys <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
              <input
                type="password"
                value={openRouterKeyInput}
                onChange={(e) => {
                  setOpenRouterKeyInput(e.target.value);
                  setOpenRouterTestResult(null);
                }}
                placeholder="sk-or-v1-..."
                className="w-full bg-[#FAF8F5] border border-black/30 p-2.5 text-xs text-black font-mono focus:outline-none focus:border-[#F27D26]"
              />
              <span className="text-[10px] text-stone-500 block">
                Default fallback: <code className="font-mono">meta-llama/llama-3.3-70b-instruct</code> &bull; <code className="font-mono">qwen/qwen-2.5-72b-instruct</code>
              </span>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleTestOpenRouterConnection}
                disabled={isTestingOpenRouter}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-black/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                {isTestingOpenRouter ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                    <span>Verifying with OpenRouter...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-[#F27D26]" />
                    <span>Test Handshake</span>
                  </>
                )}
              </button>
            </div>

            {/* Handshake Result */}
            {openRouterTestResult && (
              <div
                className={`p-3 text-xs border transition-all ${
                  openRouterTestResult.valid
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-red-50 border-red-500 text-red-950'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {openRouterTestResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{openRouterTestResult.message}</p>
                    {openRouterTestResult.pingMs && (
                      <p className="text-[11px] font-mono text-stone-600">
                        Roundtrip Latency: <strong>{openRouterTestResult.pingMs}ms</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: xAI Grok */}
        {activeTab === 'grok' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2 text-xs text-stone-700 bg-[#FAF8F5] p-3.5 border border-black/10">
              <div className="flex items-center space-x-1.5 text-black font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Use Grok as Alternative or Primary LLM</span>
              </div>
              <p className="leading-relaxed">
                You can use your <strong>xAI Grok API key</strong> to power real-time code-switching linguistic analysis, clinical entity extraction, agentic triage actions, and bidirectional vernacular translation.
              </p>
              <p className="text-[11px] text-stone-600">
                ⚡ <strong>Great for avoiding Google Gemini rate/quota limits</strong> or comparing Grok reasoning performance on African code-switching dialects.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700 block">
                  xAI Grok API Key
                </label>
                <a
                  href="https://console.x.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#F27D26] font-bold hover:underline inline-flex items-center"
                >
                  console.x.ai <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
              <input
                type="password"
                value={grokKeyInput}
                onChange={(e) => {
                  setGrokKeyInput(e.target.value);
                  setGrokTestResult(null);
                }}
                placeholder="xai-..."
                className="w-full bg-[#FAF8F5] border border-black/30 p-2.5 text-xs text-black font-mono focus:outline-none focus:border-[#F27D26]"
              />
              <span className="text-[10px] text-stone-500 block">
                Supports models: <code className="font-mono">grok-2-latest</code>, <code className="font-mono">grok-beta</code>, and <code className="font-mono">grok-2</code>.
              </span>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleTestGrokConnection}
                disabled={isTestingGrok}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-black/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <Activity className={`w-3.5 h-3.5 ${isTestingGrok ? 'animate-spin text-[#F27D26]' : 'text-stone-700'}`} />
                <span>{isTestingGrok ? 'Pinging xAI...' : 'Test Grok API'}</span>
              </button>
            </div>

            {/* Grok Diagnostic Result */}
            {grokTestResult && (
              <div
                className={`p-3 border text-xs leading-relaxed ${
                  grokTestResult.valid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {grokTestResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {grokTestResult.valid ? 'xAI Handshake Successful' : 'Verification Diagnostic'}
                      {grokTestResult.pingMs ? ` (${grokTestResult.pingMs}ms latency)` : ''}
                    </div>
                    <p className="text-[11px] mt-0.5">{grokTestResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Sahara Voice ASR (Major Model) */}
        {activeTab === 'sahara' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2 text-xs text-stone-700 bg-[#FAF8F5] p-3.5 border-2 border-black shadow-[3px_3px_0px_0px_#F27D26]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-black font-bold uppercase tracking-wider text-[11px]">
                  <Mic className="w-4 h-4 text-[#F27D26]" />
                  <span className="font-mono bg-black text-white px-2 py-0.5 text-[10px]">MAJOR MODEL</span>
                  <span>Sahara-v2.4 Voice & Code-Switch Core</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 font-bold border border-emerald-300">
                  Flagship Acoustic Backbone
                </span>
              </div>
              <p className="leading-relaxed">
                <strong>Sahara-v2.4</strong> is the central major model developed specifically for African acoustic recognition, tonal accents, and intra-sentential code-switching across 300+ dialects. It performs primary ASR via Intron Health’s cloud ASR cluster (<code className="font-mono text-[11px] bg-white px-1 border border-black/10">voice.intron.io</code>).
              </p>
              <p className="text-stone-600 text-[11px] bg-white p-2 border border-black/10">
                Secondary models (<strong>OpenRouter AI Llama 3.3 70B</strong>, <strong>Qwen 2.5</strong>, <strong>xAI Grok</strong>, <strong>Gemini</strong>) act as supporting semantic and medical triage coprocessors built around Sahara’s acoustic outputs.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-700 block">
                  Sahara Access Token / Intron Key
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
                value={saharaKeyInput}
                onChange={(e) => {
                  setSaharaKeyInput(e.target.value);
                  setSaharaTestResult(null);
                }}
                placeholder="sh_live_..."
                className="w-full bg-[#FAF8F5] border border-black/30 p-2.5 text-xs text-black font-mono focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            {/* Test Connection Row */}
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
                onClick={handleTestSaharaConnection}
                disabled={isTestingSahara}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-black/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <Activity className={`w-3.5 h-3.5 ${isTestingSahara ? 'animate-spin text-[#F27D26]' : 'text-stone-700'}`} />
                <span>{isTestingSahara ? 'Pinging Sahara...' : 'Test ASR Connection'}</span>
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
                  placeholder="https://infer.voice.intron.io/file/v1/upload/sync"
                  className="w-full bg-white border border-black/20 p-2 text-[11px] text-stone-900 font-mono focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-stone-500 block">
                  Official Intron Sync API: <code className="font-mono">https://infer.voice.intron.io/file/v1/upload/sync</code>
                </span>
              </div>
            )}

            {/* Sahara Diagnostic Result */}
            {saharaTestResult && (
              <div
                className={`p-3 border text-xs leading-relaxed ${
                  saharaTestResult.valid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {saharaTestResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {saharaTestResult.valid ? 'Handshake Successful' : 'Verification Diagnostic'}
                      {saharaTestResult.pingMs ? ` (${saharaTestResult.pingMs}ms latency)` : ''}
                    </div>
                    <p className="text-[11px] mt-0.5">{saharaTestResult.message}</p>
                    {saharaTestResult.endpoint && (
                      <div className="text-[10px] font-mono text-emerald-700 mt-1">
                        Endpoint: {saharaTestResult.endpoint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-black/10">
          <button
            onClick={() => {
              if (activeTab === 'openrouter') {
                setOpenRouterKeyInput('');
                if (typeof window !== 'undefined') localStorage.removeItem('openrouter_api_key');
                setOpenRouterTestResult(null);
              } else if (activeTab === 'grok') {
                setGrokKeyInput('');
                if (typeof window !== 'undefined') localStorage.removeItem('grok_api_key');
                if (onSaveGrokKey) onSaveGrokKey('');
                setGrokTestResult(null);
              } else {
                setSaharaKeyInput('');
                if (onSaveKey) onSaveKey('');
                setSaharaTestResult(null);
              }
            }}
            className="text-[11px] font-bold text-red-600 hover:underline uppercase tracking-wider"
          >
            Clear {activeTab === 'openrouter' ? 'OpenRouter' : activeTab === 'grok' ? 'Grok' : 'Sahara'} Key
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
