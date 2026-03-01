# Tech Intern Exam App

A **game-like programming examination web app** for tech interns, built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**.

## Features

- 🎮 **Game-like UI** — dark theme, animations, score tracking, countdown timer
- 📚 **40 questions** across 5 technology sections (8 per section):
  - 🎨 HTML / CSS
  - ⚡ JavaScript
  - 🔀 Git
  - 🗄️ Databases
  - 💡 General Programming
- ✅ **Instant feedback** — colour-coded answer reveals with explanations
- 🏆 **Results screen** — overall score with per-category breakdown & rank
- 🔒 **Anti-cheat measures**:
  - Copy / cut / paste disabled
  - Right-click context menu blocked
  - Keyboard shortcuts (Ctrl+C, Ctrl+V, PrintScreen, F12, …) blocked
  - CSS `user-select: none` applied during the exam

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | React hooks (useState, useEffect, useCallback) |

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles + animations
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main exam page (orchestrator)
├── components/
│   ├── CategoryBadge.tsx  # Coloured category pill
│   ├── IntroScreen.tsx    # Rules & start screen
│   ├── ProgressBar.tsx    # Question progress indicator
│   ├── QuestionCard.tsx   # Question + options + feedback
│   ├── ResultsScreen.tsx  # Score summary & breakdown
│   └── Timer.tsx          # Countdown clock
├── data/
│   └── questions.ts       # All 40 questions + config constants
├── hooks/
│   ├── useAntiCheat.ts    # Anti-cheat event listeners
│   └── useExam.ts         # Exam state machine + timer logic
└── types/
    └── exam.ts            # Shared TypeScript types
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Lint source files |


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
