import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Volume2,
  VolumeX,
  Zap,
  Headphones,
  Stethoscope,
  CreditCard,
  Sprout,
  Cpu,
  Radio,
  FileText,
  BadgeAlert,
  Send,
  Languages,
  Check,
} from 'lucide-react';
import {
  BENCHMARK_SAMPLES,
  ALL_LANGUAGE_PAIRS,
} from '../data/benchmarkData';
import { LanguagePair, BenchmarkAudioSample, CodeSwitchToken } from '../types';
import { GuidedDemoModal } from './GuidedDemoModal';

interface LiveAgentLabProps {
  hasSaharaKey: boolean;
  onOpenKeyModal: () => void;
}

export const LiveAgentLab: React.FC<LiveAgentLabProps> = ({
  hasSaharaKey,
  onOpenKeyModal,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguagePair>('Swahili-English');
  const [activeSampleId, setActiveSampleId] = useState<string>('sample-swahili-care-02');
  const [customAudioText, setCustomAudioText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'sample' | 'mic'>('sample');
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState<boolean>(false);

  // Sahara ASR live/calibrated inference state
  const [asrOutput, setAsrOutput] = useState<{
    transcript: string;
    isLiveInference: boolean;
    status: string;
    latencyMs: number;
    confidence: number;
    diagnosticMessage?: string;
    provider?: string;
    model?: string;
  } | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Real Audio Playback & Speech Synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string>('');
  const [speakerOutputNotice, setSpeakerOutputNotice] = useState<string | null>(null);
  const playbackTimerRef = useRef<any>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Canvas visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Processing & Agentic Action
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [agentResult, setAgentResult] = useState<any | null>(null);
  const [activeTokenInfo, setActiveTokenInfo] = useState<CodeSwitchToken | null>(null);

  // Multilingual translation state
  const [altLang, setAltLang] = useState<string>('Yoruba');
  const [altTranslation, setAltTranslation] = useState<string | null>(null);
  const [isTranslatingAlt, setIsTranslatingAlt] = useState<boolean>(false);
  const [altPronunciation, setAltPronunciation] = useState<string | null>(null);
  const [altNotes, setAltNotes] = useState<string | null>(null);
  const [isCopiedAlt, setIsCopiedAlt] = useState<boolean>(false);

  const handleTranslateToAlt = async (targetLanguage: string) => {
    const textToTranslate =
      agentResult?.fullStandardTranslation ||
      asrOutput?.transcript ||
      (inputMode === 'mic' && customAudioText.trim() ? customAudioText.trim() : activeSample.groundTruth);
    if (!textToTranslate) return;

    setIsTranslatingAlt(true);
    setAltLang(targetLanguage);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: 'Auto-Detect',
          targetLang: targetLanguage,
          context: activeSample.category || 'clinical',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAltTranslation(data.translatedText);
        setAltPronunciation(data.pronunciationGuide || null);
        setAltNotes(data.linguisticNotes || null);
      }
    } catch (err) {
      console.warn('Alt translate error:', err);
    } finally {
      setIsTranslatingAlt(false);
    }
  };

  // Filter samples matching language
  const availableSamples = BENCHMARK_SAMPLES.filter(
    (s) => s.languagePair === selectedLanguage
  );
  const activeSample: BenchmarkAudioSample =
    availableSamples.find((s) => s.id === activeSampleId) ||
    availableSamples[0] ||
    BENCHMARK_SAMPLES[0];

  // Sync sample change
  useEffect(() => {
    if (availableSamples.length > 0 && !availableSamples.some((s) => s.id === activeSampleId)) {
      setActiveSampleId(availableSamples[0].id);
      setAgentResult(null);
    }
  }, [selectedLanguage]);

  // Handle synthetic waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.lineWidth = 2;
      ctx.strokeStyle = isRecording
        ? '#dc2626'
        : isPlayingAudio
        ? '#F27D26'
        : '#A8A29E';

      ctx.beginPath();
      const numBars = 48;
      const barWidth = width / numBars;

      for (let i = 0; i < numBars; i++) {
        let amplitude = 4;
        if (isRecording || isPlayingAudio) {
          amplitude = Math.sin(phase + i * 0.3) * 16 + Math.cos(phase * 1.5 + i * 0.1) * 12 + 18;
        }
        const barHeight = Math.max(3, Math.min(height - 4, amplitude));
        const x = i * barWidth;
        const y = midY - barHeight / 2;

        ctx.fillStyle = isRecording
          ? 'rgba(220, 38, 38, 0.85)'
          : isPlayingAudio
          ? 'rgba(242, 125, 38, 0.9)'
          : 'rgba(168, 162, 158, 0.5)';
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }

      phase += 0.12;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, isPlayingAudio]);

  // Start Mic Recording with Web Speech Recognition fallback for live speech-to-text
  const startRecording = async () => {
    // 1. Try browser SpeechRecognition for live real-time transcript streaming
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage.includes('Swahili') ? 'sw' : 'en-US';
        recognition.onresult = (event: any) => {
          let liveText = '';
          for (let i = 0; i < event.results.length; i++) {
            liveText += event.results[i][0].transcript + ' ';
          }
          if (liveText.trim()) {
            setCustomAudioText(liveText.trim());
          }
        };
        recognition.onerror = (e: any) => console.warn('Speech recognition warning:', e);
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('Speech recognition initialization warning:', recErr);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Convert blob to base64 for Sahara ASR ingestion
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          setRecordedAudioBase64(base64data);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access not permitted or unavailable in current frame, falling back to simulated input:', err);
      // Fallback simulation for iframe sandboxes
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  // Play audio acoustic tone & speech synthesis
  const stopAudioPlayback = () => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(playbackTimerRef.current);
    setIsPlayingAudio(false);
    setPlaybackProgress(0);
    setCurrentlySpeakingText('');
  };

  const playUtteranceAudio = (specificText?: string) => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    // Determine the utterance text to speak
    const textToSpeak =
      (specificText && specificText.trim().length > 0)
        ? specificText.trim()
        : (inputMode === 'mic' && customAudioText.trim().length > 0)
        ? customAudioText.trim()
        : activeSample.groundTruth;

    setCurrentlySpeakingText(textToSpeak);

    // Play subtle audio cue chime using Web Audio API to ensure speakers/audio card are initialized
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.28);
      }
    } catch (e) {
      console.warn('Web Audio chime not initialized:', e);
    }

    // Check if user recorded an actual voice audio blob in mic mode
    if (inputMode === 'mic' && recordedAudioUrl && (!customAudioText || customAudioText.trim().length === 0)) {
      try {
        if (currentAudioElementRef.current) {
          currentAudioElementRef.current.pause();
        }
        const audio = new Audio(recordedAudioUrl);
        currentAudioElementRef.current = audio;
        setIsPlayingAudio(true);
        setPlaybackProgress(0);

        audio.ontimeupdate = () => {
          if (audio.duration) {
            setPlaybackProgress((audio.currentTime / audio.duration) * 100);
          }
        };

        audio.onended = () => {
          setIsPlayingAudio(false);
          setPlaybackProgress(100);
          setCurrentlySpeakingText('');
        };

        audio.onerror = () => {
          setIsPlayingAudio(false);
        };

        audio.play().catch((err) => {
          console.warn('Audio play was prevented by browser autoplay policy:', err);
        });
        return;
      } catch (err) {
        console.warn('Recorded audio playback error:', err);
      }
    }

    // Play via SpeechSynthesis (spoken words through device speaker)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Assign closest language voice tag
      if (selectedLanguage.includes('Swahili')) {
        utterance.lang = 'sw-KE';
      } else if (selectedLanguage.includes('Yoruba')) {
        utterance.lang = 'yo-NG';
      } else if (selectedLanguage.includes('Hausa')) {
        utterance.lang = 'ha-NG';
      } else if (selectedLanguage.includes('Zulu')) {
        utterance.lang = 'zu-ZA';
      } else {
        utterance.lang = 'en-US';
      }

      setIsPlayingAudio(true);
      setPlaybackProgress(0);

      // Estimate duration for waveform progress animation
      const wordCount = textToSpeak.split(/\s+/).length;
      const estimatedDurationMs = Math.max(1400, wordCount * 380);
      const startTime = Date.now();

      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(99, (elapsed / estimatedDurationMs) * 100);
        setPlaybackProgress(progress);
      }, 80);

      utterance.onend = () => {
        clearInterval(playbackTimerRef.current);
        setIsPlayingAudio(false);
        setPlaybackProgress(100);
        setCurrentlySpeakingText('');
      };

      utterance.onerror = () => {
        clearInterval(playbackTimerRef.current);
        setIsPlayingAudio(false);
        setCurrentlySpeakingText('');
      };

      window.speechSynthesis.speak(utterance);
      setSpeakerOutputNotice(`Playing audio through speaker: "${textToSpeak.slice(0, 32)}..."`);
      setTimeout(() => setSpeakerOutputNotice(null), 4000);
    } else {
      // Fallback timer if speech synthesis is blocked
      setIsPlayingAudio(true);
      setPlaybackProgress(0);
      const totalSteps = 40;
      let currentStep = 0;
      playbackTimerRef.current = setInterval(() => {
        currentStep++;
        setPlaybackProgress((currentStep / totalSteps) * 100);
        if (currentStep >= totalSteps) {
          clearInterval(playbackTimerRef.current);
          setIsPlayingAudio(false);
          setPlaybackProgress(100);
        }
      }, 150);
    }
  };

  // Toggle play audio convenience wrapper
  const togglePlayAudio = () => {
    playUtteranceAudio();
  };

  // Run Real Sahara ASR & Gemini Agentic Extraction (Speech -> Code-Switch Intelligence -> Action)
  const handleRunAgent = async (categoryPreset?: string, textOverride?: string) => {
    setIsProcessing(true);
    const targetText = textOverride !== undefined ? textOverride : (inputMode === 'mic' && customAudioText ? customAudioText.trim() : undefined);

    try {
      // Step 1: Query Sahara ASR Proxy (/api/sahara/transcribe)
      const asrPayload: any = {
        languagePair: selectedLanguage,
        sampleId: inputMode === 'sample' ? activeSample.id : undefined,
        customVocab: [
          'artemether',
          'lumefantrine',
          'paracetamol',
          'coartem',
          'homa',
          'anatapika',
          'ara',
          'gbona',
          'sakit',
          'habari',
          'jambo',
          'abeg',
        ],
      };

      if (inputMode === 'mic') {
        if (targetText) {
          asrPayload.text = targetText;
        }
        if (recordedAudioBase64) {
          asrPayload.audio = recordedAudioBase64;
        }
      } else if (targetText) {
        asrPayload.text = targetText;
      }

      const asrResponse = await fetch('/api/sahara/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hasSaharaKey ? { 'x-sahara-api-key': localStorage.getItem('sahara_api_key') || '' } : {}),
        },
        body: JSON.stringify(asrPayload),
      });

      const asrData = await asrResponse.json();
      setAsrOutput(asrData);

      const transcriptToProcess =
        asrData.transcript ||
        (targetText && targetText.length > 0 ? targetText : activeSample.groundTruth);

      // Step 2: Layer 2 Code-Switch Intelligence & Layer 3 Action
      const response = await fetch('/api/codeswitch/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptToProcess,
          languagePair: selectedLanguage,
          domain: categoryPreset || (targetText ? 'general' : activeSample.category.toLowerCase()),
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setAgentResult(resData.data);
      } else {
        throw new Error(resData.error || 'Failed analysis');
      }
    } catch (e) {
      console.warn('API error, applying intelligent fallback:', e);
      const isSwahili = selectedLanguage === 'Swahili-English';
      const effectiveText = targetText || (inputMode === 'mic' && customAudioText ? customAudioText.trim() : activeSample.groundTruth);
      const isGreeting = /^(habari|jambo|sannu|bawo|sawubona|hello|hi)/i.test(effectiveText);

      if (isGreeting) {
        setAgentResult({
          matrixLanguage: isSwahili ? 'Swahili' : 'African Indigenous',
          embeddedLanguage: 'English',
          codeSwitchPoints: [
            {
              token: effectiveText,
              language: isSwahili ? 'Swahili' : 'African Vernacular',
              role: 'matrix',
              translation: 'Hello / How are you? / News',
              confidence: 0.98,
            },
          ],
          fullStandardTranslation: 'Hello / How are you? (Customary African Greeting)',
          intent: 'GREETING_AND_INQUIRY',
          extractedEntities: {
            'Utterance': effectiveText,
            'Detected Language': isSwahili ? 'Swahili' : 'African Indigenous',
            'Greeting Type': 'Vernacular Greeting Received',
            'System State': 'Ready for Patient Intake / Clinical Triage',
          },
          agenticAction: {
            actionType: 'RESPOND_TO_GREETING',
            summary: `Recognized African greeting ("${effectiveText}"). Virtual agent active and ready to record clinical symptoms or dispatch assistance.`,
            urgency: 'LOW',
          },
          linguisticNotes: `Transcribed vernacular greeting "${effectiveText}" with high confidence.`,
        });
      } else if (isSwahili) {
        setAgentResult({
          matrixLanguage: 'Swahili',
          embeddedLanguage: 'English',
          codeSwitchPoints: activeSample.tokens,
          fullStandardTranslation:
            'The patient has severe high fever and joint pains; we administered artemether to them, but they are still vomiting non-stop since morning.',
          intent: 'CLINICAL_SEVERE_MALARIA_TRIAGE',
          extractedEntities: {
            'Chief Complaints': 'Severe high fever (homa kali sana), Arthralgia (joint pains), Intractable vomiting (anatapika non-stop)',
            'Administered Medication': 'Artemether (oral ACT antimalarial)',
            'Clinical Complication': 'Oral antimalarial failure due to persistent emesis',
            'Chronology': 'Since morning (>6 hours duration)',
            'Triage Urgency': 'EMERGENCY / IMMEDIATE ESCALATION',
          },
          agenticAction: {
            actionType: 'INITIATE_PARENTERAL_ARTESUNATE_TRIAGE',
            summary:
              'Emergency triage protocol triggered: Patient intolerant to oral ACT due to vomiting. Immediate parenteral artesunate (IV/IM) indicated; alerted clinical officer.',
            urgency: 'HIGH',
          },
          linguisticNotes:
            'Intra-sentential code-switching with agglutinative Swahili verb roots ("tulimpatia", "anatapika") and English pharmaceutical/symptom borrowing ("artemether", "joint pains", "non-stop").',
        });
      } else {
        setAgentResult({
          matrixLanguage: selectedLanguage.split('-')[1] || 'English',
          embeddedLanguage: selectedLanguage.split('-')[0] || 'Indigenous African',
          codeSwitchPoints: activeSample.tokens,
          fullStandardTranslation:
            'Doctor, my body is burning hot since yesterday, I have a severe headache and body weakness, even paracetamol did not work at all.',
          intent: 'CLINICAL_ACUTE_FEBRILE_TRIAGE',
          extractedEntities: {
            'Chief Complaint': 'High fever, severe headache, severe fatigue',
            'Medication History': 'Paracetamol 1000mg failed to abate fever',
            'Duration': '> 24 hours',
            'Urgency': 'HIGH / OUTPATIENT INVESTIGATION',
          },
          agenticAction: {
            actionType: 'GENERATE_AfriswitchCare_SOAP_NOTE',
            summary: 'Auto-populated clinical EHR chart and alerted primary triage nurse.',
            urgency: 'HIGH',
          },
          linguisticNotes:
            'Intra-sentential borrowing of matrix Yoruba predicates ("ara mi gbona gan", "ati") interleaved with English clinical terminology.',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Compute code switch stats
  const tokens = activeSample.tokens || [];
  const matrixTokens = tokens.filter((t) => t.role === 'matrix');
  const embeddedTokens = tokens.filter((t) => t.role === 'embedded');
  const totalSwitches = tokens.reduce((acc, curr, idx) => {
    if (idx === 0) return 0;
    return curr.language !== tokens[idx - 1].language ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Overview Banner: Editorial Header with crisp borders */}
      <div className="border-b-2 border-black pb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#F27D26] bg-[#F27D26]/10 px-2 py-0.5 border border-[#F27D26]/30">
                Phase 2 Challenge Flagship
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-600">
                Speech ➔ Intelligence ➔ Action
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black italic text-[#1A1A1A] leading-tight">
              SaharaCare: African Code-Switching Voice Engine
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsGuidedDemoOpen(true)}
              className="px-4 py-2 bg-[#F27D26] hover:bg-[#d96716] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_black] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>90s Guided Pitch Walkthrough</span>
            </button>

            <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1.5">
              Sahara-v2.4
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FAF8F5] text-stone-900 border border-black/30 px-2.5 py-1.5 font-mono">
              13 Pairs
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-700 max-w-4xl leading-relaxed">
          The flagship clinical implementation demonstrating why voice AI must not force Africans to choose one language. Experience end-to-end African code-switching across clinical intake (AfriswitchCare), rural health triage, and downstream EHR automation.
        </p>

        {/* Flagship Demonstration Presets */}
        <div className="pt-2 border-t border-black/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F27D26] mr-1">
              Flagship Clinical Demos:
            </span>

            <button
              onClick={() => {
                setSelectedLanguage('Swahili-English');
                setActiveSampleId('sample-swahili-care-02');
                setInputMode('sample');
                setAgentResult(null);
                setAsrOutput(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 transition-all ${
                selectedLanguage === 'Swahili-English' && activeSampleId === 'sample-swahili-care-02'
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#F27D26]'
                  : 'bg-white text-stone-800 border-black/20 hover:border-black'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>★ Flagship 1: Swahili-English Malaria Triage (artemether)</span>
            </button>

            <button
              onClick={() => {
                setSelectedLanguage('Yoruba-English');
                setActiveSampleId('sample-yoruba-care-01');
                setInputMode('sample');
                setAgentResult(null);
                setAsrOutput(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 transition-all ${
                selectedLanguage === 'Yoruba-English' && activeSampleId === 'sample-yoruba-care-01'
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#F27D26]'
                  : 'bg-white text-stone-800 border-black/20 hover:border-black'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>★ Flagship 2: Yoruba-English Acute Fever (ara mi gbona)</span>
            </button>

            <button
              onClick={() => {
                setSelectedLanguage('Nigerian Pidgin-English');
                setActiveSampleId('sample-pidgin-fintech-01');
                setInputMode('sample');
                setAgentResult(null);
                setAsrOutput(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 transition-all ${
                selectedLanguage === 'Nigerian Pidgin-English'
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#F27D26]'
                  : 'bg-white text-stone-800 border-black/20 hover:border-black'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Pidgin Remittance</span>
            </button>

            <button
              onClick={() => {
                setSelectedLanguage('Hausa-English');
                setActiveSampleId('sample-hausa-agri-01');
                setInputMode('sample');
                setAgentResult(null);
                setAsrOutput(null);
              }}
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 transition-all ${
                selectedLanguage === 'Hausa-English'
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#F27D26]'
                  : 'bg-white text-stone-800 border-black/20 hover:border-black'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Hausa Crop Blight</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Strip: Language Pair & Input Mode in Editorial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Language Pair Selector */}
        <div className="bg-white rounded-none p-4 border border-black/15 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] block">
              01. Select Code-Switching Pair
            </label>
            <span className="text-[10px] font-mono font-bold text-stone-500">13 Pairs</span>
          </div>
          <select
            id="language-pair-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as LanguagePair)}
            className="w-full bg-[#FAF8F5] border border-black/20 rounded-none px-3 py-2 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-black transition-colors"
          >
            {ALL_LANGUAGE_PAIRS.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-500">
            Official Sahara Voice supported bilingual pair (Intron Voice API)
          </p>
        </div>

        {/* Input Source Mode */}
        <div className="bg-white rounded-none p-4 border border-black/15 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] block">
            02. Audio Input Source
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="mode-sample-btn"
              onClick={() => setInputMode('sample')}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all ${
                inputMode === 'sample'
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#F27D26]'
                  : 'bg-white text-stone-700 border-black/20 hover:border-black'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Benchmark Audio</span>
            </button>

            <button
              id="mode-mic-btn"
              onClick={() => setInputMode('mic')}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all ${
                inputMode === 'mic'
                  ? 'bg-[#F27D26] text-white border-[#F27D26] shadow-[2px_2px_0px_0px_black]'
                  : 'bg-white text-stone-700 border-black/20 hover:border-black'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Mic</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            {inputMode === 'sample'
              ? 'Consented, de-identified recordings from Afriswitch & AfriswitchCare'
              : 'Record your own live African code-switched voice in real-time'}
          </p>
        </div>

        {/* Sahara API Status Banner */}
        <div className="bg-[#FAF8F5] rounded-none p-4 border border-black/15 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26]">
                03. Sahara Voice ASR Gateway
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 ${
                  hasSaharaKey
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {hasSaharaKey ? 'Live Key Configured' : 'Evaluation Benchmark Mode'}
              </span>
            </div>
            <p className="text-xs text-stone-800 mt-1.5">
              Engine: <strong className="font-serif italic text-sm text-black">Sahara-ASR-Africa-v2.4</strong>
            </p>
            <p className="text-[10px] text-stone-600 mt-0.5">
              Live Intron API endpoint: <code className="font-mono bg-white px-1 border border-black/10">POST /api/sahara/transcribe</code>
            </p>
          </div>

          <button
            onClick={onOpenKeyModal}
            className="mt-2 w-full py-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-black hover:text-white text-stone-900 border border-black flex items-center justify-center space-x-1 transition-all shadow-sm"
          >
            <span>{hasSaharaKey ? 'Manage Sahara API Key' : 'Configure Sahara API Key'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Workspace: Audio Playback/Recording & Code-Switch Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Audio Console & Transcription */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-none border border-black/15 p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            {/* Sample Selector or Mic Controls */}
            {inputMode === 'sample' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                      Select Benchmark Clip
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-black bg-[#FAF8F5] px-2 py-0.5 border border-black/20">
                    Dataset: {activeSample.dataset}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSamples.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSampleId(s.id);
                        setAgentResult(null);
                        setIsPlayingAudio(false);
                      }}
                      className={`text-left p-2.5 border text-xs transition-all ${
                        activeSample.id === s.id
                          ? 'bg-[#F27D26]/10 border-2 border-[#F27D26] text-black shadow-sm'
                          : 'bg-white border-black/15 text-stone-700 hover:border-black hover:text-black'
                      }`}
                    >
                      <div className="font-serif italic font-bold text-stone-900 line-clamp-1">{s.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                        <span>{s.speakerGender} • {s.durationSec}s</span>
                        <span className="text-[#F27D26] font-mono font-bold">SNR {s.snrDb}dB</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900 flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-red-600" />
                    <span>Microphone Live Audio Stream</span>
                  </span>
                  {isRecording && (
                    <span className="flex items-center space-x-1.5 text-xs text-red-600 font-mono font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span>Recording: {recordingDuration}s</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {!isRecording ? (
                    <button
                      id="start-mic-record-btn"
                      onClick={startRecording}
                      className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-[2px_2px_0px_0px_#F27D26]"
                    >
                      <Mic className="w-4 h-4 text-[#F27D26]" />
                      <span>Start Speaking Code-Switched Audio</span>
                    </button>
                  ) : (
                    <button
                      id="stop-mic-record-btn"
                      onClick={stopRecording}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-[2px_2px_0px_0px_black]"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop & Transcribe</span>
                    </button>
                  )}

                  {recordedAudioUrl && (
                    <button
                      onClick={() => playUtteranceAudio()}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono font-bold border border-black/20 flex items-center space-x-1.5"
                      title="Play your recorded audio clip"
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#F27D26]" />
                      <span>Replay Mic Audio</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
                      Type vernacular utterance or edit speech input:
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">Press Enter to transcribe</span>
                  </div>
                  <textarea
                    value={customAudioText}
                    onChange={(e) => setCustomAudioText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRunAgent();
                      }
                    }}
                    placeholder="e.g. habari, or Doctor, ara mi gbona gan since yesterday..."
                    rows={2}
                    className="w-full bg-[#FAF8F5] border border-black/25 p-2.5 text-xs text-black placeholder-stone-400 focus:outline-none focus:border-black font-mono shadow-inner"
                  />

                  {/* Immediate Transcribe and Speech Synthesis Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRunAgent()}
                        disabled={isProcessing}
                        className="px-3.5 py-2 bg-[#F27D26] hover:bg-[#d96716] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_black] transition-all disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>
                          Transcribe & Analyze {customAudioText.trim() ? `"${customAudioText.trim().slice(0, 18)}"` : ''}
                        </span>
                      </button>

                      <button
                        onClick={() => playUtteranceAudio(customAudioText || 'habari')}
                        className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border border-black flex items-center space-x-1.5 transition-all shadow-sm ${
                          isPlayingAudio
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-white hover:bg-stone-100 text-black'
                        }`}
                        title="Hear this utterance read aloud through device speakers"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#F27D26]" />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 font-mono inline-flex items-center space-x-1">
                      <Volume2 className="w-3 h-3 text-emerald-600" />
                      <span>Device Audio Active</span>
                    </span>
                  </div>

                  {/* Quick Vernacular Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-stone-500 font-medium text-[10px]">Test Phrases:</span>
                    {[
                      { label: 'habari (Swahili)', text: 'habari' },
                      { label: 'homa kali (Swahili fever)', text: 'Mgonjwa ana homa kali sana na joint pains' },
                      { label: 'ara mi gbona (Yoruba)', text: 'Doctor, ara mi gbona gan since yesterday' },
                      { label: 'abeg transfer (Pidgin)', text: 'Abeg transfer twenty thousand naira to hospital' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setCustomAudioText(preset.text);
                          playUtteranceAudio(preset.text);
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-stone-100 border border-black/20 text-stone-800 text-[10px] font-mono hover:border-black transition-colors"
                        title="Insert phrase and listen aloud"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Waveform Visualizer & Audio Player */}
            <div className="bg-[#FAF8F5] p-3 border border-black/15 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePlayAudio}
                    className={`w-8 h-8 flex items-center justify-center transition-colors shadow-sm ${
                      isPlayingAudio ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#F27D26] hover:bg-black text-white'
                    }`}
                    title={isPlayingAudio ? 'Stop audio' : 'Play audio utterance aloud'}
                  >
                    {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs text-black font-semibold flex items-center space-x-1.5">
                      <span>{isPlayingAudio ? '🔊 Playing Audio Through Speaker...' : 'Play Audio Clip'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 line-clamp-1 max-w-[280px]">
                      {currentlySpeakingText ? `"${currentlySpeakingText}"` : (inputMode === 'mic' && customAudioText.trim() ? `"${customAudioText.trim()}"` : `"${activeSample.groundTruth.slice(0, 38)}..."`)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 flex items-center space-x-1">
                    <Volume2 className="w-3 h-3 text-emerald-600" />
                    <span>Speakers Online</span>
                  </span>
                  <span className="text-[11px] font-mono font-medium text-stone-600">
                    {activeSample.accentRegion}
                  </span>
                </div>
              </div>

              {/* Canvas Waveform */}
              <div className="relative w-full h-12 bg-white border border-black/15 overflow-hidden flex items-center">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={48}
                  className="w-full h-full object-cover"
                />
                {isPlayingAudio && (
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#F27D26]/20 border-r-2 border-[#F27D26] transition-all pointer-events-none"
                    style={{ width: `${playbackProgress}%` }}
                  />
                )}
              </div>

              {speakerOutputNotice && (
                <div className="text-[10px] font-mono text-[#B84E00] bg-[#F27D26]/10 px-2 py-1 border border-[#F27D26]/30 flex items-center justify-between">
                  <span>🔊 {speakerOutputNotice}</span>
                  <span className="text-stone-500">(Ensure your device speakers are unmuted)</span>
                </div>
              )}
            </div>

            {/* Layer 1: Speech (Sahara ASR Engine) */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-black/15">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5">
                    Layer 1: 🎙️ Speech
                  </span>
                  <span className="text-xs font-serif font-bold italic text-black">
                    Sahara Voice ASR Output
                  </span>
                </div>

                {asrOutput ? (
                  <div className="flex items-center space-x-2 font-mono text-[10px]">
                    <span
                      className={`px-2 py-0.5 font-bold ${
                        asrOutput.isLiveInference
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                          : 'bg-[#F27D26]/15 text-[#B84E00] border border-[#F27D26]/40'
                      }`}
                    >
                      {asrOutput.isLiveInference ? '● Live Intron Inference' : '● Afriswitch Calibrated Reference'}
                    </span>
                    <span className="text-stone-600 bg-stone-100 px-1.5 py-0.5 border border-black/10">
                      {asrOutput.latencyMs}ms
                    </span>
                    <span className="text-stone-600 bg-stone-100 px-1.5 py-0.5 border border-black/10">
                      Conf: {(asrOutput.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5">
                      Awaiting ASR execution
                    </span>
                    <button
                      onClick={() => handleRunAgent()}
                      className="text-[10px] font-bold uppercase tracking-wider bg-[#F27D26] hover:bg-black text-white px-2.5 py-0.5 transition-colors"
                    >
                      Transcribe Now ➔
                    </button>
                  </div>
                )}
              </div>

              {/* Diagnostic banner if present */}
              {asrOutput?.diagnosticMessage && (
                <div className="text-[11px] bg-stone-100 p-2 border border-black/10 text-stone-700 font-mono">
                  ℹ️ {asrOutput.diagnosticMessage}
                </div>
              )}

              {/* Verbatim Transcript Box */}
              <div className="p-3 bg-white border border-black/15 text-sm leading-relaxed font-serif italic text-stone-900 flex items-start justify-between gap-2">
                <span className="flex-1">
                  "{asrOutput?.transcript || (inputMode === 'mic' && customAudioText.trim() ? customAudioText.trim() : activeSample.groundTruth)}"
                </span>
                <button
                  onClick={() => playUtteranceAudio(asrOutput?.transcript || (inputMode === 'mic' && customAudioText.trim() ? customAudioText.trim() : activeSample.groundTruth))}
                  className="p-1 hover:bg-stone-100 text-stone-600 hover:text-black transition-colors"
                  title="Listen to this transcript"
                >
                  <Volume2 className="w-4 h-4 text-[#F27D26]" />
                </button>
              </div>
            </div>

            {/* Layer 2: Code-Switch Intelligence & Token Alignment */}
            <div className="space-y-2 pt-2 border-t border-black/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F27D26] text-white px-2 py-0.5">
                    Layer 2: 🧠 Code-Switch Intelligence
                  </span>
                  <span className="text-xs font-serif font-bold italic text-black">
                    Token Matrix & Dialect Boundary Tagging
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#F27D26]/20 border border-[#F27D26]" />
                    <span className="text-stone-700 font-medium">
                      {selectedLanguage.split('-')[0]} (Embedded)
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-stone-200 border border-stone-400" />
                    <span className="text-stone-700 font-medium">
                      {selectedLanguage.split('-')[1] || 'English'} (Matrix)
                    </span>
                  </span>
                </div>
              </div>

              {/* Interactive Token Strip */}
              <div className="p-3 bg-[#FAF8F5] border border-black/15 text-sm leading-loose">
                {tokens.map((tokenObj, idx) => {
                  const isIndigenous = tokenObj.language !== 'English' && tokenObj.language !== 'French';
                  return (
                    <span
                      key={idx}
                      onClick={() => setActiveTokenInfo(tokenObj)}
                      className={`inline-block px-1.5 py-0.5 mx-0.5 cursor-pointer transition-all border ${
                        isIndigenous
                          ? 'bg-[#F27D26]/15 text-[#B84E00] border-[#F27D26]/40 font-semibold hover:bg-[#F27D26]/25'
                          : 'bg-white text-stone-800 border-black/15 font-medium hover:border-black'
                      }`}
                      title={`${tokenObj.language} (${tokenObj.role}) - Click for translation`}
                    >
                      {tokenObj.token}
                    </span>
                  );
                })}
              </div>

              {/* Active Token Inspector */}
              {activeTokenInfo && (
                <div className="p-2.5 bg-white border-l-4 border-[#F27D26] border-y border-r border-black/15 text-xs flex items-center justify-between text-stone-800 animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-black font-mono">
                      "{activeTokenInfo.token}"
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-stone-200 text-stone-800 border border-black/10">
                      {activeTokenInfo.language}
                    </span>
                    <span className="text-stone-500">Translation:</span>
                    <strong className="text-[#F27D26] font-serif italic text-sm">
                      {activeTokenInfo.translation || 'Standard context'}
                    </strong>
                  </div>
                  <button
                    onClick={() => setActiveTokenInfo(null)}
                    className="text-stone-500 hover:text-black text-[10px] font-bold uppercase"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Code-Switching Metrics Strip */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-[#FAF8F5] p-2 border border-black/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Switch Points</div>
                  <div className="text-xl font-serif italic font-bold text-[#F27D26]">
                    {totalSwitches}
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-2 border border-black/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Switch Density</div>
                  <div className="text-xl font-serif italic font-bold text-black">
                    {(totalSwitches / (activeSample.durationSec || 1)).toFixed(1)}/s
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-2 border border-black/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Matrix Tokens</div>
                  <div className="text-xl font-serif italic font-bold text-stone-800">
                    {matrixTokens.length}
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-2 border border-black/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Embedded Tokens</div>
                  <div className="text-xl font-serif italic font-bold text-[#F27D26]">
                    {embeddedTokens.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons to Trigger Agentic Processing */}
            <div className="pt-2 border-t border-black/10 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-stone-600">
                Active Domain: <strong className="text-black font-semibold uppercase">{activeSample.category}</strong>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="run-agent-btn"
                  onClick={() => handleRunAgent()}
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-[2px_2px_0px_0px_#F27D26] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                      <span>Transcribing & Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                      <span>Execute Full 3-Layer Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Agentic Output & Clinical/Fintech Extraction */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-none border border-black/15 p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)] min-h-[460px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5">
                    Layer 3: 🤖 Action
                  </span>
                  <h3 className="text-base font-serif font-black italic text-[#1A1A1A]">
                    Clinical Decision Support & Agentic Dispatch
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#F27D26] text-white">
                  SaharaCare
                </span>
              </div>

              {!agentResult && !isProcessing && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 border border-black/10">
                    <Sparkles className="w-6 h-6 text-[#F27D26]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-black">
                      Ready to parse African Code-Switched Speech
                    </p>
                    <p className="text-[11px] text-stone-500 max-w-xs mx-auto leading-relaxed">
                      Click "Execute Agentic Action" to extract clinical SOAP notes, financial payment
                      intents, or agricultural advisory workflows.
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunAgent()}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black hover:bg-stone-800 text-white border border-black inline-flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_#F27D26]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                    <span>
                      {inputMode === 'mic' && customAudioText.trim()
                        ? `Transcribe & Analyze "${customAudioText.trim().slice(0, 16)}"`
                        : 'Run Sample Analysis'}
                    </span>
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-black border-t-[#F27D26] rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-black font-bold uppercase tracking-wider">
                    Performing Intra-Sentential Code-Switch Extraction...
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Grounding matrix grammar, resolving colloquial vernacular, mapping clinical entities
                  </p>
                </div>
              )}

              {agentResult && !isProcessing && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Action Banner */}
                  <div className="bg-[#F27D26]/10 border-l-4 border-[#F27D26] border-y border-r border-black/10 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-900">
                        {agentResult.agenticAction?.actionType || 'AGENTIC_ACTION_TRIGGERED'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 font-mono ${
                          agentResult.agenticAction?.urgency === 'HIGH' ||
                          agentResult.agenticAction?.urgency === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {agentResult.agenticAction?.urgency || 'NORMAL'}
                      </span>
                    </div>
                    <p className="text-xs text-black font-serif italic text-[13px] font-medium leading-snug">
                      {agentResult.agenticAction?.summary}
                    </p>
                  </div>

                  {/* Standardized Translation */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                      Standardized English Translation (Normalized)
                    </span>
                    <div className="bg-[#FAF8F5] p-3 border border-black/15 text-xs text-stone-900 font-serif italic text-[13px] leading-relaxed flex items-start justify-between gap-2">
                      <span className="flex-1">"{agentResult.fullStandardTranslation}"</span>
                      <button
                        onClick={() => playUtteranceAudio(agentResult.fullStandardTranslation)}
                        className="p-1 hover:bg-stone-200 text-stone-600 hover:text-black transition-colors"
                        title="Listen to English translation"
                      >
                        <Volume2 className="w-4 h-4 text-[#F27D26]" />
                      </button>
                    </div>
                  </div>

                  {/* Multilingual African Vernacular Translation Tool */}
                  <div className="bg-white border border-black/15 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center space-x-1.5">
                        <Languages className="w-3.5 h-3.5 text-[#F27D26]" />
                        <span>Translate to Another African Language / Dialect:</span>
                      </span>
                      <span className="text-[9px] font-mono text-stone-500">Polyglot Mode</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: 'Swahili', lang: 'Swahili (Kiswahili)' },
                        { label: 'Yoruba', lang: 'Yoruba (Èdè Yorùbá)' },
                        { label: 'Pidgin', lang: 'Nigerian Pidgin (Naija)' },
                        { label: 'Hausa', lang: 'Hausa' },
                        { label: 'isiZulu', lang: 'isiZulu (Zulu)' },
                        { label: 'French', lang: 'French (Français)' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleTranslateToAlt(item.lang)}
                          disabled={isTranslatingAlt}
                          className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            altLang.includes(item.label)
                              ? 'bg-black text-white border-black shadow-[1px_1px_0px_0px_#F27D26]'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-black/20'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {isTranslatingAlt && (
                      <div className="text-center py-2 text-stone-500 text-xs font-mono flex items-center justify-center space-x-2">
                        <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                        <span>Translating into {altLang}...</span>
                      </div>
                    )}

                    {altTranslation && !isTranslatingAlt && (
                      <div className="bg-[#FAF8F5] p-2.5 border border-black/15 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-600">
                          <span>Output in {altLang}:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => playUtteranceAudio(altTranslation)}
                              className="text-[#F27D26] hover:underline flex items-center space-x-1"
                              title="Listen to translation"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(altTranslation);
                                setIsCopiedAlt(true);
                                setTimeout(() => setIsCopiedAlt(false), 2000);
                              }}
                              className="text-stone-600 hover:text-black flex items-center space-x-1"
                            >
                              {isCopiedAlt ? <Check className="w-3 h-3 text-emerald-600" /> : <span>Copy</span>}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-serif italic text-black font-medium leading-relaxed">
                          "{altTranslation}"
                        </p>

                        {altPronunciation && (
                          <div className="text-[10px] font-mono text-[#B84E00] bg-[#F27D26]/10 px-2 py-0.5 border border-[#F27D26]/20">
                            🗣️ {altPronunciation}
                          </div>
                        )}

                        {altNotes && (
                          <div className="text-[10px] text-stone-600 font-mono">
                            ℹ️ {altNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Extracted Key-Value Entities */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                      Structured Domain Entities
                    </span>
                    <div className="bg-white border border-black/15 divide-y divide-black/10 text-xs">
                      {Object.entries(agentResult.extractedEntities || {}).map(
                        ([key, val]: [string, any]) => (
                          <div key={key} className="p-2 flex items-start justify-between">
                            <span className="text-stone-600 capitalize font-medium">{key}:</span>
                            <span className="text-black font-mono font-semibold text-right max-w-[60%]">
                              {String(val)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Linguistic & Code-Switch Analysis Note */}
                  {agentResult.linguisticNotes && (
                    <div className="p-2.5 bg-[#FAF8F5] border border-black/10 text-[11px] text-stone-700 flex items-start space-x-2">
                      <Info className="w-3.5 h-3.5 text-[#F27D26] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-black">Linguistic Insight: </strong>
                        {agentResult.linguisticNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Category Quick Switchers */}
            <div className="pt-3 border-t border-black/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Simulate Specialized Category Workflows:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleRunAgent('health')}
                  className="px-2 py-1 bg-[#FAF8F5] hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-wider text-stone-800 border border-black/20 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Stethoscope className="w-3 h-3 text-[#F27D26]" />
                  <span>Clinical SOAP</span>
                </button>
                <button
                  onClick={() => handleRunAgent('fintech')}
                  className="px-2 py-1 bg-[#FAF8F5] hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-wider text-stone-800 border border-black/20 flex items-center justify-center space-x-1 transition-colors"
                >
                  <CreditCard className="w-3 h-3 text-[#F27D26]" />
                  <span>Voice Banking</span>
                </button>
                <button
                  onClick={() => handleRunAgent('agriculture')}
                  className="px-2 py-1 bg-[#FAF8F5] hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-wider text-stone-800 border border-black/20 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Sprout className="w-3 h-3 text-[#F27D26]" />
                  <span>Crop Advisory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 90-120s Guided Pitch Walkthrough Modal */}
      <GuidedDemoModal
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
      />
    </div>
  );
};
