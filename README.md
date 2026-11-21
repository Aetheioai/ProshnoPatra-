# ProshnoPatra

Offline-first exam and question paper maker for Bangladeshi schools, colleges, and board-style assessments (Class 1 through HSC). Build print-ready A4 papers with Creative Questions (CQ), 2-column MCQs, reading passages, tables, diagrams, and typeset math or chemistry equations—completely in the browser with no backend or accounts required.

## Features

- **Authentic A4 Board Formatting**: Subject code boxes, set codes, institute logos, time/marks headers, double hairline rules, and automatic Bangla (`১, ২, ৩` / `ক, খ, গ, ঘ` / `অথবা`) or English (`1, 2, 3` / `a, b, c, d` / `Or`) numbering.
- **Complete Question Types**:
  - **Creative Questions (CQ / সৃজনশীল)** with stem text, attached diagrams, stem data tables, and customizable sub-questions (`ক–ঘ`).
  - **Multiple Choice (MCQ / বহুনির্বাচনি)** with 1- or 2-column layouts, common stems, multi-statement (`i, ii, iii`) format, and an optional teacher Answer Key sheet.
  - **Short & Descriptive Questions** with sub-parts, right-margin marks breakdowns, and `Or / অথবা` alternatives.
  - **Reading Passages** with comprehension sub-questions.
  - **Tables & Grammar Blocks** for accounting trial balances, Column A–B matching, substitution tables, and gap-fill with clues.
  - **Section Dividers** spanning full page width.
- **Visual 2D Math & Chemistry Equation Builder**: Point-and-click AST-based equation editor powered by KaTeX—supports fractions, roots, powers, integrals, matrices, piecewise cases, nuclear isotopes, reaction arrows, Greek symbols, smart typing shortcuts (`/`, `^`, `_`, `pi`, `>=`), and raw LaTeX editing.
- **NCTB Curriculum & Starter Presets**: Pre-configured subjects and codes for Primary, Junior, SSC, HSC, and custom class tests, plus filled board-style examples.
- **Native Print & Client-Side A4 PDF Export**: Vector browser printing (`Ctrl+P` / `Cmd+P`) with dedicated `@media print` rules plus one-click multi-page A4 PDF download via `html-to-image` and `jsPDF`.
- **Offline-First PWA & JSON Backups**: Auto-saves drafts locally in `localStorage`, supports full JSON draft import/export, and installs as a standalone Progressive Web App.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4 |
| Math Rendering | KaTeX |
| PDF Export | `html-to-image` + `jsPDF` |
| Offline / PWA | `vite-plugin-pwa` (Workbox) |
| Icons | `lucide-react` |

## Getting Started

### Prerequisites

- Node.js 20+ (Node 22 LTS recommended)
- `npm` (or `bun` / `pnpm`)

### Installation & Local Development

```bash
git clone https://github.com/<your-username>/proshnopatra.git
cd proshnopatra
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. No environment variables or API keys are required.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server on port 3000 |
| `npm run build` | Build production bundle and PWA service worker into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript strict type checking (`tsc --noEmit`) |
| `npm run clean` | Remove generated `dist/` and `dev-dist/` folders |

## Project Structure

```text
├── public/                     # Static icons & PWA assets
├── src/
│   ├── components/
│   │   ├── HeaderEditor.tsx        # Step 1: Institute, exam, subject & metadata setup
│   │   ├── QuestionEditors.tsx     # Step 2: CQ, MCQ, Short, Passage, Table & Section editors
│   │   ├── StylePrintStep.tsx      # Step 3: Language, columns, typography & export actions
│   │   ├── PaperPreview.tsx        # Live scaled A4 sheet & print surface
│   │   ├── VisualMathModal.tsx     # Interactive 2D AST equation & chemistry editor
│   │   ├── VisualRichInput.tsx     # Inline rich input with clickable KaTeX chips
│   │   ├── RichMathText.tsx        # Prose + LaTeX renderer for sheet preview
│   │   ├── TableGridEditor.tsx     # Spreadsheet-style table editor with column alignment
│   │   ├── ImageAttachmentControl.tsx  # Local image upload, resize & alignment control
│   │   ├── TemplateLibraryModal.tsx    # Blank paper generator, presets & saved drafts
│   │   └── PWAInstallButton.tsx    # Install prompt & offline status banner
│   ├── data/
│   │   ├── curriculum.ts           # NCTB education levels, subjects & starter presets
│   │   └── mathLibrary.ts          # Math/chemistry symbol palettes & formula library
│   ├── hooks/
│   │   └── usePWAInstall.ts        # PWA install & online/offline hooks
│   ├── types/
│   │   └── paper.ts                # Core ExamPaper & QuestionItem TypeScript models
│   ├── utils/
│   │   ├── formatters.ts           # Digit localization, marks math, tokenizer & JSON validation
│   │   ├── mathAst.ts              # Bidirectional LaTeX <-> 2D visual AST parser/serializer
│   │   └── pdfExport.ts            # Multi-page A4 PDF generator & smart print fallback
│   ├── App.tsx                     # Root split workspace & local persistence
│   ├── index.css                   # Tailwind theme, typography & A4 print stylesheet
│   └── main.tsx                    # Entry point & PWA service worker registration
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## Privacy & Offline Storage

ProshnoPatra runs 100% locally in your browser. Question papers, uploaded diagrams, and recent equations stay on your device via `localStorage`. Nothing is sent to external servers.

## Contributing

Contributions are welcome—whether adding NCTB curriculum presets, improving math AST parsing, fixing print layout edge cases, or translating UI labels. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

Released under the [MIT License](LICENSE).
