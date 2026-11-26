import React, { useEffect, useRef, useState } from 'react';
import {
  AttachedImage,
  CQItem,
  ExamPaper,
  Language,
  MCQItem,
  PassageItem,
  QuestionItem,
  ShortQuestionItem,
  TableBlockItem,
  TableData,
} from '../types/paper';
import {
  formatDigits,
  formatNumber,
  getBoardLabels,
  getOptionLabel,
  getRomanLabel,
} from '../utils/formatters';
import { RichMathText } from './RichMathText';

interface PaperPreviewProps {
  paper: ExamPaper;
  zoom: 'fit' | number;
  activeQuestionId?: string | null;
  onSelectHeader?: () => void;
  onSelectQuestion?: (questionId: string) => void;
}

const SheetImage: React.FC<{ image: AttachedImage; maxH?: string }> = ({ image, maxH }) => {
  const justify =
    image.align === 'left'
      ? 'items-start'
      : image.align === 'right'
      ? 'items-end'
      : 'items-center';

  return (
    <figure className={`my-2 flex flex-col ${justify}`}>
      <img
        src={image.src}
        alt={image.caption || 'Question diagram'}
        referrerPolicy="no-referrer"
        style={{ width: `${image.width}%`, maxHeight: maxH }}
        className="object-contain block"
      />
      {image.caption && (
        <figcaption className="mt-1 text-[0.85em] text-zinc-700 italic">
          <RichMathText text={image.caption} inline />
        </figcaption>
      )}
    </figure>
  );
};

