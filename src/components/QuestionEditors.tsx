import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Sigma,
  Table2,
  Trash2,
} from 'lucide-react';
import {
  CQItem,
  Language,
  MCQItem,
  PassageItem,
  QuestionItem,
  SectionItem,
  ShortQuestionItem,
  TableBlockItem,
  TableVariant,
} from '../types/paper';
import {
  createId,
  formatNumber,
  getBoardLabels,
  getOptionLabel,
  getQuestionMarks,
  getRomanLabel,
} from '../utils/formatters';
import { QUICK_INLINE_MATH } from '../data/mathLibrary';
import { ImageAttachmentControl } from './ImageAttachmentControl';
import { RichMathText } from './RichMathText';
import { TableGridEditor } from './TableGridEditor';
import { QuickMathTemplateKey } from './VisualMathModal';
import { ActiveMathTarget, MathEditRequest, VisualRichInput } from './VisualRichInput';

interface QuestionCardEditorProps {
  item: QuestionItem;
  displayNumber: number | null;
  index: number;
  total: number;
  language: Language;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (updated: QuestionItem) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onFocusTarget: (target: ActiveMathTarget) => void;
  onOpenInsertEquation: (template?: QuickMathTemplateKey) => void;
  onQuickInsertLatex: (latex: string) => void;
  onEditChip: (req: MathEditRequest) => void;
}

function getTypeName(item: QuestionItem): string {
  switch (item.type) {
    case 'section':
      return 'Section';
    case 'cq':
      return 'CQ';
    case 'mcq':
      return item.isMultiStatement ? 'MCQ (i, ii, iii)' : 'MCQ';
    case 'short':
      return 'Short / Desc.';
    case 'passage':
      return 'Passage';
    case 'table':
      return item.variant === 'matching'
        ? 'Matching'
        : item.variant === 'substitution'
        ? 'Substitution'
        : item.variant === 'gap_clues'
        ? 'Gap-Fill'
        : 'Table';
  }
}

function getSummaryText(item: QuestionItem): string {
  switch (item.type) {
    case 'section':
      return item.title || 'Untitled section';
    case 'cq':
      return item.stem || item.subQuestions[0]?.text || 'Empty Creative Question';
    case 'mcq':
      return item.question || 'Empty MCQ';
    case 'short':
      return item.prompt || 'Empty question';
    case 'passage':
      return item.title || item.passage || 'Empty passage';
    case 'table':
      return item.prompt || 'Table block';
  }
}

