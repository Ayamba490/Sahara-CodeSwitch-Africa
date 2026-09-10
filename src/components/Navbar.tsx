import React from 'react';
import {
  Mic,
  BarChart3,
  Layers,
  Sparkles,
  Languages,
  KeyRound,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenKeyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenKeyModal,
}) => {
  const navItems = [
    { id: 'live-lab', label: 'Live Speech Lab', icon: Mic, badge: 'Sahara ASR' },
    { id: 'translator', label: 'Bidirectional Translator', icon: Languages, badge: 'English ⇄ African' },
    { id: 'benchmark', label: '3+ Model Benchmark', icon: BarChart3, badge: 'Intron vs Global' },
    { id: 'categories', label: 'Solutions & Agents', icon: Layers, badge: 'AfriswitchCare' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FDFCFB]/95 backdrop-blur-md border-b-2 border-black">
      {/* Top Banner */}
      <div className="bg-[#FAF8F5] border-b border-black/10 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] bg-black text-white px-2 py-0.5">
              African Voice AI
            </span>
            <span className="text-stone-700 text-xs hidden sm:inline">
              Sahara CodeSwitch Suite by <strong className="font-bold text-[#1A1A1A]">Intron Health</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-stone-600 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Enterprise ASR & TTS across 300+ African Accents</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-serif italic font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_#F27D26]">
              SC
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-black italic text-[#1A1A1A] text-lg sm:text-xl tracking-tight leading-none">
                  Sahara CodeSwitch
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F27D26] text-white px-1.5 py-0.2">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-sans tracking-tight mt-0.5">
                Multi-Model Benchmarking & Agentic Solution Builder
              </p>
            </div>
          </div>

          {/* Nav Pills Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 bg-stone-100/80 p-1 border border-black/15">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs transition-all ${
                    isActive
                      ? 'bg-black text-white font-bold shadow-sm'
                      : 'text-stone-700 hover:text-black hover:bg-white/80 font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className={isActive ? 'font-serif italic text-[13px]' : ''}>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 font-mono font-bold uppercase ${
                        isActive
                          ? 'bg-[#F27D26] text-white'
                          : 'bg-stone-200 text-stone-700 border border-black/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Badges & Controls */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Flagship Major Model Badge */}
            <div
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#F27D26]"
              title="Sahara-v2.4 (Sahara Voice) is the flagship major model for African speech, acoustics, and code-switching"
            >
              <Mic className="w-3.5 h-3.5 text-[#F27D26]" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[8px] text-[#F27D26] font-black tracking-widest">MAJOR MODEL</span>
                <span className="text-[11px] font-bold tracking-tight">Sahara-v2.4 Voice</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Core Engine Active"></span>
            </div>

            {/* Supporting Models & Gateway Settings Button */}
            <button
              onClick={onOpenKeyModal}
              title="Configure Supporting Models (OpenRouter AI, Grok, Gemini) and Sahara Voice Credentials"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-[#FAF8F5] text-black border border-black/30 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(242,125,38,1)] cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-stone-600" />
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-[8px] text-stone-500 font-bold">SUPPORTING AI</span>
                <span className="text-[10px] text-stone-800 font-bold">+OpenRouter / Grok</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex overflow-x-auto py-2 space-x-1.5 border-t border-black/10 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs whitespace-nowrap shrink-0 transition-all border ${
                  isActive
                    ? 'bg-black text-white border-black font-bold font-serif italic'
                    : 'bg-white text-stone-700 border-black/20 hover:border-black'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
