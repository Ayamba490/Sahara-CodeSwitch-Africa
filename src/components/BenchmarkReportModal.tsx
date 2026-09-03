import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Copy,
  CheckCircle2,
  Terminal,
  Database,
  Layers,
  Activity,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  REPRODUCIBLE_BENCHMARK_SPEC,
  generateReproducibleMarkdown,
  generatePythonHarnessScript,
} from '../data/benchmarkReport';
import { BENCHMARK_SAMPLES } from '../data/benchmarkData';

interface BenchmarkReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkReportModal: React.FC<BenchmarkReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'python' | 'json' | 'samples'>('dossier');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const spec = REPRODUCIBLE_BENCHMARK_SPEC;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateReproducibleMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([generateReproducibleMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'REPRODUCIBLE_BENCHMARK_REPORT.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([generatePythonHarnessScript()], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'benchmark_harness.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(generatePythonHarnessScript());
    setCopiedPy(true);
    setTimeout(() => setCopiedPy(false), 2000);
  };

  const rawEvidenceJson = JSON.stringify(
    {
      specification: spec,
      samples: BENCHMARK_SAMPLES,
    },
    null,
    2
  );

  const handleDownloadJson = () => {
    const blob = new Blob([rawEvidenceJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'empirical_benchmark_evidence.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawEvidenceJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-5xl w-full max-h-[92vh] flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
        {/* Header */}
        <div className="p-4 md:p-5 border-b-2 border-black bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-black text-[#F27D26] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#F27D26] text-white px-2 py-0.5">
                  Rubric: 30% Benchmark Quality
                </span>
                <span className="text-[10px] font-mono text-stone-600">
                  Split Hash: {spec.dataset.testSplitHash.slice(0, 18)}...
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-black italic text-black leading-tight mt-0.5">
                Scientific Reproducibility & Benchmark Evidence Report
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-500 hover:text-black p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center justify-between border-b border-black/20 bg-stone-100 px-4 md:px-5">
          <div className="flex items-center space-x-1">
            {[
              { id: 'dossier', label: '1. Benchmark Dossier (Evidence)', icon: Layers },
              { id: 'python', label: '2. Python Reproducibility Script', icon: Terminal },
              { id: 'json', label: '3. Raw Evidence JSON', icon: Database },
              { id: 'samples', label: '4. Evaluation Split Audit', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    isActive
                      ? 'border-black text-black bg-white'
                      : 'border-transparent text-stone-600 hover:text-black hover:bg-stone-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F27D26]' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center space-x-2 py-2">
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-[1px_1px_0px_0px_#F27D26]"
            >
              <Download className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Download .MD</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 text-stone-900 bg-white">
          {/* TAB 1: DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Pillar 1: Dataset */}
              <div className="border border-black/20 p-4 space-y-3 bg-[#FAF8F5]">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-[#F27D26]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                      Pillar I: Dataset Provenance & Split Characterization
                    </h3>
                  </div>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 border border-black/10">
                    5,000 Clips • 60.5 Hours • 13 Bilingual Pairs
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 border border-black/10 space-y-1.5">
                    <div className="font-bold text-black flex items-center justify-between">
                      <span>1. Intron Afriswitch (General & Civic)</span>
                      <span className="text-[#F27D26] font-mono">3,200 clips (38.4h)</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Everyday spontaneous bilingual conversations covering fintech remittances, USSD mobile money, agriculture, and municipal public service inquiries.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['Fintech USSD', 'Agriculture', 'Civic Inquiries', 'Urban & Rural Accents'].map((tag) => (
                        <span key={tag} className="text-[10px] bg-stone-100 px-1.5 py-0.5 text-stone-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 border border-black/10 space-y-1.5">
                    <div className="font-bold text-black flex items-center justify-between">
                      <span>2. Intron AfriswitchCare (Clinical Triage)</span>
                      <span className="text-[#F27D26] font-mono">1,800 clips (22.1h)</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Acoustically certified clinical intake and outpatient triage consultations annotated by licensed African healthcare officers with verified pharmaceutical terminology.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['Maternal Triage', 'Pediatric Fever', 'Pharmaceutical Brand Recall', 'Danger Signs'].map((tag) => (
                        <span key={tag} className="text-[10px] bg-stone-100 px-1.5 py-0.5 text-stone-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-stone-700 bg-white p-2.5 border border-black/10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <strong className="text-black">13 Evaluated Language Pairs: </strong>
                    <span className="text-stone-600">{spec.dataset.languages.join(', ')}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 border border-black/15 text-stone-800">
                    Eval Partition: 500 clips held-out gold standard
                  </span>
                </div>
              </div>

              {/* Pillar 2: Models */}
              <div className="border border-black/20 p-4 space-y-3 bg-[#FAF8F5]">
                <div className="flex items-center space-x-2 border-b border-black/10 pb-2">
                  <Layers className="w-4 h-4 text-[#F27D26]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    Pillar II: Models Evaluated & Inference Checkpoints
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white border border-black/10">
                    <thead>
                      <tr className="bg-stone-100 text-[10px] uppercase font-bold text-stone-700 border-b border-black/20">
                        <th className="p-2.5">Model</th>
                        <th className="p-2.5">Provider</th>
                        <th className="p-2.5">Architecture</th>
                        <th className="p-2.5">Parameters</th>
                        <th className="p-2.5">Decoding Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {spec.models.map((m) => (
                        <tr key={m.id} className={m.id === 'sahara' ? 'bg-[#FAF8F5] font-semibold' : ''}>
                          <td className="p-2.5 text-black">
                            <div className="flex items-center space-x-1.5">
                              {m.id === 'sahara' && (
                                <span className="w-2 h-2 rounded-full bg-[#F27D26]" />
                              )}
                              <span>{m.name}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono block">{m.checkpoint}</span>
                          </td>
                          <td className="p-2.5 text-stone-700">{m.provider}</td>
                          <td className="p-2.5 text-stone-600 text-[11px]">{m.architecture}</td>
                          <td className="p-2.5 font-mono text-stone-700">{m.parameters}</td>
                          <td className="p-2.5 font-mono text-[10px] text-stone-600">{m.decodingSettings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pillar 3: Metrics */}
              <div className="border border-black/20 p-4 space-y-3 bg-[#FAF8F5]">
                <div className="flex items-center space-x-2 border-b border-black/10 pb-2">
                  <Activity className="w-4 h-4 text-[#F27D26]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    Pillar III: Standardized Evaluation Metrics & Formulas
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {spec.metrics.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 border border-black/10 space-y-1.5">
                      <div className="text-xs font-bold text-black uppercase tracking-wider">
                        {item.metric}
                      </div>
                      <div className="font-mono text-[11px] bg-stone-50 p-1.5 border border-black/10 text-[#F27D26] font-bold">
                        {item.formula}
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 4: Method */}
              <div className="border border-black/20 p-4 space-y-3 bg-[#FAF8F5]">
                <div className="flex items-center space-x-2 border-b border-black/10 pb-2">
                  <Sliders className="w-4 h-4 text-[#F27D26]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    Pillar IV: Scientific Methodology, Audio Normalization & Reproducibility
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 border border-black/10">
                    <div className="text-[10px] font-bold uppercase text-[#F27D26]">Audio Standard</div>
                    <div className="font-mono font-bold text-black mt-1">{spec.method.audioStandard}</div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Linear uncompressed WAV format avoids compression artifacts during phonetic alignment.
                    </p>
                  </div>
                  <div className="bg-white p-3 border border-black/10">
                    <div className="text-[10px] font-bold uppercase text-[#F27D26]">Loudness Calibration</div>
                    <div className="font-mono font-bold text-black mt-1">{spec.method.loudnessStandard}</div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Ensures model decoders operate within identical dynamic ranges without clipping.
                    </p>
                  </div>
                  <div className="bg-white p-3 border border-black/10">
                    <div className="text-[10px] font-bold uppercase text-[#F27D26]">Acoustic Integrity</div>
                    <div className="font-mono font-bold text-black mt-1">Preserved Ambient SNR</div>
                    <p className="text-[11px] text-stone-600 mt-1">{spec.method.noiseStandard}</p>
                  </div>
                </div>

                <div className="bg-white p-3 border border-black/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Strict Multi-Step Evaluation Pipeline:
                  </div>
                  <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-stone-700 list-decimal list-inside">
                    {spec.method.evaluationPipeline.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-900 text-white">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F27D26]">
                    Ready to attach to competition submission
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Download complete Markdown dossier with LaTeX formulas and table citations.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border border-stone-600"
                  >
                    {copiedMd ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMd ? 'Copied MD!' : 'Copy Markdown'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-4 py-2 bg-[#F27D26] hover:bg-[#d66b1d] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 font-sans shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report (.MD)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PYTHON HARNESS */}
          {activeTab === 'python' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#FAF8F5] p-4 border border-black/15 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    Standalone Python Reproducibility Script (<code className="font-mono">benchmark_harness.py</code>)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Judges can run this locally or on Google Colab to verify the exact Levenshtein DP calculation and call the live Sahara API.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyPython}
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 text-black border border-black/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                  >
                    {copiedPy ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPy ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPython}
                    className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F27D26]" />
                    <span>Download .py</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-stone-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-black">
                <pre className="text-[11px] leading-relaxed whitespace-pre font-mono">
                  {generatePythonHarnessScript()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: RAW EVIDENCE JSON */}
          {activeTab === 'json' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#FAF8F5] p-4 border border-black/15 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    Empirical Benchmark Evidence Dataset (<code className="font-mono">empirical_benchmark_evidence.json</code>)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Full ground-truth transcripts, word-level token breakdown, model predictions, acoustic metadata, and latency metrics.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 text-black border border-black/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                  >
                    {copiedJson ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F27D26]" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-stone-900 text-amber-300 font-mono text-xs overflow-x-auto max-h-[500px] border border-black">
                <pre className="text-[11px] leading-relaxed whitespace-pre font-mono">
                  {rawEvidenceJson}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLES AUDIT */}
          {activeTab === 'samples' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-black/15 pb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    Test Split Samples Audit Table
                  </h3>
                  <p className="text-xs text-stone-600">
                    Showing 6 primary evaluation test splits across Intron Afriswitch & AfriswitchCare.
                  </p>
                </div>
                <span className="text-xs font-mono bg-[#FAF8F5] px-2.5 py-1 border border-black/20 font-bold">
                  {BENCHMARK_SAMPLES.length} Test Partitions Calibrated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white border border-black/10">
                  <thead>
                    <tr className="bg-stone-100 text-[10px] uppercase font-bold text-stone-700 border-b border-black/20">
                      <th className="p-2.5">Sample ID & Domain</th>
                      <th className="p-2.5">Language Pair</th>
                      <th className="p-2.5">Ground Truth Utterance</th>
                      <th className="p-2.5">Sahara WER</th>
                      <th className="p-2.5">Whisper WER</th>
                      <th className="p-2.5">Chirp WER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {BENCHMARK_SAMPLES.map((sample) => (
                      <tr key={sample.id} className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono text-stone-900">
                          <div className="font-bold text-black">{sample.id}</div>
                          <span className="text-[10px] text-stone-500">{sample.dataset} • {sample.category}</span>
                        </td>
                        <td className="p-2.5 font-mono text-stone-700">{sample.languagePair}</td>
                        <td className="p-2.5 text-stone-800 max-w-xs truncate text-[11px]" title={sample.groundTruth}>
                          "{sample.groundTruth}"
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700">
                          {sample.modelTranscripts.sahara.wer.toFixed(1)}%
                        </td>
                        <td className="p-2.5 font-mono text-red-700">
                          {sample.modelTranscripts['whisper-v3'].wer.toFixed(1)}%
                        </td>
                        <td className="p-2.5 font-mono text-stone-700">
                          {sample.modelTranscripts['google-chirp'].wer.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
