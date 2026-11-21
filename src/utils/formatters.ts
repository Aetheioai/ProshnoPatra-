import {
  AttachedImage,
  EducationLevel,
  ExamPaper,
  Language,
  QuestionItem,
  TableData,
  TableVariant,
} from '../types/paper';

export type MathTextToken =
  | { type: 'text'; value: string }
  | { type: 'math'; latex: string; display: boolean };

/**
 * Splits a string containing inline `$...$` and display `$$...$$` LaTeX expressions
 * into ordered text and math tokens.
 */
export function tokenizeMathText(input: string): MathTextToken[] {
  const tokens: MathTextToken[] = [];
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: input.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: 'math', latex: match[1].trim(), display: true });
    } else if (match[2] !== undefined) {
      tokens.push({ type: 'math', latex: match[2].trim(), display: false });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: 'text', value: input.slice(lastIndex) });
  }
  return tokens;
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const EN_TO_BN_MAP: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BN_TO_EN_MAP: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const BN_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'];
export const EN_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
export const ROMAN_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];

export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => EN_TO_BN_MAP[d] ?? d);
}

export function toEnDigits(input: string | number): string {
  return String(input).replace(/[০-৯]/g, (d) => BN_TO_EN_MAP[d] ?? d);
}

export function formatDigits(input: string | number, lang: Language): string {
  return lang === 'bn' ? toBnDigits(input) : toEnDigits(input);
}

export function formatNumber(n: number, lang: Language): string {
  const s = Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
  return formatDigits(s, lang);
}

export function getOptionLabel(index: number, lang: Language): string {
  if (lang === 'bn') {
    return BN_LETTERS[index] ?? BN_DIGITS[index] ?? String(index + 1);
  }
  return EN_LETTERS[index] ?? String(index + 1);
}

export function getRomanLabel(index: number): string {
  return ROMAN_LOWER[index] ?? String(index + 1);
}

export function getBoardLabels(lang: Language) {
  if (lang === 'bn') {
    return {
      classLabel: 'শ্রেণি',
      subjectLabel: 'বিষয়',
      subjectCode: 'বিষয় কোড',
      setCode: 'সেট',
      dateLabel: 'তারিখ',
      timeLabel: 'সময়',
      fullMarksLabel: 'পূর্ণমান',
      orDivider: 'অথবা',
      notePrefix: 'দ্রষ্টব্য:',
      multiStatementDefaultPrompt: 'নিচের কোনটি সঠিক?',
      answerKeyTitle: 'উত্তরমালা (শিক্ষক কপি)',
      marksWord: 'নম্বর',
      questionWord: 'প্রশ্ন',
      colA: 'কলাম ক',
      colB: 'কলাম খ',
    };
  }
  return {
    classLabel: 'Class',
    subjectLabel: 'Subject',
    subjectCode: 'Subject Code',
    setCode: 'Set',
    dateLabel: 'Date',
    timeLabel: 'Time',
    fullMarksLabel: 'Full Marks',
    orDivider: 'Or',
    notePrefix: 'N.B.:',
    multiStatementDefaultPrompt: 'Which one of the following is correct?',
    answerKeyTitle: 'Answer Key (Teacher Copy)',
    marksWord: 'Marks',
    questionWord: 'Question',
    colA: 'Column A',
    colB: 'Column B',
  };
}

export function getQuestionMarks(item: QuestionItem): number {
  switch (item.type) {
    case 'section':
      return 0;
    case 'cq':
      return item.subQuestions.reduce((sum, sq) => sum + (Number(sq.marks) || 0), 0);
    case 'mcq':
      return Number(item.marks) || 0;
    case 'short': {
      if (item.subParts && item.subParts.length > 0) {
        const subSum = item.subParts.reduce((sum, sp) => sum + (Number(sp.marks) || 0), 0);
        if (subSum > 0) return subSum;
      }
      return Number(item.marks) || 0;
    }
    case 'passage':
      return item.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    case 'table':
      return Number(item.marks) || 0;
  }
}

export function calculateTotalMarks(questions: QuestionItem[]): number {
  return questions.reduce((sum, q) => sum + getQuestionMarks(q), 0);
}

export function countNumberedQuestions(questions: QuestionItem[]): number {
  return questions.filter((q) => q.type !== 'section').length;
}

