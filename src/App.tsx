import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveAgentLab } from './components/LiveAgentLab';
import { BenchmarkSuite } from './components/BenchmarkSuite';
import { CategorySolutions } from './components/CategorySolutions';
import { SaharaApiDocs } from './components/SaharaApiDocs';
import { BidirectionalTranslator } from './components/BidirectionalTranslator';
import { KeyModal } from './components/KeyModal';
import { ChallengeCategory } from './types';
import { ExternalLink, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('live-lab');
  const [saharaKey, setSaharaKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('sahara_api_key');
    if (saved) {
      setSaharaKey(saved);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    setSaharaKey(key);
    if (key) {
      localStorage.setItem('sahara_api_key', key);
    } else {
      localStorage.removeItem('sahara_api_key');
    }
  };

  const handleSelectCategoryForLab = (category: ChallengeCategory) => {
    setActiveTab('live-lab');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#F27D26] selection:text-white border-t-[8px] sm:border-t-[12px] border-[#F27D26]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasSaharaKey={Boolean(saharaKey)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'live-lab' && (
          <LiveAgentLab
            hasSaharaKey={Boolean(saharaKey)}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        )}

        {activeTab === 'translator' && <BidirectionalTranslator />}

        {activeTab === 'benchmark' && <BenchmarkSuite />}

        {activeTab === 'categories' && (
          <CategorySolutions onSelectCategoryForLab={handleSelectCategoryForLab} />
        )}

        {activeTab === 'api-docs' && (
          <SaharaApiDocs
            hasSaharaKey={Boolean(saharaKey)}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        )}
      </main>

      {/* API Key Modal */}
      <KeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={saharaKey}
        onSaveKey={handleSaveKey}
      />

      {/* Footer */}
      <footer className="border-t-2 border-black bg-[#FDFCFB] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-[#1A1A1A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif italic font-bold text-sm text-[#1A1A1A]">
              Sahara CodeSwitch Africa
            </span>
            <span className="text-black/30">•</span>
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#F27D26]">
              Speech AI Studio
            </span>
            <span className="text-black/30">•</span>
            <span className="text-[11px] text-stone-600 font-medium">
              Powered by Intron Health
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a
              href="https://voice.intron.io"
              target="_blank"
              rel="noreferrer"
              className="text-stone-700 hover:text-[#F27D26] font-medium transition-colors flex items-center space-x-1"
            >
              <span className="underline decoration-stone-300 underline-offset-4 hover:decoration-[#F27D26]">Sahara Portal</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
            <a
              href="https://docs.voice.intron.io"
              target="_blank"
              rel="noreferrer"
              className="text-stone-700 hover:text-[#F27D26] font-medium transition-colors flex items-center space-x-1"
            >
              <span className="underline decoration-stone-300 underline-offset-4 hover:decoration-[#F27D26]">docs.voice.intron.io</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
            <a
              href="https://huggingface.co/collections/intronhealth/code-switching"
              target="_blank"
              rel="noreferrer"
              className="text-stone-700 hover:text-[#F27D26] font-medium transition-colors flex items-center space-x-1"
            >
              <span className="underline decoration-stone-300 underline-offset-4 hover:decoration-[#F27D26]">Afriswitch Datasets</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
            <a
              href="https://github.com/intron-innovation/Intron-Multimodal-Benchmarking"
              target="_blank"
              rel="noreferrer"
              className="text-stone-700 hover:text-[#F27D26] font-medium transition-colors flex items-center space-x-1"
            >
              <span className="underline decoration-stone-300 underline-offset-4 hover:decoration-[#F27D26]">Benchmarking Repo</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>

          <div className="text-[11px] uppercase tracking-widest font-bold text-stone-500 flex items-center space-x-1">
            <span className="text-[#F27D26] font-bold">Intron Sahara-v2</span>
            <span>&bull; Production Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
