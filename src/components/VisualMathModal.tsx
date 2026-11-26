import React, { useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  CornerDownRight,
  Delete,
  Keyboard,
  Minus,
  Plus,
  Redo2,
  Search,
  Undo2,
  X,
} from 'lucide-react';
import {
  CHEM_QUICK_ITEMS,
  FORMULA_PRESETS,
  GEOMETRY_SET_SYMBOLS,
  GREEK_LOWER_SYMBOLS,
  GREEK_UPPER_SYMBOLS,
  OPERATOR_SYMBOLS,
  SymbolItem,
  TRIG_FUNC_ITEMS,
} from '../data/mathLibrary';
import {
  AccentKind,
  astToLatex,
  BigOpCommand,
  collectAllSlotPaths,
  DelimStyle,
  getDelimVisual,
  getNodeSlotSegments,
  getSlotList,
  isNodeEmpty,
  MathCursor,
  MathNode,
  mathUid,
  MatrixEnv,
  mutateMatrixInAst,
  parseLatexToAst,
  samePath,
  SlotPathSegment,
  SMART_TYPING_SHORTCUTS,
  updateSlotList,
} from '../utils/mathAst';

import { UI_COPY, UiLang } from '../data/uiCopy';
import { convertWordLinearOnSpace, finalizeWordLinearToLatex } from '../utils/unicodeMath';

export type QuickMathTemplateKey = 'frac' | 'sup' | 'sub' | 'sqrt' | 'int' | 'matrix';

interface VisualMathModalProps {
  open: boolean;
  initialLatex: string;
  initialDisplay?: boolean;
  initialTemplate?: QuickMathTemplateKey | null;
  isEditing: boolean;
  uiLang?: UiLang;
  subjectHint?: string;
  onClose: () => void;
  onConfirm: (latex: string, display: boolean) => void;
  onDeleteEquation?: () => void;
}

type PaletteTab =
  | 'keypad'
  | 'structures'
  | 'calc'
  | 'matrices'
  | 'symbols'
  | 'chemistry'
  | 'formulas';

const RECENT_MATH_STORAGE_KEY = 'proshnopatra_recent_math_v1';

function loadRecentEquations(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_MATH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, 12) : [];
  } catch {
    return [];
  }
}

