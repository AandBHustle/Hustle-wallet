/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, Search, Plus, Filter, ShieldAlert, BadgeCheck, Eye, EyeOff, Copy, 
  Check, Edit, Trash2, Globe, ExternalLink, Mail, CreditCard, Lock, Briefcase, 
  FileText, Shield, Sparkles, X, ChevronRight, User, CornerDownRight, RefreshCw, Loader 
} from 'lucide-react';
import { WalletItem } from '../types';
import { analyzePasswordStrength, generatePassword } from '../utils/crypto';

interface HustleDashboardProps {
  userId: string;
  isAnonymous: boolean;
  hustleItems: WalletItem[];
  onAddHustleItem: (item: Omit<WalletItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  onUpdateHustleItem: (id: string, updates: Partial<WalletItem>) => Promise<void>;
  onDeleteHustleItem: (id: string) => Promise<void>;
}

export default function HustleDashboard({
  userId,
  isAnonymous,
  hustleItems,
  onAddHustleItem,
  onUpdateHustleItem,
  onDeleteHustleItem,
}: HustleDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<WalletItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formCategory, setFormCategory] = useState<WalletItem['category']>('Login');
  const [formNotes, setFormNotes] = useState('');
  
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  const [revealStates, setRevealStates] = useState<Record<string, boolean>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Dynamic Icon Mapping depending on title
  const getBrandIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    
    if (t.includes('github') || t.includes('git')) return <Lock className="w-4 h-4 text-slate-400" />;
    if (t.includes('google') || t.includes('gmail') || t.includes('youtube')) return <Mail className="w-4 h-4 text-red-400" />;
    if (t.includes('apple') || t.includes('icloud')) return <Lock className="w-4 h-4 text-white" />;
    if (t.includes('amazon') || t.includes('shop') || t.includes('ebay')) return <Globe className="w-4 h-4 text-amber-500" />;
    if (t.includes('bank') || t.includes('card') || t.includes('paypal') || t.includes('stripe') || t.includes('finance')) return <CreditCard className="w-4 h-4 text-emerald-405" />;
    if (t.includes('mail') || t.includes('outlook') || t.includes('proton')) return <Mail className="w-4 h-4 text-sky-400" />;
    
