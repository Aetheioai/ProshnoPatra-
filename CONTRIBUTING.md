# Contributing to ProshnoPatra

Thank you for your interest in improving ProshnoPatra! This guide explains how to set up the project locally and submit clean pull requests.

## Local Setup

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/aetheioai/ProshnoPatra-.git
   cd ProshnoPatra-
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Before Opening a Pull Request

Run both checks locally and make sure they pass with zero errors:

```bash
npm run typecheck
npm run build
```

Also verify your changes visually:
- Check both desktop split view and mobile bottom-tab view.
- Test both Bangla (`bn`) and English (`en`) modes if touching paper layout or numbering.
- Verify print preview (`Ctrl+P` / `Cmd+P`) and **Download A4 PDF** if changing `PaperPreview.tsx`, `index.css`, or `pdfExport.ts`.

## Common Contribution Areas

- **Curriculum & Presets (`src/data/curriculum.ts`)**: Add subjects, subject codes, or ready-made exam templates.
- **Math & Chemistry Library (`src/data/mathLibrary.ts`, `src/utils/mathAst.ts`)**: Add formula presets, symbol palettes, or LaTeX AST node support.
- **Question Formats (`src/types/paper.ts`, `src/components/QuestionEditors.tsx`, `src/components/PaperPreview.tsx`)**: Improve existing question types or board-style print formatting.
- **Accessibility & Mobile UX**: Improve keyboard navigation, ARIA labels, and touch targets.

## Guidelines

- Keep the app 100% offline-capable and privacy-respecting (no analytics, trackers, or required backend services).
- Follow strict TypeScript (`strict: true`); avoid `any`.
- Keep changes focused—one feature or bug fix per pull request.
- Validate any imported user data (such as JSON drafts or uploaded images) safely.

## Code of Conduct

Please review and follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.