function saveRecentEquation(latex: string) {
  const clean = latex.trim();
  if (!clean) return;
  try {
    const existing = loadRecentEquations().filter((x) => x !== clean);
    const next = [clean, ...existing].slice(0, 12);
    localStorage.setItem(RECENT_MATH_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
}

function renderKatexSafe(latex: string, displayMode = false): string {
  if (!latex) return '';
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return '';
  }
}

const KatexPreviewInline: React.FC<{ latex: string; className?: string }> = React.memo(
  ({ latex, className = '' }) => {
    const html = useMemo(() => renderKatexSafe(latex, false), [latex]);
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }
);

function buildInitialTemplateState(template: QuickMathTemplateKey): {
  nodes: MathNode[];
  cursor: MathCursor;
} {
  const id = mathUid();
  switch (template) {
    case 'frac':
      return {
        nodes: [{ id, type: 'frac', num: [], den: [] }],
        cursor: { path: [{ nodeId: id, slot: 'num' }], index: 0 },
      };
    case 'sup':
      return {
        nodes: [
          { id: mathUid(), type: 'char', value: 'x' },
          { id, type: 'sup', content: [] },
        ],
        cursor: { path: [{ nodeId: id, slot: 'content' }], index: 0 },
      };
    case 'sub':
      return {
        nodes: [
          { id: mathUid(), type: 'char', value: 'x' },
          { id, type: 'sub', content: [] },
        ],
        cursor: { path: [{ nodeId: id, slot: 'content' }], index: 0 },
      };
    case 'sqrt':
      return {
        nodes: [{ id, type: 'sqrt', content: [] }],
        cursor: { path: [{ nodeId: id, slot: 'content' }], index: 0 },
      };
    case 'int':
      return {
        nodes: [{ id, type: 'bigop', op: '\\int', display: '∫', lower: [], upper: [] }],
        cursor: { path: [{ nodeId: id, slot: 'lower' }], index: 0 },
      };
    case 'matrix':
      return {
        nodes: [{ id, type: 'matrix', env: 'pmatrix', rows: 2, cols: 2, cells: [[], [], [], []] }],
        cursor: { path: [{ nodeId: id, slot: 'cell', cellIndex: 0 }], index: 0 },
      };
  }
}

export const VisualMathModal: React.FC<VisualMathModalProps> = ({
  open,
  initialLatex,
  initialDisplay = false,
  initialTemplate = null,
  isEditing,
  uiLang = 'bn',
  subjectHint = '',
  onClose,
  onConfirm,
  onDeleteEquation,
}) => {
  const t = UI_COPY[uiLang];
  const [builderMode, setBuilderMode] = useState<'simple' | 'pro'>(() => {
    try {
      return localStorage.getItem('proshnopatra_eq_mode_v1') === 'pro' ? 'pro' : 'simple';
    } catch {
      return 'simple';
    }
  });
  const switchBuilderMode = (mode: 'simple' | 'pro') => {
    setBuilderMode(mode);
    try {
      localStorage.setItem('proshnopatra_eq_mode_v1', mode);
    } catch {
      // ignore
    }
  };
  const [wordLinearDraft, setWordLinearDraft] = useState('');
  const wordLinearInputRef = useRef<HTMLInputElement>(null);
  const [nodes, setNodes] = useState<MathNode[]>([]);
  const [cursor, setCursor] = useState<MathCursor>({ path: [], index: 0 });
  const [history, setHistory] = useState<{ past: MathNode[][]; future: MathNode[][] }>({
    past: [],
    future: [],
  });
  const [displayMode, setDisplayMode] = useState(initialDisplay);
  const [paletteTab, setPaletteTab] = useState<PaletteTab>('structures');
  const [searchQuery, setSearchQuery] = useState('');
  const [formulaCategory, setFormulaCategory] = useState<string>('All');
  const [showRawLatex, setShowRawLatex] = useState(false);
  const [rawLatexDraft, setRawLatexDraft] = useState('');
  const [recentEquations, setRecentEquations] = useState<string[]>([]);
  const [nativeKeyboardActive, setNativeKeyboardActive] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when modal opens
  useEffect(() => {
    if (!open) return;
    setRecentEquations(loadRecentEquations());
    setSearchQuery('');
    setShowRawLatex(false);
    setHistory({ past: [], future: [] });

    // Auto-select relevant formula category from current paper subject
    const subLower = subjectHint.toLowerCase();
    if (subLower.includes('phys') || subjectHint.includes('পদার্থ')) {
      setFormulaCategory('Physics');
    } else if (subLower.includes('chem') || subjectHint.includes('রসায়ন') || subjectHint.includes('রসায়ন')) {
      setFormulaCategory('Chemistry');
    } else if (subLower.includes('bio') || subjectHint.includes('জীব')) {
      setFormulaCategory('Biology');
    } else {
      setFormulaCategory('All');
    }

    // Default to touch keypad on small mobile viewports, structures on desktop
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
    setPaletteTab(isSmallScreen ? 'keypad' : 'structures');
    setNativeKeyboardActive(false);

    if (initialLatex) {
      const parsed = parseLatexToAst(initialLatex);
      setNodes(parsed);
      setCursor({ path: [], index: parsed.length });
      setRawLatexDraft(initialLatex);
    } else if (initialTemplate) {
      const tpl = buildInitialTemplateState(initialTemplate);
      setNodes(tpl.nodes);
      setCursor(tpl.cursor);
      setRawLatexDraft(astToLatex(tpl.nodes));
    } else {
      setNodes([]);
      setCursor({ path: [], index: 0 });
      setRawLatexDraft('');
    }
    setDisplayMode(initialDisplay);

    // On desktop focus canvas for immediate hardware typing; on touch avoid auto-popping OS keyboard over keypad
    if (!isSmallScreen) {
      window.setTimeout(() => canvasRef.current?.focus(), 30);
    }
  }, [open, initialLatex, initialDisplay, initialTemplate]);

  const liveLatex = useMemo(() => astToLatex(nodes), [nodes]);
  const renderedPreviewHtml = useMemo(
    () => renderKatexSafe(liveLatex, displayMode),
    [liveLatex, displayMode]
  );

  useEffect(() => {
    if (!showRawLatex) {
      setRawLatexDraft(liveLatex);
    }
    setWordLinearDraft(liveLatex);
  }, [liveLatex, showRawLatex]);

  // Detect if cursor is inside a matrix so we can show quick +Row/+Col controls
  const activeMatrixId = useMemo(() => {
    for (let i = cursor.path.length - 1; i >= 0; i--) {
      if (cursor.path[i].slot === 'cell') return cursor.path[i].nodeId;
    }
    return null;
  }, [cursor.path]);

  if (!open) return null;

  const commitNodes = (nextNodes: MathNode[], nextCursor?: MathCursor) => {
    setHistory((h) => ({
      past: [...h.past.slice(-39), nodes],
      future: [],
    }));
    setNodes(nextNodes);
    if (nextCursor) setCursor(nextCursor);
  };

  const handleUndo = () => {
    if (history.past.length === 0) return;
    const prev = history.past[history.past.length - 1];
    setHistory((h) => ({
      past: h.past.slice(0, -1),
      future: [nodes, ...h.future.slice(0, 39)],
    }));
    setNodes(prev);
    setCursor({ path: [], index: prev.length });
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory((h) => ({
      past: [...h.past, nodes],
      future: h.future.slice(1),
    }));
    setNodes(next);
    setCursor({ path: [], index: next.length });
  };

  const keepFocus = () => {
    if (nativeKeyboardActive) {
      hiddenInputRef.current?.focus();
    } else if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      canvasRef.current?.focus();
    }
  };

  const insertNodesAtCursor = (
    newNodes: MathNode[],
    enterSlot?: SlotPathSegment
  ) => {
    const updated = updateSlotList(nodes, cursor.path, (list) => {
      const next = [...list];
      next.splice(cursor.index, 0, ...newNodes);
      return next;
    });

    const nextCursor: MathCursor = enterSlot
      ? { path: [...cursor.path, enterSlot], index: 0 }
      : { path: cursor.path, index: cursor.index + newNodes.length };

    commitNodes(updated, nextCursor);
    keepFocus();
  };

  // Smart character insertion: converts shortcuts like >= -> ≥, pi -> π, -> -> →
  const insertCharSmart = (ch: string) => {
    const currentList = getSlotList(nodes, cursor.path) ?? [];
    const before = currentList.slice(0, cursor.index);

    // Check smart typing shortcuts against trailing char nodes + incoming char
    let trailingChars = '';
    let charCount = 0;
    for (let i = before.length - 1; i >= 0 && charCount < 8; i--) {
      const n = before[i];
      if (n.type !== 'char') break;
      trailingChars = n.value + trailingChars;
      charCount++;
    }
    const candidate = trailingChars + ch;

    for (const sc of SMART_TYPING_SHORTCUTS) {
      if (candidate.endsWith(sc.trigger)) {
        // For alphabetic triggers (like 'pi'), make sure it's not in the middle of a longer word (like 'spin')
        const isAlpha = /^[a-zA-Z]+$/.test(sc.trigger);
        if (isAlpha) {
          const prevCharIdx = candidate.length - sc.trigger.length - 1;
          if (prevCharIdx >= 0 && /[a-zA-Z]/.test(candidate[prevCharIdx])) {
            continue;
          }
        }
        const removeCount = sc.trigger.length - 1;
        const symNode: MathNode = {
          id: mathUid(),
          type: 'symbol',
          latex: sc.latex,
          display: sc.display,
        };
        const updated = updateSlotList(nodes, cursor.path, (list) => {
          const next = [...list];
          next.splice(cursor.index - removeCount, removeCount, symNode);
          return next;
        });
        commitNodes(updated, {
          path: cursor.path,
          index: cursor.index - removeCount + 1,
        });
        keepFocus();
        return;
      }
    }

    insertNodesAtCursor([{ id: mathUid(), type: 'char', value: ch }]);
  };

  // Smart fraction: if user types `/` right after a number/variable/term, auto-move it into numerator!
  const insertSmartFraction = () => {
    const list = getSlotList(nodes, cursor.path) ?? [];
    if (cursor.index > 0) {
      // Collect contiguous preceding numerator atom (digits/letters or a single structured node)
      let start = cursor.index - 1;
      const lastNode = list[start];
      const stopChars = new Set(['+', '-', '=', '<', '>', ',', ' ', '(', '[', '{']);
      if (lastNode.type === 'char' && !stopChars.has(lastNode.value)) {
        while (start > 0) {
          const prev = list[start - 1];
          if (prev.type === 'char' && !stopChars.has(prev.value)) {
            start--;
          } else if (prev.type === 'sup' || prev.type === 'sub') {
            start--;
          } else {
            break;
          }
        }
        const numNodes = list.slice(start, cursor.index);
        const id = mathUid();
        const updated = updateSlotList(nodes, cursor.path, (arr) => {
          const next = [...arr];
          next.splice(start, cursor.index - start, { id, type: 'frac', num: numNodes, den: [] });
          return next;
        });
        commitNodes(updated, {
          path: [...cursor.path, { nodeId: id, slot: 'den' }],
          index: 0,
        });
        keepFocus();
        return;
      }
    }
    insertFraction();
  };

  const insertFraction = () => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'frac', num: [], den: [] }], { nodeId: id, slot: 'num' });
  };

  const insertBinom = () => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'binom', top: [], bottom: [] }], { nodeId: id, slot: 'top' });
  };

  const insertPower = () => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'sup', content: [] }], { nodeId: id, slot: 'content' });
  };

  const insertSubscript = () => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'sub', content: [] }], { nodeId: id, slot: 'content' });
  };

  const insertSubSup = () => {
    const subId = mathUid();
    const supId = mathUid();
    insertNodesAtCursor(
      [
        { id: subId, type: 'sub', content: [] },
        { id: supId, type: 'sup', content: [] },
      ],
      { nodeId: subId, slot: 'content' }
    );
  };

  const insertSqrt = (withIndex: boolean) => {
    const id = mathUid();
    insertNodesAtCursor(
      [{ id, type: 'sqrt', index: withIndex ? [] : undefined, content: [] }],
      { nodeId: id, slot: withIndex ? 'index' : 'content' }
    );
  };

  const insertDelim = (style: DelimStyle) => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'delim', style, content: [] }], {
      nodeId: id,
      slot: 'content',
    });
  };

  const insertBigOp = (op: BigOpCommand, display: string, withLimits = true) => {
    const id = mathUid();
    insertNodesAtCursor(
      [
        {
          id,
          type: 'bigop',
          op,
          display,
          lower: [],
          upper: op === '\\lim' || !withLimits ? undefined : [],
        },
      ],
      { nodeId: id, slot: 'lower' }
    );
  };

  const insertChemArrow = (
    arrow: 'right' | 'left' | 'eq',
    defaultAbove = '',
    withBelow = false
  ) => {
    const id = mathUid();
    const aboveNodes = defaultAbove ? parseLatexToAst(defaultAbove) : [];
    insertNodesAtCursor(
      [
        {
          id,
          type: 'chemArrow',
          arrow,
          above: aboveNodes,
          below: withBelow ? [] : undefined,
        },
      ],
      defaultAbove && !withBelow ? undefined : { nodeId: id, slot: defaultAbove ? 'below' : 'above' }
    );
  };

  const insertIsotope = () => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'isotope', mass: [], atomic: [], element: [] }], {
      nodeId: id,
      slot: 'mass',
    });
  };

  const insertAccent = (accent: AccentKind) => {
    const id = mathUid();
    insertNodesAtCursor([{ id, type: 'accent', accent, content: [] }], {
      nodeId: id,
      slot: 'content',
    });
  };

  const insertMatrix = (env: MatrixEnv, rows: number, cols: number) => {
    const id = mathUid();
    const cells = Array.from({ length: rows * cols }, () => [] as MathNode[]);
    insertNodesAtCursor([{ id, type: 'matrix', env, rows, cols, cells }], {
      nodeId: id,
      slot: 'cell',
      cellIndex: 0,
    });
  };

  const insertSymbol = (sym: SymbolItem) => {
    if (sym.latex.length === 1 && !sym.latex.startsWith('\\')) {
      insertNodesAtCursor([{ id: mathUid(), type: 'char', value: sym.latex }]);
      return;
    }
    insertNodesAtCursor([
      { id: mathUid(), type: 'symbol', latex: sym.latex, display: sym.display },
    ]);
  };

  const insertQuickFormula = (latex: string) => {
    const parsed = parseLatexToAst(latex);
    insertNodesAtCursor(parsed);
  };

  const handleMatrixMutate = (action: 'addRow' | 'removeRow' | 'addCol' | 'removeCol') => {
    if (!activeMatrixId) return;
    const updated = mutateMatrixInAst(nodes, activeMatrixId, action);
    commitNodes(updated, { path: [], index: updated.length });
  };

  const handleBackspace = () => {
    const list = getSlotList(nodes, cursor.path);
    if (!list) return;

    if (cursor.index > 0) {
      const updated = updateSlotList(nodes, cursor.path, (arr) =>
        arr.filter((_, i) => i !== cursor.index - 1)
      );
      commitNodes(updated, { path: cursor.path, index: cursor.index - 1 });
      keepFocus();
      return;
    }

    if (cursor.path.length > 0) {
      const parentPath = cursor.path.slice(0, -1);
      const lastSeg = cursor.path[cursor.path.length - 1];
      const parentList = getSlotList(nodes, parentPath);
      if (!parentList) return;
      const parentIdx = parentList.findIndex((n) => n.id === lastSeg.nodeId);
      if (parentIdx === -1) return;

      const parentNode = parentList[parentIdx];
      if (isNodeEmpty(parentNode)) {
        const updated = updateSlotList(nodes, parentPath, (arr) =>
          arr.filter((_, i) => i !== parentIdx)
        );
        commitNodes(updated, { path: parentPath, index: parentIdx });
      } else {
        setCursor({ path: parentPath, index: parentIdx });
      }
      keepFocus();
    }
  };

  const handleTabNavigation = (shiftKey: boolean) => {
    const allPaths = collectAllSlotPaths(nodes);
    if (allPaths.length === 0) return;
    const currentIdx = allPaths.findIndex((p) => samePath(p, cursor.path));
    const nextIdx =
      currentIdx === -1
        ? 0
        : (currentIdx + (shiftKey ? -1 : 1) + allPaths.length) % allPaths.length;
    const targetPath = allPaths[nextIdx];
    const targetList = getSlotList(nodes, targetPath) ?? [];
    setCursor({ path: targetPath, index: targetList.length });
    keepFocus();
  };

  const handleArrow = (dir: -1 | 1) => {
    const list = getSlotList(nodes, cursor.path);
    if (!list) return;

    const nextIndex = cursor.index + dir;
    if (nextIndex >= 0 && nextIndex <= list.length) {
      const steppedNode = dir === 1 ? list[cursor.index] : list[cursor.index - 1];
      if (steppedNode) {
        const segs = getNodeSlotSegments(steppedNode);
        if (segs.length > 0) {
          const targetSeg = dir === 1 ? segs[0] : segs[segs.length - 1];
          const child = getSlotList([steppedNode], [targetSeg]) ?? [];
          setCursor({
            path: [...cursor.path, targetSeg],
            index: dir === 1 ? 0 : child.length,
          });
          keepFocus();
          return;
        }
      }
      setCursor({ ...cursor, index: nextIndex });
      keepFocus();
      return;
    }

    // Step to sibling slot or exit parent node
    if (cursor.path.length > 0) {
      const parentPath = cursor.path.slice(0, -1);
      const lastSeg = cursor.path[cursor.path.length - 1];
      const parentList = getSlotList(nodes, parentPath);
      if (!parentList) return;
      const parentIdx = parentList.findIndex((n) => n.id === lastSeg.nodeId);
      if (parentIdx === -1) return;
      const parentNode = parentList[parentIdx];
      const segs = getNodeSlotSegments(parentNode);
      const segIdx = segs.findIndex(
        (s) => s.slot === lastSeg.slot && s.cellIndex === lastSeg.cellIndex
      );
      const nextSegIdx = segIdx + dir;
      if (segIdx !== -1 && nextSegIdx >= 0 && nextSegIdx < segs.length) {
        const nextSeg = segs[nextSegIdx];
        const child = getSlotList([parentNode], [nextSeg]) ?? [];
        setCursor({
          path: [...parentPath, nextSeg],
          index: dir === 1 ? 0 : child.length,
        });
        keepFocus();
        return;
      }

      setCursor({ path: parentPath, index: dir === 1 ? parentIdx + 1 : parentIdx });
      keepFocus();
    }
  };

  const handleConfirm = () => {
    if (!liveLatex) return;
    saveRecentEquation(liveLatex);
    onConfirm(liveLatex, displayMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabNavigation(e.shiftKey);
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleArrow(-1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleArrow(1);
      return;
    }
    if (e.key === '^') {
      e.preventDefault();
      insertPower();
      return;
    }
    if (e.key === '_') {
      e.preventDefault();
      insertSubscript();
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      insertSmartFraction();
      return;
    }
    if (e.key === '*') {
      e.preventDefault();
      insertSymbol({ display: '×', title: 'Multiply', latex: '\\times' });
      return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      insertCharSmart(e.key);
    }
  };

  // Mobile native keyboard bridge via hidden input
  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    e.target.value = '';
    for (const ch of val) {
      if (ch === '^') insertPower();
      else if (ch === '_') insertSubscript();
      else if (ch === '/') insertSmartFraction();
      else if (ch === '*') insertSymbol({ display: '×', title: 'Multiply', latex: '\\times' });
      else insertCharSmart(ch);
    }
  };

  const toggleNativeKeyboard = () => {
    if (nativeKeyboardActive) {
      hiddenInputRef.current?.blur();
      setNativeKeyboardActive(false);
    } else {
      setNativeKeyboardActive(true);
      window.setTimeout(() => hiddenInputRef.current?.focus(), 10);
    }
  };

  const applyRawLatex = (val: string) => {
    setRawLatexDraft(val);
    const parsed = parseLatexToAst(val);
    setNodes(parsed);
    setCursor({ path: [], index: parsed.length });
  };

  const renderSlot = (
    list: MathNode[],
    path: SlotPathSegment[],
    placeholder = '',
    compact = false
  ): React.ReactNode => {
    const isActiveSlot = samePath(cursor.path, path);
    const isRoot = path.length === 0;

    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          setCursor({ path, index: list.length });
          keepFocus();
        }}
        className={`inline-flex items-center flex-wrap align-middle transition-colors ${
          isRoot
            ? 'min-h-[40px] px-1'
            : `min-w-[24px] min-h-[24px] px-1 rounded border ${
                isActiveSlot
                  ? 'border-[#0F4C81] bg-[#EBF4FF]'
                  : list.length === 0
                  ? 'border-dashed border-zinc-400 bg-zinc-50'
                  : 'border-transparent hover:border-zinc-300'
              }`
        } ${compact ? 'text-[0.76em] min-w-[20px] min-h-[20px]' : ''}`}
      >
        {list.length === 0 && !isActiveSlot && placeholder && (
          <span className="text-zinc-300 text-xs select-none">{placeholder}</span>
        )}
        {list.length === 0 && isActiveSlot && (
          <span className="inline-block w-[2px] h-[1.15em] bg-[#0F4C81] animate-pulse" />
        )}

        {list.map((node, idx) => (
          <React.Fragment key={node.id}>
            {isActiveSlot && cursor.index === idx && (
              <span className="inline-block w-[2px] h-[1.15em] bg-[#0F4C81] animate-pulse" />
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                setCursor({ path, index: idx + 1 });
                keepFocus();
              }}
              className="inline-flex items-center"
            >
              {renderNode(node, path)}
            </span>
          </React.Fragment>
        ))}

        {isActiveSlot && list.length > 0 && cursor.index === list.length && (
          <span className="inline-block w-[2px] h-[1.15em] bg-[#0F4C81] animate-pulse" />
        )}
      </span>
    );
  };

  const renderNode = (node: MathNode, parentPath: SlotPathSegment[]): React.ReactNode => {
    switch (node.type) {
      case 'char':
        return (
          <span className="whitespace-pre font-paper-serif">
            {node.value === ' ' ? '\u00A0' : node.value}
          </span>
        );
      case 'symbol':
        return <span className="px-0.5 font-paper-serif">{node.display}</span>;
      case 'frac':
        return (
          <span className="inline-flex flex-col items-center align-middle mx-1 leading-tight">
            <span className="pb-0.5">
              {renderSlot(node.num, [...parentPath, { nodeId: node.id, slot: 'num' }], 'a', true)}
            </span>
            <span className="w-full min-w-[24px] border-t border-zinc-900" />
            <span className="pt-0.5">
              {renderSlot(node.den, [...parentPath, { nodeId: node.id, slot: 'den' }], 'b', true)}
            </span>
          </span>
        );
      case 'binom':
        return (
          <span className="inline-flex items-center align-middle mx-1">
            <span className="text-2xl font-light text-zinc-700 select-none">(</span>
            <span className="inline-flex flex-col items-center leading-tight px-0.5">
              <span className="pb-0.5">
                {renderSlot(node.top, [...parentPath, { nodeId: node.id, slot: 'top' }], 'n', true)}
              </span>
              <span className="pt-0.5">
                {renderSlot(
                  node.bottom,
                  [...parentPath, { nodeId: node.id, slot: 'bottom' }],
                  'r',
                  true
                )}
              </span>
            </span>
            <span className="text-2xl font-light text-zinc-700 select-none">)</span>
          </span>
        );
      case 'sup':
        return (
          <span className="inline-flex items-start -mt-3 ml-0.5">
            {renderSlot(
              node.content,
              [...parentPath, { nodeId: node.id, slot: 'content' }],
              '2',
              true
            )}
          </span>
        );
      case 'sub':
        return (
          <span className="inline-flex items-end mt-2.5 ml-0.5">
            {renderSlot(
              node.content,
              [...parentPath, { nodeId: node.id, slot: 'content' }],
              'n',
              true
            )}
          </span>
        );
      case 'sqrt':
        return (
          <span className="inline-flex items-center mx-0.5">
            {node.index !== undefined && (
              <span className="-mt-3 -mr-0.5">
                {renderSlot(
                  node.index,
                  [...parentPath, { nodeId: node.id, slot: 'index' }],
                  'n',
                  true
                )}
              </span>
            )}
            <span className="text-lg leading-none select-none font-serif">√</span>
            <span className="border-t border-zinc-900 pt-0.5 pl-0.5">
              {renderSlot(node.content, [...parentPath, { nodeId: node.id, slot: 'content' }], 'x')}
            </span>
          </span>
        );
      case 'delim': {
        const vis = getDelimVisual(node.style);
        return (
          <span className="inline-flex items-center mx-0.5">
            <span className="text-xl font-light text-zinc-700 select-none px-0.5">{vis.open}</span>
            {renderSlot(node.content, [...parentPath, { nodeId: node.id, slot: 'content' }], 'x')}
            <span className="text-xl font-light text-zinc-700 select-none px-0.5">{vis.close}</span>
          </span>
        );
      }
      case 'bigop':
        return (
          <span className="inline-flex items-center gap-0.5 mx-1">
            <span className="inline-flex flex-col items-center leading-none">
              {node.upper !== undefined && (
                <span className="mb-0.5">
                  {renderSlot(
                    node.upper,
                    [...parentPath, { nodeId: node.id, slot: 'upper' }],
                    'b',
                    true
                  )}
                </span>
              )}
              <span className="text-xl font-serif leading-none">{node.display}</span>
              <span className="mt-0.5">
                {renderSlot(
                  node.lower,
                  [...parentPath, { nodeId: node.id, slot: 'lower' }],
                  node.op === '\\lim' ? 'x→0' : 'a',
                  true
                )}
              </span>
            </span>
          </span>
        );
      case 'chemArrow':
        return (
          <span className="inline-flex flex-col items-center mx-1.5 leading-none">
            <span className="mb-0.5">
              {renderSlot(
                node.above,
                [...parentPath, { nodeId: node.id, slot: 'above' }],
                'Δ',
                true
              )}
            </span>
            <span className="text-base leading-none select-none">
              {node.arrow === 'eq' ? '⇌' : node.arrow === 'left' ? '⟵' : '⟶'}
            </span>
            {node.below !== undefined && (
              <span className="mt-0.5">
                {renderSlot(
                  node.below,
                  [...parentPath, { nodeId: node.id, slot: 'below' }],
                  'cat.',
                  true
                )}
              </span>
            )}
          </span>
        );
      case 'isotope':
        return (
          <span className="inline-flex items-center mx-1">
            <span className="inline-flex flex-col items-end leading-tight mr-0.5">
              <span>
                {renderSlot(
                  node.mass,
                  [...parentPath, { nodeId: node.id, slot: 'mass' }],
                  'A',
                  true
                )}
              </span>
              <span>
                {renderSlot(
                  node.atomic,
                  [...parentPath, { nodeId: node.id, slot: 'atomic' }],
                  'Z',
                  true
                )}
              </span>
            </span>
            <span>
              {renderSlot(
                node.element,
                [...parentPath, { nodeId: node.id, slot: 'element' }],
                'X'
              )}
            </span>
          </span>
        );
      case 'accent': {
        const mark =
          node.accent === 'vec' || node.accent === 'overrightarrow'
            ? '→'
            : node.accent === 'hat' || node.accent === 'widehat'
            ? '^'
            : node.accent === 'dot'
            ? '·'
            : node.accent === 'ddot'
            ? '··'
            : node.accent === 'underline'
            ? ''
            : '—';
        return (
          <span className="inline-flex flex-col items-center mx-0.5 leading-none">
            {mark && <span className="text-[11px] leading-none select-none -mb-0.5">{mark}</span>}
            <span className={node.accent === 'underline' ? 'border-b border-zinc-900 pb-0.5' : ''}>
              {renderSlot(node.content, [...parentPath, { nodeId: node.id, slot: 'content' }], 'A')}
            </span>
          </span>
        );
      }
      case 'matrix': {
        const leftDelim =
          node.env === 'bmatrix'
            ? '['
            : node.env === 'vmatrix'
            ? '|'
            : node.env === 'cases'
            ? '{'
            : '(';
        const rightDelim =
          node.env === 'bmatrix'
            ? ']'
            : node.env === 'vmatrix'
            ? '|'
            : node.env === 'cases'
            ? ''
            : ')';
        return (
          <span className="inline-flex items-center mx-1 align-middle">
            <span className="text-2xl font-light text-zinc-700 select-none pr-0.5">
              {leftDelim}
            </span>
            <span
              className="inline-grid gap-1 py-0.5"
              style={{ gridTemplateColumns: `repeat(${node.cols}, minmax(26px, auto))` }}
            >
              {node.cells.map((cellNodes, cIdx) => (
                <span key={cIdx} className="inline-flex justify-center">
                  {renderSlot(
                    cellNodes,
                    [...parentPath, { nodeId: node.id, slot: 'cell', cellIndex: cIdx }],
                    node.env === 'cases' && cIdx % node.cols === 1 ? 'if…' : '·',
                    true
                  )}
                </span>
              ))}
            </span>
            {rightDelim && (
              <span className="text-2xl font-light text-zinc-700 select-none pl-0.5">
                {rightDelim}
              </span>
            )}
          </span>
        );
      }
    }
  };

  // Filtered symbols & formulas for instant search
  const q = searchQuery.trim().toLowerCase();
  const filterSym = (list: SymbolItem[]) =>
    !q
      ? list
      : list.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.display.toLowerCase().includes(q) ||
            s.latex.toLowerCase().includes(q) ||
            (s.keywords?.toLowerCase().includes(q) ?? false)
        );

  const filteredFormulas = FORMULA_PRESETS.filter((f) => {
    const catMatch = formulaCategory === 'All' || f.category === formulaCategory;
    if (!catMatch) return false;
    if (!q) return true;
    return (
      f.title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.keywords.toLowerCase().includes(q)
    );
  });

  const tabs: { id: PaletteTab; label: string }[] = [
    { id: 'keypad', label: 'Keypad' },
    { id: 'structures', label: 'Structures' },
    { id: 'calc', label: 'Trig & Calc' },
    { id: 'matrices', label: 'Matrices' },
    { id: 'symbols', label: 'Symbols' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'formulas', label: 'Formulas' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white border-t sm:border border-zinc-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl h-[93dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab indicator */}
        <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Hidden input for mobile native OS keyboard bridge */}
        <input
          ref={hiddenInputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Mobile equation keyboard input"
          onChange={handleHiddenInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setNativeKeyboardActive(false)}
          className="sr-only"
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-zinc-200 shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-950 truncate">
              {isEditing ? t.eqEditTitle : t.eqBuilderTitle}
            </h2>
            <p className="text-[11px] text-zinc-500 hidden sm:block mt-0.5">
              {builderMode === 'simple' ? t.eqSimpleHint : t.eqProHint}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
              <button
                type="button"
                onClick={() => switchBuilderMode('simple')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  builderMode === 'simple'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {t.eqSimpleMode}
              </button>
              <button
                type="button"
                onClick={() => switchBuilderMode('pro')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  builderMode === 'pro'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {t.eqProMode}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close equation editor"
              className="min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sticky Top Builder Canvas + Controls + Live Preview */}
        <div className="px-3.5 sm:px-5 pt-3 pb-2.5 space-y-2.5 border-b border-zinc-200 bg-white shrink-0">
          {/* Visual Equation Canvas */}
          <div
            ref={canvasRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={() => {
              setCursor({ path: [], index: nodes.length });
              keepFocus();
            }}
            className="min-h-[60px] sm:min-h-[72px] max-h-[120px] overflow-y-auto thin-scroll w-full px-3 sm:px-4 py-2.5 border-2 border-[#0F4C81]/75 rounded-lg bg-white text-base sm:text-lg text-zinc-950 flex items-center flex-wrap cursor-text focus:outline-none focus:border-[#0F4C81]"
          >
            {nodes.length === 0 && samePath(cursor.path, []) ? (
              <span className="inline-flex items-center text-zinc-400 text-xs sm:text-sm">
                <span className="inline-block w-[2px] h-5 bg-[#0F4C81] animate-pulse mr-1.5" />
                Tap keys or a template below to build your equation...
              </span>
            ) : (
              renderSlot(nodes, [])
            )}
          </div>

          {/* Tactile Navigation & Action Bar (Essential for Mobile + Fast Desktop) */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleArrow(-1)}
                title="Move cursor left"
                className="min-h-[36px] min-w-[36px] px-2 flex items-center justify-center border border-zinc-200 hover:border-zinc-400 rounded-md bg-white text-zinc-700 active:bg-zinc-100 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleArrow(1)}
                title="Move cursor right"
                className="min-h-[36px] min-w-[36px] px-2 flex items-center justify-center border border-zinc-200 hover:border-zinc-400 rounded-md bg-white text-zinc-700 active:bg-zinc-100 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTabNavigation(false)}
                title="Jump to next editable box (Tab)"
                className="min-h-[36px] px-2.5 inline-flex items-center gap-1 text-xs font-medium border border-[#0F4C81]/30 bg-[#F0F6FC] text-[#0F4C81] hover:bg-[#E2EFFA] rounded-md cursor-pointer whitespace-nowrap"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Next Box</span>
              </button>
              <button
                type="button"
                onClick={toggleNativeKeyboard}
                title="Open device keyboard for letters or Bangla text"
                className={`min-h-[36px] px-2.5 inline-flex items-center gap-1 text-xs font-medium border rounded-md cursor-pointer whitespace-nowrap ${
                  nativeKeyboardActive
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">ABC</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={history.past.length === 0}
                onClick={handleUndo}
                title="Undo"
                className="min-h-[36px] min-w-[34px] flex items-center justify-center border border-zinc-200 rounded-md text-zinc-600 hover:text-zinc-950 disabled:opacity-30 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={history.future.length === 0}
                onClick={handleRedo}
                title="Redo"
                className="min-h-[36px] min-w-[34px] flex items-center justify-center border border-zinc-200 rounded-md text-zinc-600 hover:text-zinc-950 disabled:opacity-30 cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                title="Backspace"
                className="min-h-[36px] px-2.5 inline-flex items-center gap-1 text-xs font-medium border border-zinc-200 hover:border-zinc-400 rounded-md bg-white text-zinc-700 active:bg-zinc-100 cursor-pointer"
              >
                <Delete className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Del</span>
              </button>
              {nodes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    commitNodes([], { path: [], index: 0 });
                    keepFocus();
                  }}
                  className="min-h-[36px] px-2 text-xs text-zinc-500 hover:text-red-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Contextual Matrix Dimension Bar (appears only when editing a matrix/system) */}
          {activeMatrixId && (
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#F0F6FC] border border-[#0F4C81]/20 rounded-md text-xs">
              <span className="text-[#0F4C81] font-medium">Matrix Size</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMatrixMutate('addRow')}
                  className="inline-flex items-center gap-0.5 px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-800 hover:border-zinc-900 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Row
                </button>
                <button
                  type="button"
                  onClick={() => handleMatrixMutate('removeRow')}
                  className="inline-flex items-center gap-0.5 px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-800 hover:border-zinc-900 cursor-pointer"
                >
                  <Minus className="w-3 h-3" /> Row
                </button>
                <button
                  type="button"
                  onClick={() => handleMatrixMutate('addCol')}
                  className="inline-flex items-center gap-0.5 px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-800 hover:border-zinc-900 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Col
                </button>
                <button
                  type="button"
                  onClick={() => handleMatrixMutate('removeCol')}
                  className="inline-flex items-center gap-0.5 px-2 py-1 bg-white border border-zinc-200 rounded text-zinc-800 hover:border-zinc-900 cursor-pointer"
                >
                  <Minus className="w-3 h-3" /> Col
                </button>
              </div>
            </div>
          )}

          {/* Live Formatted Paper Preview + Optional LaTeX Toggle */}
          <div className="px-3 py-2 bg-[#F8F9FA] border border-zinc-200 rounded-md flex items-center justify-between gap-2 min-h-[42px]">
            <span className="text-[11px] text-zinc-400 shrink-0 hidden sm:inline">{t.eqPreview}</span>
            <div className="flex-1 text-center overflow-x-auto text-sm sm:text-base text-black">
              {renderedPreviewHtml ? (
                <span dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }} />
              ) : (
                <span className="text-xs text-zinc-400">{t.eqPreview}</span>
              )}
            </div>
            {builderMode === 'pro' && (
              <button
                type="button"
                onClick={() => setShowRawLatex((v) => !v)}
                title="Toggle raw LaTeX code"
                className={`px-2 py-1 text-[11px] font-medium rounded inline-flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
                  showRawLatex
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>LaTeX</span>
              </button>
            )}
          </div>

          {/* MS Word Linear Input Bar in Pro Mode */}
          {builderMode === 'pro' && !showRawLatex && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500 shrink-0 hidden sm:inline">
                {t.eqLinearBar}:
              </span>
              <input
                ref={wordLinearInputRef}
                type="text"
                value={wordLinearDraft}
                onChange={(e) => {
                  const val = e.target.value;
                  setWordLinearDraft(val);
                  const parsed = parseLatexToAst(finalizeWordLinearToLatex(val));
                  setNodes(parsed);
                  setCursor({ path: [], index: parsed.length });
                }}
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    const el = wordLinearInputRef.current;
                    if (!el) return;
                    const pos = el.selectionStart ?? wordLinearDraft.length;
                    const before = wordLinearDraft.slice(0, pos);
                    const after = wordLinearDraft.slice(pos);
                    const converted = convertWordLinearOnSpace(before);
                    if (converted !== null) {
                      e.preventDefault();
                      const nextVal = converted + ' ' + after;
                      setWordLinearDraft(nextVal);
                      const parsed = parseLatexToAst(finalizeWordLinearToLatex(nextVal));
                      setNodes(parsed);
                      setCursor({ path: [], index: parsed.length });
                      const nextPos = converted.length + 1;
                      window.requestAnimationFrame(() => el.setSelectionRange(nextPos, nextPos));
                    }
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                placeholder={t.eqInlinePlaceholder}
                className="flex-1 text-xs font-mono px-2.5 py-1.5 border border-zinc-200 rounded-md bg-white text-zinc-900 focus:border-[#0F4C81] focus:outline-none"
              />
            </div>
          )}

          {builderMode === 'pro' && showRawLatex && (
            <input
              type="text"
              value={rawLatexDraft}
              onChange={(e) => applyRawLatex(e.target.value)}
              placeholder="Paste or edit raw LaTeX directly, e.g. \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              className="w-full text-xs font-mono px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900 focus:border-[#0F4C81]"
            />
          )}
        </div>

        {/* Scrollable Category Tabs (Pro Mode only) */}
        {builderMode === 'pro' && (
          <div className="px-3.5 sm:px-5 pt-2 pb-2 border-b border-zinc-200 bg-[#FAFAFB] shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaletteTab(tab.id)}
                  className={`px-3 min-h-[34px] text-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    paletteTab === tab.id
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Palette Body */}
        <div className="flex-1 overflow-y-auto thin-scroll px-3.5 sm:px-5 py-3 space-y-3">
          {builderMode === 'simple' && (
            <div className="space-y-4">
              {/* 1. Fill-in Shapes */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 mb-2">
                  {t.eqFillBoxes}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={insertFraction}
                    className="p-2.5 border border-zinc-200 hover:border-[#0F4C81] hover:bg-[#F0F6FC] rounded-lg bg-white text-center cursor-pointer transition-colors"
                  >
                    <div className="text-base font-serif font-semibold text-zinc-900">
                      <KatexPreviewInline latex="\frac{\square}{\square}" />
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-1">
                      {uiLang === 'bn' ? 'ভগ্নাংশ (a/b)' : 'Fraction (a/b)'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={insertPower}
                    className="p-2.5 border border-zinc-200 hover:border-[#0F4C81] hover:bg-[#F0F6FC] rounded-lg bg-white text-center cursor-pointer transition-colors"
                  >
                    <div className="text-base font-serif font-semibold text-zinc-900">
                      <KatexPreviewInline latex="x^{\square}" />
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-1">
                      {uiLang === 'bn' ? 'পাওয়ার / ঘাত (x²)' : 'Power (x²)'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSqrt(false)}
                    className="p-2.5 border border-zinc-200 hover:border-[#0F4C81] hover:bg-[#F0F6FC] rounded-lg bg-white text-center cursor-pointer transition-colors"
                  >
                    <div className="text-base font-serif font-semibold text-zinc-900">
                      <KatexPreviewInline latex="\sqrt{\square}" />
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-1">
                      {uiLang === 'bn' ? 'বর্গমূল (√x)' : 'Square Root (√x)'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={insertSubscript}
                    className="p-2.5 border border-zinc-200 hover:border-[#0F4C81] hover:bg-[#F0F6FC] rounded-lg bg-white text-center cursor-pointer transition-colors"
                  >
                    <div className="text-base font-serif font-semibold text-zinc-900">
                      <KatexPreviewInline latex="\text{H}_{\square}" />
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-1">
                      {uiLang === 'bn' ? 'নিচের সংখ্যা (H₂)' : 'Subscript (H₂)'}
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Numbers & Basic Signs */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 mb-2">
                  {t.eqNumbersSigns}
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                  {[
                    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                    '+', '-', '=', '(', ')', 'x', 'y', 'a', 'b', '.',
                  ].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => insertNodesAtCursor([{ id: mathUid(), type: 'char', value: ch }])}
                      className="min-h-[38px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 rounded-md bg-white text-sm font-medium text-zinc-900 cursor-pointer"
                    >
                      {ch}
                    </button>
                  ))}
                  {[
                    { d: '×', l: '\\times' },
                    { d: '÷', l: '\\div' },
                    { d: '±', l: '\\pm' },
                    { d: '°', l: '^\\circ' },
                    { d: 'θ', l: '\\theta' },
                    { d: 'π', l: '\\pi' },
                    { d: 'Δ', l: '\\Delta' },
                    { d: 'Ω', l: '\\Omega' },
                    { d: '→', l: '\\rightarrow' },
                    { d: '⇌', l: '\\rightleftharpoons' },
                  ].map((s) => (
                    <button
                      key={s.d}
                      type="button"
                      onClick={() => insertQuickFormula(s.l)}
                      className="min-h-[38px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 rounded-md bg-[#F8F9FA] text-sm font-serif text-zinc-900 cursor-pointer"
                    >
                      {s.d}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Ready NCTB Formulas (Physics, Chemistry, Biology, Math) */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-500">{t.eqReadyFormulas}</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        uiLang === 'bn'
                          ? 'সূত্র খুঁজুন (যেমন: ohm, motion, ph, photosynthesis...)'
                          : 'Search formulas (ohm, motion, ph, photosynthesis...)'
                      }
                      className="w-full text-xs pl-8 pr-3 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {['All', 'Physics', 'Chemistry', 'Biology', 'Algebra', 'Geometry & Trig'].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormulaCategory(cat)}
                          className={`px-2.5 min-h-[32px] text-xs rounded-md border whitespace-nowrap shrink-0 cursor-pointer ${
                            formulaCategory === cat
                              ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredFormulas.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => insertQuickFormula(preset.latex)}
                      className="p-2.5 text-left border border-zinc-200 hover:border-[#0F4C81] rounded-lg bg-white transition-colors cursor-pointer space-y-1 overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-900 truncate">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">{preset.category}</span>
                      </div>
                      <div className="overflow-x-auto text-sm text-zinc-950">
                        <KatexPreviewInline latex={preset.latex} />
                      </div>
                    </button>
                  ))}
                  {filteredFormulas.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-zinc-400">
                      No formulas matched &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {builderMode === 'pro' && (
            <>
          {/* TAB 1: TOUCH MATH KEYPAD */}
          {paletteTab === 'keypad' && (
            <div className="space-y-2.5">
              {/* Quick Structures Row */}
              <div className="grid grid-cols-6 gap-1.5">
                <button
                  type="button"
                  onClick={insertFraction}
                  className="min-h-[44px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-[#F8F9FA] text-zinc-900 font-serif text-sm cursor-pointer"
                  title="Fraction"
                >
                  a/b
                </button>
                <button
                  type="button"
                  onClick={insertPower}
                  className="min-h-[44px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-[#F8F9FA] text-zinc-900 font-serif text-sm cursor-pointer"
                  title="Power"
                >
                  x<sup className="text-[10px]">□</sup>
                </button>
                <button
                  type="button"
                  onClick={insertSubscript}
                  className="min-h-[44px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-[#F8F9FA] text-zinc-900 font-serif text-sm cursor-pointer"
                  title="Subscript"
                >
                  x<sub className="text-[10px]">□</sub>
                </button>
                <button
                  type="button"
                  onClick={() => insertSqrt(false)}
                  className="min-h-[44px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-[#F8F9FA] text-zinc-900 font-serif text-sm cursor-pointer"
                  title="Square root"
                >
                  √□
                </button>
                <button
                  type="button"
                  onClick={() => insertDelim('paren')}
                  className="min-h-[44px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-[#F8F9FA] text-zinc-900 font-serif text-sm cursor-pointer"
                  title="Auto-sizing parentheses"
                >
                  (□)
                </button>
                <button
                  type="button"
                  onClick={() => insertSymbol({ display: '°', title: 'Degree', latex: '^\\circ' })}
                  className="min-h-[44px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-[#F8F9FA] text-zinc-900 font-serif text-base cursor-pointer"
                  title="Degree"
                >
                  °
                </button>
              </div>

              {/* Variables Row */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                {['x', 'y', 'z', 'a', 'b', 'c', 'n', 't'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertNodesAtCursor([{ id: mathUid(), type: 'char', value: v }])}
                    className="min-h-[42px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-white text-zinc-900 font-paper-serif italic text-base cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => insertSymbol({ display: 'θ', title: 'Theta', latex: '\\theta' })}
                  className="min-h-[42px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-white text-zinc-900 font-serif text-base cursor-pointer"
                >
                  θ
                </button>
                <button
                  type="button"
                  onClick={() => insertSymbol({ display: 'π', title: 'Pi', latex: '\\pi' })}
                  className="min-h-[42px] flex items-center justify-center border border-zinc-200 hover:border-zinc-900 active:bg-zinc-100 rounded-lg bg-white text-zinc-900 font-serif text-base cursor-pointer"
                >
                  π
                </button>
              </div>

              {/* Numeric + Operator Pad */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: '7', action: () => insertCharSmart('7') },
                  { label: '8', action: () => insertCharSmart('8') },
                  { label: '9', action: () => insertCharSmart('9') },
                  {
                    label: '÷',
                    action: () =>
                      insertSymbol({ display: '÷', title: 'Divide', latex: '\\div' }),
                    op: true,
                  },
                  {
                    label: '×',
                    action: () =>
                      insertSymbol({ display: '×', title: 'Multiply', latex: '\\times' }),
                    op: true,
                  },
                  { label: '4', action: () => insertCharSmart('4') },
                  { label: '5', action: () => insertCharSmart('5') },
                  { label: '6', action: () => insertCharSmart('6') },
                  { label: '+', action: () => insertCharSmart('+'), op: true },
                  { label: '−', action: () => insertCharSmart('-'), op: true },
                  { label: '1', action: () => insertCharSmart('1') },
                  { label: '2', action: () => insertCharSmart('2') },
                  { label: '3', action: () => insertCharSmart('3') },
                  { label: '=', action: () => insertCharSmart('='), op: true },
                  {
                    label: '±',
                    action: () =>
                      insertSymbol({ display: '±', title: 'Plus-minus', latex: '\\pm' }),
                    op: true,
                  },
                  { label: '0', action: () => insertCharSmart('0') },
                  { label: '.', action: () => insertCharSmart('.') },
                  { label: ',', action: () => insertCharSmart(',') },
                  {
                    label: 'Space',
                    action: () => insertNodesAtCursor([{ id: mathUid(), type: 'char', value: ' ' }]),
                    op: true,
                  },
                  {
                    label: '≤',
                    action: () => insertSymbol({ display: '≤', title: 'Less or equal', latex: '\\le' }),
                    op: true,
                  },
                ].map((key) => (
                  <button
                    key={key.label}
                    type="button"
                    onClick={key.action}
                    className={`min-h-[44px] flex items-center justify-center rounded-lg border font-medium transition-colors active:scale-[0.97] cursor-pointer ${
                      key.op
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-900 text-sm hover:border-zinc-900'
                        : 'bg-white border-zinc-200 text-zinc-950 text-base font-mono-num hover:border-zinc-900'
                    }`}
                  >
                    {key.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CORE STRUCTURES, BRACKETS & ACCENTS */}
          {paletteTab === 'structures' && (
            <div className="space-y-3.5">
              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Fractions, Powers &amp; Roots
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { label: 'Fraction', latex: '\\frac{a}{b}', onClick: insertFraction },
                    { label: 'Power', latex: 'x^{2}', onClick: insertPower },
                    { label: 'Subscript', latex: 'x_{n}', onClick: insertSubscript },
                    { label: 'Sub & Power', latex: 'x_{n}^{m}', onClick: insertSubSup },
                    { label: 'Square Root', latex: '\\sqrt{x}', onClick: () => insertSqrt(false) },
                    { label: 'nth Root', latex: '\\sqrt[n]{x}', onClick: () => insertSqrt(true) },
                    { label: 'Binomial nCr', latex: '\\binom{n}{r}', onClick: insertBinom },
                    {
                      label: '10 Power',
                      latex: '\\times 10^{n}',
                      onClick: () => {
                        const supId = mathUid();
                        insertNodesAtCursor(
                          [
                            { id: mathUid(), type: 'symbol', latex: '\\times', display: '×' },
                            { id: mathUid(), type: 'char', value: '1' },
                            { id: mathUid(), type: 'char', value: '0' },
                            { id: supId, type: 'sup', content: [] },
                          ],
                          { nodeId: supId, slot: 'content' }
                        );
                      },
                    },
                    {
                      label: 'Squared',
                      latex: 'x^{2}',
                      onClick: () =>
                        insertNodesAtCursor([
                          {
                            id: mathUid(),
                            type: 'sup',
                            content: [{ id: mathUid(), type: 'char', value: '2' }],
                          },
                        ]),
                    },
                    {
                      label: 'Cubed',
                      latex: 'x^{3}',
                      onClick: () =>
                        insertNodesAtCursor([
                          {
                            id: mathUid(),
                            type: 'sup',
                            content: [{ id: mathUid(), type: 'char', value: '3' }],
                          },
                        ]),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="min-h-[58px] flex flex-col items-center justify-center py-2 px-1.5 border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                    >
                      <KatexPreviewInline latex={item.latex} className="text-sm" />
                      <span className="text-[10px] text-zinc-500 mt-1 whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Auto-Sizing Brackets &amp; Absolute Value
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(
                    [
                      { style: 'paren', label: '( )', latex: '\\left(x\\right)' },
                      { style: 'bracket', label: '[ ]', latex: '\\left[x\\right]' },
                      { style: 'brace', label: '{ }', latex: '\\left\\{x\\right\\}' },
                      { style: 'abs', label: '|x|', latex: '\\left|x\\right|' },
                      { style: 'norm', label: '‖x‖', latex: '\\left\\|x\\right\\|' },
                      { style: 'floor', label: 'Floor', latex: '\\left\\lfloor x\\right\\rfloor' },
                      { style: 'ceil', label: 'Ceil', latex: '\\left\\lceil x\\right\\rceil' },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.style}
                      type="button"
                      onClick={() => insertDelim(b.style)}
                      className="min-h-[52px] flex flex-col items-center justify-center py-1.5 px-1 border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                    >
                      <KatexPreviewInline latex={b.latex} className="text-xs" />
                      <span className="text-[10px] text-zinc-500 mt-0.5">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Vectors, Bars &amp; Accents
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {(
                    [
                      { kind: 'vec', label: 'Vector', latex: '\\vec{A}' },
                      { kind: 'overrightarrow', label: 'Ray AB', latex: '\\overrightarrow{AB}' },
                      { kind: 'bar', label: 'Mean', latex: '\\bar{x}' },
                      { kind: 'overline', label: 'Line / Bar', latex: '\\overline{AB}' },
                      { kind: 'hat', label: 'Unit Vec', latex: '\\hat{i}' },
                      { kind: 'widehat', label: 'Angle Hat', latex: '\\widehat{ABC}' },
                      { kind: 'dot', label: 'Dot', latex: '\\dot{x}' },
                      { kind: 'underline', label: 'Underline', latex: '\\underline{x}' },
                    ] as const
                  ).map((acc) => (
                    <button
                      key={acc.kind}
                      type="button"
                      onClick={() => insertAccent(acc.kind)}
                      className="min-h-[52px] flex flex-col items-center justify-center py-1.5 px-1 border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                    >
                      <KatexPreviewInline latex={acc.latex} className="text-xs" />
                      <span className="text-[10px] text-zinc-500 mt-0.5 whitespace-nowrap">
                        {acc.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRIG, LOG & CALCULUS */}
          {paletteTab === 'calc' && (
            <div className="space-y-3.5">
              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Calculus, Integrals &amp; Series
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    {
                      label: 'Def. Integral',
                      latex: '\\int_{a}^{b}',
                      onClick: () => insertBigOp('\\int', '∫', true),
                    },
                    {
                      label: 'Indef. Integral',
                      latex: '\\int',
                      onClick: () => insertBigOp('\\int', '∫', false),
                    },
                    {
                      label: 'Double Int.',
                      latex: '\\iint',
                      onClick: () => insertBigOp('\\iint', '∬', false),
                    },
                    {
                      label: 'Summation',
                      latex: '\\sum_{i=1}^{n}',
                      onClick: () => insertBigOp('\\sum', '∑', true),
                    },
                    {
                      label: 'Product',
                      latex: '\\prod_{i=1}^{n}',
                      onClick: () => insertBigOp('\\prod', '∏', true),
                    },
                    {
                      label: 'Limit',
                      latex: '\\lim_{x \\to 0}',
                      onClick: () => insertBigOp('\\lim', 'lim', false),
                    },
                    {
                      label: 'd/dx',
                      latex: '\\frac{d}{dx}',
                      onClick: () => insertQuickFormula('\\frac{d}{dx}'),
                    },
                    {
                      label: 'dy/dx',
                      latex: '\\frac{dy}{dx}',
                      onClick: () => insertQuickFormula('\\frac{dy}{dx}'),
                    },
                    {
                      label: '2nd Deriv.',
                      latex: '\\frac{d^{2}y}{dx^{2}}',
                      onClick: () => insertQuickFormula('\\frac{d^{2}y}{dx^{2}}'),
                    },
                    {
                      label: 'Partial ∂/∂x',
                      latex: '\\frac{\\partial}{\\partial x}',
                      onClick: () => insertQuickFormula('\\frac{\\partial}{\\partial x}'),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="min-h-[58px] flex flex-col items-center justify-center py-2 px-1.5 border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                    >
                      <KatexPreviewInline latex={item.latex} className="text-xs" />
                      <span className="text-[10px] text-zinc-500 mt-1 whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Trigonometry &amp; Logarithms
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {TRIG_FUNC_ITEMS.map((fn) => (
                    <button
                      key={fn.label}
                      type="button"
                      title={fn.title}
                      onClick={() => insertQuickFormula(fn.latex)}
                      className="min-h-[42px] px-2 text-xs font-serif font-medium border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                    >
                      {fn.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    title="Log with custom base"
                    onClick={() => {
                      const subId = mathUid();
                      insertNodesAtCursor(
                        [
                          { id: mathUid(), type: 'symbol', latex: '\\log', display: 'log' },
                          { id: subId, type: 'sub', content: [] },
                        ],
                        { nodeId: subId, slot: 'content' }
                      );
                    }}
                    className="min-h-[42px] px-2 text-xs font-serif font-medium border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                  >
                    log<sub>a</sub>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MATRICES, DETERMINANTS & PIECEWISE SYSTEMS */}
          {paletteTab === 'matrices' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Insert a matrix, determinant, or system of equations. Once inserted, tap any cell to
                edit or use the <strong>Matrix Size</strong> bar above to add/remove rows and
                columns.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    label: '2×2 Matrix ( )',
                    latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
                    onClick: () => insertMatrix('pmatrix', 2, 2),
                  },
                  {
                    label: '3×3 Matrix ( )',
                    latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}',
                    onClick: () => insertMatrix('pmatrix', 3, 3),
                  },
                  {
                    label: '2×2 Bracket [ ]',
                    latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
                    onClick: () => insertMatrix('bmatrix', 2, 2),
                  },
                  {
                    label: '3×3 Bracket [ ]',
                    latex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}',
                    onClick: () => insertMatrix('bmatrix', 3, 3),
                  },
                  {
                    label: '2×2 Determinant',
                    latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
                    onClick: () => insertMatrix('vmatrix', 2, 2),
                  },
                  {
                    label: '3×3 Determinant',
                    latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}',
                    onClick: () => insertMatrix('vmatrix', 3, 3),
                  },
                  {
                    label: 'Column Vector 2×1',
                    latex: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}',
                    onClick: () => insertMatrix('pmatrix', 2, 1),
                  },
                  {
                    label: 'Piecewise (2 rows)',
                    latex: '\\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}',
                    onClick: () => insertMatrix('cases', 2, 2),
                  },
                  {
                    label: 'Piecewise (3 rows)',
                    latex: '\\begin{cases} a & x < 0 \\\\ b & x = 0 \\\\ c & x > 0 \\end{cases}',
                    onClick: () => insertMatrix('cases', 3, 2),
                  },
                ].map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={m.onClick}
                    className="min-h-[76px] flex flex-col items-center justify-center p-2 border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                  >
                    <KatexPreviewInline latex={m.latex} className="text-[11px]" />
                    <span className="text-[11px] font-medium text-zinc-600 mt-1.5">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYMBOLS, GEOMETRY, SETS & GREEK */}
          {paletteTab === 'symbols' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symbols (e.g. angle, alpha, subset, integral, degree...)"
                  className="w-full text-sm sm:text-xs pl-8 pr-3 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              {[
                { title: 'Operators & Relations', items: filterSym(OPERATOR_SYMBOLS) },
                { title: 'Geometry, Sets & Logic', items: filterSym(GEOMETRY_SET_SYMBOLS) },
                { title: 'Greek Letters (Lowercase)', items: filterSym(GREEK_LOWER_SYMBOLS) },
                { title: 'Greek Letters (Uppercase)', items: filterSym(GREEK_UPPER_SYMBOLS) },
              ].map(
                (group) =>
                  group.items.length > 0 && (
                    <div key={group.title}>
                      <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                        {group.title}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((sym) => (
                          <button
                            key={`${group.title}-${sym.title}`}
                            type="button"
                            title={sym.title}
                            onClick={() => insertSymbol(sym)}
                            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-base sm:text-sm font-serif border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-lg bg-white text-zinc-900 transition-colors cursor-pointer"
                          >
                            {sym.display}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}

          {/* TAB 6: CHEMISTRY, REACTIONS & NUCLEAR */}
          {paletteTab === 'chemistry' && (
            <div className="space-y-3.5">
              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Reaction Arrows &amp; Nuclear Notation
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertChemArrow('right', '\\Delta', false)}
                    className="min-h-[46px] px-2.5 py-2 text-xs font-medium border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KatexPreviewInline latex="\\xrightarrow{\\Delta}" />
                    <span>Heat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertChemArrow('right', '', false)}
                    className="min-h-[46px] px-2.5 py-2 text-xs font-medium border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KatexPreviewInline latex="\\xrightarrow{\\text{cat}}" />
                    <span>Top Label</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertChemArrow('right', '', true)}
                    className="min-h-[46px] px-2.5 py-2 text-xs font-medium border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KatexPreviewInline latex="\\xrightarrow[\\text{P}]{\\text{T}}" />
                    <span>Top &amp; Bottom</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertChemArrow('eq', '', false)}
                    className="min-h-[46px] px-2.5 py-2 text-xs font-medium border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KatexPreviewInline latex="\\xrightleftharpoons{\\Delta}" />
                    <span>Equilibrium</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertChemArrow('eq', '', true)}
                    className="min-h-[46px] px-2.5 py-2 text-xs font-medium border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KatexPreviewInline latex="\\xrightleftharpoons[\\text{P}]{\\text{Fe}}" />
                    <span>Eq. 2-Label</span>
                  </button>
                  <button
                    type="button"
                    onClick={insertIsotope}
                    className="min-h-[46px] px-2.5 py-2 text-xs font-medium border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KatexPreviewInline latex="{}_{Z}^{A}\\text{X}" />
                    <span>Isotope</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Common Compounds, Ions &amp; SI Units
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CHEM_QUICK_ITEMS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      title={item.title}
                      onClick={() => insertQuickFormula(item.latex)}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-medium border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-lg bg-white text-zinc-800 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: READY-MADE FORMULA LIBRARY + RECENTLY USED */}
          {paletteTab === 'formulas' && (
            <div className="space-y-3">
              {recentEquations.length > 0 && (
                <div>
                  <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                    Recently Used Equations
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {recentEquations.map((eq, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => insertQuickFormula(eq)}
                        className="min-h-[40px] px-3 py-1.5 border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white text-zinc-900 whitespace-nowrap shrink-0 cursor-pointer text-xs"
                      >
                        <KatexPreviewInline latex={eq} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search formulas (quadratic, ohm, ph, lens, haber...)"
                    className="w-full text-sm sm:text-xs pl-8 pr-3 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {['All', 'Physics', 'Chemistry', 'Biology', 'Algebra', 'Geometry & Trig', 'Calculus'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormulaCategory(cat)}
                        className={`px-2.5 min-h-[34px] text-xs rounded-md border whitespace-nowrap shrink-0 cursor-pointer ${
                          formulaCategory === cat
                            ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredFormulas.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => insertQuickFormula(preset.latex)}
                    className="p-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-lg bg-white transition-colors cursor-pointer space-y-1.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 truncate">
                        {preset.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 shrink-0">{preset.category}</span>
                    </div>
                    <div className="overflow-x-auto text-sm text-zinc-950 py-0.5">
                      <KatexPreviewInline latex={preset.latex} />
                    </div>
                  </button>
                ))}
                {filteredFormulas.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs text-zinc-400">
                    No formulas matched &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-4 sm:px-5 py-3 pb-safe bg-[#FAFAFB] border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={displayMode}
                onChange={(e) => setDisplayMode(e.target.checked)}
                className="w-4 h-4 accent-zinc-900"
              />
              <span className="whitespace-nowrap">{uiLang === 'bn' ? 'আলাদা লাইনে' : 'Own line'}</span>
            </label>
            {isEditing && onDeleteEquation && (
              <button
                type="button"
                onClick={onDeleteEquation}
                className="min-h-[36px] px-1 text-xs font-medium text-red-600 hover:underline cursor-pointer"
              >
                {t.eqDelete}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-3.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
            >
              {t.eqCancel}
            </button>
            <button
              type="button"
              disabled={!liveLatex}
              onClick={handleConfirm}
              className="min-h-[40px] px-4 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
            >
              {isEditing ? t.eqSave : t.eqInsert}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
