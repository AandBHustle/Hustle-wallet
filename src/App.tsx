/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Key, RefreshCw, Hash, LogOut, User, CheckCircle, AlertCircle, ShieldCheck, Database
} from 'lucide-react';

import { WalletItem, HashRecord, AuthUser } from './types';
import { 
  db, auth, isFirebaseActive, handleFirestoreError, OperationType 
} from './firebase';
import { 
  collection, query, where, onSnapshot, setDoc, doc, deleteDoc, updateDoc, getDocFromServer 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import AuthScreen from './components/AuthScreen';
import HustleDashboard from './components/HustleDashboard';
import PasswordGenerator from './components/PasswordGenerator';
import HashCreator from './components/HashCreator';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hustle' | 'generator' | 'hashes'>('hustle');
  
  // App states
  const [hustleItems, setHustleItems] = useState<WalletItem[]>([]);
  const [dbHashItems, setDbHashItems] = useState<HashRecord[]>([]);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Prerequisite Rule Check: call getDocFromServer to validate Firestore connection on boot
  useEffect(() => {
    async function testConnection() {
      if (isFirebaseActive && db) {
        try {
          setDbConnectionStatus('checking');
          await getDocFromServer(doc(db, 'test', 'connection'));
          setDbConnectionStatus('online');
          console.log("Firestore secure handshake verified successfully.");
        } catch (error) {
          setDbConnectionStatus('offline');
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.warn("Please check your Firebase configuration or network limits.");
          }
        }
      } else {
        setDbConnectionStatus('offline');
      }
    }
    testConnection();
  }, []);

  // Firebase Auth Changed subscription
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribeAuto = onAuthStateChanged(auth, (loggedUser) => {
        if (loggedUser) {
          setUser({
            uid: loggedUser.uid,
            email: loggedUser.email,
            displayName: loggedUser.displayName,
            emailVerified: loggedUser.emailVerified,
            isAnonymous: loggedUser.isAnonymous
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return () => unsubscribeAuto();
    } else {
      // Local session loading fallback
      const storedLocalSession = localStorage.getItem('__hustle_simulated_user');
      if (storedLocalSession) {
        setUser(JSON.parse(storedLocalSession));
      }
      setAuthLoading(false);
    }
  }, []);

  // Active sync lists from database / local storage depending on session mode
  useEffect(() => {
    if (!user) {
      setHustleItems([]);
      setDbHashItems([]);
      return;
    }

    if (isFirebaseActive && db && !user.isAnonymous) {
      // Subscribe to personal password lists
      const qHustles = query(collection(db, 'hustleItems'), where('userId', '==', user.uid));
      const unsubscribeHustles = onSnapshot(qHustles, (snapshot) => {
        const list: WalletItem[] = [];
        snapshot.forEach((docSnapshot) => {
          list.push({ ...docSnapshot.data(), id: docSnapshot.id } as WalletItem);
        });
        // Sort newest updated first
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setHustleItems(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'hustleItems');
      });

      // Subscribe to hash history lists
      const qHashes = query(collection(db, 'hashRecords'), where('userId', '==', user.uid));
      const unsubscribeHashes = onSnapshot(qHashes, (snapshot) => {
        const list: HashRecord[] = [];
        snapshot.forEach((docSnapshot) => {
          list.push({ ...docSnapshot.data(), id: docSnapshot.id } as HashRecord);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDbHashItems(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'hashRecords');
      });

      return () => {
        unsubscribeHustles();
        unsubscribeHashes();
      };
    } else {
      // Sync local sandbox storage lists
      const localHustle = localStorage.getItem(`__hustle_items_${user.uid}`);
      if (localHustle) {
        setHustleItems(JSON.parse(localHustle));
      } else {
        setHustleItems([]);
      }

      const localHashes = localStorage.getItem(`__hustle_hash_records_${user.uid}`);
      if (localHashes) {
        setDbHashItems(JSON.parse(localHashes));
      } else {
        setDbHashItems([]);
      }
    }
  }, [user]);

  // Handle successful Auth login operations
  const handleAuthSuccess = (loggedUser: { uid: string; email: string | null; displayName: string | null; isAnonymous: boolean }) => {
    // Treat Google Accounts and Apple simulated accounts as verified by default
    const verifiedStatus = loggedUser.isAnonymous 
      ? false 
      : loggedUser.email?.includes('gmail') || loggedUser.email?.includes('icloud') || loggedUser.uid.includes('google') || loggedUser.uid.includes('apple') 
        ? true 
        : false;

    const formattedUser: AuthUser = {
      uid: loggedUser.uid,
      email: loggedUser.email,
      displayName: loggedUser.displayName,
      emailVerified: verifiedStatus,
      isAnonymous: loggedUser.isAnonymous
    };

    setUser(formattedUser);
    if (!isFirebaseActive || loggedUser.isAnonymous) {
      localStorage.setItem('__hustle_simulated_user', JSON.stringify(formattedUser));
    }
  };

  // Auth logout routine
  const handleSignOut = async () => {
    if (isFirebaseActive && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      }
    }
    setUser(null);
    localStorage.removeItem('__hustle_simulated_user');
  };

  // Hustle Items operations
  const handleAddHustleItem = async (fields: Omit<WalletItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    const itemId = 'w_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const timestamp = new Date().toISOString();

    const payload: WalletItem = {
      id: itemId,
      ...fields,
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: user.uid,
    };

    if (isFirebaseActive && db && !user.isAnonymous) {
      try {
        await setDoc(doc(db, 'hustleItems', itemId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `hustleItems/${itemId}`);
      }
    } else {
      const updated = [payload, ...hustleItems];
      setHustleItems(updated);
      localStorage.setItem(`__hustle_items_${user.uid}`, JSON.stringify(updated));
    }
  };

  const handleUpdateHustleItem = async (id: string, updates: Partial<WalletItem>) => {
    if (!user) return;
    const timestamp = new Date().toISOString();

    if (isFirebaseActive && db && !user.isAnonymous) {
      try {
        await updateDoc(doc(db, 'hustleItems', id), {
          ...updates,
          updatedAt: timestamp,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `hustleItems/${id}`);
      }
    } else {
      const updated = hustleItems.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates, updatedAt: timestamp };
        }
        return item;
      });
      setHustleItems(updated);
      localStorage.setItem(`__hustle_items_${user.uid}`, JSON.stringify(updated));
    }
  };

  const handleDeleteHustleItem = async (id: string) => {
    if (!user) return;

    if (isFirebaseActive && db && !user.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'hustleItems', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `hustleItems/${id}`);
      }
    } else {
      const updated = hustleItems.filter((item) => item.id !== id);
      setHustleItems(updated);
      localStorage.setItem(`__hustle_items_${user.uid}`, JSON.stringify(updated));
    }
  };

  // Hash transaction operations
  const handleAddHashRecord = async (text: string, algorithm: string, hashValue: string) => {
    if (!user) return;
    const recordId = 'h_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const timestamp = new Date().toISOString();

    const payload: HashRecord = {
      id: recordId,
      text,
      algorithm,
      hashValue,
      createdAt: timestamp,
      userId: user.uid,
    };

    if (isFirebaseActive && db && !user.isAnonymous) {
      try {
        await setDoc(doc(db, 'hashRecords', recordId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `hashRecords/${recordId}`);
      }
    } else {
      const updated = [payload, ...dbHashItems];
      setDbHashItems(updated);
      localStorage.setItem(`__hustle_hash_records_${user.uid}`, JSON.stringify(updated));
    }
  };

  const handleDeleteHashRecord = async (id: string) => {
    if (!user) return;

    if (isFirebaseActive && db && !user.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'hashRecords', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `hashRecords/${id}`);
      }
    } else {
      const updated = dbHashItems.filter((item) => item.id !== id);
      setDbHashItems(updated);
      localStorage.setItem(`__hustle_hash_records_${user.uid}`, JSON.stringify(updated));
    }
  };

  // Render initial Loading screen values
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/35 mb-4 text-emerald-400"
        >
          <Shield className="w-8 h-8 animate-pulse" />
        </motion.div>
        <span className="font-display text-sm tracking-widest text-slate-500 uppercase">
          Initializing Hustle Wallet...
        </span>
      </div>
    );
  }

  // Redirect to register if session isn't loaded
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Mesh Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-purple-500 to-blue-500 text-white rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              HUSTLE<span className="text-purple-400 font-normal">WALLET</span>
            </h1>
            <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">
              Digital Credentials Wallet
            </span>
          </div>
        </div>

        {/* Tab Selection panel links */}
        <nav className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('hustle')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer relative transition-all ${
              activeTab === 'hustle' ? 'text-white' : 'text-white/65 hover:text-white'
            }`}
          >
            {activeTab === 'hustle' && (
              <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg -z-10" />
            )}
            <Key className="w-3.5 h-3.5" />
            Saved Hustles ({hustleItems.length})
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer relative transition-all ${
              activeTab === 'generator' ? 'text-white' : 'text-white/65 hover:text-white'
            }`}
          >
            {activeTab === 'generator' && (
              <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg -z-10" />
            )}
            <RefreshCw className="w-3.5 h-3.5" />
            Generator
          </button>
          <button
            onClick={() => setActiveTab('hashes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer relative transition-all ${
              activeTab === 'hashes' ? 'text-white' : 'text-white/65 hover:text-white'
            }`}
          >
            {activeTab === 'hashes' && (
              <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg -z-10" />
            )}
            <Hash className="w-3.5 h-3.5" />
            Hash Creator
          </button>
        </nav>

        {/* Profile Status Badge & Actions */}
        <div className="flex items-center gap-3">
          {/* Email Verification overlay check for safety */}
          {!user.isAnonymous && (
            <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase tracking-wider ${
              user.emailVerified 
                ? 'text-purple-300 border-purple-500/20 bg-purple-500/5' 
                : 'text-amber-400 border-amber-500/20 bg-amber-500/5'
            }`}>
              {user.emailVerified ? (
                <>
                  <CheckCircle className="w-3 h-3 text-purple-400 shrink-0" />
                  Verified Session
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  Unverified Account
                </>
              )}
            </div>
          )}

          {/* User profile capsule info */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 leading-none text-left backdrop-blur-md">
            <div className="p-1.5 bg-black/40 rounded border border-white/10">
              <User className="w-3.5 h-3.5 text-white/60" />
            </div>
            <div className="hidden md:block">
              <span className="text-[10px] text-white/40 block truncate font-mono max-w-[80px]">
                {user.isAnonymous ? 'Sandbox-Guest' : 'Cloud Session'}
              </span>
              <span className="text-[11px] font-bold text-white truncate block max-w-[100px]" title={user.displayName || user.email || 'Client'}>
                {user.displayName || user.email?.split('@')[0] || 'User Client'}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-white/10 text-white/50 hover:text-red-400 rounded-xl border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Log out of session safely"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Screen Panel */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10">
        {/* Dynamic Warning for Sandbox Session */}
        {user.isAnonymous && (
          <div className="mb-6 p-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-between gap-4">
            <span className="text-xs text-white/80 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400 shrink-0" />
              You are in a <span className="font-semibold text-white">Sandbox Session</span>. Passwords and history are saved to your local storage.
            </span>
            <button 
              onClick={handleSignOut}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline shrink-0 cursor-pointer"
            >
              Log in / Create Account to Sync
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {activeTab === 'hustle' && (
              <HustleDashboard
                userId={user.uid}
                isAnonymous={user.isAnonymous}
                hustleItems={hustleItems}
                onAddHustleItem={handleAddHustleItem}
                onUpdateHustleItem={handleUpdateHustleItem}
                onDeleteHustleItem={handleDeleteHustleItem}
              />
            )}
            
            {activeTab === 'generator' && <PasswordGenerator />}

            {activeTab === 'hashes' && (
              <HashCreator
                userId={user.uid}
                isAnonymous={user.isAnonymous}
                dbHashItems={dbHashItems}
                onAddHashRecord={handleAddHashRecord}
                onDeleteHashRecord={handleDeleteHashRecord}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-5 text-center text-xs text-white/40 bg-[#050508]/60 backdrop-blur-md mt-auto select-none space-y-1 font-sans">
        <p className="flex justify-center items-center gap-1.5 font-mono text-[10px] tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          Hustle Wallet &mdash; Client-side encryption & key derivation
        </p>
        <p className="text-[10px] text-white/30 font-medium">
          Creator: <span className="text-purple-400 font-semibold">A&B</span> &mdash; <span className="text-white/60">Barad Babaei</span> & <span className="text-white/60">Amir mahdi Najafi</span>
        </p>
      </footer>
    </div>
  );
}
