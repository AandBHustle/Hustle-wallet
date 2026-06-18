/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, RefreshCw, Sliders, ShieldAlert, BadgeCheck, CheckSquare, Square, Info } from 'lucide-react';
import { PasswordConfig } from '../types';
import { generatePassword, analyzePasswordStrength } from '../utils/crypto';

export default function PasswordGenerator() {
  const [config, setConfig] = useState<PasswordConfig>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedHistory, setCopiedHistory] = useState<string[]>([]);

  // Regenerate password on config change
  const handleRegenerate = () => {
    const newPwd = generatePassword(config);
    setPassword(newPwd);
    setCopied(false);
  };

  useEffect(() => {
    handleRegenerate();
  }, [config]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    
    // Add to quick session list if not already there
    if (!copiedHistory.includes(password)) {
      setCopiedHistory(prev => [password, ...prev.slice(0, 4)]);
    }

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const strength = analyzePasswordStrength(password);

  const toggleOption = (key: keyof PasswordConfig) => {
    if (typeof config[key] === 'boolean') {
      // Prevent turning off all character types
      const keys: (keyof PasswordConfig)[] = ['uppercase', 'lowercase', 'numbers', 'symbols'];
      const activeTypes = keys.filter(k => config[k]);
      if (activeTypes.length === 1 && activeTypes[0] === key && config[key]) {
        return; // Reject changing the last selected option
      }

      setConfig(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  return (
    <div className="space-y-6" id="password-generator-widget">
      {/* Preview and Output */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-4 backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/10 via-purple-400 to-purple-500/10" />
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Generated Password
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            strength.score >= 3 ? 'text-purple-300 border-purple-500/25 bg-purple-500/5' :
            strength.score === 2 ? 'text-yellow-300 border-yellow-500/25 bg-yellow-500/5' :
            'text-red-300 border-red-500/25 bg-red-500/5'
          }`}>
            {strength.label}
          </span>
        </div>

        {/* Monospace output text area */}
        <div className="flex gap-2 items-center bg-black/30 p-4 rounded-xl border border-white/5 relative group h-20">
          <div className="flex-1 font-mono text-lg md:text-xl font-medium text-white tracking-wide select-all overflow-x-auto whitespace-nowrap scrollbar-none pr-2">
            {password || <span className="text-white/20">Waiting...</span>}
          </div>
          
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={handleRegenerate}
              title="Regenerate password"
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-lg cursor-pointer transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              disabled={!password}
              className={`p-2.5 border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 ${
                copied
                  ? 'bg-purple-650 bg-purple-600 text-white border-purple-500'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Animated copied overlay flag */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-12 -top-8 px-2.5 py-1 bg-purple-600 text-white font-sans font-semibold text-[10px] uppercase rounded-md shadow-lg border border-purple-500"
              >
                Copied to clipboard!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Entropy strength meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-white/50">
            <span>Security Strength Metrics:</span>
            <span className="font-mono">{Math.round((password.length * (config.symbols ? 6.5 : 5.1)))} bits entropy</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((idx) => {
              // Map the emerald metrics colors to purple/violet spectrum for strength
              let barColor = 'bg-red-500/40';
              if (strength.score >= 3) {
                barColor = 'bg-purple-550 bg-gradient-to-r from-purple-500 to-blue-500';
              } else if (strength.score === 2) {
                barColor = 'bg-yellow-500/60';
              }

              return (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    idx <= strength.barCount 
                      ? barColor 
                      : 'bg-black/40 border border-white/5'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Adjustments control grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Parameters Slider */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Password Length Settings
          </h3>
          
          <div className="py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white/80">Total Characters</span>
              <span className="font-mono text-lg font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                {config.length}
              </span>
            </div>
            
            <input
              type="range"
              min="6"
              max="64"
              value={config.length}
              onChange={(e) => setConfig(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-black/40 accent-purple-500 rounded-lg appearance-none cursor-pointer border border-white/5"
            />
            
            <div className="flex justify-between text-[11px] text-white/35 font-mono">
              <span>6 (Minimum)</span>
              <span>32 (Optimal)</span>
              <span>64 (Maximum)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Options list */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Exclusions & Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => toggleOption('uppercase')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/10 text-left hover:border-white/20 hover:bg-white/10 text-xs text-white cursor-pointer h-11 transition-colors"
            >
              {config.uppercase ? (
                <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-white/30 shrink-0" />
              )}
              Uppercase (A-Z)
            </button>

            <button
              onClick={() => toggleOption('lowercase')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/10 text-left hover:border-white/20 hover:bg-white/10 text-xs text-white cursor-pointer h-11 transition-colors"
            >
              {config.lowercase ? (
                <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-white/30 shrink-0" />
              )}
              Lowercase (a-z)
            </button>

            <button
              onClick={() => toggleOption('numbers')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/10 text-left hover:border-white/20 hover:bg-white/10 text-xs text-white cursor-pointer h-11 transition-colors"
            >
              {config.numbers ? (
                <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-white/30 shrink-0" />
              )}
              Numbers (0-9)
            </button>

            <button
              onClick={() => toggleOption('symbols')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/10 text-left hover:border-white/20 hover:bg-white/10 text-xs text-white cursor-pointer h-11 transition-colors"
            >
              {config.symbols ? (
                <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-white/30 shrink-0" />
              )}
              Symbols (!@#)
            </button>

            <button
              onClick={() => toggleOption('excludeSimilar')}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/10 text-left hover:border-white/20 hover:bg-white/10 text-xs text-white col-span-1 sm:col-span-2 cursor-pointer h-11 transition-colors"
            >
              {config.excludeSimilar ? (
                <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-white/30 shrink-0" />
              )}
              <span className="flex-1 truncate">
                Exclude Similar Chars (e.g., L, l, 1, 0, o, O)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics / Actionable Advice Panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start backdrop-blur-md">
        {strength.score >= 3 ? (
          <div className="p-3 bg-purple-500/10 text-purple-300 border border-purple-500/25 rounded-xl shrink-0">
            <BadgeCheck className="w-6 h-6" />
          </div>
        ) : (
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/25 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        )}

        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
            Password Assessment:
            <span className={strength.score >= 3 ? 'text-purple-300 font-bold' : 'text-red-400 font-bold'}>
              {strength.label}
            </span>
          </h4>
          
          <div className="text-xs text-white/60 leading-relaxed font-sans">
            {strength.suggestions.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {strength.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            ) : (
              <p className="text-purple-300 font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                This password has excellent strength and entropy.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick session history references */}
      {copiedHistory.length > 0 && (
        <div className="bg-white/5 p-4 border border-white/10 rounded-2xl space-y-2 backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
            Clipboard History (Current Session)
          </span>
          <div className="flex flex-wrap gap-2">
            {copiedHistory.map((pwd, i) => (
              <button
                key={i}
                onClick={() => {
                  navigator.clipboard.writeText(pwd);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="font-mono text-xs text-white/60 bg-black/30 hover:bg-black/10 hover:text-white px-2.5 py-1 rounded-lg border border-white/5 text-left transition-all truncate max-w-[200px]"
                title="Click to copy again"
              >
                {pwd}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
