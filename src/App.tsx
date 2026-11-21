import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Download,
  Eye,
  FilePlus2,
  FileText,
  FolderOpen,
  ListChecks,
  ListOrdered,
  Loader2,
  Menu,
  Plus,
  Printer,
  SlidersHorizontal,
  Table2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { HeaderEditor } from './components/HeaderEditor';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { PaperPreview } from './components/PaperPreview';
import { QuestionItemEditor } from './components/QuestionEditors';
import { StylePrintStep } from './components/StylePrintStep';
import { TemplateLibraryModal } from './components/TemplateLibraryModal';
import { QuickMathTemplateKey, VisualMathModal } from './components/VisualMathModal';
import { ActiveMathTarget, MathEditRequest } from './components/VisualRichInput';
import { STARTER_PRESETS } from './data/curriculum';
import { ExamPaper, PaperSettings, QuestionItem } from './types/paper';
import { exportPaperToPdf, triggerSmartPrint } from './utils/pdfExport';
import {
  calculateTotalMarks,
  countNumberedQuestions,
  createId,
  downloadPaperJson,
  parseNumericMarks,
  validateImportedPaper,
} from './utils/formatters';

type WizardStep = 1 | 2 | 3;

const STORAGE_PAPERS_KEY = 'proshnopatra_saved_papers_v1';
const STORAGE_ACTIVE_KEY = 'proshnopatra_active_paper_id_v1';

function loadInitialPapers(): { papers: ExamPaper[]; activeId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_PAPERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed
          .map((item) => validateImportedPaper(item))
          .filter((item): item is ExamPaper => item !== null);
        if (valid.length > 0) {
          const savedActive = localStorage.getItem(STORAGE_ACTIVE_KEY);
          const activeId = valid.some((p) => p.id === savedActive) ? savedActive! : valid[0].id;
          return { papers: valid, activeId };
        }
      }
    }
  } catch {
    // Fall back to default starter paper
  }
  const initial = STARTER_PRESETS[0].buildPaper();
  return { papers: [initial], activeId: initial.id };
}

function appendLatexToPrimaryField(item: QuestionItem, latex: string, display: boolean): QuestionItem {
  const token = display ? `\n$$${latex}$$` : ` $${latex}$`;
  switch (item.type) {
    case 'cq':
      return { ...item, stem: `${item.stem}${token}`.trimStart() };
    case 'mcq':
      return { ...item, question: `${item.question}${token}`.trimStart() };
    case 'short':
      return { ...item, prompt: `${item.prompt}${token}`.trimStart() };
    case 'passage':
      return { ...item, passage: `${item.passage}${token}`.trimStart() };
    case 'table':
      return { ...item, prompt: `${item.prompt}${token}`.trimStart() };
    default:
      return item;
  }
}

