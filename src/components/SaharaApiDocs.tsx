import React, { useState, useEffect, useRef } from 'react';
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
  Radio,
  FileAudio,
  Volume2,
  Square,
  Play,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertCircle,
  Check,
  Sliders,
  Download,
  Search,
  Upload,
  Activity,
  Cpu,
  Server,
  Workflow,
  Stethoscope,
} from 'lucide-react';
import { ALL_LANGUAGE_PAIRS } from '../data/benchmarkData';

interface SaharaApiDocsProps {
  hasSaharaKey: boolean;
  onOpenKeyModal: () => void;
}

type DocTab =
  | 'intro'
  | 'streaming'
  | 'file-stt'
  | 'tts'
  | 'vocab'
  | 'catalog'
  | 'code'
  | 'errors';

export const SaharaApiDocs: React.FC<SaharaApiDocsProps> = ({
  hasSaharaKey,
  onOpenKeyModal,
}) => {
  const [activeTab, setActiveTab] = useState<DocTab>('intro');
  const [activeLangTab, setActiveLangTab] = useState<'node' | 'python' | 'dart' | 'curl'>('node');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // File STT Interactive state
  const [selectedFilePreset, setSelectedFilePreset] = useState<string>('swahili-malaria');
  const [fileSttLanguage, setFileSttLanguage] = useState<string>('Swahili-English');
  const [fileSttCustomVocab, setFileSttCustomVocab] = useState<string>('artemether, lumefantrine, homa kali, joint pains');
  const [fileJobId, setFileJobId] = useState<string | null>(null);
  const [fileJobStatus, setFileJobStatus] = useState<string | null>(null);
  const [fileJobProgress, setFileJobProgress] = useState<number>(0);
  const [fileJobResult, setFileJobResult] = useState<any | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  // Streaming STT Simulator state
  const [isStreamingActive, setIsStreamingActive] = useState<boolean>(false);
  const [streamLanguage, setStreamLanguage] = useState<string>('Yoruba-English');
  const [streamPacketsSent, setStreamPacketsSent] = useState<number>(0);
  const [streamTokens, setStreamTokens] = useState<Array<{ text: string; isFinal: boolean; confidence: number; isCodeSwitch?: boolean }>>([]);
  const streamIntervalRef = useRef<any>(null);

  // TTS Interactive state
  const [ttsText, setTtsText] = useState<string>(
    'Mgonjwa ana homa kali; tunapendekeza atumie artemether mara mbili kwa siku baada ya chakula.'
  );
  const [ttsVoice, setTtsVoice] = useState<string>('amina-swahili-female');
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);
  const [ttsResult, setTtsResult] = useState<any | null>(null);
  const [isPlayingTts, setIsPlayingTts] = useState<boolean>(false);

  // Custom Vocabulary Biasing tester
  const [customVocabInput, setCustomVocabInput] = useState<string>(
    'artemether, lumefantrine, coartem, paracetamol, amoxicillin, wahala, e dey, unwana'
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false);

  // Language Catalog search
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Poll File Job Status
  useEffect(() => {
    if (!fileJobId || fileJobStatus === 'COMPLETED' || fileJobStatus === 'FAILED') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/intron/file/status/${fileJobId}`);
        if (res.ok) {
          const data = await res.json();
          setFileJobStatus(data.status);
          if (data.status === 'PROCESSING') {
            setFileJobProgress(60);
          } else if (data.status === 'COMPLETED') {
            setFileJobProgress(100);
            setFileJobResult(data);
          }
        }
      } catch (err) {
        console.warn('File status poll error:', err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [fileJobId, fileJobStatus]);

  // Handle File STT Trigger
  const handleUploadFileStt = async () => {
    setIsUploadingFile(true);
    setFileJobResult(null);
    setFileJobStatus('QUEUED');
    setFileJobProgress(15);

    try {
      const vocabList = fileSttCustomVocab.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/intron/file/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `${selectedFilePreset}.wav`,
          languagePair: fileSttLanguage,
          customVocabulary: vocabList,
          enableCodeSwitching: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFileJobId(data.file_id);
        setFileJobStatus(data.status);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setFileJobStatus('FAILED');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Handle Streaming STT Toggle
  const toggleStreaming = () => {
    if (isStreamingActive) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setIsStreamingActive(false);
      return;
    }

    setIsStreamingActive(true);
    setStreamPacketsSent(0);
    setStreamTokens([]);

    const sampleScript =
      streamLanguage === 'Yoruba-English'
        ? [
            { text: 'Doctor,', isFinal: true, conf: 0.98 },
            { text: ' ara', isFinal: false, conf: 0.94 },
            { text: ' mi', isFinal: false, conf: 0.95 },
            { text: ' gbona', isFinal: true, conf: 0.97, isCS: true },
            { text: ' gan', isFinal: true, conf: 0.98, isCS: true },
            { text: ' since', isFinal: false, conf: 0.92 },
            { text: ' yesterday,', isFinal: true, conf: 0.99 },
            { text: ' mo', isFinal: false, conf: 0.93 },
            { text: ' ni', isFinal: true, conf: 0.96, isCS: true },
            { text: ' severe', isFinal: false, conf: 0.91 },
            { text: ' headache', isFinal: true, conf: 0.99 },
            { text: ' ati', isFinal: true, conf: 0.97, isCS: true },
            { text: ' body', isFinal: false, conf: 0.95 },
            { text: ' weakness.', isFinal: true, conf: 0.99 },
          ]
        : [
            { text: 'Mgonjwa', isFinal: true, conf: 0.99, isCS: true },
            { text: ' ana', isFinal: true, conf: 0.97, isCS: true },
            { text: ' homa', isFinal: false, conf: 0.94 },
            { text: ' kali', isFinal: true, conf: 0.98, isCS: true },
            { text: ' sana', isFinal: true, conf: 0.98, isCS: true },
            { text: ' na', isFinal: true, conf: 0.97, isCS: true },
            { text: ' joint', isFinal: false, conf: 0.92 },
            { text: ' pains,', isFinal: true, conf: 0.99 },
            { text: ' bado', isFinal: false, conf: 0.94 },
            { text: ' anatapika', isFinal: true, conf: 0.98, isCS: true },
            { text: ' non-stop', isFinal: true, conf: 0.96 },
            { text: ' since', isFinal: false, conf: 0.93 },
            { text: ' asubuhi.', isFinal: true, conf: 0.99, isCS: true },
          ];

    let index = 0;
    streamIntervalRef.current = setInterval(() => {
      if (index >= sampleScript.length) {
        clearInterval(streamIntervalRef.current);
        setIsStreamingActive(false);
        return;
      }

      const item = sampleScript[index];
      setStreamPacketsSent((prev) => prev + 1);
      setStreamTokens((prev) => [
        ...prev,
        {
          text: item.text,
          isFinal: item.isFinal,
          confidence: item.conf,
          isCodeSwitch: item.isCS,
        },
      ]);
      index++;
    }, 450);
  };

  // Handle TTS Generation
  const handleGenerateTts = async () => {
    if (!ttsText.trim()) return;
    setIsGeneratingTts(true);
    setTtsResult(null);

    try {
      const res = await fetch('/api/intron/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText,
          voiceId: ttsVoice,
          language: ttsVoice.includes('swahili') ? 'sw-KE' : ttsVoice.includes('yoruba') ? 'yo-NG' : 'pcm-NG',
          speed: ttsSpeed,
          format: 'mp3',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTtsResult(data);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Play synthesized audio
  const playSynthesizedVoice = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isPlayingTts) {
      setIsPlayingTts(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ttsSpeed;
    if (ttsVoice.includes('swahili')) utterance.lang = 'sw-KE';
    else if (ttsVoice.includes('yoruba')) utterance.lang = 'yo-NG';
    else if (ttsVoice.includes('hausa')) utterance.lang = 'ha-NG';
    else if (ttsVoice.includes('zulu')) utterance.lang = 'zu-ZA';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsPlayingTts(true);
    utterance.onend = () => setIsPlayingTts(false);
    utterance.onerror = () => setIsPlayingTts(false);
    window.speechSynthesis.speak(utterance);
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

  const codeSnippets = {
    node: `// Intron Voice AI (Sahara v-2) - Node.js / TypeScript Integration
// Documentation: https://docs.voice.intron.io
// Production Inference Host: https://infer.voice.intron.io

import axios from 'axios';
import fs from 'fs';

const INTRON_API_KEY = process.env.SAHARA_API_KEY || 'your_intron_api_key_here';

// 1. Asynchronous File-based STT Upload
async function uploadAudioForTranscription(filePath: string) {
  const audioBuffer = fs.readFileSync(filePath);
  
  const response = await axios.post(
    'https://infer.voice.intron.io/file/v1/upload',
    {
      audio: audioBuffer.toString('base64'),
      filename: 'clinical_intake_patient_01.wav',
      language_pair: 'Swahili-English', // e.g. Yoruba-English, Pidgin-English, Hausa-English
      enable_code_switching: true,
      custom_vocabulary: [
        'artemether', 'lumefantrine', 'paracetamol', 'homa kali', 'coartem'
      ],
    },
    {
      headers: {
        'Authorization': \`Bearer \${INTRON_API_KEY}\`,
        'Content-Type': 'application/json',
      },
    }
  );

  const fileId = response.data.file_id;
  console.log('Upload Accepted! File ID:', fileId);
  return pollTranscriptionStatus(fileId);
}

// 2. Poll Transcription Status & Retrieve Code-Switch Data
async function pollTranscriptionStatus(fileId: string) {
  let completed = false;
  while (!completed) {
    await new Promise((r) => setTimeout(r, 1500));
    const statusRes = await axios.get(
      \`https://infer.voice.intron.io/file/v1/status/\${fileId}\`,
      {
        headers: { 'Authorization': \`Bearer \${INTRON_API_KEY}\` }
      }
    );

    console.log('Current Status:', statusRes.data.status);
    if (statusRes.data.status === 'COMPLETED') {
      console.log('Verbatim Transcript:', statusRes.data.transcript);
      console.log('Confidence Score:', statusRes.data.confidence);
      console.log('Code-Switch Transitions:', statusRes.data.code_switch_boundaries);
      return statusRes.data;
    }
  }
}

// Run Intake
uploadAudioForTranscription('./sample_audio.wav');`,

    python: `# Intron Voice AI (Sahara v-2) - Python 3.10+ Integration
# Documentation: https://docs.voice.intron.io
# Production Inference Host: https://infer.voice.intron.io

import os
import time
import base64
import requests

INTRON_API_KEY = os.getenv("SAHARA_API_KEY", "your_intron_api_key_here")
HEADERS = {
    "Authorization": f"Bearer {INTRON_API_KEY}",
    "Content-Type": "application/json"
}

def transcribe_african_audio(file_path: str, language_pair="Swahili-English"):
    with open(file_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    # Step 1: Upload to Intron Voice File Endpoint
    upload_url = "https://infer.voice.intron.io/file/v1/upload"
    payload = {
        "audio": audio_b64,
        "language_pair": language_pair,
        "enable_code_switching": True,
        "custom_vocabulary": ["artemether", "lumefantrine", "homa kali"]
    }
    
    res = requests.post(upload_url, json=payload, headers=HEADERS)
    file_id = res.json().get("file_id")
    print(f"File uploaded. Tracking Job ID: {file_id}")
    
    # Step 2: Poll status until COMPLETED
    status_url = f"https://infer.voice.intron.io/file/v1/status/{file_id}"
    while True:
        time.sleep(1.5)
        status_res = requests.get(status_url, headers=HEADERS).json()
        status = status_res.get("status")
        print(f"Polling status: {status}")
        
        if status == "COMPLETED":
            print("\\n--- Decoded Transcript ---")
            print(status_res.get("transcript"))
            print("Confidence:", status_res.get("confidence"))
            print("Code-Switch Boundaries:", len(status_res.get("code_switch_boundaries", [])))
            return status_res

if __name__ == "__main__":
    transcribe_african_audio("clinical_sample.wav")`,

    dart: `// Intron Voice AI Dart SDK (Flutter & Server-side Dart)
// Documentation: https://docs.voice.intron.io
// Package: intron_voice on pub.dev

import 'package:intron_voice/intron_voice.dart';

void main() async {
  final client = IntronVoiceClient(
    apiKey: 'YOUR_INTRON_API_KEY',
    baseUrl: 'https://infer.voice.intron.io',
    webSocketUrl: 'wss://infer.voice.intron.io/stt/v1/stream',
  );

  // Real-Time Streaming STT (WebSocket)
  final stream = await client.streamingStt.start(
    options: StreamingSttOptions(
      languageCode: 'sw-KE', // Swahili (Kenya)
      sampleRateHertz: 16000,
      encoding: AudioEncoding.linear16,
      enableCodeSwitching: true,
      customVocabulary: ['artemether', 'lumefantrine', 'homa kali'],
    ),
  );

  // Listen to incoming interim & final transcripts
  stream.listen((event) {
    if (event.isFinal) {
      print('Committed Transcript: \${event.transcript}');
    } else {
      print('Interim Partial: \${event.transcript}');
    }
  });
}`,

    curl: `# 1. Asynchronous File Upload (Intron Voice API)
curl -X POST https://infer.voice.intron.io/file/v1/upload \\
  -H "Authorization: Bearer YOUR_INTRON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language_pair": "Swahili-English",
    "filename": "patient_triage.wav",
    "enable_code_switching": true,
    "custom_vocabulary": ["artemether", "paracetamol", "homa kali"],
    "audio": "BASE64_PCM_DATA"
  }'

# 2. Check File Status & Retrieve Output
curl -X GET https://infer.voice.intron.io/file/v1/status/FILE_ID \\
  -H "Authorization: Bearer YOUR_INTRON_API_KEY"

# 3. Generate African Localized Speech (TTS)
curl -X POST https://infer.voice.intron.io/tts/v1/generate \\
  -H "Authorization: Bearer YOUR_INTRON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Mgonjwa ana homa kali sana, tafadhali muone daktari.",
    "voice_id": "amina-swahili-female",
    "language": "sw-KE",
    "format": "mp3"
  }'`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeLangTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadOpenApiSpec = () => {
    fetch('/api/intron/spec')
      .then((res) => res.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'intron-voice-openapi-v2.4.json';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const ACCENTS_CATALOG = [
    { code: 'sw-KE', language: 'Swahili (Kiswahili)', region: 'Kenya', sampleRate: '16kHz / 8kHz', codeSwitch: 'Swahili ⇄ English', domain: 'Clinical & USSD', ttsVoice: 'amina-swahili' },
    { code: 'sw-TZ', language: 'Swahili (Kiswahili)', region: 'Tanzania', sampleRate: '16kHz / 8kHz', codeSwitch: 'Swahili ⇄ English', domain: 'Health & Legal', ttsVoice: 'juma-swahili' },
    { code: 'yo-NG', language: 'Yoruba (Èdè Yorùbá)', region: 'Southwestern Nigeria, Benin', sampleRate: '16kHz / 8kHz', codeSwitch: 'Yoruba ⇄ English', domain: 'Hospital & Retail', ttsVoice: 'tunde-yoruba' },
    { code: 'pcm-NG', language: 'Nigerian Pidgin', region: 'Nigeria, West Africa', sampleRate: '16kHz / 8kHz', codeSwitch: 'Pidgin ⇄ Standard English', domain: 'Fintech & Intake', ttsVoice: 'chidi-pidgin' },
    { code: 'ha-NG', language: 'Hausa', region: 'Northern Nigeria, Niger', sampleRate: '16kHz / 8kHz', codeSwitch: 'Hausa ⇄ English', domain: 'Agri & Health', ttsVoice: 'fatima-hausa' },
    { code: 'zu-ZA', language: 'isiZulu (Zulu)', region: 'South Africa, Eswatini', sampleRate: '16kHz / 8kHz', codeSwitch: 'isiZulu ⇄ English', domain: 'Public Services', ttsVoice: 'sipho-zulu' },
    { code: 'ig-NG', language: 'Igbo (Asụsụ Igbo)', region: 'Southeastern Nigeria', sampleRate: '16kHz / 8kHz', codeSwitch: 'Igbo ⇄ English', domain: 'Trade & Clinics', ttsVoice: 'ngozi-igbo' },
    { code: 'rw-RW', language: 'Kinyarwanda', region: 'Rwanda, Eastern DRC', sampleRate: '16kHz', codeSwitch: 'Kinyarwanda ⇄ French/English', domain: 'Telemedicine', ttsVoice: 'mugisha-rwanda' },
    { code: 'am-ET', language: 'Amharic', region: 'Ethiopia', sampleRate: '16kHz', codeSwitch: 'Amharic ⇄ English', domain: 'Public Admin', ttsVoice: 'almaz-amharic' },
    { code: 'wo-SN', language: 'Wolof', region: 'Senegal, The Gambia', sampleRate: '16kHz', codeSwitch: 'Wolof ⇄ French', domain: 'Commerce & Health', ttsVoice: 'moussa-wolof' },
    { code: 'ak-GH', language: 'Akan / Twi', region: 'Ghana', sampleRate: '16kHz', codeSwitch: 'Twi ⇄ English', domain: 'Community Health', ttsVoice: 'kwame-akan' },
    { code: 'en-NG', language: 'Nigerian English', region: 'Nigeria', sampleRate: '16kHz / 8kHz', codeSwitch: 'Regional Multi-Dialect', domain: 'Medical Dictation', ttsVoice: 'dami-en-ng' },
  ];

  const filteredAccents = ACCENTS_CATALOG.filter((item) =>
    item.language.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.region.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.code.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.domain.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-[#FAF8F5] p-6 border-2 border-black relative shadow-[4px_4px_0px_0px_#F27D26]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#F27D26] text-white shadow-[2px_2px_0px_0px_black]">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Official API Specification & Developer Hub
            </div>
            <h1 className="text-3xl font-serif font-black italic text-black tracking-tight">
              Intron Voice AI & Sahara v-2 API Documentation
            </h1>
            <p className="text-sm text-stone-700 leading-relaxed font-sans">
              Complete reference implementation matching{' '}
              <a
                href="https://docs.voice.intron.io/docs/index/introduction"
                target="_blank"
                rel="noreferrer"
                className="text-black font-bold underline decoration-[#F27D26] decoration-2 inline-flex items-center hover:text-[#F27D26]"
              >
                docs.voice.intron.io/docs/index/introduction
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              . Access real-time WebSocket streaming STT, asynchronous batch file uploads, multilingual African Text-to-Speech (TTS), and custom vocabulary biasing across 200+ African accents.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={downloadOpenApiSpec}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-100 text-black border border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-[2px_2px_0px_0px_black] transition-all"
              title="Download OpenAPI 3.0 specification JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Export OpenAPI JSON</span>
            </button>

            <button
              onClick={onOpenKeyModal}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[2px_2px_0px_0px_black] ${
                hasSaharaKey
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-black text-white hover:bg-stone-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>{hasSaharaKey ? 'API Gateway: Connected' : 'Configure API Key'}</span>
            </button>
          </div>
        </div>

        {/* Live Status Ticker */}
        <div className="mt-4 pt-3 border-t border-black/15 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-black">Primary Gateway:</strong>{' '}
              <span className="text-stone-600">https://infer.voice.intron.io</span>
            </span>
            <span className="text-stone-400">|</span>
            <span>
              <strong className="text-black">WebSocket Stream:</strong>{' '}
              <span className="text-stone-600">wss://infer.voice.intron.io/stt/v1/stream</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Rate Limit: 30 req/min • Offline Edge: Sahara-v2 Ready</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto bg-white border-2 border-black p-1 gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]">
        {[
          { id: 'intro', label: '1. Introduction & Quickstart', icon: BookOpen },
          { id: 'streaming', label: '2. Streaming STT (WebSocket)', icon: Radio },
          { id: 'file-stt', label: '3. File STT (Async REST)', icon: FileAudio },
          { id: 'tts', label: '4. Text-to-Speech (TTS)', icon: Volume2 },
          { id: 'vocab', label: '5. Custom Vocab Biasing', icon: Zap },
          { id: 'catalog', label: '6. 200+ Accents Matrix', icon: Database },
          { id: 'code', label: '7. SDKs & Code Generator', icon: Terminal },
          { id: 'errors', label: '8. Auth & Error Codes', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DocTab)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shrink-0 border transition-all ${
                isActive
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#F27D26]'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-transparent hover:border-black/20'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F27D26]' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTRODUCTION & QUICKSTART */}
      {activeTab === 'intro' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Core Documentation Narrative */}
            <div className="lg:col-span-8 bg-white border-2 border-black p-6 space-y-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FAF8F5] border border-black/20 text-stone-700">
                  Documentation Overview
                </span>
                <h2 className="text-2xl font-serif font-black italic text-black">
                  Empowering Voice Applications for Africa
                </h2>
                <p className="text-sm text-stone-700 leading-relaxed">
                  Intron Voice AI develops cutting-edge acoustic speech recognition (ASR) and text-to-speech (TTS) engines specifically calibrated for over 300 African accents, regional dialects, and natural intra-sentential code-switching. Standard global models (like OpenAI Whisper or Google Cloud Speech) often degrade significantly on African speech (failing on 35-50% of vernacular words). Intron’s <strong>Sahara-v2</strong> achieves 95%+ recognition accuracy across healthcare, fintech, legal, and conversational voice bots.
                </p>
              </div>

              {/* 4 Architectural Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[#FAF8F5] border border-black/15 space-y-1.5">
                  <div className="flex items-center space-x-2 text-black font-bold text-xs">
                    <Radio className="w-4 h-4 text-[#F27D26]" />
                    <span>Real-Time Streaming STT</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Low-latency WebSocket streaming (<code className="text-[11px] font-mono">wss://infer.voice.intron.io/stt/v1/stream</code>) with word-level partial updates, committed sentence boundaries, and sub-350ms latency.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-black/15 space-y-1.5">
                  <div className="flex items-center space-x-2 text-black font-bold text-xs">
                    <FileAudio className="w-4 h-4 text-[#F27D26]" />
                    <span>Batch File Upload STT</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Asynchronous processing for recorded consultations, voice notes, and phone calls in WAV, MP3, WEBM, FLAC with timestamped word alignments and code-switching tags.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-black/15 space-y-1.5">
                  <div className="flex items-center space-x-2 text-black font-bold text-xs">
                    <Volume2 className="w-4 h-4 text-[#F27D26]" />
                    <span>African Text-to-Speech (TTS)</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Hyper-localized vocal synthesis featuring culturally natural accents in Swahili, Yoruba, Nigerian Pidgin, Hausa, isiZulu, and West African English.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-black/15 space-y-1.5">
                  <div className="flex items-center space-x-2 text-black font-bold text-xs">
                    <Server className="w-4 h-4 text-[#F27D26]" />
                    <span>Offline / On-Premise Sahara-v2</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Designed for resilience in rural clinics and intermittent internet conditions, running fully localized inference without internet dependencies.
                  </p>
                </div>
              </div>

              {/* 3-Step Quickstart */}
              <div className="space-y-3 pt-3 border-t border-black/10">
                <h3 className="text-sm font-serif font-bold italic text-black">
                  Quickstart: Get Up and Running in 3 Steps
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-white border border-black/15 flex items-start space-x-3">
                    <span className="w-6 h-6 bg-black text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                    <div className="text-xs space-y-1">
                      <strong className="text-black block">Generate Your API Token</strong>
                      <p className="text-stone-600">
                        Sign up at <a href="https://voice.intron.io" target="_blank" rel="noreferrer" className="text-[#F27D26] underline font-bold">voice.intron.io</a>, navigate to the <strong>Developers</strong> tab, and copy your Bearer API token.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-black/15 flex items-start space-x-3">
                    <span className="w-6 h-6 bg-black text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                    <div className="text-xs space-y-1">
                      <strong className="text-black block">Choose Your Integration Protocol</strong>
                      <p className="text-stone-600">
                        Select between <strong>WebSocket Streaming</strong> for live conversational agents or <strong>REST File Upload</strong> for recorded audio.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-black/15 flex items-start space-x-3">
                    <span className="w-6 h-6 bg-black text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                    <div className="text-xs space-y-1">
                      <strong className="text-black block">Enable Code-Switching & Custom Vocabulary</strong>
                      <p className="text-stone-600">
                        Pass <code className="font-mono bg-stone-100 px-1 border border-black/10">enable_code_switching: true</code> and inject clinical drug terms or local vernacular into <code className="font-mono bg-stone-100 px-1 border border-black/10">custom_vocabulary</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Interactive Sandbox Status & Quick Links */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between pb-2 border-b border-black/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    Live Gateway Handshake
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                    hasSaharaKey ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-700 border-black/15'
                  }`}>
                    {hasSaharaKey ? 'Live Remote Key' : 'Calibrated Engine'}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Verify your connection to Intron’s inference cluster. If you have not yet configured an API key, the studio seamlessly uses calibrated Afriswitch ground-truth references.
                </p>

                <button
                  onClick={testSaharaEndpoint}
                  disabled={testingEndpoint}
                  className="w-full py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[2px_2px_0px_0px_#F27D26] disabled:opacity-50"
                >
                  {testingEndpoint ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                      <span>Pinging infer.voice.intron.io...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#F27D26]" />
                      <span>Test Gateway Handshake</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div className="p-3 bg-[#FAF8F5] border border-black/20 text-xs font-mono space-y-1 text-stone-900 animate-fadeIn">
                    <div className="text-emerald-700 font-bold text-[10px]">HTTP 200 OK — READY</div>
                    <div>Model: <strong>{testResult.model}</strong></div>
                    <div>Confidence: <strong>{(testResult.confidence * 100).toFixed(1)}%</strong></div>
                    <div>Latency: <strong>{testResult.latencyMs}ms</strong></div>
                  </div>
                )}
              </div>

              {/* 4 Official Resources */}
              <div className="space-y-2">
                <a
                  href="https://voice.intron.io"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white border border-black/15 hover:border-black flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <KeyRound className="w-4 h-4 text-[#F27D26]" />
                    <div>
                      <div className="text-xs font-bold text-black group-hover:text-[#F27D26]">voice.intron.io</div>
                      <div className="text-[10px] text-stone-500">Developer Portal & API Tokens</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-black" />
                </a>

                <a
                  href="https://docs.voice.intron.io"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white border border-black/15 hover:border-black flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-[#F27D26]" />
                    <div>
                      <div className="text-xs font-bold text-black group-hover:text-[#F27D26]">docs.voice.intron.io</div>
                      <div className="text-[10px] text-stone-500">Official REST & WebSocket Documentation</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-black" />
                </a>

                <a
                  href="https://huggingface.co/collections/intronhealth/code-switching"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white border border-black/15 hover:border-black flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Database className="w-4 h-4 text-[#F27D26]" />
                    <div>
                      <div className="text-xs font-bold text-black group-hover:text-[#F27D26]">Hugging Face Datasets</div>
                      <div className="text-[10px] text-stone-500">Afriswitch & AfriswitchCare Audio Splits</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-black" />
                </a>

                <a
                  href="https://github.com/intron-innovation/Intron-Multimodal-Benchmarking"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white border border-black/15 hover:border-black flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <GitBranch className="w-4 h-4 text-[#F27D26]" />
                    <div>
                      <div className="text-xs font-bold text-black group-hover:text-[#F27D26]">GitHub Benchmarking Repo</div>
                      <div className="text-[10px] text-stone-500">Intron Multimodal Benchmarking Scripts</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-black" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STREAMING STT (WEBSOCKET) */}
      {activeTab === 'streaming' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                  WebSocket Protocol Specification
                </span>
                <h2 className="text-lg font-serif font-black italic text-black">
                  Streaming Speech-to-Text (STT) API
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono bg-stone-100 px-2.5 py-1 border border-black/15 text-stone-800">
                  wss://infer.voice.intron.io/stt/v1/stream
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              The Intron Voice Streaming STT API uses bi-directional WebSockets to stream audio chunks (16kHz PCM 16-bit linear) and receive partial interim hypotheses (<code className="font-mono bg-stone-100 px-1">is_final: false</code>) followed by committed words (<code className="font-mono bg-stone-100 px-1">is_final: true</code>).
            </p>

            {/* Interactive WebSocket Client Simulator */}
            <div className="bg-[#FAF8F5] border-2 border-black p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${isStreamingActive ? 'bg-emerald-500 animate-ping' : 'bg-stone-300'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    Live Stream Console: {isStreamingActive ? 'Connected & Streaming Packets' : 'Idle'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={streamLanguage}
                    onChange={(e) => setStreamLanguage(e.target.value)}
                    disabled={isStreamingActive}
                    className="bg-white border border-black/20 text-xs font-bold p-1.5 focus:outline-none"
                  >
                    <option value="Yoruba-English">Yoruba ⇄ English (Clinic Febrile)</option>
                    <option value="Swahili-English">Swahili ⇄ English (Malaria Triage)</option>
                  </select>

                  <button
                    onClick={toggleStreaming}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border border-black transition-all shadow-[2px_2px_0px_0px_black] ${
                      isStreamingActive ? 'bg-red-600 text-white' : 'bg-[#F27D26] text-white hover:bg-[#d96716]'
                    }`}
                  >
                    {isStreamingActive ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop WebSocket Stream</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Simulate WebSocket Audio Stream</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Streaming Output Visualizer */}
              <div className="min-h-[140px] bg-white border border-black/20 p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-stone-500 pb-1 border-b border-black/5">
                  <span>Packets Emitted: <strong>{streamPacketsSent}</strong> (16000Hz PCM)</span>
                  <span>Tokens Received: <strong>{streamTokens.length}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {streamTokens.length === 0 ? (
                    <span className="text-stone-400 italic text-xs">
                      Click "Simulate WebSocket Audio Stream" to observe live word-level partial updates and committed code-switch tokens.
                    </span>
                  ) : (
                    streamTokens.map((tok, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded-xs transition-all ${
                          tok.isCodeSwitch
                            ? 'bg-[#F27D26]/20 border border-[#F27D26] font-bold text-[#B84E00]'
                            : tok.isFinal
                            ? 'bg-stone-100 text-black border border-stone-300'
                            : 'bg-yellow-50 text-stone-600 italic border border-dashed border-yellow-300'
                        }`}
                        title={`Confidence: ${(tok.confidence * 100).toFixed(1)}% | isFinal: ${tok.isFinal}`}
                      >
                        {tok.text}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Handshake & Frame Message Spec */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                  1. Client Initial Handshake JSON Frame:
                </label>
                <pre className="p-3 bg-[#1A1A1A] text-stone-100 text-xs font-mono overflow-x-auto">
{`{
  "event": "start",
  "data": {
    "language_code": "sw-KE",
    "sample_rate_hertz": 16000,
    "encoding": "LINEAR16",
    "enable_code_switching": true,
    "custom_vocabulary": ["artemether", "lumefantrine"]
  }
}`}
                </pre>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                  2. Server Emitted Event Frame:
                </label>
                <pre className="p-3 bg-[#1A1A1A] text-stone-100 text-xs font-mono overflow-x-auto">
{`{
  "event": "transcript",
  "data": {
    "transcript": "Mgonjwa ana homa kali",
    "is_final": true,
    "confidence": 0.985,
    "code_switching_markers": [
      { "token": "homa kali", "lang": "sw-KE" }
    ]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FILE STT (ASYNC REST) */}
      {activeTab === 'file-stt' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                  Asynchronous File Processing Pipeline
                </span>
                <h2 className="text-lg font-serif font-black italic text-black">
                  Batch File Speech-to-Text API
                </h2>
              </div>
              <span className="text-xs font-mono bg-stone-100 px-2 py-1 border border-black/15 text-stone-800">
                POST /file/v1/upload &bull; GET /file/v1/status/{'{file_id}'}
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Upload pre-recorded audio files up to 2 hours in duration. Intron Voice accepts WAV, MP3, WEBM, FLAC, and OGG, queuing them for deep acoustic decoding and returning a trackable <code className="font-mono bg-stone-100 px-1">file_id</code>.
            </p>

            {/* Interactive File Upload Sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Controls */}
              <div className="lg:col-span-6 bg-[#FAF8F5] border border-black/20 p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                    Choose Pre-Recorded Test Audio or Upload:
                  </label>
                  <select
                    value={selectedFilePreset}
                    onChange={(e) => setSelectedFilePreset(e.target.value)}
                    className="w-full bg-white border border-black/20 p-2 text-xs font-bold"
                  >
                    <option value="swahili-malaria">Swahili ⇄ English (AfriswitchCare Malaria Intake)</option>
                    <option value="yoruba-hospital">Yoruba ⇄ English (Hospital Febrile Consultation)</option>
                    <option value="pidgin-fintech">Nigerian Pidgin (Fintech USSD Remittance)</option>
                    <option value="hausa-agri">Hausa ⇄ English (Crop Disease Agronomy)</option>
                    <option value="zulu-public">isiZulu ⇄ English (Municipal Deed Affidavit)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                      Language Pair:
                    </label>
                    <select
                      value={fileSttLanguage}
                      onChange={(e) => setFileSttLanguage(e.target.value)}
                      className="w-full bg-white border border-black/20 p-2 text-xs font-bold"
                    >
                      <option value="Swahili-English">Swahili-English</option>
                      <option value="Yoruba-English">Yoruba-English</option>
                      <option value="Pidgin-English">Pidgin-English</option>
                      <option value="Hausa-English">Hausa-English</option>
                      <option value="Zulu-English">Zulu-English</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                      Audio Format:
                    </label>
                    <input
                      type="text"
                      disabled
                      value="WAV (16kHz PCM 16-bit)"
                      className="w-full bg-stone-100 border border-black/15 p-2 text-xs font-mono text-stone-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                    Custom Vocabulary Boosting (Comma-separated):
                  </label>
                  <input
                    type="text"
                    value={fileSttCustomVocab}
                    onChange={(e) => setFileSttCustomVocab(e.target.value)}
                    className="w-full bg-white border border-black/20 p-2 text-xs font-mono"
                    placeholder="artemether, lumefantrine, paracetamol"
                  />
                </div>

                <button
                  onClick={handleUploadFileStt}
                  disabled={isUploadingFile}
                  className="w-full py-2.5 bg-[#F27D26] hover:bg-[#d96716] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[2px_2px_0px_0px_black] disabled:opacity-50"
                >
                  {isUploadingFile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting to /file/v1/upload...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Audio & Start Job</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress & Live Job State */}
              <div className="lg:col-span-6 bg-white border border-black/20 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      Job Status Monitor
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                        fileJobStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : fileJobStatus === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse'
                          : 'bg-stone-100 text-stone-700 border-black/15'
                      }`}
                    >
                      {fileJobStatus || 'NO JOB ACTIVE'}
                    </span>
                  </div>

                  {fileJobId ? (
                    <div className="space-y-2 font-mono text-xs text-stone-700">
                      <div>File ID: <strong className="text-black">{fileJobId}</strong></div>
                      {/* Progress bar */}
                      <div className="w-full bg-stone-200 h-2 border border-black/10 overflow-hidden">
                        <div
                          className="bg-[#F27D26] h-full transition-all duration-500"
                          style={{ width: `${fileJobProgress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {fileJobStatus === 'QUEUED' && 'Step 1/3: Audio ingested into Sahara-v2 queue...'}
                        {fileJobStatus === 'PROCESSING' && 'Step 2/3: Acoustic decoding & code-switch boundary detection...'}
                        {fileJobStatus === 'COMPLETED' && 'Step 3/3: Transcription complete with word alignments!'}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      Submit an audio file on the left to trigger the asynchronous job execution pipeline.
                    </div>
                  )}

                  {/* Completed Output */}
                  {fileJobResult && (
                    <div className="bg-[#FAF8F5] p-3 border border-black/20 space-y-2 text-xs font-mono animate-fadeIn">
                      <div className="text-stone-500 text-[10px] uppercase font-bold">Verbatim Output Transcript:</div>
                      <p className="text-black font-serif italic text-sm">"{fileJobResult.transcript}"</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-black/10 text-[10px] text-stone-600">
                        <span>Confidence: <strong>{(fileJobResult.confidence * 100).toFixed(1)}%</strong></span>
                        <span>Duration: <strong>{fileJobResult.duration_seconds}s</strong></span>
                        <span>Words: <strong>{fileJobResult.words?.length}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-black/10">
                  Endpoint Polled: <code className="text-black font-semibold">GET /file/v1/status/{fileJobId || '{file_id}'}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEXT-TO-SPEECH (TTS) */}
      {activeTab === 'tts' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                  Acoustic Speech Synthesis
                </span>
                <h2 className="text-lg font-serif font-black italic text-black">
                  African Text-to-Speech (TTS) API
                </h2>
              </div>
              <span className="text-xs font-mono bg-stone-100 px-2 py-1 border border-black/15 text-stone-800">
                POST https://infer.voice.intron.io/tts/v1/generate
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Convert clinical reports, health advisories, or automated financial USSD prompts into natural African speech. Intron Voice TTS features neural voice models trained on African prosody, tonal dynamics, and authentic vernacular inflections.
            </p>

            {/* Interactive Voice Synthesizer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 bg-[#FAF8F5] border border-black/20 p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                    Text to Synthesize into Speech:
                  </label>
                  <textarea
                    rows={4}
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    className="w-full bg-white border border-black/20 p-2.5 text-xs font-serif text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                      Select African Voice:
                    </label>
                    <select
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="w-full bg-white border border-black/20 p-2 text-xs font-bold"
                    >
                      <option value="amina-swahili-female">Amina — Swahili (Kenya / Tanzania) Female</option>
                      <option value="tunde-yoruba-male">Tunde — Yoruba (Nigeria) Male</option>
                      <option value="chidi-pidgin-male">Chidi — Nigerian Pidgin Male</option>
                      <option value="fatima-hausa-female">Fatima — Hausa (Northern Nigeria) Female</option>
                      <option value="sipho-zulu-male">Sipho — isiZulu (South Africa) Male</option>
                      <option value="dami-english-female">Dami — West African English Female</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                      Speech Speed: {ttsSpeed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.1"
                      value={ttsSpeed}
                      onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                      className="w-full accent-[#F27D26]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateTts}
                  disabled={isGeneratingTts || !ttsText.trim()}
                  className="w-full py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[2px_2px_0px_0px_#F27D26] disabled:opacity-50"
                >
                  {isGeneratingTts ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                      <span>Synthesizing Voice...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#F27D26]" />
                      <span>Generate Voice Synthesis</span>
                    </>
                  )}
                </button>
              </div>

              {/* TTS Result Box */}
              <div className="lg:col-span-5 bg-white border border-black/20 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      Synthesis Output
                    </span>
                    <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 border border-black/10">
                      MP3 • 24kHz
                    </span>
                  </div>

                  {ttsResult ? (
                    <div className="bg-[#FAF8F5] p-3 border border-black/15 space-y-3 animate-fadeIn">
                      <div className="text-xs font-serif italic text-black">
                        "{ttsResult.text}"
                      </div>

                      <div className="text-[11px] font-mono text-stone-600 space-y-1">
                        <div>Voice: <strong className="text-black">{ttsResult.voice?.name}</strong></div>
                        <div>Accent: <strong>{ttsResult.voice?.accent}</strong></div>
                        <div>Format: <strong>{ttsResult.audio_format}</strong></div>
                      </div>

                      <button
                        onClick={() => playSynthesizedVoice(ttsResult.text)}
                        className={`w-full py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border border-black transition-all shadow-[2px_2px_0px_0px_black] ${
                          isPlayingTts ? 'bg-red-600 text-white' : 'bg-[#F27D26] text-white hover:bg-[#d96716]'
                        }`}
                      >
                        {isPlayingTts ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Stop Audio Playback</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Listen to Synthesized Audio</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      Select voice parameters and click "Generate Voice Synthesis" to test speech playback.
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-black/10">
                  Endpoint: <code className="text-black font-semibold">POST /tts/v1/generate</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOM VOCABULARY BIASING */}
      {activeTab === 'vocab' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                  Domain Adaptation Feature
                </span>
                <h2 className="text-lg font-serif font-black italic text-black">
                  Custom Vocabulary Biasing Dictionary
                </h2>
              </div>
              <span className="text-xs font-mono bg-[#F27D26]/15 text-[#B84E00] px-2 py-1 border border-[#F27D26]/30 font-bold">
                custom_vocabulary parameter
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              African clinical practice and fintech ecosystems rely heavily on localized nomenclature (e.g. malaria drugs like <code className="font-mono bg-stone-100 px-1 font-bold">artemether</code>, <code className="font-mono bg-stone-100 px-1 font-bold">lumefantrine</code>, or mobile money terms like <code className="font-mono bg-stone-100 px-1 font-bold">m-pesa</code>, <code className="font-mono bg-stone-100 px-1 font-bold">momo</code>, <code className="font-mono bg-stone-100 px-1 font-bold">naira</code>). Injecting these terms into the Sahara acoustic decoder biases the language model weights, elevating rare medical entity recall to 95.4%.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                Target Biasing Terms (Comma-separated):
              </label>
              <textarea
                rows={3}
                value={customVocabInput}
                onChange={(e) => setCustomVocabInput(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-black/20 p-3 text-xs font-mono text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-stone-500">
                Registered terms: {customVocabInput.split(',').filter((s) => s.trim()).length} words
              </span>
              <button
                onClick={testSaharaEndpoint}
                disabled={testingEndpoint}
                className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-[2px_2px_0px_0px_#F27D26]"
              >
                {testingEndpoint ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                    <span>Testing Biased Decoder...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#F27D26]" />
                    <span>Apply Biasing to Decoder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 200+ ACCENTS MATRIX */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                  Linguistic Coverage Matrix
                </span>
                <h2 className="text-lg font-serif font-black italic text-black">
                  Supported African Languages & Dialects
                </h2>
              </div>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter language or region..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-black/20 focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b-2 border-black text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Language / Dialect</th>
                    <th className="p-2.5">Primary Region</th>
                    <th className="p-2.5">Sample Rate</th>
                    <th className="p-2.5">Code-Switch Support</th>
                    <th className="p-2.5">Domain Fit</th>
                    <th className="p-2.5">TTS Voice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 font-mono text-[11px]">
                  {filteredAccents.map((item) => (
                    <tr key={item.code} className="hover:bg-stone-50">
                      <td className="p-2.5 font-bold text-black">{item.code}</td>
                      <td className="p-2.5 font-serif not-italic font-bold text-black">{item.language}</td>
                      <td className="p-2.5 text-stone-600">{item.region}</td>
                      <td className="p-2.5 text-stone-500">{item.sampleRate}</td>
                      <td className="p-2.5 text-[#B84E00] font-semibold">{item.codeSwitch}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-stone-100 border border-black/10 text-stone-800 text-[10px]">
                          {item.domain}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#F27D26] font-bold">{item.ttsVoice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CODE GENERATORS & SDks */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b-2 border-black bg-[#FAF8F5] gap-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#F27D26]" />
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  Official SDK & Client Code Generator
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex bg-white p-1 border border-black/20 gap-1">
                  {(['node', 'python', 'dart', 'curl'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLangTab(lang)}
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                        activeLangTab === lang
                          ? 'bg-black text-white shadow-sm'
                          : 'text-stone-600 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      {lang === 'node'
                        ? 'TypeScript'
                        : lang === 'python'
                        ? 'Python 3'
                        : lang === 'dart'
                        ? 'Dart / Flutter'
                        : 'cURL'}
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

            <pre className="p-5 text-xs font-mono text-stone-100 bg-[#1A1A1A] overflow-x-auto leading-relaxed max-h-[480px]">
              {codeSnippets[activeLangTab]}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 8: AUTH & ERROR REFERENCE */}
      {activeTab === 'errors' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="pb-3 border-b border-black/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                Security & Reliability
              </span>
              <h2 className="text-lg font-serif font-black italic text-black">
                Authentication & HTTP Error Status Codes
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#FAF8F5] border border-black/15 space-y-1 text-xs">
                <div className="font-bold text-black flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authentication Header Format:</span>
                </div>
                <p className="text-stone-600">
                  Pass your developer key via the standard HTTP Authorization header:
                </p>
                <code className="block bg-black text-white p-2 font-mono text-xs">
                  Authorization: Bearer YOUR_INTRON_API_KEY
                </code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { code: '200 OK', meaning: 'Successful synchronous inference or job query.' },
                  { code: '202 Accepted', meaning: 'Audio file accepted into asynchronous queue (/file/v1/upload).' },
                  { code: '400 Bad Request', meaning: 'Malformed payload, missing audio base64, or invalid language_pair.' },
                  { code: '401 Unauthorized', meaning: 'Missing or expired API token. Ensure token is generated at voice.intron.io.' },
                  { code: '404 Not Found', meaning: 'Job file_id expired, or organization tenant endpoint requires configuration.' },
                  { code: '429 Rate Limited', meaning: 'Exceeded 30 requests/minute tier limit. Implement exponential backoff.' },
                  { code: '500 Internal Error', meaning: 'Acoustic decoder timeout. Studio automatically fails over to local Sahara-v2.' },
                ].map((err) => (
                  <div key={err.code} className="p-3 bg-white border border-black/15 space-y-1">
                    <span className="font-mono font-bold text-xs text-[#F27D26] block">{err.code}</span>
                    <p className="text-xs text-stone-600">{err.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
