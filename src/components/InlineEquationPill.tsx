import React, { useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import { Check, Sparkles, X } from 'lucide-react';
import { convertWordLinearOnSpace, finalizeWordLinearToLatex } from '../utils/unicodeMath';

interface InlineEquationPillProps {
  initialLatex?: string;
  placeholder?: string;
  insertLabel?: string;
  cancelLabel?: string;
  onCommit: (latex: string) => void;
  onCancel: () => void;
}

const QUICK_CHIPS = [
  { label: 'a/b', insert: '\\frac{}{}' },
  { label: 'x²', insert: '^{2}' },
  { label: 'xₙ', insert: '_{}' },
  { label: '√x', insert: '\\sqrt{}' },
  { label: 'θ', insert: '\\theta' },
  { label: 'π', insert: '\\pi' },
  { label: '°', insert: '^\\circ' },
  { label: '×', insert: '\\times' },
  { label: '→', insert: '\\rightarrow' },
];

export const InlineEquationPill: React.FC<InlineEquationPillProps> = ({
  initialLatex = '',
  placeholder = 'Type a/b, x^2, \\theta + Space...',
  insertLabel = 'Insert',
  cancelLabel = 'Cancel',
  onCommit,
  onCancel,
}) => {
  const [text, setText] = useState(initialLatex);
  const [showLinear, setShowLinear] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const previewLatex = useMemo(() => finalizeWordLinearToLatex(text), [text]);
  const previewHtml = useMemo(() => {
    if (!previewLatex) return '';
    try {
      return katex.renderToString(previewLatex, {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return '';
    }
  }, [previewLatex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl + = toggles Professional preview focus / linear edit (Word shortcut)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === '=') {
      e.preventDefault();
      setShowLinear(false);
      return;
    }
    // Ctrl + Shift + = switches back to Linear format (Word shortcut)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      setShowLinear(true);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const finalLatex = finalizeWordLinearToLatex(text);
      if (finalLatex) onCommit(finalLatex);
      else onCancel();
      return;
    }

    // Spacebar auto-conversion (Microsoft Word UnicodeMath style)
    if (e.key === ' ') {
      const el = inputRef.current;
      if (!el) return;
      const pos = el.selectionStart ?? text.length;
      const before = text.slice(0, pos);
      const after = text.slice(pos);
      const converted = convertWordLinearOnSpace(before);
      if (converted !== null) {
        e.preventDefault();
        const nextVal = converted + ' ' + after;
        setText(nextVal);
        const nextPos = converted.length + 1;
        window.requestAnimationFrame(() => {
          el.setSelectionRange(nextPos, nextPos);
        });
      }
    }
  };

  const insertSnippet = (snippet: string) => {
    const el = inputRef.current;
    if (!el) {
      setText((prev) => prev + snippet);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + snippet + text.slice(end);
    setText(next);
    const bracePos = snippet.indexOf('{}');
    const cursorPos = bracePos !== -1 ? start + bracePos + 1 : start + snippet.length;
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="mt-1.5 p-2.5 rounded-lg border-2 border-[#0F4C81] bg-[#F8FBFF] shadow-sm space-y-2 z-20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F4C81]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Word Equation (Alt+=)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowLinear((v) => !v)}
            className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded cursor-pointer"
            title="Ctrl+= / Ctrl+Shift+="
          >
            {showLinear ? 'Linear' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel}
            className="p-0.5 text-zinc-400 hover:text-zinc-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {showLinear ? (
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-sm font-mono px-2.5 py-1.5 bg-white border border-zinc-300 rounded focus:border-[#0F4C81] focus:outline-none text-zinc-900"
          />
        ) : (
          <div
            onClick={() => setShowLinear(true)}
            className="flex-1 min-h-[34px] px-2.5 py-1 bg-white border border-zinc-300 rounded flex items-center cursor-text"
            title="Click or press Ctrl+Shift+= to edit linear text"
          >
            {previewHtml ? (
              <span dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <span className="text-xs text-zinc-400">{placeholder}</span>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!previewLatex}
          onClick={() => {
            if (previewLatex) onCommit(previewLatex);
          }}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] disabled:opacity-40 rounded cursor-pointer shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{insertLabel}</span>
        </button>
      </div>

      {/* Live Professional Preview when typing linear */}
      {showLinear && previewHtml && (
        <div className="px-2.5 py-1.5 bg-white border border-zinc-200 rounded flex items-center gap-2 text-sm overflow-x-auto">
          <span className="text-[10px] uppercase tracking-wide text-zinc-400 shrink-0">Preview:</span>
          <span dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      {/* Quick 1-tap snippets */}
      <div className="flex items-center gap-1 flex-wrap">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertSnippet(c.insert)}
            className="px-2 py-0.5 text-xs font-serif bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 rounded transition-colors cursor-pointer"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
