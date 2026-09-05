import React from 'react';
import {
  Mic,
  BarChart3,
  Layers,
  Code2,
  Sparkles,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Languages,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasSaharaKey: boolean;
  onOpenKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasSaharaKey,
  onOpenKeyModal,
}) => {
  const navItems = [
    { id: 'live-lab', label: 'Live Speech Lab', icon: Mic, badge: 'Sahara ASR' },
    { id: 'translator', label: 'Bidirectional Translator', icon: Languages, badge: 'English ⇄ African' },
    { id: 'benchmark', label: '3+ Model Benchmark', icon: BarChart3, badge: 'Intron vs Global' },
    { id: 'categories', label: 'Solutions & Agents', icon: Layers, badge: 'AfriswitchCare' },
    { id: 'api-docs', label: 'API & Integration', icon: Code2, badge: 'voice.intron.io' },
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

          <div className="flex items-center space-x-4">
            <span className="text-stone-600 text-xs hidden md:inline">
              Enterprise ASR & TTS across 300+ African Accents
            </span>

            <a
              href="https://voice.intron.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#F27D26] hover:text-black font-bold tracking-wider uppercase text-[11px] transition-colors"
            >
              <span>voice.intron.io</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
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
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs transition-all ${
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

          {/* Right Action: Sahara API Key Status */}
          <div className="flex items-center space-x-2">
            <button
              id="sahara-key-config-btn"
              onClick={onOpenKeyModal}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                hasSaharaKey
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-700 hover:bg-emerald-100'
                  : 'bg-white text-[#1A1A1A] border-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {hasSaharaKey ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 text-[#F27D26]" />
              )}
              <span className="hidden sm:inline">
                {hasSaharaKey ? 'Sahara API Active' : 'API Key Config'}
              </span>
              <span className="sm:hidden">{hasSaharaKey ? 'Active' : 'Key'}</span>
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
