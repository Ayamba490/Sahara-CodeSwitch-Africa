import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Volume2,
  Square,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Languages,
  BookOpen,
  Mic,
  MessageSquare,
  Stethoscope,
  Info,
  ChevronRight,
} from 'lucide-react';

interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  pronunciationGuide?: string;
  literalBreakdown?: string;
  linguisticNotes?: string;
  detectedCodeSwitching?: boolean;
  confidence?: number;
  engine?: string;
  isLiveAi?: boolean;
  latencyMs?: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', voiceLang: 'en-US', region: 'Global / West / East Africa' },
  { code: 'sw', name: 'Swahili (Kiswahili)', voiceLang: 'sw-KE', region: 'Kenya, Tanzania, Uganda, DRC' },
  { code: 'yo', name: 'Yoruba (Èdè Yorùbá)', voiceLang: 'yo-NG', region: 'Southwestern Nigeria, Benin' },
  { code: 'pcm', name: 'Nigerian Pidgin (Naija)', voiceLang: 'en-NG', region: 'Nigeria, Ghana, Cameroon' },
  { code: 'ha', name: 'Hausa', voiceLang: 'ha-NG', region: 'Northern Nigeria, Niger, Chad' },
  { code: 'zu', name: 'isiZulu (Zulu)', voiceLang: 'zu-ZA', region: 'South Africa, Eswatini' },
  { code: 'ig', name: 'Igbo (Asụsụ Igbo)', voiceLang: 'en-NG', region: 'Southeastern Nigeria' },
  { code: 'fr', name: 'French (Français)', voiceLang: 'fr-FR', region: 'Francophone West & Central Africa' },
];

const PRESETS = [
  {
    title: 'English ➔ Swahili (Clinical)',
    source: 'English',
    target: 'Swahili (Kiswahili)',
    text: 'The patient has a very high fever and joint pains; take two tablets every morning.',
  },
  {
    title: 'English ➔ Yoruba (Hospital)',
    source: 'English',
    target: 'Yoruba (Èdè Yorùbá)',
    text: 'Doctor says your body is hot; drink plenty of water and rest.',
  },
  {
    title: 'English ➔ Nigerian Pidgin (Fintech)',
    source: 'English',
    target: 'Nigerian Pidgin (Naija)',
    text: 'Please transfer twenty thousand naira immediately to pay for the hospital discharge bill.',
  },
  {
    title: 'Swahili ➔ English (Malaria Triage)',
    source: 'Swahili (Kiswahili)',
    target: 'English',
    text: 'Mgonjwa ana homa kali sana na joint pains, bado anatapika non-stop since asubuhi.',
  },
  {
    title: 'Yoruba ➔ English (Febrile Illness)',
    source: 'Yoruba (Èdè Yorùbá)',
    target: 'English',
    text: 'Doctor, ara mi gbona gan since yesterday, mo ni severe headache ati body weakness.',
  },
  {
    title: 'Vernacular Greeting ➔ English',
    source: 'Swahili (Kiswahili)',
    target: 'English',
    text: 'Habari yako, jambo daktari?',
  },
];

