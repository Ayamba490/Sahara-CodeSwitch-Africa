import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LiveAgentLab } from './components/LiveAgentLab';
import { BenchmarkSuite } from './components/BenchmarkSuite';
import { CategorySolutions } from './components/CategorySolutions';
import { BidirectionalTranslator } from './components/BidirectionalTranslator';
import { ChallengeCategory } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('live-lab');

  const handleSelectCategoryForLab = (category: ChallengeCategory) => {
    setActiveTab('live-lab');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#F27D26] selection:text-white border-t-[8px] sm:border-t-[12px] border-[#F27D26]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'live-lab' && <LiveAgentLab />}

        {activeTab === 'translator' && <BidirectionalTranslator />}

        {activeTab === 'benchmark' && <BenchmarkSuite />}

        {activeTab === 'categories' && (
          <CategorySolutions onSelectCategoryForLab={handleSelectCategoryForLab} />
        )}
      </main>

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
              Intron Health ASR & TTS
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-600 font-medium">
            <span>Afriswitch Code-Switching Corpus</span>
            <span className="text-black/20">•</span>
            <span>Intra-Sentential Dialect Parsing</span>
            <span className="text-black/20">•</span>
            <span>Clinical & Agentic Vernacular Workflows</span>
          </div>

          <div className="text-[11px] uppercase tracking-widest font-bold text-stone-500 flex items-center space-x-1">
            <span className="text-[#F27D26] font-bold">Sahara-v2.4</span>
            <span>&bull; Production Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
