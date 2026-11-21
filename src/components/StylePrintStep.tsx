import React from 'react';
import { Columns2, Download, Loader2, Minus, Plus, Printer, Rows2 } from 'lucide-react';
import { ExamPaper, PaperSettings } from '../types/paper';
import {
  calculateTotalMarks,
  countNumberedQuestions,
  parseNumericMarks,
} from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';

interface StylePrintStepProps {
  paper: ExamPaper;
  isExporting: boolean;
  onChangeSettings: (patch: Partial<PaperSettings>) => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
}

export const StylePrintStep: React.FC<StylePrintStepProps> = ({
  paper,
  isExporting,
  onChangeSettings,
  onDownloadPdf,
  onPrint,
}) => {
  const { settings, header, questions } = paper;
  const hasMcqs = questions.some((q) => q.type === 'mcq');
  const qCount = countNumberedQuestions(questions);
  const talliedMarks = calculateTotalMarks(questions);
  const declaredMarks = parseNumericMarks(header.fullMarks);

  const adjustFontSize = (delta: number) => {
    const next = Math.min(15, Math.max(9.5, Number((settings.fontSizePt + delta).toFixed(1))));
    onChangeSettings({ fontSizePt: next });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Style &amp; Print</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Adjust language, page columns, and typography before downloading or printing your A4 PDF.
        </p>
      </div>

      {/* Language Toggle */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-700">
          Paper Language &amp; Numbering
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeSettings({ language: 'bn' })}
            className={`px-3 py-2.5 text-left rounded border transition-colors cursor-pointer ${
              settings.language === 'bn'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
            }`}
          >
            <div className="text-sm font-semibold">বাংলা</div>
            <div
              className={`text-[11px] mt-0.5 ${
                settings.language === 'bn' ? 'text-zinc-300' : 'text-zinc-500'
              }`}
            >
              ১, ২, ৩ · (ক, খ, গ, ঘ) · অথবা
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeSettings({ language: 'en' })}
            className={`px-3 py-2.5 text-left rounded border transition-colors cursor-pointer ${
              settings.language === 'en'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
            }`}
          >
            <div className="text-sm font-semibold">English</div>
            <div
              className={`text-[11px] mt-0.5 ${
                settings.language === 'en' ? 'text-zinc-300' : 'text-zinc-500'
              }`}
            >
              1, 2, 3 · (a, b, c, d) · Or
            </div>
          </button>
        </div>
      </div>

      {/* Column Layout */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-700">Page Layout</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeSettings({ columns: 1 })}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded border transition-colors cursor-pointer ${
              settings.columns === 1
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
            }`}
          >
            <Rows2 className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold">1-Column</div>
              <div
                className={`text-[11px] ${
                  settings.columns === 1 ? 'text-zinc-300' : 'text-zinc-500'
                }`}
              >
                Written &amp; CQ papers
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeSettings({ columns: 2 })}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded border transition-colors cursor-pointer ${
              settings.columns === 2
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
            }`}
          >
            <Columns2 className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold">2-Column</div>
              <div
                className={`text-[11px] ${
                  settings.columns === 2 ? 'text-zinc-300' : 'text-zinc-500'
                }`}
              >
                Board-style MCQ
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Font Style */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-700">Font Style</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeSettings({ fontFamily: 'serif' })}
            className={`px-3 py-2 text-left rounded border transition-colors cursor-pointer ${
              settings.fontFamily === 'serif'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
            }`}
          >
            <div className="text-sm font-paper-serif font-semibold">Serif (Board Classic)</div>
            <div
              className={`text-[11px] ${
                settings.fontFamily === 'serif' ? 'text-zinc-300' : 'text-zinc-500'
              }`}
            >
              Noto Serif Bengali &amp; Source Serif
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeSettings({ fontFamily: 'sans' })}
            className={`px-3 py-2 text-left rounded border transition-colors cursor-pointer ${
              settings.fontFamily === 'sans'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
            }`}
          >
            <div className="text-sm font-paper-sans font-semibold">Sans (Modern Clean)</div>
            <div
              className={`text-[11px] ${
                settings.fontFamily === 'sans' ? 'text-zinc-300' : 'text-zinc-500'
              }`}
            >
              Noto Sans Bengali &amp; Jakarta Sans
            </div>
          </button>
        </div>
      </div>

      {/* Font Size & Line Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700">Font Size</label>
            <span className="text-xs font-mono-num text-zinc-800">{settings.fontSizePt}pt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustFontSize(-0.5)}
              aria-label="Decrease font size"
              className="p-1.5 border border-zinc-200 rounded bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={9.5}
              max={15}
              step={0.5}
              value={settings.fontSizePt}
              onChange={(e) => onChangeSettings({ fontSizePt: Number(e.target.value) })}
              className="flex-1 accent-zinc-900 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => adjustFontSize(0.5)}
              aria-label="Increase font size"
              className="p-1.5 border border-zinc-200 rounded bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-700">Line Spacing</label>
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { label: 'Compact', val: 1.4 },
                { label: 'Normal', val: 1.55 },
                { label: 'Relaxed', val: 1.7 },
              ] as const
            ).map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChangeSettings({ lineHeight: opt.val })}
                className={`py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                  Math.abs(settings.lineHeight - opt.val) < 0.06
                    ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional Answer Key toggle for MCQ papers */}
      {hasMcqs && (
        <div className="pt-2 border-t border-zinc-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showAnswerKey}
              onChange={(e) => onChangeSettings({ showAnswerKey: e.target.checked })}
              className="mt-0.5 accent-zinc-900"
            />
            <div>
              <div className="text-xs font-medium text-zinc-800">
                Include Teacher Answer Key Sheet
              </div>
              <div className="text-[11px] text-zinc-500">
                Appends an Answer Key page at the end and highlights marked answers on the preview.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Print & PDF Download Actions */}
      <div className="pt-4 border-t border-zinc-200 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>
            {qCount} {qCount === 1 ? 'question' : 'questions'} · Tallied marks:{' '}
            <span className="font-mono-num font-semibold text-zinc-900">
              {talliedMarks}
              {declaredMarks !== null ? ` / ${declaredMarks}` : ''}
            </span>
          </span>
          <span className="text-zinc-400">A4 Portrait</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadPdf}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded transition-colors cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Generating PDF...' : 'Download A4 PDF'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={onPrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-900 disabled:opacity-60 rounded transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Directly</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 leading-relaxed">
          <strong>Download A4 PDF</strong> saves a print-ready A4 PDF directly to your device. You can also press <strong>Ctrl + P</strong> (or Cmd + P) anytime to open your browser&apos;s native print dialog.
        </p>

        <PWAInstallButton variant="card" />
      </div>
    </div>
  );
};
