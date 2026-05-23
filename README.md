# 🩺 RepoMedic.ai

<div align="center">

**Your AI Debugging Teammate**

*Paste any GitHub repository. Describe a bug. Get root cause, step-by-step fix, and an automatic Pull Request — in under 60 seconds.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-repomedic--ai.vercel.app-00FF7F?style=for-the-badge&logo=vercel)](https://repomedic-ai.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render.com-6366F1?style=for-the-badge&logo=render)](https://repomedic-ai.onrender.com/health)
[![IBM BOB](https://img.shields.io/badge/Powered%20by-IBM%20BOB-0F62FE?style=for-the-badge&logo=ibm)](https://www.ibm.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20llama3--70b-F54D27?style=for-the-badge)](https://groq.com)

</div>

---

## 🎯 What is RepoMedic?

RepoMedic is an AI-powered bug diagnosis and auto-fix platform built for the **IBM BOB Hackathon 2026**. It goes beyond just suggesting fixes — it **ships them** by automatically creating a Pull Request on GitHub.

### The Problem
- Developers spend **50% of their time** debugging instead of building
- **$300B** lost yearly to bug-related delays
- New developers spend **3+ hours** just understanding a foreign codebase
- Existing AI tools suggest code but **never act on it**

### The Solution
> RepoMedic doesn't just find bugs — it opens a real Pull Request on GitHub automatically.

---

## ✨ Features

### 🔍 Bug Analyzer
Paste a GitHub repo URL + describe the bug. IBM BOB scans every file, scores them for relevance, and Groq AI generates a full diagnosis report with:
- **Confidence score** (0–100)
- **Root cause** identification
- **Affected files** list
- **Step-by-step fix** with production-ready code
- **One-click PR creation** to GitHub

### 📋 Repository Summary
Instantly understand any codebase:
- What the project does (plain English)
- Tech stack auto-detection
- Architecture pattern (MVC, microservices, etc.)
- Complexity score
- Full file structure map

### 💬 Chat with Repository
Ask anything about any codebase in plain English:
- IBM BOB scores files for relevance in real time
- Responses include exact file names with confidence scores
- Context-aware — not a generic chatbot

---

## 🏗️ Architecture

```
User → Next.js Frontend
         ↓
    Express Backend
         ↓
    IBM BOB (Context Engine)
    • Scans all repo files
    • Scores by relevance to bug
    • Filters noise (test files, markdown)
    • Passes top files to Groq
         ↓
    Groq llama3-70b (Inference)
    • Root cause analysis
    • Step-by-step fix generation
         ↓
    GitHub API (Auto PR)
    • Fork repo → Create branch
    • Commit fix → Open PR
```

### How IBM BOB Powers RepoMedic

IBM BOB is the intelligence layer that makes RepoMedic accurate:

1. **Scans** every file in the repository via GitHub API
2. **Scores** each file based on the bug description — boosting controllers, routes, and middleware while penalizing test files and markdown
3. **Filters** only the top-scoring files to pass as context to Groq
4. **Generates** structured metadata: architecture pattern, complexity score, file type breakdown

This focused context approach means Groq receives **clean, relevant signal** — not noise.

---

## 🛠️ Tech Stack

| Layer | Technology | Deployment |
|-------|-----------|------------|
| Frontend | Next.js 14, Tailwind CSS | Vercel |
| Backend | Node.js, Express.js | Render.com |
| AI Context Engine | IBM BOB | IBM Cloud |
| AI Inference | Groq llama3-70b | Groq Cloud |
| Version Control | GitHub API v3 | github.com |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- GitHub Personal Access Token (with `repo` scope)
- Groq API Key
- IBM BOB API Key

### 1. Clone the repo
```bash
git clone https://github.com/Ritesh-453/repomedic-ai.git
cd repomedic-ai
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
GITHUB_TOKEN=your_github_token_here
GROQ_API_KEY=your_groq_api_key_here
BOB_API_KEY=your_ibm_bob_api_key_here
PORT=5000
```

```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### 4. Open the app
Visit `http://localhost:3000`

---

## 📁 Project Structure

```
repomedic-ai/
├── backend/
│   ├── controllers/
│   │   ├── analyzeController.js      # Bug analysis logic
│   │   ├── bugFixController.js       # Fix generation
│   │   ├── chatController.js         # Repo chat
│   │   ├── prController.js           # GitHub PR creation
│   │   └── repoSummaryController.js  # Repo summary
│   ├── services/
│   │   ├── githubService.js          # GitHub API + fork-PR workflow
│   │   ├── groqService.js            # Groq AI inference
│   │   ├── bobService.js             # IBM BOB context engine
│   │   └── parserService.js          # Repo file parsing
│   ├── routes/                       # Express route definitions
│   ├── middleware/                   # Error handling
│   └── server.js                     # Entry point
├── frontend/
│   ├── app/                          # Next.js app router
│   ├── components/                   # React components
│   ├── services/                     # API calls
│   └── store/                        # State management
├── bob_sessions/                     # IBM BOB session exports
├── docs/
└── docker-compose.yml
```

---

## 🔀 GitHub Auto-PR Workflow

One of RepoMedic's most unique features — the full automated flow:

```
1. Get bot GitHub username
2. Fork target repo → bot's account
3. Wait for fork to be ready (async)
4. Create new timestamped branch on fork
5. Commit AI-generated fix
6. Open PR: botUsername:branch → original:main
```

This fork-first approach works on **any public repository** without requiring write access.

---

## 🆚 How RepoMedic Compares

| Feature | GitHub Copilot | ChatGPT | RepoMedic |
|---------|---------------|---------|-----------|
| Repo-aware context | Partial | ❌ | ✅ IBM BOB |
| Root cause analysis | Partial | ✅ | ✅ + confidence score |
| Auto PR creation | ❌ | ❌ | ✅ |
| Chat with any repo | ❌ | ❌ | ✅ |
| Architecture summary | ❌ | ❌ | ✅ |
| Works on any public repo | ❌ | ❌ | ✅ |

---

## 🌐 Live Demo

- **Frontend:** https://repomedic-ai.vercel.app
- **Backend Health:** https://repomedic-ai.onrender.com/health
- **GitHub:** https://github.com/Ritesh-453/repomedic-ai

---

## 🗺️ Roadmap

- [ ] VS Code extension
- [ ] Private repository support (OAuth login)
- [ ] Auto-merge after CI/CD tests pass
- [ ] Team analytics dashboard
- [ ] GitHub Actions integration
- [ ] Multi-language deep support (Java, Python, Go, Rust)

---

## 👨‍💻 Built For

**IBM BOB Hackathon — May 2026**

Built with IBM BOB as the core context engine, demonstrating deep integration of BOB's repository analysis capabilities for real-world developer tooling.

---

## ⚠️ Security Note

Never commit API keys or tokens. All credentials are stored in `.env` files which are `.gitignore`d.

---

<div align="center">

**"We don't just suggest fixes — we ship them."**

Made with ❤️ using IBM BOB + Groq AI

</div>