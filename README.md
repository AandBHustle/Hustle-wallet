# 🔐 Hustle Wallet

> **Your Passwords. Your Security. Your Control.**

Hustle Wallet is a **next-generation secure password manager** built with modern web technologies and enterprise-grade security architecture. Designed for everyone who values their digital security, Hustle Wallet provides military-grade encryption, zero-trust architecture, and complete ownership of your most sensitive data.

![TypeScript](https://img.shields.io/badge/TypeScript-70.2%25-3178c6?style=flat-square)
![HTML/CSS](https://img.shields.io/badge/HTML%2FCSS-29.8%25-e34c26?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA726?style=flat-square)](https://firebase.google.com)

---

## 👥 Created By

This project was created by passionate security enthusiasts:

- **A&B** - Project Lead
- **Barad Babaei** - Lead Developer
- **Amir Mehdi Najfi** - Security Architect

---

## ✨ Why Hustle Wallet?

In today's digital world, password security is **critical**. Hustle Wallet takes security seriously:

✅ **Your Data, Your Control** - No corporate tracking, no data selling, just pure security
✅ **Military-Grade Encryption** - 256-bit encryption protects every password
✅ **Zero-Trust Architecture** - Every action is verified, nothing is assumed
✅ **Privacy First** - End-to-end encryption means your data stays yours
✅ **Modern & Fast** - Built on React 19 and Vite for lightning-fast performance
✅ **AI-Powered** - Gemini AI integration for intelligent password suggestions
✅ **Global Access** - Manage passwords securely from anywhere, on any device

---

## 🎯 Core Features

### 🔒 Advanced Security Features

| Feature | Description |
|---------|-------------|
| **End-to-End Encryption** | All passwords encrypted with CryptoJS before cloud storage |
| **Zero-Trust Verification** | Email verification required for all write operations |
| **Owner-Exclusive Isolation** | Only you can access your passwords - complete data compartmentalization |
| **Immutable Ownership** | Password ownership cannot be transferred or modified |
| **Field-Level Validation** | Strict size limits prevent "Denial of Wallet" attacks |
| **13+ Security Rules** | Firestore rules validated against 12 sophisticated attack vectors |

### 💾 Credential Management

- **Password Storage** - Securely store unlimited passwords with metadata
- **Smart Categories** - Organize by: Login, Social, Finance, Work, Secure Notes, Other
- **One-Click Copy** - Safely copy passwords without plaintext exposure
- **Secure Notes** - Store sensitive information beyond just passwords
- **Search & Filter** - Instantly find credentials by category or keyword
- **Last Modified Tracking** - Know when each password was last updated

### 🤖 Intelligent Features

- **AI Password Generation** - Get intelligent password suggestions via Gemini AI
- **Hash Generation** - Create and store cryptographic hashes (SHA-256, etc.)
- **Hash History** - Track all hashes you've generated

### 📱 User Experience

- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Beautiful UI** - Modern design with Tailwind CSS and Lucide icons
- **Smooth Animations** - Fluid interactions with Motion library
- **Fast Performance** - Vite builds ensure lightning-fast load times
- **Dark Mode Ready** - Eye-friendly interface for any environment

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** v16+ installed
- **npm** package manager
- A **Google Gemini API Key** ([Get it free](https://aistudio.google.com))
- A **Firebase Project** with Firestore enabled

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/AandBHustle/Hustle-wallet.git
cd Hustle-wallet

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
GEMINI_API_KEY=your_actual_api_key_from_google_ai_studio
APP_URL=http://localhost:3000
```

```bash
# 4. Start the development server
npm run dev
```

Open your browser to **http://localhost:3000** and start securing your passwords! 🎉

---

## 📚 Available Commands

```bash
# Development server (port 3000, accessible from 0.0.0.0)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# TypeScript type checking (without build)
npm lint

# Clean build artifacts
npm run clean
```

---

## 🔐 Security Architecture

### How Does Hustle Wallet Keep Your Data Safe?

#### 1. **Client-Side Encryption**
```
Your Password → CryptoJS Encryption → Firebase Cloud
```
- Passwords are encrypted **before** leaving your device
- Only the encrypted version travels to the cloud
- Only you have the decryption capability

#### 2. **Zero-Trust Firestore Rules**
Every database operation is validated:
```firestore
✓ User must be authenticated
✓ Email must be verified  
✓ Can only access own documents
✓ Password must be 1-1024 characters
✓ Title must be 1-64 characters
✓ Fields are immutable after creation
✓ IDs must be alphanumeric with dashes/underscores
```

#### 3. **The "Dirty Dozen" Attack Prevention**
Hustle Wallet is hardened against 12 sophisticated attack vectors:

1. **Identity Hijack** - Prevents creating items with another user's ID
2. **Ghost Field Injection** - Rejects unapproved fields
3. **No-Verify Write** - Blocks writes from unverified emails
4. **Credential Leak** - Prevents querying other users' data
5. **Buffer Overflow** - Rejects oversized passwords (>1024 chars)
6. **Malicious Title Poisoning** - Validates title content and length
7. **Cross-User Snooping** - Isolates data by user ID
8. **Owner Mutation** - Prevents changing password ownership
9. **Timestamp Retrofitting** - Locks creation date
10. **Invalid Categories** - Enforces allowed category values
11. **Orphaned Hashes** - Validates hash record fields
12. **Junk ID Poisoning** - Validates document ID format

**Status**: ✅ All 12 attacks are prevented with PERMISSION_DENIED errors

See [security_spec.md](./security_spec.md) for detailed threat analysis.

---

## 🏗️ Project Structure

```
Hustle-wallet/
├── src/                          # React TypeScript source code
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page components
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript type definitions
│   ├── styles/                   # Tailwind CSS configuration
│   └── main.tsx                  # Application entry point
├── public/                       # Static assets
├── index.html                    # HTML entry template
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── firestore.rules              # Firebase Firestore security rules
├── firebase-blueprint.json      # Database schema and structure
├── firebase-applet-config.json  # Firebase credentials (gitignored)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── security_spec.md             # Security documentation
└── README.md                    # This file!
```

---

## ⚙️ Configuration Guide

### Firebase Setup

1. **Create Firebase Project**
   - Go to [firebase.google.com](https://firebase.google.com)
   - Create a new project named "Hustle Wallet"

2. **Enable Firestore**
   - In Firebase Console → Firestore Database → Create Database
   - Select **Production Mode** (we use security rules, not test mode)
   - Choose your region (closest to you or your users)

3. **Enable Authentication**
   - Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in (optional)

4. **Copy Firebase Config**
   - Project Settings → Your apps → Web app
   - Copy the config object
   - Save to `firebase-applet-config.json`

5. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key" 
3. Create a new API key
4. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

---

## 📊 Data Schema

### HustleItem (Password Record)

```typescript
{
  id: string,              // Unique identifier
  title: string,           // Service name (e.g., "Gmail", "GitHub")
  username: string,        // Login email or username
  password: string,        // Encrypted password (1-1024 chars)
  websiteUrl?: string,     // Direct login URL
  category: string,        // "Login" | "Social" | "Finance" | "Work" | "Secure Note" | "Other"
  notes?: string,          // Additional secure notes
  createdAt: ISO-8601,     // When created
  updatedAt: ISO-8601,     // When last modified
  userId: string           // Your Firebase UID (immutable)
}
```

### HashRecord (Hash History)

```typescript
{
  id: string,              // Unique identifier
  text: string,            // Original text (≤1000 chars)
  algorithm: string,       // "SHA-256", "SHA-512", etc.
  hashValue: string,       // The generated hash
  createdAt: ISO-8601,     // When generated
  userId: string           // Your Firebase UID (immutable)
}
```

---

## 🌐 Deployment

### Deploy to Google Cloud Run

```bash
# Build the app
npm run build

# Deploy to Cloud Run
gcloud run deploy hustle-wallet \
  --source . \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,APP_URL=your_cloud_run_url
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel deploy --env GEMINI_API_KEY=your_key
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy with Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t hustle-wallet .
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e APP_URL=http://localhost:3000 \
  hustle-wallet
```

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, Lucide React Icons |
| **Encryption** | CryptoJS 4.2 |
| **Backend** | Firebase Firestore, Cloud Rules |
| **AI/ML** | Google Gemini API 2.4 |
| **Animations** | Motion Library 12.23 |
| **Build** | Vite 6.2, esbuild 0.25 |
| **DevOps** | Express 4.21, tsx 4.21 |

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Hustle-wallet.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Standards
- ✅ Write TypeScript with strict types
- ✅ Follow ESLint configuration
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Consider security implications
- ✅ Run `npm lint` before committing

### Types of Contributions We Accept
- 🐛 Bug reports and fixes
- ✨ New features (discuss in issues first)
- 📚 Documentation improvements
- 🔒 Security hardening
- ♿ Accessibility improvements
- 🎨 UI/UX enhancements
- 🚀 Performance optimizations

---

## 🚨 Security Policy

**Found a Security Vulnerability?** 🔴

Please **DO NOT** create a public GitHub issue, as this could expose the vulnerability to attackers.

Instead:
1. Email the maintainer directly
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)
3. Allow 90 days for a patch before public disclosure

We take security **very seriously** and will respond promptly to all reports.

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for full details.

### MIT License Summary
- ✅ Use for commercial purposes
- ✅ Modify the code
- ✅ Distribute the code
- ❌ Hold the creator liable
- ℹ️ Include license and copyright notice

---

## 🙏 Acknowledgments

Hustle Wallet stands on the shoulders of giants:

- **[React](https://react.dev/)** - Amazing JavaScript library for building UIs
- **[Firebase](https://firebase.google.com)** - Secure cloud infrastructure
- **[Google AI](https://ai.google.dev/)** - Gemini API for intelligent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[CryptoJS](https://cryptojs.gitbook.io/docs/)** - Cryptographic algorithms
- All open-source contributors and security researchers

---

## 📞 Support & Community

Have questions? Found a bug? Want to chat?

- 📋 **Report Issues**: [GitHub Issues](https://github.com/AandBHustle/Hustle-wallet/issues)
- 💬 **Start Discussions**: [GitHub Discussions](https://github.com/AandBHustle/Hustle-wallet/discussions)
- 🌟 **Star the Project**: Show your support!
- 🐦 **Follow Updates**: Watch the repository

---

## 🎯 Roadmap

Future features we're planning:

- [ ] Browser extension for auto-fill
- [ ] Mobile apps (iOS/Android)
- [ ] Two-factor authentication (2FA)
- [ ] Biometric unlock support
- [ ] Password breach detection
- [ ] Organization/team sharing
- [ ] Advanced audit logs
- [ ] Hardware security key support
- [ ] Dark mode optimization
- [ ] Offline mode

---

## 📊 Statistics

- **70.2%** TypeScript
- **29.8%** HTML/CSS
- **13+** Security validation rules
- **12** Attack vectors prevented
- **6** Password categories
- **256-bit** Encryption strength

---

## 💡 Tips for Users

### Best Practices

1. ✅ **Enable email verification** on your Firebase account
2. ✅ **Use strong, unique passwords** for important accounts
3. ✅ **Never share your Gemini API key** in version control
4. ✅ **Keep your dependencies updated** with `npm update`
5. ✅ **Use environment variables** for all secrets
6. ✅ **Enable Firebase Firestore backups**
7. ✅ **Review access logs** regularly

### Troubleshooting

**"PERMISSION_DENIED" error?**
- Ensure your email is verified in Firebase
- Check that your Firestore rules are deployed
- Verify your Firebase credentials are correct

**"API key not valid" error?**
- Check your Gemini API key in `.env.local`
- Ensure the API is enabled in Google Cloud Console
- Regenerate the key if necessary

**Passwords not syncing?**
- Check your internet connection
- Verify Firebase connectivity
- Clear browser cache and try again

---

## 📄 Additional Documentation

- [Security Specification](./security_spec.md) - Detailed security architecture
- [Firebase Setup Guide](./docs/firebase-setup.md) - Step-by-step Firebase configuration
- [API Documentation](./docs/api.md) - Code API reference

---

<div align="center">

### Built with ❤️ for a more secure digital world

**Protect your passwords. Protect your identity. Hustle Wallet.**

[⭐ Star us on GitHub](https://github.com/AandBHustle/Hustle-wallet) | [🐛 Report a Bug](https://github.com/AandBHustle/Hustle-wallet/issues) | [💬 Start a Discussion](https://github.com/AandBHustle/Hustle-wallet/discussions)

*Made for everyone who believes security should be simple, not complicated.*

</div>
