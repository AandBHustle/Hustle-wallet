/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WalletItem {
  id: string;
  title: string;
  username: string;
  password: string;
  websiteUrl?: string;
  category: 'Login' | 'Social' | 'Finance' | 'Work' | 'Secure Note' | 'Other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PasswordConfig {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

export interface HashRecord {
  id: string;
  text: string;
  algorithm: string;
  hashValue: string;
  createdAt: string;
  userId: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
}