export const BidirectionalTranslator: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<string>('Auto-Detect');
  const [targetLang, setTargetLang] = useState<string>('English');
  const [inputText, setInputText] = useState<string>('Mgonjwa ana homa kali sana na joint pains, bado anatapika non-stop since asubuhi.');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [contextMode, setContextMode] = useState<'clinical' | 'fintech' | 'general'>('clinical');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleSwapLanguages = () => {
    if (sourceLang === 'Auto-Detect') {
      setSourceLang(targetLang);
      setTargetLang('English');
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    if (result?.translatedText) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  const handleTranslate = async (textToTranslate = inputText) => {
    if (!textToTranslate.trim()) return;

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: sourceLang,
          targetLang: targetLang,
          context: contextMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const playAudio = (text: string, langName: string) => {
    if (!text || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    // Acoustic chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext fallback
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetObj = SUPPORTED_LANGUAGES.find((l) => l.name.toLowerCase().includes(langName.toLowerCase()) || langName.toLowerCase().includes(l.name.toLowerCase()));
    utterance.lang = targetObj?.voiceLang || 'en-US';
    utterance.rate = 0.92;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type or paste your utterance.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputText(transcript);
      };
      recognition.onend = () => {
        setIsRecording(false);
        handleTranslate();
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#F27D26] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center">
              <Languages className="w-5 h-5 text-[#F27D26]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold italic text-black">
                Bidirectional African Language & Code-Switch Translation Studio
              </h2>
              <p className="text-xs text-stone-600 font-mono">
                Translate seamlessly between African Indigenous Vernaculars (Swahili, Yoruba, Pidgin, Hausa, Zulu, Igbo) and Standard English
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-1 border border-black/15">
              Domain Context:
            </span>
            {(['clinical', 'fintech', 'general'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setContextMode(mode)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-black transition-all ${
                  contextMode === mode
                    ? 'bg-[#F27D26] text-white shadow-[2px_2px_0px_0px_black]'
                    : 'bg-white hover:bg-stone-100 text-black'
                }`}
              >
                {mode === 'clinical' && '🏥 Clinical / Health'}
                {mode === 'fintech' && '💳 Fintech & USSD'}
                {mode === 'general' && '💬 Daily Vernacular'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-[#FAF8F5] border border-black/15 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>Interactive Dialect Presets (Click to Load & Translate):</span>
          </span>
          <span className="text-[10px] text-stone-500 font-mono">Bidirectional English ⇄ African Languages</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSourceLang(preset.source);
                setTargetLang(preset.target);
                setInputText(preset.text);
                handleTranslate(preset.text);
              }}
              className="p-2 text-left bg-white hover:bg-stone-50 border border-black/15 hover:border-black transition-all group flex flex-col justify-between"
            >
              <div className="text-[10px] font-bold text-black group-hover:text-[#F27D26] truncate">
                {preset.title}
              </div>
              <div className="text-[9px] text-stone-500 line-clamp-1 italic mt-1 font-serif">
                "{preset.text}"
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Source Language */}
        <div className="md:col-span-5 bg-white border border-black/20 p-3 space-y-1.5 shadow-sm">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
            Translate From (Source):
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-black/20 p-2 text-xs font-bold text-black focus:outline-none focus:border-black"
          >
            <option value="Auto-Detect">✨ Auto-Detect (African Indigenous / English / Code-Switched)</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.name} — ({lang.region})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={handleSwapLanguages}
            className="w-10 h-10 bg-black hover:bg-stone-800 text-white flex items-center justify-center border border-black transition-transform active:scale-95 shadow-[2px_2px_0px_0px_#F27D26]"
            title="Swap source and target languages"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#F27D26]" />
          </button>
        </div>

        {/* Target Language */}
        <div className="md:col-span-5 bg-white border border-black/20 p-3 space-y-1.5 shadow-sm">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
            Translate To (Target):
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-black/20 p-2 text-xs font-bold text-black focus:outline-none focus:border-black"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.name} — ({lang.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input & Output Translation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source Input Box */}
        <div className="bg-white border-2 border-black p-4 space-y-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)] min-h-[320px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-1.5">
                <span>Input Utterance:</span>
                <span className="text-[10px] font-normal text-stone-500">({sourceLang})</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startVoiceInput}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-black flex items-center space-x-1 transition-all ${
                    isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-black'
                  }`}
                  title="Speak into microphone to input text"
                >
                  <Mic className="w-3 h-3 text-[#F27D26]" />
                  <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
                <button
                  onClick={() => playAudio(inputText, sourceLang)}
                  className="p-1 hover:bg-stone-100 text-stone-600 hover:text-black transition-colors"
                  title="Listen to input aloud"
                >
                  <Volume2 className="w-4 h-4 text-[#F27D26]" />
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type English sentence or African vernacular (e.g. Swahili, Yoruba, Hausa, Pidgin)..."
              rows={7}
              className="w-full bg-[#FAF8F5] border border-black/20 p-3 text-sm font-mono text-black placeholder-stone-400 focus:outline-none focus:border-black resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-[10px] text-stone-500 font-mono">
              {inputText.length} characters • {inputText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={() => handleTranslate()}
              disabled={isTranslating || !inputText.trim()}
              className="px-5 py-2.5 bg-[#F27D26] hover:bg-[#d96716] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-[2px_2px_0px_0px_black] disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating Dialect...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate to {targetLang.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translation Output Box */}
        <div className="bg-[#FAF8F5] border-2 border-black p-4 space-y-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)] min-h-[320px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  Target Translation:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white">
                  {targetLang}
                </span>
              </div>

              {result && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => playAudio(result.translatedText, targetLang)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-black flex items-center space-x-1 transition-all ${
                      isPlayingAudio ? 'bg-red-600 text-white' : 'bg-white hover:bg-stone-100 text-black'
                    }`}
                    title="Hear translated pronunciation spoken aloud"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-[#F27D26]" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => copyToClipboard(result.translatedText)}
                    className="p-1.5 bg-white hover:bg-stone-100 border border-black/20 text-stone-700 hover:text-black transition-colors"
                    title="Copy translation to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Translation Output Text */}
            <div className="bg-white border border-black/15 p-3.5 min-h-[140px] text-sm text-stone-900 font-serif leading-relaxed italic flex items-center justify-start">
              {isTranslating ? (
                <div className="w-full text-center space-y-2 py-6">
                  <div className="w-6 h-6 border-2 border-black border-t-[#F27D26] rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-mono text-stone-500 block">
                    Harmonizing vernacular grammar & dialect tones...
                  </span>
                </div>
              ) : result ? (
                <div className="space-y-2 w-full not-italic">
                  <p className="text-base font-serif italic text-black font-medium leading-relaxed">
                    "{result.translatedText}"
                  </p>

                  {result.pronunciationGuide && (
                    <div className="text-xs font-mono text-[#B84E00] bg-[#F27D26]/10 p-2 border border-[#F27D26]/30 flex items-center justify-between">
                      <span>🗣️ <strong>Phonetic Guide:</strong> {result.pronunciationGuide}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-stone-400 text-center w-full py-8 text-xs font-mono">
                  Translation will appear here with dialect guidance and pronunciation audio.
                </div>
              )}
            </div>

            {/* Cultural & Clinical Notes */}
            {result?.linguisticNotes && (
              <div className="bg-white border border-black/10 p-2.5 text-xs text-stone-700 space-y-1">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <Info className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>Cultural, Dialect & Medical Insights:</span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-stone-800">
                  {result.linguisticNotes}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[10px] font-mono text-stone-600">
            <span>
              Engine: <strong className="text-black">{result?.engine || 'Sahara Polyglot Engine'}</strong>
            </span>
            {result?.latencyMs && <span>Latency: {result.latencyMs}ms</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
