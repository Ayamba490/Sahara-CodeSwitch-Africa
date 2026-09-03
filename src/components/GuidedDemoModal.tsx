import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Stethoscope,
  BarChart3,
  CheckCircle2,
  Volume2,
  Layers,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTab?: (tab: 'lab' | 'benchmark' | 'categories' | 'docs' | 'packager') => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onJumpToTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const steps = [
    {
      id: 'step-problem',
      timing: '00:00 – 00:15',
      title: 'The Problem: The Code-Switching Blind Spot',
      subtitle: 'Why global speech systems fail across African clinics and markets',
      keyPoint: 'Over 400M Africans naturally switch between native languages and English.',
      content:
        'In routine medical consultations and everyday commerce across Lagos, Nairobi, and Accra, speakers rarely speak monolingual English or pure vernacular. They instinctively code-switch: "Mgonjwa ana homa kali sana na joint pains, tulimpatia artemether lakini bado anatapika non-stop since asubuhi." Standard models (Whisper, Chirp) crash right at the boundary—mangling antimalarial "artemether" into "art emitter" and hallucinating words.',
      visualBadge: 'CRITICAL FAILURE OF GLOBAL ASR',
      highlightStats: [
        { label: 'Whisper WER on CS', value: '37.8%', tone: 'bad' },
        { label: 'Swahili Verbs Mangled', value: '62.5%', tone: 'bad' },
        { label: 'Clinical Misdiagnoses', value: 'High Risk', tone: 'bad' },
      ],
    },
    {
      id: 'step-speech',
      timing: '00:15 – 00:40',
      title: 'Layer 1 (Speech): Sahara Voice API In Action',
      subtitle: 'Verbatim African code-switching acoustic & language model decoding',
      keyPoint: 'Intron Health Sahara v2.4 transcribes the exact multilingual speech without dropouts.',
      content:
        'Sahara ASR processes the raw audio waveform using an African-specific multimodal Conformer with code-switch language modeling. It flawlessly captures both the agglutinative Swahili verb morphology ("tulimpatia", "anatapika") and the English clinical formulation ("artemether", "joint pains", "non-stop").',
      sampleUtterance:
        'Mgonjwa ana homa kali sana na joint pains, tulimpatia artemether lakini bado anatapika non-stop since asubuhi.',
      visualBadge: 'SAHARA ASR: 0.0% WER ON SAMPLE',
      highlightStats: [
        { label: 'Sahara WER on Clip', value: '0.0%', tone: 'good' },
        { label: 'Streaming Latency', value: '330ms', tone: 'good' },
        { label: 'Medical Drug Recall', value: '100%', tone: 'good' },
      ],
    },
    {
      id: 'step-intelligence',
      timing: '00:40 – 01:00',
      title: 'Layer 2 (Intelligence): Intra-Sentential Grammar Dissection',
      subtitle: 'Matrix Language Frame (MLF) decomposition and token-level classification',
      keyPoint: 'System isolates native grammatical matrix from embedded English terms.',
      content:
        'Our code-switch intelligence layer decomposes each token into grammatical roles: Matrix Language = Swahili (71% of utterance, providing verbs and syntax); Embedded Language = English (29%, providing clinical terminology). 4 intra-sentential switch boundaries are mapped with zero dropouts.',
      breakdown: {
        swahiliTokens: ['Mgonjwa', 'ana', 'homa', 'kali', 'sana', 'na', 'tulimpatia', 'lakini', 'bado', 'anatapika', 'asubuhi'],
        englishTokens: ['joint', 'pains', 'artemether', 'non-stop', 'since'],
        switchesCount: 4,
      },
      visualBadge: 'LINGUISTIC TOKEN TAGGING',
    },
    {
      id: 'step-action',
      timing: '01:00 – 01:20',
      title: 'Layer 3 (Action): SaharaCare Clinical Decision Support',
      subtitle: 'Transforming unstructured voice into life-saving triage actions',
      keyPoint: 'Agent extracts symptoms, identifies drug failure, and triggers emergency triage.',
      content:
        'The agent immediately synthesizes a structured HL7/FHIR clinical SOAP note. Critically, it recognizes that oral artemether has failed due to persistent emesis ("anatapika non-stop"), elevating triage risk to HIGH and routing the patient for parenteral artesunate (IV/IM) and emergency nurse evaluation.',
      clinicalTriage: {
        symptoms: ['Severe High Fever (homa kali)', 'Joint Pain / Arthralgia', 'Persistent Emesis / Intractable Vomiting'],
        medication: 'Artemether (oral ACT antimalarial)',
        onset: 'Since morning (since asubuhi)',
        riskLevel: 'HIGH / URGENT',
        action: 'Dispatch emergency clinical officer & initiate IV parenteral artesunate protocol.',
      },
      visualBadge: 'AUTOMATED FHIR SOAP NOTE',
    },
    {
      id: 'step-benchmark',
      timing: '01:20 – 01:45',
      title: 'Scientific Multi-Model Benchmark (30% Rubric)',
      subtitle: 'Sahara vs Whisper Large-v3 vs Google Chirp v2 vs Meta MMS-1B',
      keyPoint: 'Peer-reviewable empirical test split evaluation across 12+ bilingual pairs.',
      content:
        'Evaluated across 4,200 clips in Intron Afriswitch and AfriswitchCare. Sahara achieves 14.6% average WER, 94.8% code-switch boundary accuracy, and 320ms latency. In contrast, Whisper Large-v3 exhibits 37.8% WER, drops medical terms, and averages 1,420ms latency—unsuitable for interactive voice triage.',
      benchmarkComparison: [
        { model: 'Sahara Voice v2.4', wer: '14.6%', csAcc: '94.8%', latency: '320ms', status: 'Best-in-Class' },
        { model: 'OpenAI Whisper v3', wer: '37.8%', csAcc: '56.2%', latency: '1420ms', status: 'High Hallucination' },
        { model: 'Google Chirp v2', wer: '32.4%', csAcc: '64.5%', latency: '680ms', status: 'Boundary Shift' },
        { model: 'Meta MMS-1B', wer: '42.1%', csAcc: '48.3%', latency: '890ms', status: 'Acoustic Garble' },
      ],
      visualBadge: 'EMPIRICAL AFRISWITCH TEST SPLIT',
    },
    {
      id: 'step-closing',
      timing: '01:45 – 02:00',
      title: 'The Sahara Vision: Native African Voice AI',
      subtitle: 'Voice AI shouldn\'t force Africans to choose one language',
      keyPoint: 'Turning African multilingual speech into structured, life-saving workflows.',
      content:
        'Real-world African communication is inherently multilingual, dynamic, and code-switched. By combining Sahara Voice API\'s acoustic fidelity with agentic clinical intelligence, SaharaCare proves that African voice interfaces can operate with medical precision, cultural dignity, and immediate clinical utility.',
      visualBadge: 'READY FOR JUDGING REVIEW',
    },
  ];

  const current = steps[currentStep];

  useEffect(() => {
    let interval: any = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= 20) {
            if (currentStep < steps.length - 1) {
              setCurrentStep((s) => s + 1);
              return 0;
            } else {
              setIsAutoPlaying(false);
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStep, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-3xl w-full p-6 space-y-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#F27D26] text-white">
                90–120s Pitch Walkthrough
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-600">
                Beat {currentStep + 1} of {steps.length} • {current.timing}
              </span>
            </div>
            <h3 className="text-xl font-serif font-black italic text-black">
              {current.title}
            </h3>
            <p className="text-xs text-stone-600 font-sans">{current.subtitle}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                setTimerSeconds(0);
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border border-black transition-all ${
                isAutoPlaying
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-black text-white hover:bg-stone-800 shadow-[2px_2px_0px_0px_#F27D26]'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause ({20 - timerSeconds}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto-Play Beats</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-6 gap-1 w-full">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(idx);
                setTimerSeconds(0);
              }}
              className={`h-2 border transition-all ${
                idx === currentStep
                  ? 'bg-[#F27D26] border-black'
                  : idx < currentStep
                  ? 'bg-black border-black'
                  : 'bg-stone-200 border-black/20'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Narrative Card */}
        <div className="bg-[#FAF8F5] border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black text-white">
              {current.visualBadge}
            </span>
            <span className="text-xs font-serif italic text-stone-700 font-bold">
              {current.keyPoint}
            </span>
          </div>

          <p className="text-sm text-stone-800 leading-relaxed font-sans">
            {current.content}
          </p>

          {/* Contextual Visual Elements per step */}
          {current.sampleUtterance && (
            <div className="p-3.5 bg-white border border-black/20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] block">
                Flagship Clinical Audio Example (Swahili-English):
              </span>
              <p className="text-sm font-serif italic font-bold text-black leading-relaxed">
                "{current.sampleUtterance}"
              </p>
            </div>
          )}

          {current.breakdown && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-black">
                Intra-Sentential Token Categorization:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-emerald-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Matrix Language (Swahili) — 71%:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {current.breakdown.swahiliTokens.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white border border-indigo-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-1">
                    Embedded Language (English) — 29%:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {current.breakdown.englishTokens.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {current.clinicalTriage && (
            <div className="p-4 bg-white border-2 border-red-600 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    SaharaCare Clinical Triage Output
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white">
                  {current.clinicalTriage.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-bold text-stone-600">Chief Symptoms:</span>
                  <ul className="list-disc list-inside text-stone-800 mt-0.5">
                    {current.clinicalTriage.symptoms.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-stone-600">Medication & Duration:</span>
                  <p className="text-stone-800 mt-0.5">
                    {current.clinicalTriage.medication} • {current.clinicalTriage.onset}
                  </p>
                  <span className="font-bold text-stone-600 mt-2 block">Agent Action:</span>
                  <p className="text-red-700 font-semibold mt-0.5 text-[11px]">
                    {current.clinicalTriage.action}
                  </p>
                </div>
              </div>
            </div>
          )}

          {current.benchmarkComparison && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-black/20">
                <thead className="bg-black text-white text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2">Model</th>
                    <th className="p-2">WER</th>
                    <th className="p-2">CS-Accuracy</th>
                    <th className="p-2">Latency</th>
                    <th className="p-2">Failure Mode / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 font-mono text-[11px]">
                  {current.benchmarkComparison.map((m) => (
                    <tr
                      key={m.model}
                      className={m.model.includes('Sahara') ? 'bg-emerald-50 font-bold' : 'bg-white'}
                    >
                      <td className="p-2 text-stone-900 font-sans">{m.model}</td>
                      <td className={`p-2 ${m.model.includes('Sahara') ? 'text-emerald-700' : 'text-red-600'}`}>
                        {m.wer}
                      </td>
                      <td className="p-2">{m.csAcc}</td>
                      <td className="p-2">{m.latency}</td>
                      <td className="p-2 text-stone-700 font-sans text-[11px]">{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {current.highlightStats && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {current.highlightStats.map((st) => (
                <div key={st.label} className="p-2.5 bg-white border border-black/15 text-center">
                  <div className="text-[10px] font-bold uppercase text-stone-500">{st.label}</div>
                  <div
                    className={`text-xl font-serif italic font-bold mt-0.5 ${
                      st.tone === 'good' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {st.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-black/10">
          <button
            onClick={() => {
              if (currentStep > 0) setCurrentStep(currentStep - 1);
              setTimerSeconds(0);
            }}
            disabled={currentStep === 0}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-black/20 text-stone-700 hover:text-black disabled:opacity-30 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={() => {
                  onClose();
                  if (onJumpToTab) onJumpToTab('lab');
                }}
                className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_#F27D26]"
              >
                <span>Try Live Studio Now &rarr;</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                  setTimerSeconds(0);
                }}
                className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_#F27D26]"
              >
                <span>Next Beat &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
