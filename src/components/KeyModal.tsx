import React, { useState } from 'react';
import { KeyRound, X, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(currentKey);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(apiKeyInput.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FAF8F5] border border-black/20 flex items-center justify-center text-[#F27D26]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black italic text-black">
              Sahara API Configuration
            </h3>
            <p className="text-xs text-stone-600">
              Access Token from voice.intron.io
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-stone-700">
          <p>
            To use live Sahara Speech-to-Text streaming on your own voice, obtain your developer key:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-stone-600">
            <li>
              Sign up or log in at{' '}
              <a
                href="https://voice.intron.io"
                target="_blank"
                rel="noreferrer"
                className="text-[#F27D26] font-bold hover:underline inline-flex items-center"
              >
                voice.intron.io <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </li>
            <li>Click the <strong className="text-black">Developer</strong> tab in the sidebar</li>
            <li>Copy your access token and paste below</li>
          </ol>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-600 block">
            Sahara Access Token / API Key
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sh_live_..."
            className="w-full bg-[#FAF8F5] border border-black/20 p-2.5 text-xs text-black font-mono focus:outline-none focus:border-[#F27D26]"
          />
          <span className="text-[10px] text-stone-500 block leading-relaxed">
            *Stored locally in your browser session. If left empty, the studio operates in benchmark simulation mode using Intron Afriswitch audio samples.
          </span>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-black/10">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-black"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_0px_#F27D26]"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved & Connected!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Save Key</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
