# WYSIWYG Repository - GitHub Copilot Instructions

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match what is documented here.

## Current State & Project Overview
This repository is currently in initial setup phase. It contains only a basic README.md file and is planned to become a "Quick Notes Web App for Solutions Engineering" (see Issue #1).

The project will be a Next.js application with the following architecture:
- **Frontend**: React with TypeScript, Tailwind CSS  
- **Backend**: Next.js API routes (serverless)
- **Authentication**: GitHub OAuth via NextAuth.js
- **Integration**: GitHub Issues API for note storage and management

## Working Effectively

### Environment Setup
- Node.js v20.19.4 and npm v10.8.2 are available and validated
- Git v2.50.1 is available
- TypeScript, ESLint, and Tailwind CSS will be configured automatically

### Project Initialization (for fresh setup)
When starting development, initialize the Next.js project with these EXACT commands:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

**IMPORTANT**: This command fails in network-restricted environments due to Google Fonts dependencies. Remove Google Font imports from `app/layout.tsx` if build fails:
- Remove: `import { Geist, Geist_Mono } from "next/font/google"`  
- Remove: font variable configurations
- Simplify className to just `"antialiased"`

### Build Process
- **Build command**: `npm run build`
- **NEVER CANCEL**: Build takes approximately 25-30 seconds. Set timeout to 180+ seconds.
- **Build output**: Static optimization with ~5KB main page, ~105KB total bundle
- **Network limitations**: Build may fail if Google Fonts or external resources are accessed
- **Build cache warning**: First build shows "No build cache found" warning - this is normal

### Development Server
- **Dev command**: `npm run dev`
- **Startup time**: ~1 second with Turbopack
- **URL**: http://localhost:3000  
- **NEVER CANCEL**: Allow 30+ seconds for full startup
- **Uses Turbopack**: Fast refresh and Hot Module Replacement enabled

### Linting
- **Lint command**: `npm run lint`
- **Time**: ~3 seconds
- **ALWAYS** run linting before committing changes

### Testing
- **No test framework configured by default** in Next.js template
- When adding tests, recommended: Jest + React Testing Library
- Add test scripts manually to package.json when needed

## Manual Validation Requirements

### After Project Setup
1. Run `npm run build` and verify successful compilation
2. Run `npm run dev` and confirm server starts on localhost:3000
3. Open browser and verify basic Next.js page loads
4. Run `npm run lint` and confirm no errors

### After Code Changes
1. **ALWAYS** run `npm run lint` before committing
2. **ALWAYS** run `npm run build` to verify no build errors
3. Test development server starts successfully
4. Manually test any new functionality in the browser

## Common Issues & Workarounds

### Google Fonts Network Error
**Problem**: Build fails with "getaddrinfo ENOTFOUND fonts.googleapis.com"
**Solution**: Remove Google Fonts imports from `app/layout.tsx` as shown in Environment Setup

### Missing Dependencies
**Problem**: TypeScript or ESLint errors about missing packages
**Solution**: Run `npm install` to ensure all dependencies are installed

### Port Already in Use
**Problem**: Development server fails to start on port 3000
**Solution**: Use `npm run dev -- -p 3001` to run on alternative port

## Project Structure (When Created)
```
├── app/
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx           # Home page component  
│   └── globals.css        # Global styles
├── public/                # Static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── next.config.js        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Expected Development Workflow
1. Initialize project with Next.js template
2. Set up GitHub OAuth authentication (NextAuth.js)
3. Create UI components for note-taking interface
4. Implement GitHub Issues API integration
5. Add responsive design and accessibility features
6. Configure deployment pipeline

## Key Dependencies (Future)
- `next`: React framework
- `react` & `react-dom`: UI library
- `typescript`: Type safety
- `tailwindcss`: Styling
- `next-auth`: Authentication
- `@octokit/rest`: GitHub API client

## Validation Timing Expectations
- **Project initialization**: 2-3 minutes (package installation) - measured at 2m 19s
- **NEVER CANCEL**: Build process: 25-30 seconds (set 180+ second timeout) - measured at 25s
- **NEVER CANCEL**: Linting: 3-5 seconds (set 60+ second timeout) - measured at 3s
- **Development server startup**: 1-2 seconds - measured at 1040ms
- **Package installation**: 2-3 minutes for full dependency tree

## Critical Reminders
- **NEVER CANCEL** any build or long-running commands
- **ALWAYS** test in browser after making changes
- **ALWAYS** run linting before committing
- This is a fresh repository - most development commands will need project initialization first
- Network restrictions may require workarounds for external font/CDN dependencies