const SheetTable: React.FC<{ table: TableData }> = ({ table }) => {
  const borderCls = table.bordered ? 'border border-black' : 'border-b border-zinc-400';

  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[0.94em]">
        {table.showHeader && (
          <thead>
            <tr>
              {table.headers.map((h, i) => {
                const align = table.colAligns?.[i] ?? 'left';
                const alignCls =
                  align === 'center'
                    ? 'text-center'
                    : align === 'right'
                    ? 'text-right'
                    : 'text-left';
                return (
                  <th
                    key={i}
                    className={`${borderCls} ${alignCls} px-2 py-1 font-semibold bg-zinc-50 print:bg-transparent`}
                  >
                    <RichMathText text={h} inline />
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => {
                const align = table.colAligns?.[cIdx] ?? 'left';
                const alignCls =
                  align === 'center'
                    ? 'text-center'
                    : align === 'right'
                    ? 'text-right tabular-nums'
                    : 'text-left';
                return (
                  <td key={cIdx} className={`${borderCls} ${alignCls} px-2 py-1 align-top`}>
                    <RichMathText text={cell} inline />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RenderCQ: React.FC<{ item: CQItem; num: number; lang: Language }> = ({ item, num, lang }) => (
  <div className="question-block mb-4">
    <div className="flex items-baseline gap-2">
      <span className="font-semibold shrink-0 tabular-nums">{formatNumber(num, lang)}।</span>
      <div className="flex-1 min-w-0">
        {item.stem && <RichMathText text={item.stem} className="text-justify" />}
        {item.image && <SheetImage image={item.image} />}
        {item.table && <SheetTable table={item.table} />}

        <div className="mt-1.5 space-y-1">
          {item.subQuestions.map((sq, idx) => (
            <div
              key={sq.id}
              className="grid items-baseline gap-x-3"
              style={{ gridTemplateColumns: '1fr auto' }}
            >
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="shrink-0">
                  ({getOptionLabel(idx, lang)})
                </span>
                <div className="flex-1 min-w-0">
                  <RichMathText text={sq.text} inline />
                </div>
              </div>
              <span className="font-medium tabular-nums text-right shrink-0">
                {formatNumber(sq.marks, lang)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RenderMCQ: React.FC<{
  item: MCQItem;
  num: number;
  lang: Language;
  showAnswerInline: boolean;
}> = ({ item, num, lang, showAnswerInline }) => {
  const labels = getBoardLabels(lang);
  const longestOpt = Math.max(...item.options.map((o) => o.replace(/\$[^$]*\$/g, 'xxxx').length));
  const useSingleColOpts = longestOpt > 28;

  return (
    <div className="question-block mb-3">
      {item.commonStem && (
        <div className="mb-2 border border-zinc-800 px-2.5 py-1.5 text-[0.95em] leading-snug">
          <RichMathText text={item.commonStem} />
        </div>
      )}

      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold shrink-0 tabular-nums">
          {formatNumber(num, lang)}{lang === 'bn' ? '।' : '.'}
        </span>
        <div className="flex-1 min-w-0">
          <RichMathText text={item.question} inline />

          {item.image && <SheetImage image={item.image} maxH="140px" />}

          {item.isMultiStatement && item.statements && (
            <div className="mt-1 ml-2 space-y-0.5">
              {item.statements.map((st, idx) => (
                <div key={idx} className="flex items-baseline gap-1.5">
                  <span className="shrink-0 font-serif italic">{getRomanLabel(idx)}.</span>
                  <RichMathText text={st} inline />
                </div>
              ))}
              <div className="pt-0.5 font-medium">
                {item.statementPrompt || labels.multiStatementDefaultPrompt}
              </div>
            </div>
          )}

          <div
            className={`mt-1.5 grid gap-x-3 gap-y-0.5 ${
              useSingleColOpts ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {item.options.map((opt, idx) => {
              const isCorrect = showAnswerInline && item.correctOption === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-baseline gap-1.5 ${
                    isCorrect ? 'font-bold underline decoration-1 underline-offset-2' : ''
                  }`}
                >
                  <span className="shrink-0">
                    ({getOptionLabel(idx, lang)})
                  </span>
                  <div className="min-w-0 break-words">
                    <RichMathText text={opt} inline />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const RenderShort: React.FC<{ item: ShortQuestionItem; num: number; lang: Language }> = ({
  item,
  num,
  lang,
}) => {
  const labels = getBoardLabels(lang);
  const hasPerSubMarks = Boolean(item.subParts?.some((sp) => typeof sp.marks === 'number' && sp.marks > 0));
  const topMarksText = item.marksBreakdown
    ? formatDigits(item.marksBreakdown, lang)
    : !hasPerSubMarks
    ? formatNumber(item.marks, lang)
    : '';

  return (
    <div className="question-block mb-4">
      <div
        className="grid items-baseline gap-x-3"
        style={{ gridTemplateColumns: '1fr auto' }}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-semibold shrink-0 tabular-nums">
            {formatNumber(num, lang)}{lang === 'bn' ? '।' : '.'}
          </span>
          <div className="flex-1 min-w-0">
            <RichMathText text={item.prompt} className="text-justify" />
            {item.image && <SheetImage image={item.image} />}
          </div>
        </div>
        {topMarksText && (
          <span className="font-medium tabular-nums text-right shrink-0">{topMarksText}</span>
        )}
      </div>

      {item.subParts && item.subParts.length > 0 && (
        <div className="mt-1.5 pl-6 space-y-1">
          {item.subParts.map((sp, idx) => (
            <div
              key={sp.id}
              className="grid items-baseline gap-x-3"
              style={{ gridTemplateColumns: '1fr auto' }}
            >
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="shrink-0">({getOptionLabel(idx, lang)})</span>
                <div className="flex-1 min-w-0">
                  <RichMathText text={sp.text} inline />
                </div>
              </div>
              {typeof sp.marks === 'number' && sp.marks > 0 && !item.marksBreakdown && (
                <span className="font-medium tabular-nums text-right shrink-0">
                  {formatNumber(sp.marks, lang)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {item.hasOr && (
        <div className="mt-2.5">
          <div className="text-center font-semibold my-1.5 tracking-wide">
            {labels.orDivider}
          </div>
          <div
            className="grid items-baseline gap-x-3 pl-6"
            style={{ gridTemplateColumns: '1fr auto' }}
          >
            <div className="min-w-0">
              <RichMathText text={item.orPrompt ?? ''} className="text-justify" />
              {item.orImage && <SheetImage image={item.orImage} />}
            </div>
            {item.orMarks ? (
              <span className="font-medium tabular-nums text-right shrink-0">
                {formatNumber(item.orMarks, lang)}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

const RenderPassage: React.FC<{ item: PassageItem; num: number; lang: Language }> = ({
  item,
  num,
  lang,
}) => (
  <div className="mb-4">
    <div
      className="section-heading-block grid items-baseline gap-x-3 mb-1.5"
      style={{ gridTemplateColumns: '1fr auto' }}
    >
      <div className="flex items-baseline gap-2 min-w-0 font-semibold">
        <span className="shrink-0 tabular-nums">
          {formatNumber(num, lang)}{lang === 'bn' ? '।' : '.'}
        </span>
        <RichMathText text={item.title} inline />
      </div>
      {item.marksBreakdown && (
        <span className="font-medium tabular-nums text-right shrink-0">
          {formatDigits(item.marksBreakdown, lang)}
        </span>
      )}
    </div>

    <div className="pl-6">
      <div className="mb-2.5 text-justify leading-relaxed">
        <RichMathText text={item.passage} />
      </div>
      {item.image && <SheetImage image={item.image} />}

      <div className="space-y-1.5 mt-2">
        {item.questions.map((pq, idx) => (
          <div
            key={pq.id}
            className="question-block grid items-baseline gap-x-3"
            style={{ gridTemplateColumns: '1fr auto' }}
          >
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="shrink-0">({getOptionLabel(idx, lang)})</span>
              <div className="flex-1 min-w-0">
                <RichMathText text={pq.text} inline />
              </div>
            </div>
            {!item.marksBreakdown && (
              <span className="font-medium tabular-nums text-right shrink-0">
                {formatNumber(pq.marks, lang)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RenderTableBlock: React.FC<{ item: TableBlockItem; num: number; lang: Language }> = ({
  item,
  num,
  lang,
}) => {
  const rightMarks = item.marksBreakdown
    ? formatDigits(item.marksBreakdown, lang)
    : formatNumber(item.marks, lang);

  return (
    <div className="question-block mb-4">
      <div
        className="grid items-baseline gap-x-3"
        style={{ gridTemplateColumns: '1fr auto' }}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-semibold shrink-0 tabular-nums">
            {formatNumber(num, lang)}{lang === 'bn' ? '।' : '.'}
          </span>
          <div className="flex-1 min-w-0">
            <RichMathText text={item.prompt} />
          </div>
        </div>
        <span className="font-medium tabular-nums text-right shrink-0">{rightMarks}</span>
      </div>

      <div className="pl-6 mt-2">
        {item.variant === 'gap_clues' ? (
          <div className="space-y-2.5">
            {item.clues && item.clues.filter(Boolean).length > 0 && (
              <div className="border border-black px-3 py-2 grid grid-cols-4 sm:grid-cols-6 gap-x-3 gap-y-1 text-center text-[0.95em]">
                {item.clues.filter(Boolean).map((word, idx) => (
                  <span key={idx} className="font-medium">
                    <RichMathText text={word} inline />
                  </span>
                ))}
              </div>
            )}
            {item.gapText && (
              <div className="text-justify leading-relaxed">
                <RichMathText text={item.gapText} />
              </div>
            )}
          </div>
        ) : (
          item.table && <SheetTable table={item.table} />
        )}
      </div>
    </div>
  );
};

export const PaperPreview: React.FC<PaperPreviewProps> = ({
  paper,
  zoom,
  activeQuestionId,
  onSelectHeader,
  onSelectQuestion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [sheetHeightPx, setSheetHeightPx] = useState(1122);

  // Measure available width for crisp "Fit" zoom on A4 (210mm ≈ 794px at 96dpi)
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      if (cw <= 0) return;
      const horizontalPad = cw < 640 ? 16 : 40;
      const available = cw - horizontalPad;
      const a4WidthPx = 794;
      setFitScale(Math.min(1, Math.max(0.32, available / a4WidthPx)));
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!sheetRef.current) return;
    const ro = new ResizeObserver(() => {
      if (sheetRef.current) {
        setSheetHeightPx(sheetRef.current.scrollHeight);
      }
    });
    ro.observe(sheetRef.current);
    return () => ro.disconnect();
  }, [paper]);

  const effectiveScale = zoom === 'fit' ? fitScale : zoom;
  const { header, settings, questions } = paper;
  const lang = settings.language;
  const labels = getBoardLabels(lang);
  const fontClass = settings.fontFamily === 'serif' ? 'font-paper-serif' : 'font-paper-sans';

  // Compute running display numbers (skipping Section headers)
  let runningNum = 0;
  const numberedItems = questions.map((q) => {
    if (q.type === 'section') return { item: q, num: null as number | null };
    runningNum += 1;
    return { item: q, num: runningNum };
  });

  // Collect MCQs with marked answers for optional Answer Key page
  const answeredMcqs = numberedItems
    .filter(
      (entry): entry is { item: MCQItem; num: number } =>
        entry.item.type === 'mcq' &&
        entry.num !== null &&
        typeof entry.item.correctOption === 'number'
    );

  // Page break visual guides (297mm = 1122.5px at 96dpi)
  const a4PageHeightPx = 1122;
  const pageBreakCount = Math.max(0, Math.floor((sheetHeightPx - 40) / a4PageHeightPx));

  const renderQuestion = (entry: { item: QuestionItem; num: number | null }) => {
    const { item, num } = entry;
    if (item.type === 'section') {
      return (
        <div
          key={item.id}
          className="section-heading-block my-3.5 text-center"
          style={{ columnSpan: 'all' }}
        >
          <div className="font-bold text-[1.06em] underline underline-offset-4">
            <RichMathText text={item.title} inline />
            {item.marksNote ? ` (${formatDigits(item.marksNote, lang)})` : ''}
          </div>
          {item.subtitle && (
            <div className="text-[0.92em] italic mt-0.5">
              <RichMathText text={item.subtitle} inline />
            </div>
          )}
        </div>
      );
    }

    const qNum = num ?? 1;
    switch (item.type) {
      case 'cq':
        return <RenderCQ key={item.id} item={item} num={qNum} lang={lang} />;
      case 'mcq':
        return (
          <RenderMCQ
            key={item.id}
            item={item}
            num={qNum}
            lang={lang}
            showAnswerInline={settings.showAnswerKey}
          />
        );
      case 'short':
        return <RenderShort key={item.id} item={item} num={qNum} lang={lang} />;
      case 'passage':
        return <RenderPassage key={item.id} item={item} num={qNum} lang={lang} />;
      case 'table':
        return <RenderTableBlock key={item.id} item={item} num={qNum} lang={lang} />;
    }
  };

  const subjectCodeDigits = header.subjectCode
    ? formatDigits(header.subjectCode.trim(), lang).split('')
    : [];

  return (
    <div
      ref={containerRef}
      className="print-only-container w-full flex flex-col items-center py-3 px-2 sm:py-6 sm:px-4 print:p-0"
    >
      <div
        style={{
          width: `${794 * effectiveScale}px`,
          height: `${sheetHeightPx * effectiveScale}px`,
        }}
        className="print:!w-full print:!h-auto relative transition-[width] duration-150"
      >
        <article
          id="proshnopatra-sheet"
          ref={sheetRef}
          style={{
            width: '210mm',
            minHeight: '297mm',
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top left',
            fontSize: `${settings.fontSizePt}pt`,
            lineHeight: settings.lineHeight,
          }}
          className={`paper-sheet ${fontClass} bg-white text-black border border-zinc-300 px-[14mm] py-[13mm] relative box-border`}
        >
          {/* On-screen A4 page break guides (hidden in PDF print) */}
          {Array.from({ length: pageBreakCount }).map((_, idx) => (
            <div
              key={idx}
              style={{ top: `${(idx + 1) * a4PageHeightPx}px` }}
              className="page-guide-line pointer-events-none absolute left-0 right-0 border-t border-dashed border-zinc-300 flex justify-end pr-2"
            >
              <span className="-mt-2.5 bg-white px-1.5 text-[10px] font-sans text-zinc-400">
                Page {idx + 1} / {idx + 2}
              </span>
            </div>
          ))}

          {/* Authentic Bangladeshi Board-Style Paper Header */}
          <header
            onClick={onSelectHeader}
            title={onSelectHeader ? 'Click to edit header' : undefined}
            className={`relative pb-2.5 mb-3 rounded transition-colors ${
              onSelectHeader ? 'cursor-pointer hover:bg-[#0F4C81]/[0.04] print:hover:bg-transparent' : ''
            }`}
          >
            {/* Top corner boxes: Subject Code (left) & Set Code (right) */}
            {(subjectCodeDigits.length > 0 || header.setCode) && (
              <div className="flex items-start justify-between text-[0.88em] mb-1">
                <div>
                  {subjectCodeDigits.length > 0 && (
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-medium">{labels.subjectCode}:</span>
                      <span className="inline-flex border border-black">
                        {subjectCodeDigits.map((ch, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 leading-none font-semibold tabular-nums ${
                              idx > 0 ? 'border-l border-black' : ''
                            }`}
                          >
                            {ch}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  {header.setCode && (
                    <div className="inline-block border border-black px-2.5 py-0.5 font-semibold">
                      {labels.setCode}: {formatDigits(header.setCode, lang)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Logo */}
            {header.logo && (
              <div
                className={`mb-1.5 flex ${
                  header.logo.align === 'left'
                    ? 'justify-start'
                    : header.logo.align === 'right'
                    ? 'justify-end'
                    : 'justify-center'
                }`}
              >
                <img
                  src={header.logo.src}
                  alt="Institute Logo"
                  referrerPolicy="no-referrer"
                  style={{ width: `${Math.min(header.logo.width, 40)}%`, maxHeight: '64px' }}
                  className="object-contain"
                />
              </div>
            )}

            {/* Center Institution & Exam Title */}
            <div className="text-center space-y-0.5">
              {header.instituteName && (
                <h1 className="font-bold text-[1.35em] leading-snug tracking-tight">
                  {header.instituteName}
                </h1>
              )}
              {header.instituteSubline && (
                <div className="text-[0.9em] text-zinc-800">{header.instituteSubline}</div>
              )}
              {header.examName && (
                <div className="font-semibold text-[1.06em]">{header.examName}</div>
              )}
              {(header.className || header.subject) && (
                <div className="text-[1.02em]">
                  {header.className && (
                    <span>
                      {labels.classLabel}: <span className="font-medium">{header.className}</span>
                    </span>
                  )}
                  {header.className && header.subject && <span className="mx-2">|</span>}
                  {header.subject && (
                    <span>
                      {labels.subjectLabel}: <span className="font-bold">{header.subject}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Time / Date / Full Marks bar */}
            <div className="mt-2.5 flex items-baseline justify-between text-[0.95em] font-medium">
              <div className="flex items-baseline gap-4">
                {header.time && (
                  <span>
                    {labels.timeLabel}: {formatDigits(header.time, lang)}
                  </span>
                )}
                {header.date && (
                  <span>
                    {labels.dateLabel}: {formatDigits(header.date, lang)}
                  </span>
                )}
              </div>
              {header.fullMarks && (
                <span className="tabular-nums">
                  {labels.fullMarksLabel}: {formatDigits(header.fullMarks, lang)}
                </span>
              )}
            </div>

            {/* Classic Board Double Hairline Rule */}
            <div className="mt-1.5 border-t-[1.5px] border-black pt-[2px]">
              <div className="border-t border-black" />
            </div>

            {/* General Instructions */}
            {header.instructions && (
              <div className="mt-2 text-center text-[0.92em] italic leading-snug">
                [<RichMathText text={header.instructions} inline />]
              </div>
            )}
          </header>

          {/* Main Questions Area */}
          {questions.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 font-sans text-sm">
              No questions added yet. Add a CQ, MCQ, Short Question, Passage, or Table from the editor.
            </div>
          ) : (
            <div className={settings.columns === 2 ? 'paper-two-col' : ''}>
              {numberedItems.map((entry) => {
                const isActive = activeQuestionId === entry.item.id;
                return (
                  <div
                    key={entry.item.id}
                    onClick={
                      onSelectQuestion ? () => onSelectQuestion(entry.item.id) : undefined
                    }
                    className={`rounded transition-colors ${
                      onSelectQuestion
                        ? 'cursor-pointer hover:bg-[#0F4C81]/[0.04] print:hover:bg-transparent'
                        : ''
                    } ${
                      isActive
                        ? 'ring-1 ring-[#0F4C81]/35 bg-[#0F4C81]/[0.03] print:ring-0 print:bg-transparent'
                        : ''
                    }`}
                  >
                    {renderQuestion(entry)}
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional MCQ Answer Key Page */}
          {settings.showAnswerKey && answeredMcqs.length > 0 && (
            <div className="page-break-before mt-8 pt-4 border-t-2 border-dashed border-zinc-400 print:border-t-0 print:mt-0 print:pt-0">
              <div className="text-center mb-4">
                <h2 className="font-bold text-[1.15em]">{labels.answerKeyTitle}</h2>
                <div className="text-[0.9em]">
                  {header.instituteName}
                  {header.subject ? ` — ${header.subject}` : ''}
                  {header.setCode ? ` (${labels.setCode}: ${formatDigits(header.setCode, lang)})` : ''}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[0.95em]">
                {answeredMcqs.map(({ item, num }) => (
                  <div
                    key={item.id}
                    className="border border-black px-2 py-1 flex items-center justify-between tabular-nums"
                  >
                    <span className="font-medium">{formatNumber(num, lang)}.</span>
                    <span className="font-bold">
                      ({getOptionLabel(item.correctOption!, lang)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};
