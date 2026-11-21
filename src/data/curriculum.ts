import {
  EducationLevel,
  ExamFormat,
  ExamPaper,
  Language,
  QuestionItem,
  StarterPreset,
  SubjectDefinition,
} from '../types/paper';
import { createId, formatDigits } from '../utils/formatters';

export interface LevelInfo {
  id: EducationLevel;
  labelEn: string;
  labelBn: string;
  classesEn: string[];
  classesBn: string[];
}

export const EDUCATION_LEVELS: LevelInfo[] = [
  {
    id: 'primary',
    labelEn: 'Primary (Class 1–5)',
    labelBn: 'প্রাথমিক (১ম–৫ম শ্রেণি)',
    classesEn: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    classesBn: ['প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি'],
  },
  {
    id: 'junior',
    labelEn: 'Junior (Class 6–8)',
    labelBn: 'নিম্ন মাধ্যমিক (৬ষ্ঠ–৮ম শ্রেণি)',
    classesEn: ['Class 6', 'Class 7', 'Class 8'],
    classesBn: ['ষষ্ঠ শ্রেণি', 'সপ্তম শ্রেণি', 'অষ্টম শ্রেণি'],
  },
  {
    id: 'ssc',
    labelEn: 'SSC (Class 9–10)',
    labelBn: 'এসএসসি (৯ম–১০ম শ্রেণি)',
    classesEn: ['Class 9', 'Class 10', 'SSC Examinee'],
    classesBn: ['নবম শ্রেণি', 'দশম শ্রেণি', 'এসএসসি পরীক্ষার্থী'],
  },
  {
    id: 'hsc',
    labelEn: 'HSC (Class 11–12)',
    labelBn: 'এইচএসসি (১১শ–১২শ শ্রেণি)',
    classesEn: ['Class 11 (HSC 1st Year)', 'Class 12 (HSC 2nd Year)', 'HSC Examinee'],
    classesBn: ['একাদশ শ্রেণি', 'দ্বাদশ শ্রেণি', 'এইচএসসি পরীক্ষার্থী'],
  },
  {
    id: 'custom',
    labelEn: 'Custom / Class Test',
    labelBn: 'কাস্টম / শ্রেণি অভীক্ষা',
    classesEn: ['Class Test', 'Weekly Model Test', 'Scholarship Prep'],
    classesBn: ['শ্রেণি অভীক্ষা', 'সাপ্তাহিক মডেল টেস্ট', 'বৃত্তি প্রস্তুতি'],
  },
];

