/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import CryptoJS from 'crypto-js';
import { PasswordConfig } from '../types';

/**
 * Generates a high-entropy password based on provided configurations.
 */
export function generatePassword(config: PasswordConfig): string {
  const { length, uppercase, lowercase, numbers, symbols, excludeSimilar } = config;

  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (excludeSimilar) {
    // Exclude confusing/similar characters: o, O, 0, i, I, l, L, 1, |, s, S, 5
    upperChars = upperChars.replace(/[OILeS]/g, '');
    lowerChars = lowerChars.replace(/[oils]/g, '');
    numberChars = numberChars.replace(/[015]/g, '');
    symbolChars = symbolChars.replace(/[|]/g, '');
  }

  let charPool = '';
  const guaranteedChars: string[] = [];

  if (uppercase) {
    charPool += upperChars;
    if (upperChars.length > 0) {
      guaranteedChars.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
    }
  }
  if (lowercase) {
    charPool += lowerChars;
    if (lowerChars.length > 0) {
      guaranteedChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
    }
  }
  if (numbers) {
    charPool += numberChars;
    if (numberChars.length > 0) {
      guaranteedChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    }
  }
  if (symbols) {
    charPool += symbolChars;
    if (symbolChars.length > 0) {
      guaranteedChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }
  }

  // If no pools selected, default to lowercase
  if (!charPool) {
    charPool = lowerChars;
    guaranteedChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }

  let result = '';
  // Fill remaining spots
  const fillLength = length - guaranteedChars.length;
  for (let i = 0; i < fillLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    result += charPool[randomIndex];
  }

  // Add the guaranteed characters and shuffle
  const finalArray = [...result, ...guaranteedChars];
  for (let i = finalArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalArray[i], finalArray[j]] = [finalArray[j], finalArray[i]];
  }

  return finalArray.join('');
}

export interface PasswordStrength {
  score: number; // 0 (very weak) to 4 (excellent)
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Excellent';
  colorClass: string; // Tailwind bg- class
  barCount: number;
  suggestions: string[];
}

/**
 * Evaluates password strength and returns a detailed diagnostics report.
 */
export function analyzePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      colorClass: 'bg-red-500',
      barCount: 0,
      suggestions: ['Enter some characters to evaluate strength.'],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let varietyCount = 0;
  if (hasUpper) varietyCount++;
  if (hasLower) varietyCount++;
  if (hasDigit) varietyCount++;
  if (hasSpecial) varietyCount++;

  if (varietyCount >= 3) score += 1;

  // Penalty: extremely short passwords are always weak
  if (password.length < 6) {
    score = 0;
  }

  // Generate actionable suggestions
  if (password.length < 8) {
    suggestions.push('Make password at least 8 characters long (12+ is highly recommended).');
  }
  if (!hasUpper) {
    suggestions.push('Add an uppercase letter (A-Z).');
  }
  if (!hasLower) {
    suggestions.push('Add a lowercase letter (a-z).');
  }
  if (!hasDigit) {
    suggestions.push('Include at least one number (0-9).');
  }
  if (!hasSpecial) {
    suggestions.push('Incorporate special characters (!@#$%^&*).');
  }

  // Common pattern checks
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating the same character 3 or more times consecutively.');
  }

  // Map score to label & color
  let label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Excellent' = 'Very Weak';
  let colorClass = 'bg-red-500';
  let barCount = 1;

  switch (score) {
    case 0:
      label = 'Very Weak';
      colorClass = 'bg-red-500';
      barCount = 1;
      break;
    case 1:
      label = 'Weak';
      colorClass = 'bg-orange-500';
      barCount = 2;
      break;
    case 2:
      label = 'Fair';
      colorClass = 'bg-yellow-500';
      barCount = 3;
      break;
    case 3:
      label = 'Strong';
      colorClass = 'bg-green-500';
      barCount = 4;
      break;
    case 4:
      label = 'Excellent';
      colorClass = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      barCount = 5;
      break;
  }

  return {
    score,
    label,
    colorClass,
    barCount,
    suggestions,
  };
}

/**
 * Structure containing all cryptographic checksum values.
 */
export interface HashOutput {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

/**
 * Computes multiple common cryptographic hashes.
 */
export function generateHashes(text: string): HashOutput {
  if (!text) {
    return { md5: '', sha1: '', sha256: '', sha512: '' };
  }
  return {
    md5: CryptoJS.MD5(text).toString(CryptoJS.enc.Hex),
    sha1: CryptoJS.SHA1(text).toString(CryptoJS.enc.Hex),
    sha256: CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex),
    sha512: CryptoJS.SHA512(text).toString(CryptoJS.enc.Hex),
  };
}