    // Fallbacks based on category
    switch (category) {
      case 'Social':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'Finance':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'Work':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'Secure Note':
        return <FileText className="w-4 h-4 text-sky-400" />;
      default:
        return <Key className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter and search parameters
  const categoriesList = ['All', 'Login', 'Social', 'Finance', 'Work', 'Secure Note', 'Other'];

  const filteredItems = hustleItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const searchString = `${item.title} ${item.username} ${item.notes || ''} ${item.websiteUrl || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate credential strengths
  const weakPasswordsCount = hustleItems.filter((item) => {
    const str = analyzePasswordStrength(item.password);
    return str.score < 3;
  }).length;

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopyStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleToggleReveal = (id: string) => {
    setRevealStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open modal for writing/editing
  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormTitle('');
    setFormUsername('');
    setFormPassword('');
    setFormWebsiteUrl('');
    setFormCategory('Login');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: WalletItem) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormUsername(item.username);
    setFormPassword(item.password);
    setFormWebsiteUrl(item.websiteUrl || '');
    setFormCategory(item.category);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Inside Modal password generation helper
  const handleAutoGenerate = () => {
    const randomPwd = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true
    });
    setFormPassword(randomPwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formUsername || !formPassword) return;

    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        await onAddHustleItem({
          title: formTitle,
          username: formUsername,
          password: formPassword,
          websiteUrl: formWebsiteUrl || undefined,
          category: formCategory,
          notes: formNotes || undefined,
        });
      } else if (modalMode === 'edit' && editingId) {
        await onUpdateHustleItem(editingId, {
          title: formTitle,
          username: formUsername,
          password: formPassword,
          websiteUrl: formWebsiteUrl || undefined,
          category: formCategory,
          notes: formNotes || undefined,
        });
        // refresh selected item detail view drawer if applicable
        if (selectedItem?.id === editingId) {
          setSelectedItem(prev => prev ? {
            ...prev,
            title: formTitle,
            username: formUsername,
            password: formPassword,
            websiteUrl: formWebsiteUrl || undefined,
            category: formCategory,
            notes: formNotes || undefined,
            updatedAt: new Date().toISOString()
          } : null);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    setIsConfirmingDelete(false);
    await onDeleteHustleItem(id);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="hustle-dashboard-container">
      {/* Categories */}
      <div className="lg:col-span-3 space-y-4">
        {/* Statistics or Strength Indicator Gauge Banner */}
        {hustleItems.length > 0 && weakPasswordsCount > 0 && (
          <div className="p-4 bg-amber-500/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-amber-400">Security Recommendation</span>
              <p className="text-[11px] text-white/60 leading-tight">
                You have {weakPasswordsCount} weak or legacy credentials. Update them with our high-entropy generator.
              </p>
            </div>
          </div>
        )}

        {/* Category list */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5 backdrop-blur-md">
          <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">
            Categories
          </span>
          {categoriesList.map((cat) => {
            const count = cat === 'All' 
              ? hustleItems.length 
              : hustleItems.filter(item => item.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedItem(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all relative cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold backdrop-blur-md'
                    : 'text-white/60 hover:text-white border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 opacity-60" />
                  {cat === 'All' ? 'All Secrets' : cat}
                </span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat ? 'bg-purple-500/20 text-purple-300' : 'bg-black/30 text-white/35'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Credentials list */}
      <div className="lg:col-span-5 space-y-4">
        {/* search block and add buttons */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search target credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-md placeholder-white/20 h-10"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] shadow-lg transition-all shrink-0 h-10"
          >
            <Plus className="w-4 h-4 text-white stroke-[3]" />
            New Secret
          </button>
        </div>

        {/* Scrollable list items container */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
              <Key className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/60 font-semibold mb-1">No items match your filters</p>
              <p className="text-xs text-white/40">
                Click "+ New Secret" at the top right to store your first password credential.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsConfirmingDelete(false);
                  }}
                  className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer relative group backdrop-blur-md ${
                    isSelected 
                      ? 'bg-white/10 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.06)]' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Category accent tag */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-xl bg-white/5 group-hover:bg-purple-500/55 transition-colors" />

                  {/* Left part: Title, Category Icon, Username metadata */}
                  <div className="flex items-center gap-3.5 pl-1.5 min-w-0">
                    <div className="p-2 bg-black/40 border border-white/5 rounded-lg group-hover:border-white/20 transition-colors">
                      {getBrandIcon(item.title, item.category)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate max-w-[120px] md:max-w-[160px]" title={item.title}>
                          {item.title}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-tight px-1.5 py-0.1 bg-black/30 rounded text-white/55 border border-white/5 truncate max-w-[60px]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 font-medium truncate max-w-[120px] md:max-w-[160px]" title={item.username}>
                        {item.username}
                      </p>
                    </div>
                  </div>

                  {/* Right part: Masked values, eye review, copy action */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Show password display value */}
                    <div className="hidden sm:block font-mono text-xs text-white/40 pr-2">
                      {revealStates[item.id] ? item.password : '••••••••••••'}
                    </div>

                    <button
                      onClick={() => handleToggleReveal(item.id)}
                      className="p-1.5 hover:bg-white/10 text-white/40 hover:text-white/70 rounded-lg cursor-pointer transition-colors"
                      title={revealStates[item.id] ? 'Hide password value' : 'Show password value'}
                    >
                      {revealStates[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleCopy(`hustle-${item.id}`, item.password)}
                      className={`p-1.5 border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        copyStates[`hustle-${item.id}`]
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-black/30 hover:bg-black/10 text-white/40 hover:text-white/70 border-white/10'
                      }`}
                      title="Copy raw password value"
                    >
                      {copyStates[`hustle-${item.id}`] ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Chevron to symbolize deeper details */}
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all hidden md:block" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Card Detail Panel */}
      <div className="lg:col-span-4" id="hustle-detail-panel">
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-5 space-y-5 h-full relative flex flex-col justify-between backdrop-blur-xl shadow-xl"
            >
              <div className="space-y-4">
                {/* Header title */}
                <div className="flex justify-between items-start gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-black/40 border border-white/10 rounded-lg">
                      {getBrandIcon(selectedItem.title, selectedItem.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm truncate max-w-[150px]">
                        {selectedItem.title}
                      </h3>
                      <span className="text-[10px] text-white/40 block uppercase font-mono">
                        {selectedItem.category} Ref
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Details list fields */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-white/40 uppercase tracking-older">
                      Associated Username/Email
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5 text-xs">
                      <span className="font-mono text-white/85 truncate select-all">{selectedItem.username}</span>
                      <button
                        onClick={() => handleCopy(`detail-un-${selectedItem.id}`, selectedItem.username)}
                        className="text-white/40 hover:text-white/80 p-1"
                      >
                        {copyStates[`detail-un-${selectedItem.id}`] ? (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-white/40 uppercase tracking-older">
                      Secured Password Value
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5 text-xs">
                      <span className="font-mono text-white/80 break-all select-all">
                        {revealStates[`det-${selectedItem.id}`] ? selectedItem.password : '••••••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                           onClick={() => handleToggleReveal(`det-${selectedItem.id}`)}
                          className="text-white/40 hover:text-white/80 p-1"
                        >
                          {revealStates[`det-${selectedItem.id}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(`detail-pw-${selectedItem.id}`, selectedItem.password)}
                          className="text-white/40 hover:text-white/80 p-1"
                        >
                          {copyStates[`detail-pw-${selectedItem.id}`] ? (
                            <Check className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Strength evaluation feedback detail */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] px-1">
                      <span className="text-white/40">Security Audit:</span>
                      <span className={analyzePasswordStrength(selectedItem.password).score >= 3 ? 'text-purple-300 font-bold' : 'text-amber-400'}>
                        {analyzePasswordStrength(selectedItem.password).label}
                      </span>
                    </div>
                  </div>

                  {selectedItem.websiteUrl && (
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-older">
                        Website Link Address
                      </span>
                      <div className="flex items-center justify-between gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5 text-xs">
                        <span className="font-mono text-white/60 truncate max-w-[180px]" title={selectedItem.websiteUrl}>
                          {selectedItem.websiteUrl}
                        </span>
                        <a
                          href={selectedItem.websiteUrl.startsWith('http') ? selectedItem.websiteUrl : `https://${selectedItem.websiteUrl}`}
                          target="_blank"
                          rel="noreferrer referrerPolicy"
                          className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-purple-400 transition-colors shrink-0"
                          title="Open login page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedItem.notes && (
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-older">
                        Secure Details Note
                      </span>
                      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-xs text-white/60 whitespace-pre-wrap font-sans max-h-32 overflow-y-auto leading-relaxed">
                        {selectedItem.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons (Edit, Delete, Dates info) */}
              <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
                <div className="flex gap-2.5">
                  <button
                    onClick={() => openEditModal(selectedItem)}
                    className="flex-1 py-1.5 px-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl text-xs font-semibold text-white/80 flex items-center justify-center gap-1.5 cursor-pointer h-9 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Modify Item
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer h-9 transition-all ${
                      isConfirmingDelete
                        ? 'bg-red-600 text-white border border-red-500 animate-pulse'
                        : 'bg-red-950/20 border border-red-500/20 hover:bg-red-500/10 text-red-200'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[9px] text-white/30 font-mono px-1">
                  <span>Created: {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(selectedItem.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white/40 bg-white/5 backdrop-blur-md min-h-[400px]">
              <Shield className="w-8 h-8 text-white/20 mb-2.5" />
              <p className="text-xs font-semibold">Credential Auditor Panel</p>
              <p className="text-[11px] text-white/30 max-w-[200px] mt-1">
                Select any saved credential card on the left to reveal secure item files, links, notes, and audits.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Secret Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#050508] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
              onSubmit={handleSubmit}
            >
              {/* Top Title */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  {modalMode === 'create' ? 'Securing a Brand New Secret' : `Editing Saved Secret: ${formTitle}`}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Service Title */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. github, Gmail, Stripe"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-10 outline-none transition-all"
                    />
                  </div>

                  {/* Category select option */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as WalletItem['category'])}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-10 outline-none transition-all"
                    >
                      <option value="Login">Login / App</option>
                      <option value="Social">Social Media</option>
                      <option value="Finance">Finance & Bills</option>
                      <option value="Work">Work & Projects</option>
                      <option value="Secure Note">Secure Note</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Account Username */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                      Username or Login Email *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Username, handle or email"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-10 outline-none transition-all"
                    />
                  </div>

                  {/* Website link URL */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5 flex justify-between">
                      <span>Website Link URL</span>
                      <span className="text-[9px] text-white/30 normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. github.com, mail.google.com"
                      value={formWebsiteUrl}
                      onChange={(e) => setFormWebsiteUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-10 outline-none"
                    />
                  </div>
                </div>

                {/* Password field with dynamic generator sync */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">
                      Password Code *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerate}
                      className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer select-none"
                      title="Quick high-entropy random password"
                    >
                      <RefreshCw className="w-3 h-3 text-purple-400" />
                      Auto-Generate Secure Password
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter secure password or click generate"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-10 outline-none"
                  />
                  {formPassword && (
                    <div className="flex justify-between text-[10px] px-1 font-sans">
                      <span className="text-white/40">Proposed Password Strength:</span>
                      <span className={
                        analyzePasswordStrength(formPassword).score >= 3 ? 'text-purple-300 font-bold' :
                        analyzePasswordStrength(formPassword).score === 2 ? 'text-yellow-400 font-semibold' :
                        'text-red-400 font-semibold'
                      }>
                        {analyzePasswordStrength(formPassword).label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Secure details notes */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5 flex justify-between">
                    <span>Secure Notes</span>
                    <span className="text-[9px] text-white/30 normal-case">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Write custom security recovery codes, passphrases, pin tokens or references safely..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 rounded-xl p-3 text-xs text-white resize-none outline-none"
                  />
                </div>

                {/* Action Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2 px-4 bg-black/30 border border-white/10 hover:border-white/20 text-xs font-semibold text-white/60 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="py-2 px-5 bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer h-10 flex items-center justify-center min-w-[100px]"
                  >
                    {formLoading ? <Loader className="w-4.5 h-4.5 animate-spin text-white" /> : 'Save Secure Token'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
