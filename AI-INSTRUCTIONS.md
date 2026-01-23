# GBC-CPP Project Governance & AI Behavioral Constraints

## 1. Safety & Data Integrity (NON-NEGOTIABLE)
- **Zero-Data Loss:** Before any file modification, create a `.bak` version of the target file (e.g., `Quiz.tsx` -> `Quiz.tsx.bak`).
- **Production Mode Only:** The app is connected to a LIVE Firebase instance. Never revert code to "Mock Data" or "Local Storage" logic. All reads/writes must use the existing `firebase.config.ts` and Firestore hooks.
- **Dry Run Verification:** Since the AI lacks API keys, provide a logical walkthrough of the data flow. A "Green Light" is only granted if the logic matches the current Firebase schema.

## 2. UI/UX & Branding Preservations
- **Branded Content:** Do NOT alter the string "Germiston Baptist Church" or any church-specific headers/titles.
- **Visual Identity:** Do NOT change Tailwind classes, CSS colors (especially the #D4AF37 Gold), or the layout structure unless explicitly instructed. 
- **Consistency:** New features (like Certificate buttons) must inherit the styling of existing buttons and components.

## 3. Workflow Protocol
- **Reference vs. Overwrite:** Use the `.bak` files to compare and ensure requested changes do not accidentally delete existing logic (e.g., Admin Dashboard filters).
- **Comments & Documentation:** Add JSDoc headers to new functions and descriptive comments to logic blocks.
- **Scope Creep:** Do not "optimize" or "refactor" code outside the specific requested change.

## 4. Environment Context
- **Base URL:** The site is hosted on GitHub Pages at `/CPP-Test/`. Do not alter the `base` path in `vite.config.ts`.
- **Public Folder:** The `/public` folder contains `logo.png`. Reference it as `/logo.png`.