export const QuestionItemEditor: React.FC<QuestionCardEditorProps> = ({
  item,
  displayNumber,
  index,
  total,
  language,
  isExpanded,
  onToggleExpand,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
  onFocusTarget,
  onOpenInsertEquation,
  onQuickInsertLatex,
  onEditChip,
}) => {
  const marks = getQuestionMarks(item);
  const labels = getBoardLabels(language);

  return (
    <div
      className={`border-b border-zinc-200 transition-colors ${
        isExpanded ? 'bg-white' : 'bg-[#FAFAFB]/50 hover:bg-zinc-50'
      }`}
    >
      {/* Clean One-Line Summary Header */}
      <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 sm:py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-2 min-w-0 flex-1 min-h-[38px] sm:min-h-0 text-left cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          )}

          <div className="flex items-baseline gap-2 min-w-0 flex-1 text-xs">
            {displayNumber !== null && (
              <span className="font-mono-num font-semibold text-zinc-900 shrink-0">
                {formatNumber(displayNumber, language)}.
              </span>
            )}
            <span className="font-semibold text-zinc-700 whitespace-nowrap shrink-0">
              {getTypeName(item)}
            </span>
            {!isExpanded && (
              <>
                <span className="text-zinc-300 shrink-0" aria-hidden="true">·</span>
                <span className="text-zinc-600 truncate block flex-1 min-w-0">
                  <RichMathText text={getSummaryText(item)} inline />
                </span>
              </>
            )}
            {item.type !== 'section' && (
              <>
                <span className="text-zinc-300 shrink-0" aria-hidden="true">·</span>
                <span className="font-mono-num text-zinc-500 whitespace-nowrap shrink-0">
                  {marks} {marks === 1 ? 'mark' : 'marks'}
                </span>
              </>
            )}
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            title="Move up"
            className="min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-25 rounded transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
            title="Move down"
            className="min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-25 rounded transition-colors cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            title="Duplicate"
            className="min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-900 rounded transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            title="Delete"
            className="min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Active Editor */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4">
          {/* Active Question Action Strip: 1-Tap Quick Math + Visual Equation Builder */}
          {item.type !== 'section' && (
            <div className="py-2 border-y border-zinc-100 space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onOpenInsertEquation()}
                  className="inline-flex items-center gap-1.5 px-2.5 min-h-[34px] text-xs font-semibold text-[#0F4C81] bg-[#F0F6FC] hover:bg-[#E2EFFA] border border-[#0F4C81]/25 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sigma className="w-3.5 h-3.5" />
                  <span>Equation Builder</span>
                </button>

                <span className="h-4 w-px bg-zinc-200 shrink-0 mx-0.5" aria-hidden="true" />

                {QUICK_INLINE_MATH.map((qm) => (
                  <button
                    key={qm.id}
                    type="button"
                    title={qm.title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (qm.instantLatex) {
                        onQuickInsertLatex(qm.instantLatex);
                      } else if (qm.templateKey) {
                        onOpenInsertEquation(qm.templateKey);
                      }
                    }}
                    className="min-w-[34px] min-h-[34px] px-2 text-xs font-serif font-medium text-zinc-800 bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 hover:border-zinc-900 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {qm.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400">
                Tap any rendered math chip in your text to edit it, or use quick buttons above.
              </p>
            </div>
          )}

          {item.type === 'section' && (
            <SectionEditor item={item} onChange={onChange} />
          )}
          {item.type === 'cq' && (
            <CQEditor
              item={item}
              language={language}
              onChange={onChange}
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
          )}
          {item.type === 'mcq' && (
            <MCQEditor
              item={item}
              language={language}
              labels={labels}
              onChange={onChange}
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
          )}
          {item.type === 'short' && (
            <ShortEditor
              item={item}
              language={language}
              labels={labels}
              onChange={onChange}
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
          )}
          {item.type === 'passage' && (
            <PassageEditor
              item={item}
              language={language}
              onChange={onChange}
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
          )}
          {item.type === 'table' && (
            <TableBlockEditor
              item={item}
              language={language}
              onChange={onChange}
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
          )}
        </div>
      )}
    </div>
  );
};

