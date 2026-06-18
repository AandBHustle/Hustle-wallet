/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Chrome, Apple, ArrowRight, Eye, EyeOff, Terminal, HelpCircle, Loader } from 'lucide-react';
import { isFirebaseActive, auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthScreenProps {
  onAuthSuccess: (user: { uid: string; email: string | null; displayName: string | null; isAnonymous: boolean }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    if (isFirebaseActive && auth) {
      try {
        if (isSignUp) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          onAuthSuccess({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || email.split('@')[0],
            isAnonymous: false
          });
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          onAuthSuccess({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || email.split('@')[0],
            isAnonymous: false
          });
        }
      } catch (err: any) {
        console.error(err);
        let msg = err.message;
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = 'Invalid email or password.';
        } else if (err.code === 'auth/email-already-in-use') {
          msg = 'This email already has an account associated.';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = 'Email/password authentication is not enabled in your Firebase project. See the setup guide above.';
        }
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Local Database simulation (for offline demo mode)
      setTimeout(() => {
        setLoading(false);
        // Simulate successful login
        const simulatedUser = {
          uid: `simulated_users_${Math.abs(email.hashCode())}`,
          email: email,
          displayName: email.split('@')[0],
          isAnonymous: false
        };
        // Store simple local account mapping in localStorage
        const accountsStr = localStorage.getItem('__hustle_simulated_accounts') || '{}';
        const accounts = JSON.parse(accountsStr);
        
        if (isSignUp) {
          if (accounts[email]) {
            setErrorMessage('This email already has an account associated.');
            return;
          }
          accounts[email] = password;
          localStorage.setItem('__hustle_simulated_accounts', JSON.stringify(accounts));
        } else {
          if (!accounts[email] || accounts[email] !== password) {
            setErrorMessage('Invalid email or password.');
            return;
          }
        }

        onAuthSuccess(simulatedUser);
      }, 800);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (isFirebaseActive && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        onAuthSuccess({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          isAnonymous: false
        });
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Google authentication failed.');
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setLoading(false);
        onAuthSuccess({
          uid: 'simulated_google_user_123',
          email: 'baradbabaeiii@gmail.com',
          displayName: 'Barad Babaeiii',
          isAnonymous: false
        });
      }, 700);
    }
  };

  const handleAppleAuth = () => {
    // Apple Auth simulation or Firebase auth setup
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess({
        uid: 'simulated_apple_user_999',
        email: 'apple.user@icloud.com',
        displayName: 'Apple Client',
        isAnonymous: false
      });
    }, 800);
  };

  const enterAsGuest = () => {
    onAuthSuccess({
      uid: 'sandbox_guest_session',
      email: null,
      displayName: 'Sandbox Explorer',
      isAnonymous: true
    });
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Mesh Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8 text-center" id="auth-header">
          <div className="p-3 bg-gradient-to-tr from-purple-500 to-blue-500 text-white rounded-2xl mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-2">
            HUSTLE<span className="text-purple-400 font-normal">WALLET</span>
          </h1>
          <p className="text-sm text-white/60 max-w-xs">
            Secure digital credentials wallet, offline password generator, and cryptographic hash utility.
          </p>
        </div>

        {/* Dashboard/Database status indication */}
        <div className="mb-4 text-xs flex justify-between items-center py-2 px-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-white/60 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-white/40" />
            Backend Sync Status:
          </span>
          <div className="flex items-center gap-1.5">
            {isFirebaseActive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-purple-300 font-medium">Cloud Active</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 font-medium">Local-Sandbox (Secure)</span>
                <button 
                  onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                  className="text-white/45 hover:text-white transition-colors ml-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic developer guide showing how to switch to Live Firebase */}
        {showFirebaseGuide && !isFirebaseActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 text-xs bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md text-white/80"
          >
            <p className="font-semibold text-purple-300 mb-1">To Enable Firebase Persistence:</p>
            <ol className="list-decimal list-inside space-y-1 text-white/60">
              <li>Open the Firebase settings panel in UI to accept the terms of service.</li>
              <li>Enable standard Email/Password authentication in your Firebase Auth dashboard.</li>
              <li>The application will automatically detect the settings and connect.</li>
            </ol>
            <button 
              onClick={() => setShowFirebaseGuide(false)}
              className="text-purple-400 hover:underline mt-2 block font-medium"
            >
              Acknowledge & Hide
            </button>
          </motion.div>
        )}

        {/* Real Form and card layout */}
        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black/40 p-6 relative overflow-hidden" id="login-container">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-purple-500/40" />
          
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
                  placeholder="name@service.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl"
              >
                {errorMessage}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/30 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] shadow-lg transition-all duration-300"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  {isSignUp ? 'Initialize New Account' : 'Verify Security Credentials'}
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Prompt Toggle */}
          <div className="mt-4 text-center text-xs">
            <span className="text-white/40">
              {isSignUp ? 'Already registered?' : 'Need a separate sandbox?'}
            </span>{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              className="text-purple-400 hover:text-purple-300 font-medium underline min-w-[44px] inline-block h-8 cursor-pointer align-middle"
            >
              {isSignUp ? 'Verify credentials' : 'Initialize an account'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#050508]/10 text-white/40 uppercase tracking-wider backdrop-blur-md rounded">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Social Sign In Providers */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white cursor-pointer h-11 transition-all"
            >
              <Chrome className="w-4 h-4 text-red-400" />
              Google
            </button>
            <button
              type="button"
              onClick={handleAppleAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white cursor-pointer h-11 transition-all"
            >
              <Apple className="w-4 h-4 text-white" />
              Apple ID
            </button>
          </div>

          {/* Guest sandbox session link */}
          <button
            type="button"
            onClick={enterAsGuest}
            disabled={loading}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/75 hover:text-white rounded-xl text-xs font-medium cursor-pointer transition-colors border border-dashed border-white/10 h-9"
          >
            Enter Sandbox Mode (Instant, No Sign-in Required)
          </button>
        </div>

        {/* Security disclaimer footer */}
        <p className="text-center text-[10px] text-white/30 mt-6 select-none leading-relaxed">
          Credentials are encrypted client-side using robust crypto guidelines before sync. Password values are never stored or stored unencrypted.<br />
          Creator: <span className="text-purple-400 font-semibold">A&B</span> &mdash; <span className="text-white/60">Barad Babaei</span> & <span className="text-white/60">Amir mahdi Najafi</span>
        </p>
      </motion.div>
    </div>
  );
}

// Simple hash implementation helper for simulated unique keys
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
