export type Language = 'bn' | 'en';

export type EducationLevel = 'primary' | 'junior' | 'ssc' | 'hsc' | 'custom';

export type ExamFormat = 'cq' | 'mcq' | 'written' | 'mixed';

export interface AttachedImage {
  src: string;
  width: number; // percentage 20-100
  align: 'left' | 'center' | 'right';
  caption?: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  showHeader: boolean;
  bordered: boolean;
  colAligns?: ('left' | 'center' | 'right')[];
}

export interface PaperHeader {
  instituteName: string;
  instituteSubline: string;
  logo?: AttachedImage;
  examName: string;
  level: EducationLevel;
  className: string;
  subject: string;
  subjectCode: string;
  setCode: string;
  date: string;
  time: string;
  fullMarks: string;
  instructions: string;
}

export interface PaperSettings {
  language: Language;
  columns: 1 | 2;
  fontSizePt: number;
  fontFamily: 'serif' | 'sans';
  lineHeight: number;
  showAnswerKey: boolean;
}

export interface SectionItem {
  id: string;
  type: 'section';
  title: string;
  subtitle?: string;
  marksNote?: string;
}

export interface CQSubQuestion {
  id: string;
  text: string;
  marks: number;
}

export interface CQItem {
  id: string;
  type: 'cq';
  stem: string;
  image?: AttachedImage;
  table?: TableData;
  subQuestions: CQSubQuestion[];
}

export interface MCQItem {
  id: string;
  type: 'mcq';
  commonStem?: string;
  question: string;
  image?: AttachedImage;
  isMultiStatement?: boolean;
  statements?: string[];
  statementPrompt?: string;
  options: [string, string, string, string];
  marks: number;
  correctOption?: number; // 0..3
}

export interface SubPart {
  id: string;
  text: string;
  marks?: number;
}

export interface ShortQuestionItem {
  id: string;
  type: 'short';
  prompt: string;
  image?: AttachedImage;
  marks: number;
  marksBreakdown?: string;
  subParts?: SubPart[];
  hasOr?: boolean;
  orPrompt?: string;
  orImage?: AttachedImage;
  orMarks?: number;
  orSubParts?: SubPart[];
}

export interface PassageSubQuestion {
  id: string;
  text: string;
  marks: number;
}

export interface PassageItem {
  id: string;
  type: 'passage';
  title: string;
  passage: string;
  image?: AttachedImage;
  marksBreakdown?: string;
  questions: PassageSubQuestion[];
}

export type TableVariant = 'general' | 'matching' | 'substitution' | 'gap_clues';

export interface TableBlockItem {
  id: string;
  type: 'table';
  variant: TableVariant;
  prompt: string;
  marks: number;
  marksBreakdown?: string;
  clues?: string[];
  gapText?: string;
  table?: TableData;
}

export type QuestionItem =
  | SectionItem
  | CQItem
  | MCQItem
  | ShortQuestionItem
  | PassageItem
  | TableBlockItem;

export interface ExamPaper {
  id: string;
  updatedAt: string;
  header: PaperHeader;
  settings: PaperSettings;
  questions: QuestionItem[];
}

export interface SubjectDefinition {
  id: string;
  nameEn: string;
  nameBn: string;
  stream?: 'Common' | 'Science' | 'Business Studies' | 'Humanities';
  codeByLevel?: Partial<Record<EducationLevel, string>>;
  defaultLanguage: Language;
  defaultFormats: ExamFormat[];
}

export interface StarterPreset {
  id: string;
  title: string;
  subtitle: string;
  level: EducationLevel;
  format: ExamFormat;
  language: Language;
  buildPaper: () => ExamPaper;
}
