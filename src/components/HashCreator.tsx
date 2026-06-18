/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Copy, Check, Terminal, ShieldAlert, BadgeCheck, FileCode, History, Trash2, Search } from 'lucide-react';
import { generateHashes, HashOutput } from '../utils/crypto';
import { HashRecord } from '../types';

interface HashCreatorProps {
  userId: string;
  isAnonymous: boolean;
  dbHashItems: HashRecord[];
  onAddHashRecord: (text: string, algorithm: string, hashValue: string) => void;
  onDeleteHashRecord: (id: string) => void;
}

export default function HashCreator({ userId, isAnonymous, dbHashItems, onAddHashRecord, onDeleteHashRecord }: HashCreatorProps) {
  const [inputText, setInputText] = useState('');
  const [compareHash, setCompareHash] = useState('');
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');

  // Generate hashes in real-time
  const hashes = generateHashes(inputText);

  const handleCopy = (key: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopyStates(prev => ({ ...prev, [key]: true }));

    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Add the current calculated hash to saved history securely
  const handleSaveToHistory = (algorithm: string, value: string) => {
    if (!inputText || !value) return;
    
    // Check if exactly this combination is already in history to avoid spam
    const alreadySaved = dbHashItems.some(
      item => item.text === inputText && item.algorithm === algorithm && item.hashValue === value
    );
    if (alreadySaved) return;

    onAddHashRecord(inputText, algorithm, value);
  };

  // Custom metadata for each cryptographic algorithm
  const hashSpecs = [
    { key: 'md5', label: 'MD5', outputBits: '128 bits', value: hashes.md5, level: 'Legacy / Col-Weak', colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
    { key: 'sha1', label: 'SHA-1', outputBits: '160 bits', value: hashes.sha1, level: 'Legacy / Collisions', colorClass: 'text-orange-400 border-orange-500/20 bg-orange-500/5' },
    { key: 'sha256', label: 'SHA-256', outputBits: '256 bits', value: hashes.sha256, level: 'Highly Secure', colorClass: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' },
    { key: 'sha512', label: 'SHA-512', outputBits: '512 bits', value: hashes.sha512, level: 'Industry-Standard', colorClass: 'text-sky-400 border-sky-500/25 bg-sky-500/5' },
  ];

  // Compare functions
  const matchingSpec = compareHash
    ? hashSpecs.find(spec => spec.value && spec.value.toLowerCase() === compareHash.trim().toLowerCase())
    : null;

  const filteredHistory = dbHashItems.filter(item => {
    const textMatch = item.text.toLowerCase().includes(searchHistoryQuery.toLowerCase());
    const hashMatch = item.hashValue.toLowerCase().includes(searchHistoryQuery.toLowerCase());
    const algoMatch = item.algorithm.toLowerCase().includes(searchHistoryQuery.toLowerCase());
    return textMatch || hashMatch || algoMatch;
  });

  return (
    <div className="space-y-6" id="hash-creator-widget">
      {/* Input Box */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-purple-400" />
          Source Text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text to compute cryptographic hashes in real-time..."
          rows={3}
          className="w-full bg-black/30 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 rounded-xl p-3 text-white placeholder-white/20 text-sm font-sans resize-none transition-all"
        />
        <div className="flex justify-between items-center text-[10px] text-white/35 font-mono">
          <span>Encoding format: UTF-8</span>
          <span>Chars: {inputText.length} | Bytes: {new Blob([inputText]).size}</span>
        </div>
      </div>

      {/* Computed Digests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hashSpecs.map((spec) => (
          <div 
            key={spec.key}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 relative group backdrop-blur-md"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-black/40 border border-white/10 rounded-md">
                  {spec.label}
                </span>
                <span className="text-[10px] font-mono text-white/40 ml-2">
                  {spec.outputBits}
                </span>
              </div>
              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${spec.colorClass}`}>
                {spec.level}
              </span>
            </div>

            {/* Output view area */}
            <div className="bg-black/30 px-3 py-2.5 rounded-lg border border-white/5 flex items-center justify-between gap-2 h-11 relative">
              <span className="font-mono text-xs break-all overflow-x-auto whitespace-pre-wrap select-all text-white/80 pr-1 h-full flex items-center">
                {spec.value || <span className="text-white/20 italic select-none">No input...</span>}
              </span>
              
              {spec.value && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(spec.key, spec.value)}
                    className="p-1.5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded text-white/45 hover:text-white cursor-pointer text-xs flex items-center justify-center transition-colors h-7 w-7"
                    title="Copy hash output"
                  >
                    {copyStates[spec.key] ? (
                      <Check className="w-3.5 h-3.5 text-purple-400 stroke-[3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSaveToHistory(spec.label, spec.value)}
                    className="px-1.5 py-1 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/20 rounded text-white/50 hover:text-purple-300 cursor-pointer text-[10px] font-mono uppercase transition-colors h-7"
                    title="Save to Hustle History"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Checksum Verifier */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-purple-400" />
          Checksum Verifier
        </h3>
        
        <div className="space-y-3">
          <p className="text-xs text-white/50 leading-relaxed font-sans">
            Paste an expected hash signature below to compare with computed digests.
          </p>
          <input
            type="text"
            value={compareHash}
            onChange={(e) => setCompareHash(e.target.value)}
            placeholder="Paste expected MD5, SHA-1, or SHA-256 signature..."
            className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-10 outline-none"
          />

          {compareHash && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                matchingSpec
                  ? 'bg-purple-500/5 border-purple-500/25 text-purple-300'
                  : 'bg-red-500/5 border-red-500/25 text-red-300'
              }`}
            >
              {matchingSpec ? (
                <>
                  <BadgeCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="text-xs font-sans">
                    <p className="font-semibold text-white">Signature MATCH verified successfully!</p>
                    <p className="opacity-80">
                      The checksum matches the computed <span className="font-bold underline">{matchingSpec.label}</span> layout.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <div className="text-xs font-sans">
                    <p className="font-semibold text-white">Signature MISMATCH detected!</p>
                    <p className="opacity-80">This hash is different from all calculated UTF-8 digests of the current input text.</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Digest History */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-sans">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-white/30" />
            Digest History ({filteredHistory.length})
          </h3>
          
          {/* Quick filter query */}
          {dbHashItems.length > 0 && (
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-white/30">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search history..."
                value={searchHistoryQuery}
                onChange={(e) => setSearchHistoryQuery(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-550 font-sans outline-none"
              />
            </div>
          )}
        </div>

        {dbHashItems.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-white/10 rounded-xl bg-white/5 font-sans">
            <Code className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/50">No digest history stored yet.</p>
            <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
              {isAnonymous ? 'Guest session' : 'Your saved history'} records are retained here. Calculate and click "Save" above to retain records.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center p-4 text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
            No matching hash records search outcomes.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filteredHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1.5 relative group font-sans"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-black/50 border border-white/10 rounded text-white uppercase tracking-tight">
                        {item.algorithm}
                      </span>
                      <span className="text-[10px] text-white/40 truncate max-w-[200px]" title={item.text}>
                        Source: "{item.text}"
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteHashRecord(item.id)}
                      className="text-white/30 hover:text-red-400 p-1 rounded hover:bg-white/10 cursor-pointer shrink-0 transition-colors"
                      title="Delete record from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 p-1.5 bg-black/40 rounded border border-white/5">
                    <span className="font-mono text-[10px] break-all select-all text-purple-300 leading-tight">
                      {item.hashValue}
                    </span>
                    <button
                      onClick={() => handleCopy(`hist-${item.id}`, item.hashValue)}
                      className="p-1 hover:bg-white/10 text-white/40 hover:text-purple-300 rounded cursor-pointer transition-colors shrink-0"
                    >
                      {copyStates[`hist-${item.id}`] ? (
                        <Check className="w-3 h-3 text-purple-300" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