export default function App() {
  const [{ papers: initialPapers, activeId: initialActiveId }] = useState(loadInitialPapers);
  const [savedPapers, setSavedPapers] = useState<ExamPaper[]>(initialPapers);
  const [activePaperId, setActivePaperId] = useState<string>(initialActiveId);
  const [step, setStep] = useState<WizardStep>(1);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(() => {
    const activePaper = initialPapers.find((p) => p.id === initialActiveId) ?? initialPapers[0];
    return activePaper?.questions[0]?.id ?? null;
  });
  const [modalMode, setModalMode] = useState<'templates' | 'saved' | null>(null);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [zoom, setZoom] = useState<'fit' | number>('fit');
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Visual Equation Modal state (insert new, pre-seeded template, OR edit existing chip)
  const [mathModalState, setMathModalState] = useState<{
    open: boolean;
    initialLatex: string;
    initialDisplay: boolean;
    initialTemplate: QuickMathTemplateKey | null;
    editRequest: MathEditRequest | null;
    fallbackQuestionId: string | null;
  }>({
    open: false,
    initialLatex: '',
    initialDisplay: false,
    initialTemplate: null,
    editRequest: null,
    fallbackQuestionId: null,
  });

  const activeMathTargetRef = useRef<{ questionId: string; target: ActiveMathTarget } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const draftsMenuRef = useRef<HTMLDivElement>(null);
  const stepScrollRef = useRef<HTMLDivElement>(null);

  const paper = savedPapers.find((p) => p.id === activePaperId) ?? savedPapers[0];

  const showNotice = useCallback((msg: string) => setNotice(msg), []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(t);
  }, [notice]);

  // Close Drafts dropdown on outside click
  useEffect(() => {
    if (!draftsOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (draftsMenuRef.current && !draftsMenuRef.current.contains(e.target as Node)) {
        setDraftsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [draftsOpen]);

  // Auto-save offline to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAPERS_KEY, JSON.stringify(savedPapers));
      localStorage.setItem(STORAGE_ACTIVE_KEY, activePaperId);
    } catch {
      setNotice('Browser storage limit reached. Export a JSON draft to back up.');
    }
  }, [savedPapers, activePaperId]);

  const updatePaper = useCallback(
    (updater: (prev: ExamPaper) => ExamPaper) => {
      setSavedPapers((list) =>
        list.map((p) =>
          p.id === activePaperId
            ? { ...updater(p), updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [activePaperId]
  );

  const handleLoadPaper = (next: ExamPaper) => {
    setSavedPapers((prev) => {
      const exists = prev.some((p) => p.id === next.id);
      return exists ? prev.map((p) => (p.id === next.id ? next : p)) : [next, ...prev];
    });
    setActivePaperId(next.id);
    setExpandedQuestionId(next.questions[0]?.id ?? null);
    activeMathTargetRef.current = null;
    showNotice(`Loaded "${next.header.subject || 'Untitled Paper'}"`);
  };

  const handleDuplicateSaved = (src: ExamPaper) => {
    const copy: ExamPaper = {
      ...structuredClone(src),
      id: createId('paper'),
      updatedAt: new Date().toISOString(),
      header: { ...src.header, subject: `${src.header.subject} (Copy)` },
    };
    setSavedPapers((prev) => [copy, ...prev]);
    setActivePaperId(copy.id);
    setExpandedQuestionId(copy.questions[0]?.id ?? null);
    showNotice('Created duplicate copy');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPapers((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((p) => p.id !== id);
      if (id === activePaperId) {
        setActivePaperId(filtered[0].id);
        setExpandedQuestionId(filtered[0].questions[0]?.id ?? null);
      }
      return filtered;
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const valid = validateImportedPaper(parsed);
      if (!valid) {
        showNotice('Invalid draft file. Please select a ProshnoPatra .json file.');
        return;
      }
      handleLoadPaper({ ...valid, id: createId('paper') });
    } catch {
      showNotice('Could not read file. Ensure it is a valid JSON draft.');
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  // Question CRUD
  const addQuestion = (type: QuestionItem['type']) => {
    const isBn = paper.settings.language === 'bn';
    let item: QuestionItem;

    switch (type) {
      case 'section':
        item = {
          id: createId('sec'),
          type: 'section',
          title: isBn ? 'খ-বিভাগ' : 'Part B',
          subtitle: '',
          marksNote: '',
        };
        break;
      case 'cq':
        item = {
          id: createId('cq'),
          type: 'cq',
          stem: '',
          subQuestions: [
            { id: createId('sq'), text: '', marks: 1 },
            { id: createId('sq'), text: '', marks: 2 },
            { id: createId('sq'), text: '', marks: 3 },
            { id: createId('sq'), text: '', marks: 4 },
          ],
        };
        break;
      case 'mcq':
        item = {
          id: createId('mcq'),
          type: 'mcq',
          question: '',
          options: ['', '', '', ''],
          marks: 1,
        };
        break;
      case 'short':
        item = {
          id: createId('sh'),
          type: 'short',
          prompt: '',
          marks: 5,
        };
        break;
      case 'passage':
        item = {
          id: createId('pas'),
          type: 'passage',
          title: isBn
            ? 'নিচের অনুচ্ছেদটি পড়ো এবং প্রশ্নগুলোর উত্তর দাও:'
            : 'Read the passage carefully and answer the questions below:',
          passage: '',
          questions: [
            { id: createId('pq'), text: '', marks: 2 },
            { id: createId('pq'), text: '', marks: 2 },
          ],
        };
        break;
      case 'table':
        item = {
          id: createId('tbl'),
          type: 'table',
          variant: 'matching',
          prompt: isBn
            ? 'বাম পাশের অংশের সাথে ডান পাশের অংশের মিলকরণ কর:'
            : 'Match the parts of sentences in Column A with Column B:',
          marks: 5,
          marksBreakdown: isBn ? '১ × ৫ = ৫' : '1 × 5 = 5',
          table: {
            showHeader: true,
            bordered: true,
            headers: isBn ? ['কলাম ক', 'কলাম খ'] : ['Column A', 'Column B'],
            rows: [
              ['(ক) ', '(১) '],
              ['(খ) ', '(২) '],
              ['(গ) ', '(৩) '],
            ],
            colAligns: ['left', 'left'],
          },
        };
        break;
    }

    updatePaper((p) => ({ ...p, questions: [...p.questions, item] }));
    setExpandedQuestionId(item.id);
    activeMathTargetRef.current = null;
  };

  const updateQuestion = (index: number, next: QuestionItem) => {
    updatePaper((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === index ? next : q)),
    }));
  };

  const moveQuestion = (from: number, to: number) => {
    updatePaper((p) => {
      if (to < 0 || to >= p.questions.length) return p;
      const list = [...p.questions];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { ...p, questions: list };
    });
  };

  const duplicateQuestion = (index: number) => {
    const target = paper.questions[index];
    const copy = { ...structuredClone(target), id: createId(target.type) };
    updatePaper((p) => {
      const list = [...p.questions];
      list.splice(index + 1, 0, copy);
      return { ...p, questions: list };
    });
    setExpandedQuestionId(copy.id);
  };

  const deleteQuestion = (index: number) => {
    const target = paper.questions[index];
    updatePaper((p) => ({
      ...p,
      questions: p.questions.filter((_, i) => i !== index),
    }));
    if (expandedQuestionId === target.id) {
      const nextFallback = paper.questions[index + 1] ?? paper.questions[index - 1] ?? null;
      setExpandedQuestionId(nextFallback?.id ?? null);
    }
  };

  const updateSettings = (patch: Partial<PaperSettings>) => {
    updatePaper((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  };

  // Open Visual Equation Modal (new equation or pre-seeded template for active question)
  const openInsertEquationForQuestion = (
    questionId: string,
    template?: QuickMathTemplateKey
  ) => {
    setMathModalState({
      open: true,
      initialLatex: '',
      initialDisplay: false,
      initialTemplate: template ?? null,
      editRequest: null,
      fallbackQuestionId: questionId,
    });
  };

  // Instant 1-tap math symbol insert without opening modal
  const handleQuickInsertLatex = (questionId: string, latex: string) => {
    if (
      activeMathTargetRef.current &&
      activeMathTargetRef.current.questionId === questionId
    ) {
      activeMathTargetRef.current.target.insertMath(latex, false);
    } else {
      updatePaper((p) => ({
        ...p,
        questions: p.questions.map((q) =>
          q.id === questionId ? appendLatexToPrimaryField(q, latex, false) : q
        ),
      }));
    }
  };

  // Open Visual Equation Modal (edit an existing rendered chip)
  const openEditChip = (req: MathEditRequest) => {
    setMathModalState({
      open: true,
      initialLatex: req.latex,
      initialDisplay: req.display,
      initialTemplate: null,
      editRequest: req,
      fallbackQuestionId: null,
    });
  };

  const handleConfirmMath = (latex: string, display: boolean) => {
    if (mathModalState.editRequest) {
      mathModalState.editRequest.target.updateChip(
        mathModalState.editRequest.chipIndex,
        latex,
        display
      );
    } else if (
      activeMathTargetRef.current &&
      activeMathTargetRef.current.questionId === mathModalState.fallbackQuestionId
    ) {
      activeMathTargetRef.current.target.insertMath(latex, display);
    } else if (mathModalState.fallbackQuestionId) {
      const qId = mathModalState.fallbackQuestionId;
      updatePaper((p) => ({
        ...p,
        questions: p.questions.map((q) =>
          q.id === qId ? appendLatexToPrimaryField(q, latex, display) : q
        ),
      }));
    }

    setMathModalState((s) => ({ ...s, open: false, initialTemplate: null }));
  };

  const handleDeleteMathChip = () => {
    if (mathModalState.editRequest) {
      mathModalState.editRequest.target.deleteChip(mathModalState.editRequest.chipIndex);
    }
    setMathModalState((s) => ({ ...s, open: false, initialTemplate: null }));
  };

  const goToStep = (next: WizardStep) => {
    setStep(next);
    setMobileView('editor');
    stepScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintOrPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const mode = await triggerSmartPrint(paper);
      if (mode === 'downloaded') {
        showNotice('A4 PDF downloaded to your device.');
      }
    } catch {
      showNotice('Could not generate PDF. Press Ctrl+P to print directly.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportPaperToPdf(paper);
      showNotice('A4 PDF downloaded to your device.');
    } catch {
      showNotice('Could not generate PDF. Press Ctrl+P to print directly.');
    } finally {
      setIsExporting(false);
    }
  };

  const clearAllQuestions = () => {
    updatePaper((p) => ({ ...p, questions: [] }));
    setExpandedQuestionId(null);
    activeMathTargetRef.current = null;
    showNotice('Cleared all questions');
  };

  // Pre-compute running numbers for Step 2 list
  let runningNum = 0;
  const numberedEditorItems = paper.questions.map((q) => {
    if (q.type === 'section') return { item: q, num: null as number | null };
    runningNum += 1;
    return { item: q, num: runningNum };
  });

  const totalMarks = calculateTotalMarks(paper.questions);
  const declaredMarks = parseNumericMarks(paper.header.fullMarks);
  const qCount = countNumberedQuestions(paper.questions);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8F9FA] text-[#111827] print:block print:h-auto print:bg-white">
      <input
        ref={importFileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Single Compact Top Bar */}
      <header className="no-print h-[52px] lg:h-14 pt-safe px-3.5 sm:px-5 bg-white border-b border-zinc-200 flex items-center justify-between gap-3 sm:gap-6 shrink-0 z-30">
        <span className="text-base font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0">
          ProshnoPatra
        </span>

        {/* Desktop Nav & Actions */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <button
            type="button"
            onClick={() => setModalMode('templates')}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Templates
          </button>

          {/* Drafts Dropdown (Saved Papers + Import + Export) */}
          <div ref={draftsMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setDraftsOpen((v) => !v)}
              aria-expanded={draftsOpen}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Drafts</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {draftsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-md py-1 z-40">
                <button
                  type="button"
                  onClick={() => {
                    setDraftsOpen(false);
                    setModalMode('saved');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-800 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Saved Papers ({savedPapers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftsOpen(false);
                    importFileRef.current?.click();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-800 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Import Draft (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftsOpen(false);
                    downloadPaperJson(paper);
                    showNotice('Draft exported as JSON file');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-800 hover:bg-zinc-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Export Draft (.json)</span>
                </button>
                <div className="mt-1 pt-1.5 pb-1 px-3.5 border-t border-zinc-100 text-[11px] text-zinc-400">
                  Auto-saved offline in browser
                </div>
              </div>
            )}
          </div>

          <PWAInstallButton variant="header" />

          <button
            type="button"
            disabled={isExporting}
            onClick={handlePrintOrPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Printer className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Preparing PDF...' : 'Print / PDF'}</span>
          </button>
        </div>

        {/* Mobile Compact Header Actions */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <PWAInstallButton variant="header" />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open templates and drafts menu"
            className="min-w-[40px] min-h-[38px] px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 border border-zinc-200 rounded-md bg-white active:bg-zinc-100 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden xs:inline">Menu</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'PDF...' : 'PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden print:block print:overflow-visible print:h-auto">
        {/* Left Pane: Clean 3-Step Flow */}
        <div
          className={`no-print w-full lg:w-[46%] xl:w-[44%] flex-1 lg:flex-none flex flex-col bg-white lg:border-r border-zinc-200 min-h-0 ${
            mobileView === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Desktop Clickable 3-Step Bar (Mobile uses Fixed Bottom Tab Bar) */}
          <nav
            aria-label="Paper creation steps"
            className="hidden lg:grid grid-cols-3 border-b border-zinc-200 bg-white shrink-0"
          >
            {(
              [
                { id: 1 as const, label: '1. Setup' },
                { id: 2 as const, label: '2. Questions' },
                { id: 3 as const, label: '3. Style & Print' },
              ] as const
            ).map((s) => {
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToStep(s.id)}
                  className={`py-3 px-2 text-xs font-semibold text-center border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'border-zinc-900 text-zinc-950'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/70'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Subtle inline notice bar (only when active) */}
          {notice && (
            <div className="px-5 py-2 bg-[#F0F6FC] border-b border-[#0F4C81]/15 text-xs text-[#0F4C81] font-medium shrink-0">
              {notice}
            </div>
          )}

          {/* Active Step Body */}
          <div ref={stepScrollRef} className="flex-1 overflow-y-auto thin-scroll pb-20 lg:pb-0">
            {step === 1 && (
              <HeaderEditor
                header={paper.header}
                language={paper.settings.language}
                onChange={(header) => updatePaper((p) => ({ ...p, header }))}
              />
            )}

            {step === 2 && (
              <div>
                {/* Quiet Questions Header */}
                <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-2 bg-white">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-zinc-900">Questions</h2>
                    {paper.questions.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllQuestions}
                        className="text-xs text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 font-mono-num">
                    {qCount} {qCount === 1 ? 'question' : 'questions'} · {totalMarks}
                    {declaredMarks !== null ? ` / ${declaredMarks}` : ''} marks
                  </span>
                </div>

                {/* Single-Active Accordion Question List */}
                {numberedEditorItems.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-zinc-500">
                    No questions yet. Choose a question format below to start writing.
                  </div>
                ) : (
                  <div>
                    {numberedEditorItems.map(({ item, num }, idx) => (
                      <QuestionItemEditor
                        key={item.id}
                        item={item}
                        displayNumber={num}
                        index={idx}
                        total={paper.questions.length}
                        language={paper.settings.language}
                        isExpanded={expandedQuestionId === item.id}
                        onToggleExpand={() =>
                          setExpandedQuestionId((prev) => (prev === item.id ? null : item.id))
                        }
                        onChange={(next) => updateQuestion(idx, next)}
                        onMove={moveQuestion}
                        onDuplicate={duplicateQuestion}
                        onDelete={deleteQuestion}
                        onFocusTarget={(target) => {
                          activeMathTargetRef.current = { questionId: item.id, target };
                        }}
                        onOpenInsertEquation={(template) =>
                          openInsertEquationForQuestion(item.id, template)
                        }
                        onQuickInsertLatex={(latex) => handleQuickInsertLatex(item.id, latex)}
                        onEditChip={openEditChip}
                      />
                    ))}
                  </div>
                )}

                {/* Add Question Bar */}
                <div className="p-4 sm:p-5 bg-[#FAFAFB] border-b border-zinc-200">
                  <div className="text-xs font-semibold text-zinc-700 mb-2.5">
                    Add Question
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => addQuestion('cq')}
                      className="flex items-center gap-2 px-3 min-h-[42px] sm:min-h-0 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-900 rounded transition-colors cursor-pointer text-left"
                    >
                      <FilePlus2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">Creative (CQ)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('mcq')}
                      className="flex items-center gap-2 px-3 min-h-[42px] sm:min-h-0 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-900 rounded transition-colors cursor-pointer text-left"
                    >
                      <ListChecks className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">MCQ (বহুনির্বাচনি)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('short')}
                      className="flex items-center gap-2 px-3 min-h-[42px] sm:min-h-0 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-900 rounded transition-colors cursor-pointer text-left"
                    >
                      <Type className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">Short / Desc.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('passage')}
                      className="flex items-center gap-2 px-3 min-h-[42px] sm:min-h-0 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-900 rounded transition-colors cursor-pointer text-left"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">Reading Passage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('table')}
                      className="flex items-center gap-2 px-3 min-h-[42px] sm:min-h-0 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-900 rounded transition-colors cursor-pointer text-left"
                    >
                      <Table2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">Table / Grammar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('section')}
                      className="flex items-center gap-2 px-3 min-h-[42px] sm:min-h-0 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-900 rounded transition-colors cursor-pointer text-left"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">Section Divider</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <StylePrintStep
                paper={paper}
                isExporting={isExporting}
                onChangeSettings={updateSettings}
                onDownloadPdf={handleDownloadPdf}
                onPrint={handlePrintOrPdf}
              />
            )}
          </div>

          {/* Desktop Step Navigation Footer (Back / Next) */}
          <div className="hidden lg:flex px-5 py-3 bg-white border-t border-zinc-200 items-center justify-between gap-3 shrink-0">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => goToStep((step - 1) as WizardStep)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-400 rounded transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{step === 2 ? 'Back to Setup' : 'Back to Questions'}</span>
                </button>
              )}
            </div>

            <div>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => goToStep((step + 1) as WizardStep)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                >
                  <span>{step === 1 ? 'Next: Questions' : 'Next: Style & Print'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded transition-colors cursor-pointer"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isExporting ? 'Preparing PDF...' : 'Download A4 PDF'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Live A4 Preview & Native Print Surface */}
        <div
          className={`flex-1 flex flex-col min-h-0 bg-[#F1F3F5] print:block print:bg-white print:overflow-visible ${
            mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Quiet Preview Zoom Strip */}
          <div className="no-print px-3.5 sm:px-5 py-2 bg-[#F8F9FA] border-b border-zinc-200 flex items-center justify-between gap-2 text-xs text-zinc-500 shrink-0">
            <span className="truncate">A4 Live Preview</span>
            <div className="flex items-center gap-1 shrink-0">
              {(
                [
                  { label: 'Fit', value: 'fit' as const },
                  { label: '75%', value: 0.75 },
                  { label: '100%', value: 1 },
                  { label: '125%', value: 1.25 },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setZoom(opt.value)}
                  className={`px-2 py-1 sm:py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
                    zoom === opt.value
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable A4 Sheet */}
          <div className="flex-1 overflow-auto thin-scroll pb-20 lg:pb-0 print:overflow-visible print:pb-0 print:block">
            <PaperPreview paper={paper} zoom={zoom} />
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (4 Thumb-Zone Destinations, <=15% total sticky chrome) */}
      <nav
        aria-label="Mobile navigation"
        className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-zinc-200 pb-safe"
      >
        <div className="grid grid-cols-4 h-14 items-center">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileView === 'editor' && step === 1
                ? 'text-zinc-950 font-semibold'
                : 'text-zinc-500'
            }`}
          >
            <FileText className="w-[19px] h-[19px]" />
            <span className="text-[11px] leading-none">Setup</span>
          </button>

          <button
            type="button"
            onClick={() => goToStep(2)}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileView === 'editor' && step === 2
                ? 'text-zinc-950 font-semibold'
                : 'text-zinc-500'
            }`}
          >
            <ListOrdered className="w-[19px] h-[19px]" />
            <span className="text-[11px] leading-none whitespace-nowrap">
              Questions{qCount > 0 ? ` (${qCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => goToStep(3)}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileView === 'editor' && step === 3
                ? 'text-zinc-950 font-semibold'
                : 'text-zinc-500'
            }`}
          >
            <SlidersHorizontal className="w-[19px] h-[19px]" />
            <span className="text-[11px] leading-none">Style</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              mobileView === 'preview' ? 'text-[#0F4C81] font-semibold' : 'text-zinc-500'
            }`}
          >
            <Eye className="w-[19px] h-[19px]" />
            <span className="text-[11px] leading-none">A4 Sheet</span>
          </button>
        </div>
      </nav>

      {/* Mobile Action Sheet for Templates, Saved Papers & Draft JSON */}
      {mobileMenuOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl border-t border-zinc-200 p-4 pb-safe space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-2" />
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div>
                <div className="text-sm font-semibold text-zinc-950">Templates &amp; Drafts</div>
                <div className="text-xs text-zinc-500 font-mono-num">
                  {qCount} Qs · {totalMarks}
                  {declaredMarks !== null ? ` / ${declaredMarks}` : ''} marks · Auto-saved offline
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setModalMode('templates');
              }}
              className="w-full min-h-[46px] px-3 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 rounded-lg flex items-center gap-3"
            >
              <FilePlus2 className="w-4 h-4 text-zinc-500" />
              <span>New Paper &amp; Templates</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setModalMode('saved');
              }}
              className="w-full min-h-[46px] px-3 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 rounded-lg flex items-center gap-3"
            >
              <FolderOpen className="w-4 h-4 text-zinc-500" />
              <span>Saved Papers ({savedPapers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                importFileRef.current?.click();
              }}
              className="w-full min-h-[46px] px-3 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 rounded-lg flex items-center gap-3"
            >
              <Upload className="w-4 h-4 text-zinc-500" />
              <span>Import Draft (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                downloadPaperJson(paper);
                showNotice('Draft exported as JSON file');
              }}
              className="w-full min-h-[46px] px-3 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 rounded-lg flex items-center gap-3"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              <span>Export Draft (.json)</span>
            </button>

            <div className="pt-2">
              <PWAInstallButton variant="card" />
            </div>
          </div>
        </div>
      )}

      {/* Visual Equation Editor Modal */}
      <VisualMathModal
        open={mathModalState.open}
        initialLatex={mathModalState.initialLatex}
        initialDisplay={mathModalState.initialDisplay}
        initialTemplate={mathModalState.initialTemplate}
        isEditing={Boolean(mathModalState.editRequest)}
        onClose={() => setMathModalState((s) => ({ ...s, open: false, initialTemplate: null }))}
        onConfirm={handleConfirmMath}
        onDeleteEquation={mathModalState.editRequest ? handleDeleteMathChip : undefined}
      />

      {/* Templates & Saved Papers Modal */}
      <TemplateLibraryModal
        mode={modalMode}
        onClose={() => setModalMode(null)}
        onLoadPaper={handleLoadPaper}
        savedPapers={savedPapers}
        currentPaperId={paper.id}
        onDeleteSaved={handleDeleteSaved}
        onDuplicateSaved={handleDuplicateSaved}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