export const SUBJECT_CATALOG: SubjectDefinition[] = [
  {
    id: 'bangla-1',
    nameEn: 'Bangla 1st Paper',
    nameBn: 'বাংলা প্রথম পত্র',
    stream: 'Common',
    codeByLevel: { primary: '', junior: '101', ssc: '101', hsc: '101' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq', 'written'],
  },
  {
    id: 'bangla-2',
    nameEn: 'Bangla 2nd Paper',
    nameBn: 'বাংলা দ্বিতীয় পত্র',
    stream: 'Common',
    codeByLevel: { junior: '102', ssc: '102', hsc: '102' },
    defaultLanguage: 'bn',
    defaultFormats: ['written', 'mcq'],
  },
  {
    id: 'english-1',
    nameEn: 'English 1st Paper',
    nameBn: 'ইংরেজি প্রথম পত্র',
    stream: 'Common',
    codeByLevel: { primary: '', junior: '107', ssc: '107', hsc: '107' },
    defaultLanguage: 'en',
    defaultFormats: ['written', 'mixed'],
  },
  {
    id: 'english-2',
    nameEn: 'English 2nd Paper',
    nameBn: 'ইংরেজি দ্বিতীয় পত্র',
    stream: 'Common',
    codeByLevel: { junior: '108', ssc: '108', hsc: '108' },
    defaultLanguage: 'en',
    defaultFormats: ['written'],
  },
  {
    id: 'gen-math',
    nameEn: 'General Mathematics',
    nameBn: 'গণিত',
    stream: 'Common',
    codeByLevel: { primary: '', junior: '109', ssc: '109' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq', 'written'],
  },
  {
    id: 'higher-math',
    nameEn: 'Higher Mathematics',
    nameBn: 'উচ্চতর গণিত',
    stream: 'Science',
    codeByLevel: { ssc: '126', hsc: '265' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'physics',
    nameEn: 'Physics',
    nameBn: 'পদার্থবিজ্ঞান',
    stream: 'Science',
    codeByLevel: { ssc: '136', hsc: '174' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'chemistry',
    nameEn: 'Chemistry',
    nameBn: 'রসায়ন',
    stream: 'Science',
    codeByLevel: { ssc: '137', hsc: '176' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'biology',
    nameEn: 'Biology',
    nameBn: 'জীববিজ্ঞান',
    stream: 'Science',
    codeByLevel: { ssc: '138', hsc: '178' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'ict',
    nameEn: 'Information & Communication Technology (ICT)',
    nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    stream: 'Common',
    codeByLevel: { junior: '154', ssc: '154', hsc: '275' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'accounting',
    nameEn: 'Accounting',
    nameBn: 'হিসাববিজ্ঞান',
    stream: 'Business Studies',
    codeByLevel: { ssc: '146', hsc: '253' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'finance',
    nameEn: 'Finance & Banking',
    nameBn: 'ফিন্যান্স ও ব্যাংকিং',
    stream: 'Business Studies',
    codeByLevel: { ssc: '152', hsc: '292' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'business-org',
    nameEn: 'Business Organization & Management',
    nameBn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা',
    stream: 'Business Studies',
    codeByLevel: { ssc: '143', hsc: '277' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'economics',
    nameEn: 'Economics',
    nameBn: 'অর্থনীতি',
    stream: 'Humanities',
    codeByLevel: { ssc: '141', hsc: '109' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'civics',
    nameEn: 'Civics & Good Governance',
    nameBn: 'পৌরনীতি ও সুশাসন',
    stream: 'Humanities',
    codeByLevel: { ssc: '140', hsc: '269' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'history',
    nameEn: 'History',
    nameBn: 'ইতিহাস',
    stream: 'Humanities',
    codeByLevel: { ssc: '153', hsc: '304' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'geography',
    nameEn: 'Geography & Environment',
    nameBn: 'ভূগোল ও পরিবেশ',
    stream: 'Humanities',
    codeByLevel: { ssc: '110', hsc: '125' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq'],
  },
  {
    id: 'science',
    nameEn: 'General Science',
    nameBn: 'বিজ্ঞান',
    stream: 'Common',
    codeByLevel: { primary: '', junior: '127', ssc: '127' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq', 'written'],
  },
  {
    id: 'bgs',
    nameEn: 'Bangladesh & Global Studies (BGS)',
    nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',
    stream: 'Common',
    codeByLevel: { primary: '', junior: '150', ssc: '150' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq', 'written'],
  },
  {
    id: 'religion',
    nameEn: 'Religion & Moral Education',
    nameBn: 'ধর্ম ও নৈতিক শিক্ষা',
    stream: 'Common',
    codeByLevel: { primary: '', junior: '111', ssc: '111' },
    defaultLanguage: 'bn',
    defaultFormats: ['cq', 'mcq', 'written'],
  },
];

export function getSubjectsForLevel(level: EducationLevel): SubjectDefinition[] {
  if (level === 'primary') {
    const ids = new Set(['bangla-1', 'english-1', 'gen-math', 'science', 'bgs', 'religion']);
    return SUBJECT_CATALOG.filter((s) => ids.has(s.id));
  }
  if (level === 'junior') {
    const ids = new Set([
      'bangla-1',
      'bangla-2',
      'english-1',
      'english-2',
      'gen-math',
      'science',
      'bgs',
      'ict',
      'religion',
    ]);
    return SUBJECT_CATALOG.filter((s) => ids.has(s.id));
  }
  if (level === 'hsc') {
    const excluded = new Set(['gen-math', 'science', 'bgs', 'religion']);
    return SUBJECT_CATALOG.filter((s) => !excluded.has(s.id));
  }
  return SUBJECT_CATALOG;
}

export function buildQuickBlankPaper(params: {
  level: EducationLevel;
  className: string;
  subject: SubjectDefinition;
  format: ExamFormat;
  language: Language;
}): ExamPaper {
  const { level, className, subject, format, language } = params;
  const isBn = language === 'bn';
  const subjectName = isBn ? subject.nameBn : subject.nameEn;
  const code = subject.codeByLevel?.[level] ?? '';
  const isPracticalScience =
    (level === 'ssc' || level === 'hsc') &&
    ['physics', 'chemistry', 'biology', 'higher-math', 'ict', 'geography'].includes(subject.id);

  let fullMarks = '100';
  let time = isBn ? '৩ ঘণ্টা' : '3 Hours';
  let instructions = isBn
    ? 'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।'
    : 'The figures in the right margin indicate full marks.';
  let columns: 1 | 2 = 1;
  let questions: QuestionItem[] = [];

  if (format === 'mcq') {
    columns = 2;
    const mcqCount = level === 'custom' ? 15 : isPracticalScience ? 25 : 30;
    fullMarks = formatDigits(mcqCount, language);
    time = isBn ? `${formatDigits(mcqCount, 'bn')} মিনিট` : `${mcqCount} Minutes`;
    instructions = isBn
      ? `বিশেষ দ্রষ্টব্য: সঠিক উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট কর। প্রতিটি প্রশ্নের মান ১।`
      : `N.B.: Answer all questions. Each question carries 1 mark.`;
    questions = [
      {
        id: createId('mcq'),
        type: 'mcq',
        question: '',
        options: ['', '', '', ''],
        marks: 1,
      },
    ];
  } else if (format === 'cq') {
    const cqMarks = level === 'custom' ? 20 : isPracticalScience ? 50 : 70;
    const answerCount = level === 'custom' ? 2 : isPracticalScience ? 5 : 7;
    fullMarks = formatDigits(cqMarks, language);
    time =
      level === 'custom'
        ? isBn
          ? '৪৫ মিনিট'
          : '45 Minutes'
        : isBn
        ? '২ ঘণ্টা ৩০ মিনিট'
        : '2 Hours 30 Minutes';
    instructions = isBn
      ? `দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। যেকোনো ${formatDigits(answerCount, 'bn')}টি প্রশ্নের উত্তর দাও।`
      : `N.B.: Answer any ${answerCount} questions. Figures in the right margin indicate full marks.`;
    questions = [
      {
        id: createId('cq'),
        type: 'cq',
        stem: '',
        subQuestions: [
          { id: createId('sq'), text: '', marks: 1 },
          { id: createId('sq'), text: '', marks: 2 },
          { id: createId('sq'), text: '', marks: 3 },
          { id: createId('sq'), text: '', marks: 4 },
        ],
      },
    ];
  } else if (format === 'mixed') {
    fullMarks = formatDigits(level === 'custom' ? 30 : 100, language);
    time = level === 'custom' ? (isBn ? '১ ঘণ্টা' : '1 Hour') : isBn ? '৩ ঘণ্টা' : '3 Hours';
    instructions = isBn
      ? 'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। সকল প্রশ্নের উত্তর দিতে হবে।'
      : 'Answer all the questions. Figures in the right margin indicate full marks.';
    questions = [
      {
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
      },
    ];
  } else {
    fullMarks = formatDigits(level === 'custom' ? 25 : 100, language);
    time = level === 'custom' ? (isBn ? '৫০ মিনিট' : '50 Minutes') : isBn ? '২ ঘণ্টা ৩০ মিনিট' : '2 Hours 30 Minutes';
    instructions = isBn
      ? 'দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। নির্দেশনা অনুযায়ী উত্তর দাও।'
      : 'N.B.: Answer the questions as directed. Figures in the right margin indicate full marks.';
    questions = [
      {
        id: createId('sh'),
        type: 'short',
        prompt: '',
        marks: 10,
      },
    ];
  }

  const currentYear = new Date().getFullYear();
  const yearText = formatDigits(currentYear, language);
  const examTitle =
    level === 'custom'
      ? isBn
        ? `শ্রেণি অভীক্ষা – ${yearText}`
        : `Class Test – ${yearText}`
      : isBn
      ? `প্রাক-নির্বাচনি পরীক্ষা – ${yearText}`
      : `Pre-Test Examination – ${yearText}`;

  return {
    id: createId('paper'),
    updatedAt: new Date().toISOString(),
    header: {
      instituteName: '',
      instituteSubline: '',
      examName: examTitle,
      level,
      className,
      subject:
        format === 'cq'
          ? isBn
            ? `${subjectName} (সৃজনশীল)`
            : `${subjectName} (Creative)`
          : format === 'mcq'
          ? isBn
            ? `${subjectName} (বহুনির্বাচনি অভীক্ষা)`
            : `${subjectName} (Multiple Choice)`
          : subjectName,
      subjectCode: formatDigits(code, language),
      setCode: format === 'mcq' ? (isBn ? 'ক' : 'A') : '',
      date: '',
      time,
      fullMarks,
      instructions,
    },
    settings: {
      language,
      columns,
      fontSizePt: format === 'mcq' ? 10.5 : 11.5,
      fontFamily: 'serif',
      lineHeight: format === 'mcq' ? 1.45 : 1.55,
      showAnswerKey: false,
    },
    questions,
  };
}

// Ready-to-print authentic Bangladeshi Starter Presets
export const STARTER_PRESETS: StarterPreset[] = [
  {
    id: 'ssc-physics-cq-bn',
    title: 'SSC Physics (CQ · Bangla)',
    subtitle: 'Class 10 · Subject Code 136 · LaTeX equations, table stem & 1-2-3-4 marks',
    level: 'ssc',
    format: 'cq',
    language: 'bn',
    buildPaper: () => ({
      id: createId('paper'),
      updatedAt: new Date().toISOString(),
      header: {
        instituteName: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
        instituteSubline: 'মোহাম্মদপুর, ঢাকা-১২০৭',
        examName: 'নির্বাচনি পরীক্ষা – ২০২৬',
        level: 'ssc',
        className: 'দশম শ্রেণি (বিজ্ঞান)',
        subject: 'পদার্থবিজ্ঞান (সৃজনশীল)',
        subjectCode: '১৩৬',
        setCode: '',
        date: '২২ নভেম্বর ২০২৬',
        time: '২ ঘণ্টা ৩৫ মিনিট',
        fullMarks: '৫০',
        instructions:
          'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। প্রদত্ত উদ্দীপকগুলো মনোযোগসহকারে পড়ো এবং যেকোনো ৫টি প্রশ্নের উত্তর দাও।',
      },
      settings: {
        language: 'bn',
        columns: 1,
        fontSizePt: 11.5,
        fontFamily: 'serif',
        lineHeight: 1.55,
        showAnswerKey: false,
      },
      questions: [
        {
          id: createId('cq'),
          type: 'cq',
          stem: 'একটি গাড়ি স্থির অবস্থান থেকে সুষম ত্বরণে যাত্রা শুরু করে প্রথম $8\\ \\text{s}$ এ $160\\ \\text{m}$ দূরত্ব অতিক্রম করে। এরপর গাড়িটি পরবর্তী $10\\ \\text{s}$ সমবেগে চলে এবং ব্রেক প্রয়োগের ফলে $5\\ \\text{s}$ পর থেমে যায়।',
          subQuestions: [
            { id: createId('sq'), text: 'তাৎক্ষণিক দ্রুতি কাকে বলে?', marks: 1 },
            { id: createId('sq'), text: 'সুষম বৃত্তাকার পথে ঘূর্ণায়মান বস্তুর ত্বরণ থাকে কেন? ব্যাখ্যা কর।', marks: 2 },
            { id: createId('sq'), text: 'প্রথম $8\\ \\text{s}$ এ গাড়িটির ত্বরণ ও অর্জিত শেষবেগ নির্ণয় কর।', marks: 3 },
            { id: createId('sq'), text: 'গাড়িটির সম্পূর্ণ যাত্রাপথের বেগ-সময় লেখচিত্র অঙ্কন করে মোট অতিক্রান্ত দূরত্ব বিশ্লেষণ কর।', marks: 4 },
          ],
        },
        {
          id: createId('cq'),
          type: 'cq',
          stem: 'নিচের সারণিতে $2\\ \\text{kg}$ ভরের একটি বস্তুকে ভূ-পৃষ্ঠ হতে খাড়া উপরের দিকে $v_0 = 49\\ \\text{m s}^{-1}$ বেগে নিক্ষেপ করার পর বিভিন্ন উচ্চতায় বেগের মান দেখানো হলো (যেখানে $g = 9.8\\ \\text{m s}^{-2}$):',
          table: {
            showHeader: true,
            bordered: true,
            headers: ['অবস্থান', 'উচ্চতা $h\\ (\\text{m})$', 'বেগ $v\\ (\\text{m s}^{-1})$'],
            rows: [
              ['A (ভূমি)', '$0$', '$49$'],
              ['B', '$40$', '$v_B$'],
              ['C (সর্বোচ্চ বিন্দু)', '$H_{\\max}$', '$0$'],
            ],
            colAligns: ['center', 'center', 'center'],
          },
          subQuestions: [
            { id: createId('sq'), text: 'কর্মদক্ষতা কাকে বলে?', marks: 1 },
            { id: createId('sq'), text: 'অভিকর্ষীয় বিভবশক্তি ভর ও উচ্চতার ওপর কীভাবে নির্ভর করে?', marks: 2 },
            { id: createId('sq'), text: 'বস্তুটির সর্বোচ্চ উচ্চতা $H_{\\max}$ এবং B বিন্দুতে বেগ $v_B$ নির্ণয় কর।', marks: 3 },
            { id: createId('sq'), text: 'A, B ও C বিন্দুতে বস্তুটির মোট যান্ত্রিক শক্তি ধ্রুবক থাকে—গাণিতিকভাবে যাচাই কর।', marks: 4 },
          ],
        },
        {
          id: createId('cq'),
          type: 'cq',
          stem: 'একটি বৈদ্যুতিক বর্তনীতে $R_1 = 6\\ \\Omega$ এবং $R_2 = 12\\ \\Omega$ মানের দুটি রোধ সমান্তরালে যুক্ত করে তাদের সাথে $R_3 = 4\\ \\Omega$ রোধ শ্রেণিতে যুক্ত করা হলো। বর্তনীর দুই প্রান্তে $E = 24\\ \\text{V}$ তড়িচ্চালক শক্তির একটি কোষ সংযুক্ত আছে।',
          subQuestions: [
            { id: createId('sq'), text: 'ওহমের সূত্রটি বিবৃত কর।', marks: 1 },
            { id: createId('sq'), text: 'তাপমাত্রা বৃদ্ধি পেলে পরিবাহীর রোধ বৃদ্ধি পায় কেন?', marks: 2 },
            { id: createId('sq'), text: 'বর্তনীর তুল্য রোধ এবং মূল তড়িৎ প্রবাহ $I$ নির্ণয় কর।', marks: 3 },
            { id: createId('sq'), text: '$R_1$ ও $R_2$ রোধের মধ্য দিয়ে প্রবাহিত তড়িৎ প্রবাহ ও ব্যয়িত ক্ষমতার তুলনামূলক বিশ্লেষণ কর।', marks: 4 },
          ],
        },
      ],
    }),
  },
  {
    id: 'hsc-chemistry-mcq-bn',
    title: 'HSC Chemistry (2-Column MCQ · Bangla)',
    subtitle: 'Class 12 · Code 176 · 2-column board layout, multi-statement (i, ii, iii) & chemistry equations',
    level: 'hsc',
    format: 'mcq',
    language: 'bn',
    buildPaper: () => ({
      id: createId('paper'),
      updatedAt: new Date().toISOString(),
      header: {
        instituteName: 'নটর ডেম কলেজ, ঢাকা',
        instituteSubline: 'মতিঝিল, ঢাকা-১০০০',
        examName: 'মডেল টেস্ট – ২০২৬',
        level: 'hsc',
        className: 'দ্বাদশ শ্রেণি (বিজ্ঞান)',
        subject: 'রসায়ন প্রথম পত্র (বহুনির্বাচনি অভীক্ষা)',
        subjectCode: '১৭৬',
        setCode: 'ক',
        date: '২৫ নভেম্বর ২০২৬',
        time: '২৫ মিনিট',
        fullMarks: '২৫',
        instructions:
          'বিশেষ দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসংবলিত বৃত্তসমূহ হতে সঠিক/সর্বোৎকৃষ্ট উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট কর। প্রতিটি প্রশ্নের মান ১।',
      },
      settings: {
        language: 'bn',
        columns: 2,
        fontSizePt: 10.5,
        fontFamily: 'serif',
        lineHeight: 1.45,
        showAnswerKey: false,
      },
      questions: [
        {
          id: createId('mcq'),
          type: 'mcq',
          question: 'রিডবার্গ ধ্রুবক $R_H$ এর মান কোনটি?',
          options: [
            '$1.09678 \\times 10^7\\ \\text{m}^{-1}$',
            '$6.626 \\times 10^{-34}\\ \\text{J s}$',
            '$1.602 \\times 10^{-19}\\ \\text{C}$',
            '$8.314\\ \\text{J mol}^{-1}\\text{K}^{-1}$',
          ],
          marks: 1,
          correctOption: 0,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          question: '$\\text{CH}_4$ অণুতে কার্বন পরমাণুর সংকরায়ন কোন ধরনের?',
          options: ['$sp$', '$sp^2$', '$sp^3$', '$sp^3d$'],
          marks: 1,
          correctOption: 2,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          isMultiStatement: true,
          question: 'নিচের কোনগুলো $K_p = K_c$ শর্ত মেনে চলে?',
          statements: [
            '$\\text{H}_2(g) + \\text{I}_2(g) \\rightleftharpoons 2\\text{HI}(g)$',
            '$\\text{N}_2(g) + \\text{O}_2(g) \\rightleftharpoons 2\\text{NO}(g)$',
            '$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)$',
          ],
          statementPrompt: 'নিচের কোনটি সঠিক?',
          options: ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii'],
          marks: 1,
          correctOption: 0,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          question: '$0.005\\ \\text{M}\\ \\text{H}_2\\text{SO}_4$ দ্রবণের $\\text{pH}$ কত?',
          options: ['$1.0$', '$2.0$', '$2.3$', '$3.0$'],
          marks: 1,
          correctOption: 1,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          commonStem:
            'নিচের বিক্রিয়াটি লক্ষ্য কর এবং ৫ ও ৬ নং প্রশ্নের উত্তর দাও:\n$$\\text{N}_2(g) + 3\\text{H}_2(g) \\xrightleftharpoons{\\text{Fe},\\ 450^\\circ\\text{C}} 2\\text{NH}_3(g);\\ \\Delta H = -92\\ \\text{kJ}$$',
          question: 'উদ্দীপকের বিক্রিয়াটিতে প্রভাবক হিসেবে কোনটি ব্যবহৃত হয়েছে?',
          options: ['$\\text{Pt}$', '$\\text{Fe}$', '$\\text{V}_2\\text{O}_5$', '$\\text{Ni}$'],
          marks: 1,
          correctOption: 1,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          isMultiStatement: true,
          question: 'উদ্দীপকের বিক্রিয়াটিতে অ্যামোনিয়ার উৎপাদন বৃদ্ধির জন্য প্রয়োজন—',
          statements: ['উচ্চ চাপ প্রয়োগ', 'সর্বনিম্ন অনুকূল তাপমাত্রা', 'উৎপন্ন $\\text{NH}_3$ অপসারণ'],
          statementPrompt: 'নিচের কোনটি সঠিক?',
          options: ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii'],
          marks: 1,
          correctOption: 3,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          question: 'হাইড্রোজেন বর্ণালির কোন সিরিজটি দৃশ্যমান অঞ্চলে পাওয়া যায়?',
          options: ['লাইম্যান সিরিজ', 'বামার সিরিজ', 'প্যাশ্চেন সিরিজ', 'ব্র্যাকেট সিরিজ'],
          marks: 1,
          correctOption: 1,
        },
        {
          id: createId('mcq'),
          type: 'mcq',
          question: 'রক্তের $\\text{pH}$ নিয়ন্ত্রণে প্রধান বাফার কোনটি?',
          options: [
            '$\\text{H}_2\\text{CO}_3 / \\text{HCO}_3^-$',
            '$\\text{CH}_3\\text{COOH} / \\text{CH}_3\\text{COONa}$',
            '$\\text{NH}_4\\text{OH} / \\text{NH}_4\\text{Cl}$',
            '$\\text{HCl} / \\text{NaCl}$',
          ],
          marks: 1,
          correctOption: 0,
        },
      ],
    }),
  },
  {
    id: 'ssc-english-1-en',
    title: 'SSC English 1st Paper (English)',
    subtitle: 'Class 9–10 · Code 107 · Reading passage, gap-filling with clues & substitution table',
    level: 'ssc',
    format: 'mixed',
    language: 'en',
    buildPaper: () => ({
      id: createId('paper'),
      updatedAt: new Date().toISOString(),
      header: {
        instituteName: 'Viqarunnisa Noon School & College, Dhaka',
        instituteSubline: '1/A New Bailey Road, Dhaka-1000',
        examName: 'Test Examination – 2026',
        level: 'ssc',
        className: 'Class 10',
        subject: 'English First Paper',
        subjectCode: '107',
        setCode: '',
        date: '24 November 2026',
        time: '3 Hours',
        fullMarks: '100',
        instructions:
          'Answer all the questions. Figures in the right margin indicate full marks.',
      },
      settings: {
        language: 'en',
        columns: 1,
        fontSizePt: 11,
        fontFamily: 'serif',
        lineHeight: 1.5,
        showAnswerKey: false,
      },
      questions: [
        {
          id: createId('sec'),
          type: 'section',
          title: 'Part A: Reading Test',
          marksNote: 'Marks: 50',
        },
        {
          id: createId('pas'),
          type: 'passage',
          title: 'Read the passage carefully and answer the questions following it.',
          passage:
            '21 February is observed as Shaheed Dibosh every year throughout the country in remembrance of the martyrs of Language Movement of 1952. The commemoration begins at the early hours of the day with mourning songs that recall the supreme sacrifices of our language martyrs. People wear black badges and go to the Shaheed Minar in barefoot processions, singing mourning songs. They place wreaths at the Minar. On 17 November 1999, UNESCO proclaimed February 21 as the International Mother Language Day in recognition of the sacrifices of the martyrs for the rightful place of Bangla.',
          marksBreakdown: '2 × 4 = 8',
          questions: [
            { id: createId('pq'), text: 'Why is 21 February observed as Shaheed Dibosh every year?', marks: 2 },
            { id: createId('pq'), text: 'How do people pay tribute to the language martyrs at the Shaheed Minar?', marks: 2 },
            { id: createId('pq'), text: 'When and by whom was 21 February proclaimed as International Mother Language Day?', marks: 2 },
            { id: createId('pq'), text: 'Why is the Language Movement of 1952 significant in our national history?', marks: 2 },
          ],
        },
        {
          id: createId('tbl'),
          type: 'table',
          variant: 'gap_clues',
          prompt: 'Fill in the blanks with suitable words from the box below. There are more words than needed. Make any grammatical change if necessary.',
          marks: 5,
          marksBreakdown: '0.5 × 10 = 5',
          clues: ['rivers', 'fertile', 'agriculture', 'natural', 'beauty', 'seasons', 'depends', 'green', 'wealth', 'country', 'bless', 'climate'],
          gapText:
            'Bangladesh is a land of (a) ______ beauty. She is blessed with numerous (b) ______ that make her soil extremely (c) ______. Most of the people of our (d) ______ live in villages and their livelihood largely (e) ______ on (f) ______. The six (g) ______ come in rotation and adorn the landscape with fresh (h) ______ fields. Indeed, our rivers are our greatest national (i) ______ and keep our (j) ______ moderate.',
        },
        {
          id: createId('tbl'),
          type: 'table',
          variant: 'substitution',
          prompt: 'Make five meaningful sentences using parts of sentences from each column of the table below.',
          marks: 5,
          marksBreakdown: '1 × 5 = 5',
          table: {
            showHeader: true,
            bordered: true,
            headers: ['Column A', 'Column B', 'Column C'],
            rows: [
              ['Education', 'enlightens', 'the backbone of a nation.'],
              ['It', 'is', 'our mind and refines our sensibility.'],
              ['An educated person', 'helps', 'between right and wrong.'],
              ['True education', 'can distinguish', 'us to become self-reliant.'],
              ['Without education, no nation', 'can prosper', 'in the modern competitive world.'],
            ],
            colAligns: ['left', 'left', 'left'],
          },
        },
        {
          id: createId('sec'),
          type: 'section',
          title: 'Part B: Writing Test',
          marksNote: 'Marks: 50',
        },
        {
          id: createId('sh'),
          type: 'short',
          prompt: 'Write a paragraph on **"A Book Fair You Have Visited"** in about 200 words answering the following questions:',
          marks: 10,
          subParts: [
            { id: createId('sp'), text: 'What is a book fair and where was it held?' },
            { id: createId('sp'), text: 'What types of books and stalls did you see there?' },
            { id: createId('sp'), text: 'How does a book fair enrich our reading habits?' },
          ],
          hasOr: true,
          orPrompt: 'Write a paragraph on **"Climate Change and Its Impact on Bangladesh"** in about 200 words.',
          orMarks: 10,
        },
      ],
    }),
  },
  {
    id: 'hsc-accounting-cq-bn',
    title: 'HSC Accounting (Trial Balance CQ · Bangla)',
    subtitle: 'Class 11–12 · Code 253 · Financial statement table with right-aligned amounts',
    level: 'hsc',
    format: 'cq',
    language: 'bn',
    buildPaper: () => ({
      id: createId('paper'),
      updatedAt: new Date().toISOString(),
      header: {
        instituteName: 'ঢাকা কমার্স কলেজ',
        instituteSubline: 'মিরপুর, ঢাকা-১২১৬',
        examName: 'অর্ধ-বার্ষিক পরীক্ষা – ২০২৬',
        level: 'hsc',
        className: 'একাদশ শ্রেণি (ব্যবসায় শিক্ষা)',
        subject: 'হিসাববিজ্ঞান প্রথম পত্র (সৃজনশীল)',
        subjectCode: '২৫৩',
        setCode: '',
        date: '২৮ নভেম্বর ২০২৬',
        time: '২ ঘণ্টা ৩০ মিনিট',
        fullMarks: '৭০',
        instructions:
          'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। ক-বিভাগ থেকে ২টি এবং খ-বিভাগ থেকে ৫টিসহ মোট ৭টি প্রশ্নের উত্তর দাও।',
      },
      settings: {
        language: 'bn',
        columns: 1,
        fontSizePt: 11.5,
        fontFamily: 'serif',
        lineHeight: 1.55,
        showAnswerKey: false,
      },
      questions: [
        {
          id: createId('sec'),
          type: 'section',
          title: 'ক-বিভাগ (আবশ্যিক)',
          subtitle: 'এ বিভাগ থেকে দুটি প্রশ্নেরই উত্তর দিতে হবে।',
        },
        {
          id: createId('cq'),
          type: 'cq',
          stem: '২০২৫ সালের ৩১ ডিসেম্বর তারিখে **রহমান ট্রেডার্স**-এর রেওয়ামিল নিম্নরূপ:',
          table: {
            showHeader: true,
            bordered: true,
            headers: ['হিসাবের শিরোনাম', 'ডেবিট (টাকা)', 'ক্রেডিট (টাকা)'],
            rows: [
              ['প্রারম্ভিক মজুদ পণ্য (১-১-২০২৫)', '৪৫,০০০', '—'],
              ['ক্রয় ও বিক্রয়', '২,২০,০০০', '৩,৮৫,০০০'],
              ['বেতন (১০ মাসের)', '৫০,০০০', '—'],
              ['আসবাবপত্র', '১,২০,০০০', '—'],
              ['প্রাপ্য হিসাব ও প্রদেয় হিসাব', '৬৫,০০০', '৪০,০০০'],
              ['মূলধন', '—', '২,০০,০০০'],
              ['হাতে নগদ', '১,২৫,০০০', '—'],
              ['মোট', '৬,২৫,০০০', '৬,২৫,০০০'],
            ],
            colAligns: ['left', 'right', 'right'],
          },
          subQuestions: [
            { id: createId('sq'), text: 'সমন্বয়সমূহ: (১) সমাপনী মজুদ পণ্যের মূল্য ৫৫,০০০ টাকা। (২) আসবাবপত্রের ওপর ১০% অবচয় ধরতে হবে। — প্রারম্ভিক ও সমাপনী মজুদ পণ্যের পার্থক্য এবং বকেয়া বেতনের পরিমাণ নির্ণয় কর।', marks: 2 },
            { id: createId('sq'), text: 'রহমান ট্রেডার্স-এর ৩১ ডিসেম্বর ২০২৫ তারিখে সমাপ্ত বছরের বিশদ আয় বিবরণী প্রস্তুত কর।', marks: 4 },
            { id: createId('sq'), text: 'উক্ত তারিখে প্রতিষ্ঠানের আর্থিক অবস্থার বিবরণী (মোট সম্পদ ও দায়-মালিকানা স্বত্ব) প্রস্তুত কর।', marks: 4 },
          ],
        },
      ],
    }),
  },
  {
    id: 'primary-class5-math-bn',
    title: 'Primary Class 5 (Math & Matching · Bangla)',
    subtitle: 'Class 5 · Matching table, short arithmetic & descriptive problems with Or/অথবা',
    level: 'primary',
    format: 'written',
    language: 'bn',
    buildPaper: () => ({
      id: createId('paper'),
      updatedAt: new Date().toISOString(),
      header: {
        instituteName: 'উদয়ন সরকারি প্রাথমিক বিদ্যালয়',
        instituteSubline: 'কুমিল্লা সদর, কুমিল্লা',
        examName: 'বার্ষিক পরীক্ষা – ২০২৬',
        level: 'primary',
        className: 'পঞ্চম শ্রেণি',
        subject: 'প্রাথমিক গণিত',
        subjectCode: '',
        setCode: '',
        date: '০৫ ডিসেম্বর ২০২৬',
        time: '২ ঘণ্টা ৩০ মিনিট',
        fullMarks: '১০০',
        instructions:
          'দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। সকল প্রশ্নের উত্তর সুন্দর ও পরিচ্ছন্নভাবে লেখো।',
      },
      settings: {
        language: 'bn',
        columns: 1,
        fontSizePt: 12,
        fontFamily: 'serif',
        lineHeight: 1.6,
        showAnswerKey: false,
      },
      questions: [
        {
          id: createId('sh'),
          type: 'short',
          prompt: 'নিচের সংক্ষিপ্ত প্রশ্নগুলোর উত্তর উত্তরপত্রে লেখো:',
          marks: 10,
          marksBreakdown: '২ × ৫ = ১০',
          subParts: [
            { id: createId('sp'), text: '$\\frac{3}{4}$ এবং $\\frac{5}{8}$ এর মধ্যে কোন ভগ্নাংশটি বড়?', marks: 2 },
            { id: createId('sp'), text: '$18$, $24$ এবং $36$ এর গ.সা.গু. কত?', marks: 2 },
            { id: createId('sp'), text: 'একটি বর্গাকার ক্ষেত্রের এক বাহুর দৈর্ঘ্য $12\\ \\text{মিটার}$ হলে এর ক্ষেত্রফল কত?', marks: 2 },
            { id: createId('sp'), text: 'শতকরা প্রতীক (%) দ্বারা কী বোঝায়?', marks: 2 },
            { id: createId('sp'), text: 'একটি ত্রিভুজের তিন কোণের সমষ্টি কত ডিগ্রি?', marks: 2 },
          ],
        },
        {
          id: createId('tbl'),
          type: 'table',
          variant: 'matching',
          prompt: 'বাম পাশের গাণিতিক উক্তির সাথে ডান পাশের সঠিক মানের মিলকরণ কর:',
          marks: 5,
          marksBreakdown: '১ × ৫ = ৫',
          table: {
            showHeader: true,
            bordered: true,
            headers: ['কলাম ক', 'কলাম খ'],
            rows: [
              ['(ক) $1\\ \\text{কিলোমিটার}$', '(১) $90^\\circ$'],
              ['(খ) সমকোণের মান', '(২) $1000\\ \\text{মিটার}$'],
              ['(গ) $\\frac{1}{2}$ এর শতকরা রূপ', '(৩) $366\\ \\text{দিন}$'],
              ['(ঘ) অধিবর্ষ (Leap Year)', '(৪) $50\\%$'],
              ['(ঙ) বৃত্তের ব্যাস', '(৫) $2 \\times \\text{ব্যাসার্ধ}$'],
            ],
            colAligns: ['left', 'left'],
          },
        },
        {
          id: createId('sh'),
          type: 'short',
          prompt: 'একজন কৃষক তাঁর জমির $\\frac{1}{4}$ অংশে ধান, $\\frac{2}{5}$ অংশে পাট এবং বাকি অংশে সবজি চাষ করলেন।',
          marks: 8,
          subParts: [
            { id: createId('sp'), text: 'তিনি মোট জমির কত অংশে ধান ও পাট চাষ করলেন?', marks: 4 },
            { id: createId('sp'), text: 'তিনি জমির কত অংশে সবজি চাষ করলেন?', marks: 4 },
          ],
          hasOr: true,
          orPrompt: 'বার্ষিক $8\\%$ মুনাফায় কত টাকার $5$ বছরের মুনাফা $2,400$ টাকা হবে? আসলসহ মোট মুনাফা-আসল নির্ণয় কর।',
          orMarks: 8,
        },
      ],
    }),
  },
];
