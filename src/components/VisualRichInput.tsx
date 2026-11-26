import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { tokenizeMathText } from '../utils/formatters';
import { convertProseMathOnSpace } from '../utils/unicodeMath';
import { InlineEquationPill } from './InlineEquationPill';

export interface ActiveMathTarget {
  insertMath: (latex: string, display: boolean) => void;
  updateChip: (chipIndex: number, latex: string, display: boolean) => void;
  deleteChip: (chipIndex: number) => void;
}

export interface MathEditRequest {
  latex: string;
  display: boolean;
  chipIndex: number;
  target: ActiveMathTarget;
}

interface VisualRichInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  onFocusTarget?: (target: ActiveMathTarget) => void;
  onEditChip?: (req: MathEditRequest) => void;
}

function createChipElement(latex: string, display: boolean, chipIndex: number): HTMLSpanElement {
  const span = document.createElement('span');
  span.contentEditable = 'false';
  span.dataset.mathChip = 'true';
  span.dataset.latex = latex;
  span.dataset.display = display ? '1' : '0';
  span.dataset.chipIndex = String(chipIndex);
  span.title = 'Click to edit equation';
  span.className =
    'inline-flex items-center align-baseline mx-0.5 px-2 py-0.5 rounded border border-zinc-200 bg-[#F4F6F8] hover:border-[#0F4C81] hover:bg-[#EBF2F9] active:bg-[#DCEBFA] text-zinc-950 cursor-pointer select-none transition-colors';

  try {
    span.innerHTML = katex.renderToString(latex, {
      displayMode: false,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    span.textContent = latex;
  }
  return span;
}

function renderTokensToDom(container: HTMLElement, value: string) {
  container.innerHTML = '';
  const tokens = tokenizeMathText(value);
  let chipCounter = 0;

  for (const tok of tokens) {
    if (tok.type === 'math') {
      container.appendChild(createChipElement(tok.latex, tok.display, chipCounter++));
    } else {
      const lines = tok.value.split('\n');
      lines.forEach((line, idx) => {
        if (idx > 0) {
          container.appendChild(document.createElement('br'));
        }
        if (line.length > 0) {
          container.appendChild(document.createTextNode(line));
        }
      });
    }
  }
}

function serializeDom(container: HTMLElement): string {
  let out = '';

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += (node.textContent ?? '').replace(/\u00A0/g, ' ');
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    if (el.dataset.mathChip === 'true') {
      const latex = el.dataset.latex ?? '';
      const display = el.dataset.display === '1';
      out += display ? `$$${latex}$$` : `$${latex}$`;
      return;
    }

    if (el.tagName === 'BR') {
      out += '\n';
      return;
    }

    const isBlock = el.tagName === 'DIV' || el.tagName === 'P';
    if (isBlock && out.length > 0 && !out.endsWith('\n')) {
      out += '\n';
    }
    for (const child of Array.from(el.childNodes)) {
      walk(child);
    }
  };

  for (const child of Array.from(container.childNodes)) {
    walk(child);
  }

  return out;
}

function reindexChips(container: HTMLElement) {
  const chips = container.querySelectorAll<HTMLElement>('[data-math-chip="true"]');
  chips.forEach((chip, idx) => {
    chip.dataset.chipIndex = String(idx);
  });
}

export const VisualRichInput: React.FC<VisualRichInputProps> = ({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 2,
  className = '',
  onFocusTarget,
  onEditChip,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isComposingRef = useRef(false);
  const [inlineEqOpen, setInlineEqOpen] = useState(false);

  // Sync DOM only when external value changes (not during user's own typing)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (lastEmittedRef.current === value) return;
    renderTokensToDom(el, value);
    lastEmittedRef.current = value;
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    reindexChips(el);
    const serialized = serializeDom(el);
    lastEmittedRef.current = serialized;
    onChange(serialized);
  };

  const saveSelection = () => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const targetApiRef = useRef<ActiveMathTarget>({
    insertMath: () => {},
    updateChip: () => {},
    deleteChip: () => {},
  });

  targetApiRef.current = {
    insertMath: (latex: string, display: boolean) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();

      const chip = createChipElement(latex, display, 0);
      const spacer = document.createTextNode(' ');

      const sel = window.getSelection();
      let range = savedRangeRef.current;
      if (!range || !el.contains(range.commonAncestorContainer)) {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
      }

      range.deleteContents();
      range.insertNode(spacer);
      range.insertNode(chip);

      const afterRange = document.createRange();
      afterRange.setStartAfter(spacer);
      afterRange.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(afterRange);
      savedRangeRef.current = afterRange.cloneRange();

      emitChange();
    },
    updateChip: (chipIndex: number, latex: string, display: boolean) => {
      const el = editorRef.current;
      if (!el) return;
      const chips = el.querySelectorAll<HTMLElement>('[data-math-chip="true"]');
      const oldChip = chips[chipIndex];
      if (!oldChip) return;
      const nextChip = createChipElement(latex, display, chipIndex);
      oldChip.replaceWith(nextChip);
      emitChange();
    },
    deleteChip: (chipIndex: number) => {
      const el = editorRef.current;
      if (!el) return;
      const chips = el.querySelectorAll<HTMLElement>('[data-math-chip="true"]');
      const oldChip = chips[chipIndex];
      if (!oldChip) return;
      oldChip.remove();
      emitChange();
    },
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const chip = target.closest<HTMLElement>('[data-math-chip="true"]');
    if (chip && onEditChip) {
      e.preventDefault();
      e.stopPropagation();
      const latex = chip.dataset.latex ?? '';
      const display = chip.dataset.display === '1';
      const chipIndex = Number(chip.dataset.chipIndex ?? '0');
      onEditChip({
        latex,
        display,
        chipIndex,
        target: targetApiRef.current,
      });
      return;
    }
    saveSelection();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Microsoft Word shortcut: Alt + = opens inline equation pill at caret
    if (e.altKey && (e.key === '=' || e.code === 'Equal')) {
      e.preventDefault();
      saveSelection();
      setInlineEqOpen(true);
      return;
    }

    // Direct inline equation typing in prose: Spacebar auto-converts x^2, H_2, 1/2, \theta, \sqrt(x), ->, >=
    if (
      e.key === ' ' &&
      !isComposingRef.current &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      const sel = window.getSelection();
      const el = editorRef.current;
      if (sel && el && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = range.startContainer as Text;
          const fullText = textNode.textContent ?? '';
          const offset = range.startOffset;
          const before = fullText.slice(0, offset);
          const match = convertProseMathOnSpace(before);
          if (match) {
            e.preventDefault();
            const prefix = fullText.slice(0, offset - match.consumedChars);
            const suffix = fullText.slice(offset);
            const parent = textNode.parentNode;
            if (parent) {
              const chip = createChipElement(match.latex, false, 0);
              const spacer = document.createTextNode(' ' + suffix);
              textNode.textContent = prefix;
              parent.insertBefore(chip, textNode.nextSibling);
              parent.insertBefore(spacer, chip.nextSibling);

              const nextRange = document.createRange();
              nextRange.setStart(spacer, 1);
              nextRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(nextRange);
              savedRangeRef.current = nextRange.cloneRange();
              emitChange();
              return;
            }
          }
        }
      }
    }

    // Direct inline $...$ closing delimiter
    if (
      e.key === '$' &&
      !isComposingRef.current &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      const sel = window.getSelection();
      const el = editorRef.current;
      if (sel && el && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = range.startContainer as Text;
          const fullText = textNode.textContent ?? '';
          const offset = range.startOffset;
          const before = fullText.slice(0, offset);
          const dollarIdx = before.lastIndexOf('$');
          if (dollarIdx !== -1 && (dollarIdx === 0 || before[dollarIdx - 1] !== '$')) {
            const latex = before.slice(dollarIdx + 1).trim();
            if (latex.length > 0) {
              e.preventDefault();
              const prefix = fullText.slice(0, dollarIdx);
              const suffix = fullText.slice(offset);
              const parent = textNode.parentNode;
              if (parent) {
                const chip = createChipElement(latex, false, 0);
                const spacer = document.createTextNode(suffix.startsWith(' ') ? suffix : ' ' + suffix);
                textNode.textContent = prefix;
                parent.insertBefore(chip, textNode.nextSibling);
                parent.insertBefore(spacer, chip.nextSibling);

                const nextRange = document.createRange();
                nextRange.setStart(spacer, 1);
                nextRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(nextRange);
                savedRangeRef.current = nextRange.cloneRange();
                emitChange();
                return;
              }
            }
          }
        }
      }
    }

    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plain = e.clipboardData.getData('text/plain');
    const clean = multiline ? plain : plain.replace(/\r?\n/g, ' ');
    document.execCommand('insertText', false, clean);
  };

  const minHeightPx = multiline ? Math.max(48, rows * 24 + 14) : 34;

  return (
    <div className="relative w-full">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={multiline}
        onFocus={() => {
          saveSelection();
          onFocusTarget?.(targetApiRef.current);
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onTouchEnd={saveSelection}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          emitChange();
        }}
        onInput={() => {
          if (!isComposingRef.current) {
            emitChange();
            saveSelection();
          }
        }}
        style={{ minHeight: `${minHeightPx}px` }}
        className={`w-full text-base sm:text-sm px-2.5 py-2 sm:py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 focus:border-[#0F4C81] focus:outline-none leading-relaxed break-words whitespace-pre-wrap ${className}`}
      />
      {!value && placeholder && (
        <span className="pointer-events-none absolute left-2.5 top-2 sm:top-1.5 text-sm text-zinc-400 select-none truncate right-2.5">
          {placeholder}
        </span>
      )}
      {inlineEqOpen && (
        <InlineEquationPill
          onCommit={(latex) => {
            setInlineEqOpen(false);
            targetApiRef.current.insertMath(latex, false);
          }}
          onCancel={() => {
            setInlineEqOpen(false);
            editorRef.current?.focus();
          }}
        />
      )}
    </div>
  );
};
