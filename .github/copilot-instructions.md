# WYSIWYG Repository - GitHub Copilot Instructions

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match what is documented here.

## Current Repository State

### What's Actually Here
This repository currently contains:
- `.git/` - Git repository metadata
- `.github/` - GitHub configuration (includes these instructions)
- `README.md` - Basic file with just "# wysiwyg"

### What This Will Become
Planned development: "Quick Notes Web App for Solutions Engineering" with:
- **Frontend**: React with TypeScript, Tailwind CSS  
- **Backend**: Next.js API routes (serverless)
- **Authentication**: GitHub OAuth via NextAuth.js
- **Integration**: GitHub Issues API for note storage and management

## Available Environment

### Confirmed Available Tools
- **Node.js**: v20.19.4
- **npm**: v10.8.2  
- **Git**: v2.51.0
- **Operating System**: Linux (Ubuntu-based)

### What's NOT Set Up Yet
- No `package.json` file
- No Node.js dependencies installed
- No build scripts or development tools
- No Next.js project structure
- No TypeScript, ESLint, or Tailwind configuration

## Project Initialization Guide

### Step 1: Initialize Next.js Project
When ready to start development, run this command from the repository root:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

**Expected behavior:**
- Downloads and installs Next.js template
- Creates `package.json`, `tsconfig.json`, `next.config.js`, etc.
- Installs all dependencies (takes 2-3 minutes)
- May fail in network-restricted environments due to external dependencies

### Step 2: Handle Network Restrictions
If the build fails with Google Fonts errors, edit `app/layout.tsx`:

```typescript
// REMOVE these lines if build fails:
import { Geist, Geist_Mono } from "next/font/google"

// SIMPLIFY the className to just:
<body className="antialiased">
```

### Step 3: Verify Setup
After initialization, these commands should work:

```bash
npm run build    # Build the project (25-30 seconds)
npm run dev      # Start development server (1-2 seconds)
npm run lint     # Run ESLint (3-5 seconds)
```

## Development Workflow (After Initialization)

### Building
```bash
npm run build
```
- **Never cancel** - set timeout to 180+ seconds
- First build shows "No build cache found" warning (normal)
- Generates optimized static files

### Development Server
```bash
npm run dev
```
- Starts on http://localhost:3000
- Uses Turbopack for fast refresh
- **Never cancel** - allow 30+ seconds for startup

### Linting
```bash
npm run lint
```
- **Always run before committing**
- Takes ~3 seconds
- Checks TypeScript and code style

## Expected Project Structure (After Initialization)

```
wysiwyg/
├── .git/                   # Git repository (already exists)
├── .github/               # GitHub config (already exists)
├── README.md              # Basic readme (already exists)
├── app/                   # Next.js app directory (will be created)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── public/               # Static assets (will be created)
├── package.json          # Dependencies (will be created)
├── next.config.js        # Next.js config (will be created)
├── tailwind.config.js    # Tailwind config (will be created)
└── tsconfig.json         # TypeScript config (will be created)
```

## Common Issues & Solutions

### Issue: Network Restrictions
**Problem**: Can't download dependencies or external fonts
**Solution**: Initialize in steps, remove external dependencies as needed

### Issue: Port Conflicts  
**Problem**: Port 3000 already in use
**Solution**: `npm run dev -- -p 3001`

### Issue: Permission Errors
**Problem**: Cannot write files during initialization
**Solution**: Ensure proper write permissions in the repository directory

## Critical Guidelines

### Before Starting Development
1. Verify Node.js and npm versions match expectations
2. Ensure repository directory has write permissions
3. Check network connectivity for package downloads

### During Development (After Setup)
1. **Always** run `npm run lint` before committing
2. **Always** run `npm run build` to verify no errors
3. **Never cancel** long-running commands - they need time to complete
4. Test changes in browser at http://localhost:3000

### Current Limitations
- Most npm commands will fail until project is initialized
- No testing framework configured (add Jest + React Testing Library when needed)
- No CI/CD pipeline set up yet
- External font/CDN dependencies may fail in restricted environments