// 1. Section Header Editor
const SectionEditor: React.FC<{
  item: SectionItem;
  onChange: (next: SectionItem) => void;
}> = ({ item, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <div className="sm:col-span-2">
      <label className="block text-xs font-medium text-zinc-600 mb-1">Section Title</label>
      <input
        type="text"
        value={item.title}
        onChange={(e) => onChange({ ...item, title: e.target.value })}
        placeholder="e.g. ক-বিভাগ: গদ্য / Part A: Reading Test"
        className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">Marks Note</label>
      <input
        type="text"
        value={item.marksNote ?? ''}
        onChange={(e) => onChange({ ...item, marksNote: e.target.value })}
        placeholder="e.g. মান: ৩০ / Marks: 50"
        className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
      />
    </div>
    <div className="sm:col-span-3">
      <label className="block text-xs font-medium text-zinc-600 mb-1">Section Instruction (Optional)</label>
      <input
        type="text"
        value={item.subtitle ?? ''}
        onChange={(e) => onChange({ ...item, subtitle: e.target.value })}
        placeholder="e.g. এ বিভাগ থেকে যেকোনো ২টি প্রশ্নের উত্তর দাও।"
        className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
      />
    </div>
  </div>
);

interface SharedVisualProps {
  onFocusTarget: (target: ActiveMathTarget) => void;
  onEditChip: (req: MathEditRequest) => void;
}

// 2. Creative Question (CQ / সৃজনশীল) Editor
const CQEditor: React.FC<
  {
    item: CQItem;
    language: Language;
    onChange: (next: CQItem) => void;
  } & SharedVisualProps
> = ({ item, language, onChange, onFocusTarget, onEditChip }) => {
  const updateSub = (idx: number, patch: Partial<{ text: string; marks: number }>) => {
    const subQuestions = item.subQuestions.map((sq, i) => (i === idx ? { ...sq, ...patch } : sq));
    onChange({ ...item, subQuestions });
  };

  const addSub = () => {
    onChange({
      ...item,
      subQuestions: [...item.subQuestions, { id: createId('sq'), text: '', marks: 2 }],
    });
  };

  const removeSub = (idx: number) => {
    if (item.subQuestions.length <= 1) return;
    onChange({
      ...item,
      subQuestions: item.subQuestions.filter((_, i) => i !== idx),
    });
  };

  const addStemTable = () => {
    onChange({
      ...item,
      table: {
        showHeader: true,
        bordered: true,
        headers: language === 'bn' ? ['তথ্য', 'মান'] : ['Parameter', 'Value'],
        rows: [
          ['', ''],
          ['', ''],
        ],
        colAligns: ['left', 'center'],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">
          Stem (উদ্দীপক)
        </label>
        <VisualRichInput
          multiline
          rows={3}
          value={item.stem}
          onChange={(stem) => onChange({ ...item, stem })}
          placeholder="Write the stem scenario here. Use 'Equation Builder' above for math or chemistry formulas."
          onFocusTarget={onFocusTarget}
          onEditChip={onEditChip}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ImageAttachmentControl
          image={item.image}
          onChange={(image) => onChange({ ...item, image })}
          label="Attach Stem Diagram"
        />
        {!item.table && (
          <button
            type="button"
            onClick={addStemTable}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 py-1 px-2 border border-dashed border-zinc-300 hover:border-zinc-500 rounded transition-colors cursor-pointer"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Add Stem Data Table</span>
          </button>
        )}
      </div>

      {item.table && (
        <TableGridEditor
          table={item.table}
          onChange={(table) => onChange({ ...item, table })}
          onRemoveTable={() => onChange({ ...item, table: undefined })}
          onFocusTarget={onFocusTarget}
          onEditChip={onEditChip}
        />
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600">
            Sub-Questions ({language === 'bn' ? 'ক, খ, গ, ঘ' : 'a, b, c, d'})
          </span>
          <button
            type="button"
            onClick={addSub}
            className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add part
          </button>
        </div>

        {item.subQuestions.map((sq, idx) => (
          <div key={sq.id} className="flex items-start gap-2">
            <span className="pt-2 text-xs font-semibold text-zinc-700 w-6 shrink-0">
              {getOptionLabel(idx, language)}.
            </span>
            <div className="flex-1 min-w-0">
              <VisualRichInput
                value={sq.text}
                onChange={(text) => updateSub(idx, { text })}
                placeholder={`Sub-question ${getOptionLabel(idx, language)}`}
                onFocusTarget={onFocusTarget}
                onEditChip={onEditChip}
              />
            </div>
            <input
              type="number"
              min={0}
              step={0.5}
              value={sq.marks}
              onChange={(e) => updateSub(idx, { marks: Number(e.target.value) })}
              title="Marks"
              className="w-14 text-sm px-2 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 text-right font-mono-num shrink-0"
            />
            {item.subQuestions.length > 1 && (
              <button
                type="button"
                onClick={() => removeSub(idx)}
                className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer shrink-0"
                title="Remove sub-question"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. MCQ (বহুনির্বাচনি) Editor
const MCQEditor: React.FC<
  {
    item: MCQItem;
    language: Language;
    labels: ReturnType<typeof getBoardLabels>;
    onChange: (next: MCQItem) => void;
  } & SharedVisualProps
> = ({ item, language, labels, onChange, onFocusTarget, onEditChip }) => {
  const [showCommonStem, setShowCommonStem] = useState(Boolean(item.commonStem));

  const toggleMultiStatement = (checked: boolean) => {
    if (checked) {
      onChange({
        ...item,
        isMultiStatement: true,
        statements:
          item.statements && item.statements.length > 0 ? item.statements : ['', '', ''],
        statementPrompt: item.statementPrompt || labels.multiStatementDefaultPrompt,
      });
    } else {
      onChange({ ...item, isMultiStatement: false });
    }
  };

  const applyStandardMultiOptions = () => {
    const std: [string, string, string, string] =
      language === 'bn'
        ? ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii']
        : ['i & ii', 'i & iii', 'ii & iii', 'i, ii & iii'];
    onChange({ ...item, options: std });
  };

  const updateOption = (optIdx: number, val: string) => {
    const nextOpts = [...item.options] as [string, string, string, string];
    nextOpts[optIdx] = val;
    onChange({ ...item, options: nextOpts });
  };

  const updateStatement = (sIdx: number, val: string) => {
    const nextStatements = [...(item.statements ?? ['', '', ''])];
    nextStatements[sIdx] = val;
    onChange({ ...item, statements: nextStatements });
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-zinc-600">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(item.isMultiStatement)}
              onChange={(e) => toggleMultiStatement(e.target.checked)}
              className="accent-zinc-900"
            />
            <span>Multi-statement (i, ii, iii)</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showCommonStem}
              onChange={(e) => {
                setShowCommonStem(e.target.checked);
                if (!e.target.checked) onChange({ ...item, commonStem: '' });
              }}
              className="accent-zinc-900"
            />
            <span>Common Stem</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Marks:</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={item.marks}
            onChange={(e) => onChange({ ...item, marks: Number(e.target.value) })}
            className="w-14 text-xs px-2 py-1 border border-zinc-200 rounded bg-white text-zinc-900 text-right font-mono-num"
          />
        </div>
      </div>

      {showCommonStem && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Common Stem Box (অভিন্ন উদ্দীপক)
          </label>
          <VisualRichInput
            multiline
            rows={2}
            value={item.commonStem ?? ''}
            onChange={(commonStem) => onChange({ ...item, commonStem })}
            placeholder="e.g. নিচের উদ্দীপকটি পড়ো এবং ৫ ও ৬ নং প্রশ্নের উত্তর দাও:"
            onFocusTarget={onFocusTarget}
            onEditChip={onEditChip}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Question</label>
        <VisualRichInput
          multiline
          rows={2}
          value={item.question}
          onChange={(question) => onChange({ ...item, question })}
          placeholder="Write the MCQ question here..."
          onFocusTarget={onFocusTarget}
          onEditChip={onEditChip}
        />
      </div>

      <ImageAttachmentControl
        image={item.image}
        onChange={(image) => onChange({ ...item, image })}
        label="Attach MCQ Diagram"
        compact
      />

      {item.isMultiStatement && (
        <div className="space-y-2 border border-zinc-200 rounded p-3 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700">Statements (i, ii, iii)</span>
            <button
              type="button"
              onClick={applyStandardMultiOptions}
              className="text-[11px] font-medium text-[#0F4C81] hover:underline cursor-pointer"
            >
              Auto-fill options (i &amp; ii ...)
            </button>
          </div>
          {(item.statements ?? ['', '', '']).map((st, sIdx) => (
            <div key={sIdx} className="flex items-center gap-2">
              <span className="text-xs font-mono-num text-zinc-600 w-6 text-right shrink-0">
                {getRomanLabel(sIdx)}.
              </span>
              <div className="flex-1 min-w-0">
                <VisualRichInput
                  value={st}
                  onChange={(val) => updateStatement(sIdx, val)}
                  placeholder={`Statement ${getRomanLabel(sIdx)}`}
                  onFocusTarget={onFocusTarget}
                  onEditChip={onEditChip}
                />
              </div>
            </div>
          ))}
          <input
            type="text"
            value={item.statementPrompt ?? labels.multiStatementDefaultPrompt}
            onChange={(e) => onChange({ ...item, statementPrompt: e.target.value })}
            placeholder={labels.multiStatementDefaultPrompt}
            className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded bg-white text-zinc-700"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {item.options.map((opt, optIdx) => (
          <div key={optIdx} className="flex items-start gap-1.5">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...item,
                  correctOption: item.correctOption === optIdx ? undefined : optIdx,
                })
              }
              title="Mark as correct answer for optional Answer Key"
              className={`w-9 h-[40px] sm:w-7 sm:h-[34px] text-xs font-semibold rounded border transition-colors shrink-0 cursor-pointer ${
                item.correctOption === optIdx
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {getOptionLabel(optIdx, language)}
            </button>
            <div className="flex-1 min-w-0">
              <VisualRichInput
                value={opt}
                onChange={(val) => updateOption(optIdx, val)}
                placeholder={`Option ${getOptionLabel(optIdx, language)}`}
                onFocusTarget={onFocusTarget}
                onEditChip={onEditChip}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-400">
        Click an option letter ({getOptionLabel(0, language)}–{getOptionLabel(3, language)}) to set the correct answer for the Answer Key.
      </p>
    </div>
  );
};

// 4. Short & Descriptive Question Editor
const ShortEditor: React.FC<
  {
    item: ShortQuestionItem;
    language: Language;
    labels: ReturnType<typeof getBoardLabels>;
    onChange: (next: ShortQuestionItem) => void;
  } & SharedVisualProps
> = ({ item, language, labels, onChange, onFocusTarget, onEditChip }) => {
  const addSubPart = () => {
    onChange({
      ...item,
      subParts: [...(item.subParts ?? []), { id: createId('sp'), text: '', marks: undefined }],
    });
  };

  const updateSubPart = (idx: number, patch: Partial<{ text: string; marks?: number }>) => {
    const next = (item.subParts ?? []).map((sp, i) => (i === idx ? { ...sp, ...patch } : sp));
    onChange({ ...item, subParts: next });
  };

  const removeSubPart = (idx: number) => {
    onChange({
      ...item,
      subParts: (item.subParts ?? []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Question Text</label>
        <VisualRichInput
          multiline
          rows={2}
          value={item.prompt}
          onChange={(prompt) => onChange({ ...item, prompt })}
          placeholder="Write the question prompt..."
          onFocusTarget={onFocusTarget}
          onEditChip={onEditChip}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Total Marks</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={item.marks}
            onChange={(e) => onChange({ ...item, marks: Number(e.target.value) })}
            className="w-full text-sm px-2.5 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 font-mono-num"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Right-Margin Marks Label (Optional, e.g. 2 × 5 = 10)
          </label>
          <input
            type="text"
            value={item.marksBreakdown ?? ''}
            onChange={(e) => onChange({ ...item, marksBreakdown: e.target.value })}
            placeholder="Leave blank to show total marks"
            className="w-full text-sm px-2.5 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
          />
        </div>
      </div>

      <ImageAttachmentControl
        image={item.image}
        onChange={(image) => onChange({ ...item, image })}
        label="Attach Diagram / Image"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600">Sub-parts (Optional)</span>
          <button
            type="button"
            onClick={addSubPart}
            className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add sub-part
          </button>
        </div>
        {(item.subParts ?? []).map((sp, idx) => (
          <div key={sp.id} className="flex items-start gap-2">
            <span className="pt-2 text-xs font-semibold text-zinc-700 w-6 shrink-0">
              {getOptionLabel(idx, language)}.
            </span>
            <div className="flex-1 min-w-0">
              <VisualRichInput
                value={sp.text}
                onChange={(text) => updateSubPart(idx, { text })}
                placeholder={`Sub-part ${getOptionLabel(idx, language)}`}
                onFocusTarget={onFocusTarget}
                onEditChip={onEditChip}
              />
            </div>
            <input
              type="number"
              min={0}
              step={0.5}
              value={sp.marks ?? ''}
              onChange={(e) =>
                updateSubPart(idx, {
                  marks: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              placeholder="Marks"
              className="w-16 text-sm px-2 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 text-right font-mono-num shrink-0"
            />
            <button
              type="button"
              onClick={() => removeSubPart(idx)}
              className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-zinc-100 space-y-2.5">
        <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(item.hasOr)}
            onChange={(e) =>
              onChange({
                ...item,
                hasOr: e.target.checked,
                orMarks: item.orMarks ?? item.marks,
              })
            }
            className="accent-zinc-900"
          />
          <span>Include "{labels.orDivider}" (Alternative Question)</span>
        </label>

        {item.hasOr && (
          <div className="space-y-2.5 pl-3 border-l border-zinc-200">
            <VisualRichInput
              multiline
              rows={2}
              value={item.orPrompt ?? ''}
              onChange={(orPrompt) => onChange({ ...item, orPrompt })}
              placeholder={`Alternative question after "${labels.orDivider}"...`}
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
            <ImageAttachmentControl
              image={item.orImage}
              onChange={(orImage) => onChange({ ...item, orImage })}
              label="Attach Alternative Diagram"
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Reading Passage Editor
const PassageEditor: React.FC<
  {
    item: PassageItem;
    language: Language;
    onChange: (next: PassageItem) => void;
  } & SharedVisualProps
> = ({ item, language, onChange, onFocusTarget, onEditChip }) => {
  const updateQ = (idx: number, patch: Partial<{ text: string; marks: number }>) => {
    const questions = item.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q));
    onChange({ ...item, questions });
  };

  const addQ = () => {
    onChange({
      ...item,
      questions: [...item.questions, { id: createId('pq'), text: '', marks: 2 }],
    });
  };

  const removeQ = (idx: number) => {
    onChange({
      ...item,
      questions: item.questions.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-600 mb-1">Passage Instruction</label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
            placeholder="e.g. Read the passage carefully and answer the questions below."
            className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Marks Breakdown</label>
          <input
            type="text"
            value={item.marksBreakdown ?? ''}
            onChange={(e) => onChange({ ...item, marksBreakdown: e.target.value })}
            placeholder="e.g. 2 × 5 = 10"
            className="w-full text-sm px-2.5 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Passage Text</label>
        <VisualRichInput
          multiline
          rows={5}
          value={item.passage}
          onChange={(passage) => onChange({ ...item, passage })}
          placeholder="Paste or type the seen/unseen reading passage here..."
          onFocusTarget={onFocusTarget}
          onEditChip={onEditChip}
        />
      </div>

      <ImageAttachmentControl
        image={item.image}
        onChange={(image) => onChange({ ...item, image })}
        label="Attach Passage Illustration"
        compact
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600">Attached Questions</span>
          <button
            type="button"
            onClick={addQ}
            className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add question
          </button>
        </div>
        {item.questions.map((pq, idx) => (
          <div key={pq.id} className="flex items-start gap-2">
            <span className="pt-2 text-xs font-semibold text-zinc-700 w-6 shrink-0">
              {getOptionLabel(idx, language)}.
            </span>
            <div className="flex-1 min-w-0">
              <VisualRichInput
                value={pq.text}
                onChange={(text) => updateQ(idx, { text })}
                placeholder={`Question ${getOptionLabel(idx, language)}`}
                onFocusTarget={onFocusTarget}
                onEditChip={onEditChip}
              />
            </div>
            <input
              type="number"
              min={0}
              step={0.5}
              value={pq.marks}
              onChange={(e) => updateQ(idx, { marks: Number(e.target.value) })}
              className="w-14 text-sm px-2 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 text-right font-mono-num shrink-0"
            />
            <button
              type="button"
              onClick={() => removeQ(idx)}
              className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. Table & Grammar Block Editor
const TableBlockEditor: React.FC<
  {
    item: TableBlockItem;
    language: Language;
    onChange: (next: TableBlockItem) => void;
  } & SharedVisualProps
> = ({ item, language, onChange, onFocusTarget, onEditChip }) => {
  const switchVariant = (variant: TableVariant) => {
    if (variant === 'gap_clues') {
      onChange({
        ...item,
        variant,
        clues: item.clues ?? ['word1', 'word2', 'word3', 'word4', 'word5', 'word6'],
        gapText:
          item.gapText ??
          'Fill in the blanks (a) ______ using words from the box (b) ______.',
      });
    } else if (variant === 'matching') {
      onChange({
        ...item,
        variant,
        table: {
          showHeader: true,
          bordered: true,
          headers: language === 'bn' ? ['কলাম ক', 'কলাম খ'] : ['Column A', 'Column B'],
          rows: [
            ['(a) ', '(i) '],
            ['(b) ', '(ii) '],
            ['(c) ', '(iii) '],
          ],
          colAligns: ['left', 'left'],
        },
      });
    } else if (variant === 'substitution') {
      onChange({
        ...item,
        variant,
        table: {
          showHeader: true,
          bordered: true,
          headers: ['Column A', 'Column B', 'Column C'],
          rows: [
            ['Education', 'is', 'the backbone of a nation.'],
            ['It', 'helps', 'us to build character.'],
          ],
          colAligns: ['left', 'left', 'left'],
        },
      });
    } else {
      onChange({
        ...item,
        variant,
        table: item.table ?? {
          showHeader: true,
          bordered: true,
          headers:
            language === 'bn'
              ? ['বিবরণ', 'ডেবিট (টাকা)', 'ক্রেডিট (টাকা)']
              : ['Particulars', 'Debit (Tk.)', 'Credit (Tk.)'],
          rows: [
            ['', '', ''],
            ['', '', ''],
          ],
          colAligns: ['left', 'right', 'right'],
        },
      });
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: 'general', label: 'Accounting / Data' },
            { id: 'matching', label: 'Matching (A ↔ B)' },
            { id: 'substitution', label: 'Substitution' },
            { id: 'gap_clues', label: 'Gap-Fill with Clues' },
          ] as const
        ).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => switchVariant(v.id)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              item.variant === v.id
                ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Question Instruction</label>
        <VisualRichInput
          value={item.prompt}
          onChange={(prompt) => onChange({ ...item, prompt })}
          placeholder="e.g. Match the items in Column A with Column B..."
          onFocusTarget={onFocusTarget}
          onEditChip={onEditChip}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Total Marks</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={item.marks}
            onChange={(e) => onChange({ ...item, marks: Number(e.target.value) })}
            className="w-full text-sm px-2.5 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 font-mono-num"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Right-Margin Marks Label (e.g. 0.5 × 10 = 5)
          </label>
          <input
            type="text"
            value={item.marksBreakdown ?? ''}
            onChange={(e) => onChange({ ...item, marksBreakdown: e.target.value })}
            placeholder="Optional breakdown"
            className="w-full text-sm px-2.5 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
          />
        </div>
      </div>

      {item.variant === 'gap_clues' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Clue Words (comma-separated)
            </label>
            <input
              type="text"
              value={(item.clues ?? []).join(', ')}
              onChange={(e) =>
                onChange({
                  ...item,
                  clues: e.target.value
                    .split(',')
                    .map((w) => w.trim())
                    .filter((w, idx, arr) => w.length > 0 || idx < arr.length - 1),
                })
              }
              placeholder="rivers, fertile, agriculture, natural, beauty..."
              className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Fill-in-the-Blanks Passage
            </label>
            <VisualRichInput
              multiline
              rows={4}
              value={item.gapText ?? ''}
              onChange={(gapText) => onChange({ ...item, gapText })}
              placeholder="Write text with blanks like (a) ______ (b) ______"
              onFocusTarget={onFocusTarget}
              onEditChip={onEditChip}
            />
          </div>
        </div>
      ) : (
        item.table && (
          <TableGridEditor
            table={item.table}
            onChange={(table) => onChange({ ...item, table })}
            onFocusTarget={onFocusTarget}
            onEditChip={onEditChip}
          />
        )
      )}
    </div>
  );
};