export function parseNumericMarks(val: string): number | null {
  const normalized = toEnDigits(val).replace(/[^0-9.]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function createId(prefix = 'q'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function downloadPaperJson(paper: ExamPaper) {
  const safeSubject = (paper.header.subject || 'question-paper')
    .replace(/[^\w\u0980-\u09FF-]+/g, '_')
    .slice(0, 40);
  const filename = `${safeSubject || 'proshnopatra'}_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(paper, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const VALID_LEVELS = new Set<EducationLevel>(['primary', 'junior', 'ssc', 'hsc', 'custom']);
const VALID_ALIGNS = new Set<'left' | 'center' | 'right'>(['left', 'center', 'right']);
const VALID_TABLE_VARIANTS = new Set<TableVariant>([
  'general',
  'matching',
  'substitution',
  'gap_clues',
]);

function isSafeImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  );
}

function sanitizeImage(raw: unknown): AttachedImage | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  if (!isSafeImageSrc(obj.src)) return undefined;
  const width =
    typeof obj.width === 'number' && Number.isFinite(obj.width)
      ? Math.min(100, Math.max(15, obj.width))
      : 55;
  const align = VALID_ALIGNS.has(obj.align as 'left' | 'center' | 'right')
    ? (obj.align as 'left' | 'center' | 'right')
    : 'center';
  return {
    src: obj.src.trim(),
    width,
    align,
    caption: typeof obj.caption === 'string' ? obj.caption : undefined,
  };
}

function sanitizeTable(raw: unknown): TableData | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const headers = Array.isArray(obj.headers) ? obj.headers.map((h) => String(h ?? '')) : [];
  if (headers.length === 0) return undefined;
  const colCount = headers.length;
  const rows = Array.isArray(obj.rows)
    ? obj.rows.map((r) => {
        const arr = Array.isArray(r) ? r.map((c) => String(c ?? '')) : [];
        return Array.from({ length: colCount }, (_, i) => arr[i] ?? '');
      })
    : [Array(colCount).fill('')];
  const rawAligns = Array.isArray(obj.colAligns) ? obj.colAligns : null;
  const colAligns = rawAligns
    ? Array.from({ length: colCount }, (_, i) =>
        VALID_ALIGNS.has(rawAligns[i] as 'left' | 'center' | 'right')
          ? (rawAligns[i] as 'left' | 'center' | 'right')
          : 'left'
      )
    : undefined;
  return {
    headers,
    rows: rows.length > 0 ? rows : [Array(colCount).fill('')],
    showHeader: obj.showHeader !== false,
    bordered: obj.bordered !== false,
    colAligns,
  };
}

function sanitizeMarks(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function sanitizeQuestionItem(raw: unknown): QuestionItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === 'string' && obj.id ? obj.id : createId('q');

  switch (obj.type) {
    case 'section':
      return {
        id,
        type: 'section',
        title: String(obj.title ?? ''),
        subtitle: typeof obj.subtitle === 'string' ? obj.subtitle : undefined,
        marksNote: typeof obj.marksNote === 'string' ? obj.marksNote : undefined,
      };
    case 'cq': {
      const subQuestions = Array.isArray(obj.subQuestions)
        ? obj.subQuestions
            .filter((sq): sq is Record<string, unknown> => Boolean(sq && typeof sq === 'object'))
            .map((sq) => ({
              id: typeof sq.id === 'string' && sq.id ? sq.id : createId('sq'),
              text: String(sq.text ?? ''),
              marks: sanitizeMarks(sq.marks, 1),
            }))
        : [];
      return {
        id,
        type: 'cq',
        stem: String(obj.stem ?? ''),
        image: sanitizeImage(obj.image),
        table: sanitizeTable(obj.table),
        subQuestions:
          subQuestions.length > 0
            ? subQuestions
            : [{ id: createId('sq'), text: '', marks: 1 }],
      };
    }
    case 'mcq': {
      const rawOpts = Array.isArray(obj.options) ? obj.options : [];
      const options: [string, string, string, string] = [
        String(rawOpts[0] ?? ''),
        String(rawOpts[1] ?? ''),
        String(rawOpts[2] ?? ''),
        String(rawOpts[3] ?? ''),
      ];
      const correctOption =
        typeof obj.correctOption === 'number' &&
        Number.isInteger(obj.correctOption) &&
        obj.correctOption >= 0 &&
        obj.correctOption <= 3
          ? obj.correctOption
          : undefined;
      return {
        id,
        type: 'mcq',
        commonStem: typeof obj.commonStem === 'string' ? obj.commonStem : undefined,
        question: String(obj.question ?? ''),
        image: sanitizeImage(obj.image),
        isMultiStatement: Boolean(obj.isMultiStatement),
        statements: Array.isArray(obj.statements)
          ? obj.statements.map((s) => String(s ?? ''))
          : undefined,
        statementPrompt:
          typeof obj.statementPrompt === 'string' ? obj.statementPrompt : undefined,
        options,
        marks: sanitizeMarks(obj.marks, 1),
        correctOption,
      };
    }
    case 'short': {
      const subParts = Array.isArray(obj.subParts)
        ? obj.subParts
            .filter((sp): sp is Record<string, unknown> => Boolean(sp && typeof sp === 'object'))
            .map((sp) => ({
              id: typeof sp.id === 'string' && sp.id ? sp.id : createId('sp'),
              text: String(sp.text ?? ''),
              marks:
                typeof sp.marks === 'number' && Number.isFinite(sp.marks) && sp.marks >= 0
                  ? sp.marks
                  : undefined,
            }))
        : undefined;
      return {
        id,
        type: 'short',
        prompt: String(obj.prompt ?? ''),
        image: sanitizeImage(obj.image),
        marks: sanitizeMarks(obj.marks, 5),
        marksBreakdown:
          typeof obj.marksBreakdown === 'string' ? obj.marksBreakdown : undefined,
        subParts,
        hasOr: Boolean(obj.hasOr),
        orPrompt: typeof obj.orPrompt === 'string' ? obj.orPrompt : undefined,
        orImage: sanitizeImage(obj.orImage),
        orMarks:
          typeof obj.orMarks === 'number' && Number.isFinite(obj.orMarks)
            ? obj.orMarks
            : undefined,
      };
    }
    case 'passage': {
      const questions = Array.isArray(obj.questions)
        ? obj.questions
            .filter((pq): pq is Record<string, unknown> => Boolean(pq && typeof pq === 'object'))
            .map((pq) => ({
              id: typeof pq.id === 'string' && pq.id ? pq.id : createId('pq'),
              text: String(pq.text ?? ''),
              marks: sanitizeMarks(pq.marks, 2),
            }))
        : [];
      return {
        id,
        type: 'passage',
        title: String(obj.title ?? ''),
        passage: String(obj.passage ?? ''),
        image: sanitizeImage(obj.image),
        marksBreakdown:
          typeof obj.marksBreakdown === 'string' ? obj.marksBreakdown : undefined,
        questions,
      };
    }
    case 'table': {
      const variant = VALID_TABLE_VARIANTS.has(obj.variant as TableVariant)
        ? (obj.variant as TableVariant)
        : 'general';
      return {
        id,
        type: 'table',
        variant,
        prompt: String(obj.prompt ?? ''),
        marks: sanitizeMarks(obj.marks, 5),
        marksBreakdown:
          typeof obj.marksBreakdown === 'string' ? obj.marksBreakdown : undefined,
        clues: Array.isArray(obj.clues) ? obj.clues.map((c) => String(c ?? '')) : undefined,
        gapText: typeof obj.gapText === 'string' ? obj.gapText : undefined,
        table: sanitizeTable(obj.table),
      };
    }
    default:
      return null;
  }
}

export function validateImportedPaper(data: unknown): ExamPaper | null {
  if (!data || typeof data !== 'object') return null;
  const candidate = data as Partial<ExamPaper>;
  if (!candidate.header || !candidate.settings || !Array.isArray(candidate.questions)) {
    return null;
  }
  const level = VALID_LEVELS.has(candidate.header.level as EducationLevel)
    ? (candidate.header.level as EducationLevel)
    : 'ssc';

  return {
    id: typeof candidate.id === 'string' && candidate.id ? candidate.id : createId('paper'),
    updatedAt:
      typeof candidate.updatedAt === 'string' && candidate.updatedAt
        ? candidate.updatedAt
        : new Date().toISOString(),
    header: {
      instituteName: String(candidate.header.instituteName ?? ''),
      instituteSubline: String(candidate.header.instituteSubline ?? ''),
      logo: sanitizeImage(candidate.header.logo),
      examName: String(candidate.header.examName ?? ''),
      level,
      className: String(candidate.header.className ?? ''),
      subject: String(candidate.header.subject ?? ''),
      subjectCode: String(candidate.header.subjectCode ?? ''),
      setCode: String(candidate.header.setCode ?? ''),
      date: String(candidate.header.date ?? ''),
      time: String(candidate.header.time ?? ''),
      fullMarks: String(candidate.header.fullMarks ?? ''),
      instructions: String(candidate.header.instructions ?? ''),
    },
    settings: {
      language: candidate.settings.language === 'en' ? 'en' : 'bn',
      columns: candidate.settings.columns === 2 ? 2 : 1,
      fontSizePt:
        typeof candidate.settings.fontSizePt === 'number'
          ? Math.min(16, Math.max(9, candidate.settings.fontSizePt))
          : 11.5,
      fontFamily: candidate.settings.fontFamily === 'sans' ? 'sans' : 'serif',
      lineHeight:
        typeof candidate.settings.lineHeight === 'number'
          ? Math.min(2.0, Math.max(1.2, candidate.settings.lineHeight))
          : 1.55,
      showAnswerKey: Boolean(candidate.settings.showAnswerKey),
    },
    questions: candidate.questions
      .map(sanitizeQuestionItem)
      .filter((q): q is QuestionItem => q !== null),
  };
}
