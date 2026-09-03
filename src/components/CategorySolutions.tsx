import React, { useState } from 'react';
import {
  Activity,
  CreditCard,
  Scale,
  Sprout,
  Users,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CHALLENGE_CATEGORIES, CategoryDetail } from '../data/challengeCategories';
import { ChallengeCategory } from '../types';

interface CategorySolutionsProps {
  onSelectCategoryForLab: (cat: ChallengeCategory) => void;
}

export const CategorySolutions: React.FC<CategorySolutionsProps> = ({
  onSelectCategoryForLab,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<ChallengeCategory>('Health');
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const selectedCategory: CategoryDetail =
    CHALLENGE_CATEGORIES.find((c) => c.id === activeCategoryId) || CHALLENGE_CATEGORIES[0];

  const getCategoryIcon = (id: ChallengeCategory) => {
    switch (id) {
      case 'Health':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Fintech & Customer Experience':
        return <CreditCard className="w-5 h-5 text-amber-400" />;
      case 'Agriculture & Education':
        return <Sprout className="w-5 h-5 text-teal-400" />;
      case 'Legal & Public Services':
        return <Scale className="w-5 h-5 text-indigo-400" />;
      default:
        return <Users className="w-5 h-5 text-purple-400" />;
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(1);

    setTimeout(() => {
      setSimulationStep(2);
      setTimeout(() => {
        setSimulationStep(3);
        setTimeout(() => {
          setSimulationStep(4);
          setIsSimulating(false);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <div className="bg-[#FAF8F5] p-6 border border-black/20 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#F27D26] text-white">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Pick Your Category (Bonus points for solutions addressing real population scale)
          </div>
          <h2 className="text-3xl font-serif font-black italic text-black tracking-tight">
            Challenge Categories & Agentic Architectures
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed font-sans">
            The challenge requires an agentic solution appropriate for the target user. Explore
            specialized workflows for Health (clinical intake via AfriswitchCare), Fintech (vernacular
            voice banking), Agriculture (crop disease advisory), and Public Legal Aid.
          </p>
        </div>
      </div>

      {/* Category Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHALLENGE_CATEGORIES.map((category) => {
          const isSelected = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategoryId(category.id);
                setSimulationStep(0);
              }}
              className={`text-left p-4 border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#FAF8F5] border-2 border-[#F27D26] shadow-sm'
                  : 'bg-white border-black/15 hover:border-black'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-[#FAF8F5] border border-black/20">
                    {getCategoryIcon(category.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-stone-100 text-stone-800 border border-black/15">
                    {category.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-black">{category.name}</h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">{category.tagline}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/10 text-[10px] text-black font-bold uppercase tracking-wider flex items-center space-x-1">
                <span>View Architecture</span>
                <ArrowRight className="w-3 h-3 text-[#F27D26]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Workspace on Selected Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Problem Statement & Real-World Impact */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-black/15 p-6 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#FAF8F5] border border-black/20">
                  {getCategoryIcon(selectedCategory.id)}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-black italic text-black">
                    {selectedCategory.name}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#F27D26]">{selectedCategory.badge}</span>
                </div>
              </div>
              <span className="text-xs text-stone-600 font-mono font-bold">
                Dataset: {selectedCategory.datasetUsed.split('(')[0]}
              </span>
            </div>

            {/* Description & Real-World Impact */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                The Core Challenge & Context
              </span>
              <p className="text-xs text-stone-800 leading-relaxed font-sans">
                {selectedCategory.description}
              </p>
            </div>

            <div className="p-4 bg-[#F27D26]/10 border-l-4 border-[#F27D26] border-y border-r border-black/10 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F27D26]" />
                <span>Rubric Focus: Real-World Impact (20% Weight)</span>
              </span>
              <p className="text-xs text-stone-800 font-serif italic leading-relaxed">
                {selectedCategory.realWorldImpact}
              </p>
            </div>

            {/* Target Users & Supported Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  Target User Groups
                </span>
                <ul className="space-y-1.5">
                  {selectedCategory.typicalUsers.map((user, idx) => (
                    <li key={idx} className="text-xs text-stone-800 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F27D26]" />
                      <span>{user}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  Optimal Language Pairs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategory.recommendedLanguages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] font-mono font-medium bg-[#FAF8F5] text-stone-800 border border-black/15"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Agentic Workflow Pipeline */}
            <div className="space-y-2 pt-2 border-t border-black/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                End-to-End Agentic Execution Pipeline
              </span>
              <div className="space-y-2">
                {selectedCategory.agenticWorkflowSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#FAF8F5] border border-black/15 text-xs text-stone-800 flex items-center space-x-3"
                  >
                    <span className="w-5 h-5 bg-black text-[#F27D26] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Prototype Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-black/15 p-5 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#F27D26]" />
                <h3 className="text-base font-serif font-bold italic text-black">
                  Interactive Category Prototype
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#F27D26] text-white">
                Live Simulation
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                {selectedCategory.sampleUseCase.title}
              </span>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {selectedCategory.sampleUseCase.scenario}
              </p>
            </div>

            {/* Simulated Audio Input */}
            <div className="p-3 bg-[#FAF8F5] border border-black/15 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Raw Spoken Code-Switched Input:
              </div>
              <p className="text-xs text-black font-serif italic text-sm">
                "{selectedCategory.sampleUseCase.speechTranscript}"
              </p>
            </div>

            {/* Run Button */}
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-3 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[2px_2px_0px_0px_#F27D26] disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#F27D26]" />
                  <span>Processing Agentic Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>Trigger {selectedCategory.id} Agent</span>
                </>
              )}
            </button>

            {/* Step-by-Step Simulation Result */}
            {simulationStep > 0 && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                {/* Step 1: Sahara Speech-to-Text */}
                <div
                  className={`p-3 border text-xs flex items-center space-x-2 transition-all ${
                    simulationStep >= 1
                      ? 'bg-[#FAF8F5] border-black/20 text-black'
                      : 'bg-stone-50 border-black/10 text-stone-400'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-black uppercase text-[10px] tracking-wider">Step 1: Sahara ASR Transcription: </strong>
                    <span className="text-stone-700 block mt-0.5">
                      Tokenized with 0 word errors across vernacular boundaries (310ms latency).
                    </span>
                  </div>
                </div>

                {/* Step 2: Extracted Structured Entities */}
                {simulationStep >= 2 && (
                  <div className="p-3 bg-white border border-black/15 space-y-2 animate-fadeIn">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                      Step 2: Extracted Key Entities
                    </span>
                    <div className="divide-y divide-black/10 text-xs">
                      {Object.entries(selectedCategory.sampleUseCase.extractedData).map(
                        ([k, v]) => (
                          <div key={k} className="py-1.5 flex items-start justify-between">
                            <span className="text-stone-600 capitalize font-medium">{k}:</span>
                            <span className="text-black font-mono font-semibold text-right max-w-[60%]">
                              {v}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Automated Action Executed */}
                {simulationStep >= 3 && (
                  <div className="p-3.5 bg-[#F27D26]/10 border-l-4 border-[#F27D26] border-y border-r border-black/10 space-y-1 animate-fadeIn">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black block">
                      Step 3: Automated Action Executed
                    </span>
                    <p className="text-xs text-black font-serif italic text-sm font-medium">
                      {selectedCategory.sampleUseCase.automatedAction}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
