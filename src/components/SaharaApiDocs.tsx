import React, { useState } from 'react';
import {
  Code2,
  Copy,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Terminal,
  Layers,
  KeyRound,
  ShieldCheck,
  Zap,
  Sparkles,
  Database,
  GitBranch,
} from 'lucide-react';
import { ALL_LANGUAGE_PAIRS } from '../data/benchmarkData';

interface SaharaApiDocsProps {
  hasSaharaKey: boolean;
  onOpenKeyModal: () => void;
}

export const SaharaApiDocs: React.FC<SaharaApiDocsProps> = ({
  hasSaharaKey,
  onOpenKeyModal,
}) => {
  const [activeLangTab, setActiveLangTab] = useState<'node' | 'python' | 'curl'>('node');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [customVocabInput, setCustomVocabInput] = useState<string>(
    'artemether, lumefantrine, coartem, paracetamol, amoxicillin, wahala, e dey, unwana'
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false);

  const codeSnippets = {
    node: `// Sahara Voice API Integration (Node.js / TypeScript)
// Docs: https://docs.voice.intron.io
// Developer Portal: https://voice.intron.io

import axios from 'axios';
import fs from 'fs';

const SAHARA_API_KEY = process.env.SAHARA_API_KEY || 'your_sahara_api_key_here';
const AUDIO_FILE_PATH = './patient_intake_codeswitch.wav';

async function transcribeAfricanCodeSwitchAudio() {
  const audioBuffer = fs.readFileSync(AUDIO_FILE_PATH);
  
  const response = await axios.post(
    'https://voice.intron.io/api/v1/transcribe',
    {
      audio: audioBuffer.toString('base64'),
      format: 'wav',
      language_pair: 'Yoruba-English', // or Swahili-English, Hausa-English, Pidgin-English
      code_switch_detection: true,
      custom_vocabulary: [
        'artemether', 'lumefantrine', 'paracetamol', 'coartem', 'ara gbona'
      ],
    },
    {
      headers: {
        'Authorization': \`Bearer \${SAHARA_API_KEY}\`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('--- Sahara Verbatim Transcript ---');
  console.log(response.data.transcript);
  console.log('Matrix Language:', response.data.matrix_language);
  console.log('Switch Points Detected:', response.data.code_switch_boundaries?.length);
  return response.data;
}

transcribeAfricanCodeSwitchAudio();`,

    python: `# Sahara Voice API Integration (Python 3.10+)
# Docs: https://docs.voice.intron.io
# Portal: https://voice.intron.io

import os
import base64
import requests

SAHARA_API_KEY = os.getenv("SAHARA_API_KEY", "your_sahara_api_key_here")
AUDIO_FILE = "sample_audio.wav"

def transcribe_codeswitch_speech(file_path: str, language_pair="Yoruba-English"):
    with open(file_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    url = "https://voice.intron.io/api/v1/transcribe"
    headers = {
        "Authorization": f"Bearer {SAHARA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "audio": audio_b64,
        "format": "wav",
        "language_pair": language_pair,
        "enable_code_switching": True,
        "custom_vocabulary": ["artemether", "lumefantrine", "paracetamol"]
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    print("Transcript:", result.get("transcript"))
    print("Latency:", result.get("latency_ms"), "ms")
    return result

if __name__ == "__main__":
    transcribe_codeswitch_speech(AUDIO_FILE)`,

    curl: `# Sahara Voice API cURL Command
# Replace YOUR_SAHARA_API_KEY with your key from https://voice.intron.io

curl -X POST https://voice.intron.io/api/v1/transcribe \\
  -H "Authorization: Bearer YOUR_SAHARA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language_pair": "Yoruba-English",
    "format": "wav",
    "enable_code_switching": true,
    "custom_vocabulary": ["artemether", "paracetamol", "ara gbona"],
    "audio": "BASE64_ENCODED_PCM_AUDIO_DATA"
  }'`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeLangTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const testSaharaEndpoint = async () => {
    setTestingEndpoint(true);
    try {
      const vocabList = customVocabInput.split(',').map((s) => s.trim());
      const res = await fetch('/api/sahara/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languagePair: 'Yoruba-English',
          customVocab: vocabList,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTestingEndpoint(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] p-6 border border-black/20 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#F27D26] text-white">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Developer Docs & Integration Toolkit
          </div>
          <h2 className="text-3xl font-serif font-black italic text-black tracking-tight">
            Sahara Voice API Integration & Resources
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed font-sans">
            Everything you need to build your prototype with <strong className="text-black font-semibold underline decoration-[#F27D26] decoration-2">Sahara Voice API</strong>.
            Review step-by-step credentials acquisition, official datasets from Hugging Face,
            benchmarking scripts from GitHub, and multi-language integration patterns.
          </p>
        </div>
      </div>

      {/* 4 Official Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="https://voice.intron.io"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white border border-black/15 hover:border-black transition-all flex flex-col justify-between space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.04)] group"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 bg-[#FAF8F5] text-black flex items-center justify-center border border-black/20">
              <KeyRound className="w-4 h-4 text-[#F27D26]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-black group-hover:text-[#F27D26] transition-colors flex items-center space-x-1">
                <span>voice.intron.io</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Developer portal to generate API access token for Phase 2.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-black font-bold uppercase tracking-wider">1. Get API Key &rarr;</span>
        </a>

        <a
          href="https://docs.voice.intron.io"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white border border-black/15 hover:border-black transition-all flex flex-col justify-between space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.04)] group"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 bg-[#FAF8F5] text-black flex items-center justify-center border border-black/20">
              <BookOpen className="w-4 h-4 text-[#F27D26]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-black group-hover:text-[#F27D26] transition-colors flex items-center space-x-1">
                <span>docs.voice.intron.io</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Official REST & WebSocket documentation and endpoint schemas.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-black font-bold uppercase tracking-wider">2. Read API Docs &rarr;</span>
        </a>

        <a
          href="https://huggingface.co/collections/intronhealth/code-switching"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white border border-black/15 hover:border-black transition-all flex flex-col justify-between space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.04)] group"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 bg-[#FAF8F5] text-black flex items-center justify-center border border-black/20">
              <Database className="w-4 h-4 text-[#F27D26]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-black group-hover:text-[#F27D26] transition-colors flex items-center space-x-1">
                <span>Hugging Face</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Intron Afriswitch & AfriswitchCare code-switching benchmark audio.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-black font-bold uppercase tracking-wider">3. Download Datasets &rarr;</span>
        </a>

        <a
          href="https://github.com/intron-innovation/Intron-Multimodal-Benchmarking"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white border border-black/15 hover:border-black transition-all flex flex-col justify-between space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.04)] group"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 bg-[#FAF8F5] text-black flex items-center justify-center border border-black/20">
              <GitBranch className="w-4 h-4 text-[#F27D26]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-black group-hover:text-[#F27D26] transition-colors flex items-center space-x-1">
                <span>Benchmarking Repo</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Intron Multimodal Benchmarking scripts and scoring tools.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-black font-bold uppercase tracking-wider">4. View Guidance &rarr;</span>
        </a>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-white border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-black bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#F27D26]" />
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Integration Code Generator
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language switch */}
            <div className="flex bg-white p-1 border border-black/20 gap-1">
              {(['node', 'python', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLangTab(lang)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeLangTab === lang
                      ? 'bg-black text-white shadow-sm'
                      : 'text-stone-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  {lang === 'node' ? 'TypeScript' : lang === 'python' ? 'Python 3' : 'cURL'}
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="p-2 bg-white hover:bg-stone-100 text-stone-800 transition-colors border border-black/20 shadow-sm"
              title="Copy snippet"
            >
              {copiedCode ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-[#F27D26]" />
              )}
            </button>
          </div>
        </div>

        <pre className="p-5 text-xs font-mono text-stone-100 bg-[#1A1A1A] overflow-x-auto leading-relaxed">
          {codeSnippets[activeLangTab]}
        </pre>
      </div>

      {/* Custom Vocabulary Boosting & Interactive Test */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-black/15 p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#F27D26]" />
              <h3 className="text-base font-serif font-bold italic text-black">
                Custom Vocabulary Biasing Dictionary
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#F27D26] text-white">
              Biasing Feature
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            In African code-switching, specialized clinical drug formulations, regional dialects, and
            local slang benefit from vocabulary boosting. Add your domain terms below to bias the
            Sahara decoder.
          </p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-600 block">
              Boosted Vocabulary Terms (Comma-separated)
            </label>
            <textarea
              rows={3}
              value={customVocabInput}
              onChange={(e) => setCustomVocabInput(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-black/20 p-3 text-xs text-black font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <button
            onClick={testSaharaEndpoint}
            disabled={testingEndpoint}
            className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-[2px_2px_0px_0px_#F27D26] disabled:opacity-50"
          >
            {testingEndpoint ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                <span>Pinging Sahara API...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Test Sahara ASR Decoder Handshake</span>
              </>
            )}
          </button>
        </div>

        {/* Right side: Live Endpoint Test Response */}
        <div className="lg:col-span-5 bg-white border border-black/15 p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="text-xs font-bold uppercase tracking-wider text-black">Sahara Handshake Status</span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                  hasSaharaKey
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-stone-100 text-stone-700 border-black/15'
                }`}
              >
                {hasSaharaKey ? 'Authenticated' : 'Simulation Mode'}
              </span>
            </div>

            {testResult ? (
              <div className="p-4 bg-[#FAF8F5] border-2 border-black text-xs font-mono space-y-1.5 text-stone-900 animate-fadeIn">
                <div className="text-emerald-700 font-bold uppercase text-[10px] tracking-wider">HTTP 200 OK — Ready</div>
                <div>Model: <strong>{testResult.model}</strong></div>
                <div>Provider: <strong>{testResult.provider}</strong></div>
                <div>Latency: <strong>{testResult.latencyMs}ms</strong></div>
                <div>Confidence: <strong>{(testResult.confidence * 100).toFixed(1)}%</strong></div>
                <div>Boosted Terms: <strong>{testResult.vocabBoostedTerms?.length} words registered</strong></div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500 space-y-2">
                <Code2 className="w-8 h-8 text-stone-400 mx-auto" />
                <p>Click "Test Sahara ASR Decoder Handshake" to verify connection.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-black/10 text-[11px] text-stone-600">
            For troubleshooting, visit{' '}
            <a
              href="https://voice.intron.io"
              target="_blank"
              rel="noreferrer"
              className="text-[#F27D26] font-bold hover:underline"
            >
              voice.intron.io
            </a>{' '}
            or the hackathon support channel.
          </div>
        </div>
      </div>
    </div>
  );
};
