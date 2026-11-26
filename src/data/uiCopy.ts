export type UiLang = 'bn' | 'en';

export interface UiCopy {
  brand: string;
  newPaper: string;
  templates: string;
  drafts: string;
  savedPapers: string;
  importDraft: string;
  exportDraft: string;
  autoSavedOffline: string;
  printPdf: string;
  preparingPdf: string;
  menu: string;
  step1: string;
  step2: string;
  step3: string;
  mobileSetup: string;
  mobileQuestions: string;
  mobileStyle: string;
  mobilePreview: string;
  backToSetup: string;
  backToQuestions: string;
  nextQuestions: string;
  nextStylePrint: string;
  downloadA4Pdf: string;
  a4LivePreview: string;
  fit: string;
  // Setup
  paperSetupTitle: string;
  paperSetupDesc: string;
  instituteName: string;
  examName: string;
  levelSubject: string;
  chooseNctbSubject: string;
  timeLabel: string;
  fullMarksLabel: string;
  morePaperDetails: string;
  hideOptional: string;
  optionalSummary: string;
  className: string;
  addressEiin: string;
  subjectCode: string;
  setCode: string;
  examDate: string;
  generalInstructions: string;
  addLogo: string;
  // Questions
  questionsTitle: string;
  clearAll: string;
  marksWord: string;
  noQuestionsEmpty: string;
  addQuestionTitle: string;
  qTypeCq: string;
  qTypeMcq: string;
  qTypeShort: string;
  qTypePassage: string;
  qTypeTable: string;
  qTypeSection: string;
  quickPasteMcqBtn: string;
  quickPasteTitle: string;
  quickPasteDesc: string;
  quickPastePlaceholder: string;
  quickPasteCancel: string;
  quickPasteAdd: string;
  addAnotherPrefix: string;
  equationBtn: string;
  quickEquationHint: string;
  // Style & Print
  stylePrintTitle: string;
  stylePrintDesc: string;
  paperLangNumbering: string;
  pageLayout: string;
  oneColumn: string;
  oneColumnDesc: string;
  twoColumn: string;
  twoColumnDesc: string;
  fontStyle: string;
  serifTitle: string;
  sansTitle: string;
  fontSize: string;
  lineSpacing: string;
  compact: string;
  normal: string;
  relaxed: string;
  showAnswerKey: string;
  showAnswerKeyDesc: string;
  // Equation modal & inline pill
  eqBuilderTitle: string;
  eqEditTitle: string;
  eqSimpleMode: string;
  eqProMode: string;
  eqSimpleHint: string;
  eqProHint: string;
  eqInlinePlaceholder: string;
  eqMoreSymbols: string;
  eqInsert: string;
  eqSave: string;
  eqDelete: string;
  eqCancel: string;
  eqPreview: string;
  eqNumbersSigns: string;
  eqFillBoxes: string;
  eqReadyFormulas: string;
  eqStructures: string;
  eqSymbols: string;
  eqLinearBar: string;
  eqRecent: string;
  // Preview click hint
  clickToEditHint: string;
  editLabel: string;
}

export const UI_COPY: Record<UiLang, UiCopy> = {
  bn: {
    brand: 'প্রশ্নপত্র',
    newPaper: '+ নতুন প্রশ্ন',
    templates: 'টেমপ্লেট',
    drafts: 'খসড়া',
    savedPapers: 'সংরক্ষিত প্রশ্নপত্র',
    importDraft: 'খসড়া ইমপোর্ট (.json)',
    exportDraft: 'খসড়া এক্সপোর্ট (.json)',
    autoSavedOffline: 'ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত',
    printPdf: 'প্রিন্ট / PDF',
    preparingPdf: 'PDF তৈরি হচ্ছে...',
    menu: 'মেনু',
    step1: '১. তথ্য ও শিরোনাম',
    step2: '২. প্রশ্ন যোগ',
    step3: '৩. সাজসজ্জা ও প্রিন্ট',
    mobileSetup: 'তথ্য',
    mobileQuestions: 'প্রশ্ন',
    mobileStyle: 'সাজসজ্জা',
    mobilePreview: 'A4 পাতা',
    backToSetup: 'তথ্যে ফিরুন',
    backToQuestions: 'প্রশ্নে ফিরুন',
    nextQuestions: 'পরবর্তী: প্রশ্ন যোগ',
    nextStylePrint: 'পরবর্তী: সাজসজ্জা ও প্রিন্ট',
    downloadA4Pdf: 'A4 PDF ডাউনলোড',
    a4LivePreview: 'A4 লাইভ প্রিভিউ (ক্লিক করে সম্পাদনা করুন)',
    fit: 'ফিট',
    paperSetupTitle: 'প্রশ্নপত্রের তথ্য',
    paperSetupDesc: 'প্রতিষ্ঠান ও পরীক্ষার মূল তথ্য লিখুন। ডানপাশের A4 পাতায় সাথে সাথে দেখা যাবে।',
    instituteName: '১. প্রতিষ্ঠানের নাম',
    examName: '২. পরীক্ষার নাম',
    levelSubject: '৩. শ্রেণি ও বিষয়',
    chooseNctbSubject: 'NCTB বিষয় বেছে নিন...',
    timeLabel: '৪. সময়',
    fullMarksLabel: '৫. পূর্ণমান',
    morePaperDetails: 'আরও তথ্য (ঐচ্ছিক)',
    hideOptional: 'লুকান',
    optionalSummary: 'শ্রেণি, বিষয় কোড, নির্দেশনা, লোগো',
    className: 'শ্রেণি',
    addressEiin: 'ঠিকানা / EIIN',
    subjectCode: 'বিষয় কোড',
    setCode: 'সেট কোড',
    examDate: 'পরীক্ষার তারিখ',
    generalInstructions: 'সাধারণ নির্দেশনা (দ্রষ্টব্য)',
    addLogo: 'প্রতিষ্ঠানের লোগো যোগ করুন',
    questionsTitle: 'প্রশ্নসমূহ',
    clearAll: 'সব মুছুন',
    marksWord: 'নম্বর',
    noQuestionsEmpty: 'এখনো কোনো প্রশ্ন নেই। নিচের যেকোনো ধরন বেছে নিয়ে লেখা শুরু করুন।',
    addQuestionTitle: 'নতুন প্রশ্ন যোগ করুন',
    qTypeCq: 'সৃজনশীল (CQ)',
    qTypeMcq: 'বহুনির্বাচনি (MCQ)',
    qTypeShort: 'সংক্ষিপ্ত / বর্ণনামূলক',
    qTypePassage: 'অনুচ্ছেদ (Passage)',
    qTypeTable: 'ছক / টেবিল',
    qTypeSection: 'বিভাগ বিভাজক',
    quickPasteMcqBtn: 'দ্রুত MCQ পেস্ট',
    quickPasteTitle: 'একসাথে অনেক MCQ যোগ করুন',
    quickPasteDesc: 'Word বা নোটপ্যাড থেকে প্রশ্ন কপি করে এখানে পেস্ট করুন। প্রতিটি প্রশ্নের পর ক) খ) গ) ঘ) বা a) b) c) d) দিন।',
    quickPastePlaceholder:
      '১. নিচের কোনটি ভেক্টর রাশি?\nক) দ্রুতি\nখ) কাজ\nগ) বেগ\nঘ) শক্তি\n\n২. পানির রাসায়নিক সংকেত কোনটি?\nক) H2O\nখ) CO2\nগ) NaCl\nঘ) O2',
    quickPasteCancel: 'বাতিল',
    quickPasteAdd: 'প্রশ্নগুলো যোগ করুন',
    addAnotherPrefix: '+ আরেকটি',
    equationBtn: 'সমীকরণ',
    quickEquationHint:
      'টিপস: লেখার মাঝে Alt + = চাপলে সরাসরি MS Word-এর মতো সমীকরণ লেখা যাবে, অথবা সমীকরণে ক্লিক করে পরিবর্তন করুন।',
    stylePrintTitle: 'সাজসজ্জা ও প্রিন্ট',
    stylePrintDesc: 'প্রশ্নপত্রের ভাষা, কলাম এবং ফন্ট ঠিক করে প্রিন্ট বা PDF ডাউনলোড করুন।',
    paperLangNumbering: 'প্রশ্নপত্রের ভাষা ও নম্বর',
    pageLayout: 'পাতার কলাম',
    oneColumn: '১-কলাম',
    oneColumnDesc: 'সৃজনশীল ও লিখিত প্রশ্ন',
    twoColumn: '২-কলাম',
    twoColumnDesc: 'বোর্ড স্টাইল MCQ',
    fontStyle: 'ফন্ট স্টাইল',
    serifTitle: 'সেরিফ (বোর্ড ক্লাসিক)',
    sansTitle: 'স্যান্স (আধুনিক পরিচ্ছন্ন)',
    fontSize: 'অক্ষরের আকার',
    lineSpacing: 'লাইনের ফাঁকা',
    compact: 'চাপা',
    normal: 'স্বাভাবিক',
    relaxed: 'খোলা',
    showAnswerKey: 'MCQ উত্তরপত্র যুক্ত করুন',
    showAnswerKeyDesc: 'শেষ পাতায় সঠিক উত্তরের তালিকা দেখাবে',
    eqBuilderTitle: 'সমীকরণ তৈরি করুন',
    eqEditTitle: 'সমীকরণ পরিবর্তন করুন',
    eqSimpleMode: 'সহজ মোড',
    eqProMode: 'Word / প্রো মোড',
    eqSimpleHint: 'খালি ঘরে ক্লিক করে সংখ্যা বা অক্ষর বসান, অথবা নিচের প্রস্তুত সূত্র বেছে নিন।',
    eqProHint: 'MS Word শর্টকাট: a/b, x^2, H_2, \\theta, \\sqrt(x) লিখে Space চাপুন।',
    eqInlinePlaceholder: 'যেমন: a/b, x^2, \\theta লিখে Space চাপুন...',
    eqMoreSymbols: 'আরও চিহ্ন',
    eqInsert: 'যুক্ত করুন',
    eqSave: 'সংরক্ষণ করুন',
    eqDelete: 'মুছুন',
    eqCancel: 'বাতিল',
    eqPreview: 'প্রিভিউ',
    eqNumbersSigns: 'সংখ্যা ও চিহ্ন',
    eqFillBoxes: 'খালি ঘর (ভগ্নাংশ, পাওয়ার, রুট)',
    eqReadyFormulas: 'প্রস্তুত সূত্র (১ ক্লিকে বসান)',
    eqStructures: 'কাঠামো (Structures)',
    eqSymbols: 'চিহ্ন (Symbols)',
    eqLinearBar: 'Word / LaTeX লাইন',
    eqRecent: 'সম্প্রতি ব্যবহৃত',
    clickToEditHint: 'সম্পাদনা করতে ক্লিক করুন',
    editLabel: 'সম্পাদনা',
  },
  en: {
    brand: 'ProshnoPatra',
    newPaper: '+ New Paper',
    templates: 'Templates',
    drafts: 'Drafts',
    savedPapers: 'Saved Papers',
    importDraft: 'Import Draft (.json)',
    exportDraft: 'Export Draft (.json)',
    autoSavedOffline: 'Auto-saved offline in browser',
    printPdf: 'Print / PDF',
    preparingPdf: 'Preparing PDF...',
    menu: 'Menu',
    step1: '1. Setup',
    step2: '2. Questions',
    step3: '3. Style & Print',
    mobileSetup: 'Setup',
    mobileQuestions: 'Questions',
    mobileStyle: 'Style',
    mobilePreview: 'A4 Sheet',
    backToSetup: 'Back to Setup',
    backToQuestions: 'Back to Questions',
    nextQuestions: 'Next: Questions',
    nextStylePrint: 'Next: Style & Print',
    downloadA4Pdf: 'Download A4 PDF',
    a4LivePreview: 'A4 Live Preview (click any item to edit)',
    fit: 'Fit',
    paperSetupTitle: 'Paper Setup',
    paperSetupDesc: 'Fill in the basics for your exam header. Changes appear live on the A4 sheet.',
    instituteName: '1. Institute Name',
    examName: '2. Exam Name',
    levelSubject: '3. Level & Subject',
    chooseNctbSubject: 'Choose NCTB subject...',
    timeLabel: '4. Time',
    fullMarksLabel: '5. Full Marks',
    morePaperDetails: 'More Paper Details',
    hideOptional: 'Hide optional fields',
    optionalSummary: 'Class, codes, instructions, logo',
    className: 'Class Name',
    addressEiin: 'Address / EIIN',
    subjectCode: 'Subject Code',
    setCode: 'Set Code',
    examDate: 'Exam Date',
    generalInstructions: 'General Instructions (দ্রষ্টব্য / N.B.)',
    addLogo: 'Add Institute Logo',
    questionsTitle: 'Questions',
    clearAll: 'Clear all',
    marksWord: 'marks',
    noQuestionsEmpty: 'No questions yet. Choose a question format below to start writing.',
    addQuestionTitle: 'Add Question',
    qTypeCq: 'Creative (CQ)',
    qTypeMcq: 'MCQ (বহুনির্বাচনি)',
    qTypeShort: 'Short / Desc.',
    qTypePassage: 'Reading Passage',
    qTypeTable: 'Table / Grammar',
    qTypeSection: 'Section Divider',
    quickPasteMcqBtn: 'Quick Paste MCQs',
    quickPasteTitle: 'Quick Paste Multiple MCQs',
    quickPasteDesc: 'Paste MCQs from Word or Notepad. Separate options with a) b) c) d) or ক) খ) গ) ঘ).',
    quickPastePlaceholder:
      '1. Which one is a vector quantity?\na) Speed\nb) Work\nc) Velocity\nd) Energy',
    quickPasteCancel: 'Cancel',
    quickPasteAdd: 'Add MCQs',
    addAnotherPrefix: '+ Add another',
    equationBtn: 'Equation',
    quickEquationHint:
      'Tip: Press Alt + = while typing for MS Word-style equations, or tap any math chip to edit.',
    stylePrintTitle: 'Style & Print',
    stylePrintDesc: 'Adjust language, page columns, and typography before downloading or printing your A4 PDF.',
    paperLangNumbering: 'Paper Language & Numbering',
    pageLayout: 'Page Layout',
    oneColumn: '1-Column',
    oneColumnDesc: 'Written & CQ papers',
    twoColumn: '2-Column',
    twoColumnDesc: 'Board-style MCQ',
    fontStyle: 'Font Style',
    serifTitle: 'Serif (Board Classic)',
    sansTitle: 'Sans (Modern Clean)',
    fontSize: 'Font Size',
    lineSpacing: 'Line Spacing',
    compact: 'Compact',
    normal: 'Normal',
    relaxed: 'Relaxed',
    showAnswerKey: 'Include MCQ Answer Key',
    showAnswerKeyDesc: 'Appends an answer key table at the end of the paper',
    eqBuilderTitle: 'Equation Builder',
    eqEditTitle: 'Edit Equation',
    eqSimpleMode: 'Simple Mode',
    eqProMode: 'Word / Pro Mode',
    eqSimpleHint: 'Tap boxes to fill numbers, or pick a ready-made formula below.',
    eqProHint: 'MS Word shortcuts: type a/b, x^2, H_2, \\theta, \\sqrt(x) then press Space.',
    eqInlinePlaceholder: 'Type a/b, x^2, \\theta + Space...',
    eqMoreSymbols: 'More',
    eqInsert: 'Insert',
    eqSave: 'Save',
    eqDelete: 'Delete',
    eqCancel: 'Cancel',
    eqPreview: 'Preview',
    eqNumbersSigns: 'Numbers & Basic Signs',
    eqFillBoxes: 'Fill-in Shapes (Fraction, Power, Root)',
    eqReadyFormulas: 'Ready Formulas (1-Click)',
    eqStructures: 'Structures',
    eqSymbols: 'Symbols',
    eqLinearBar: 'Word / LaTeX Linear',
    eqRecent: 'Recent',
    clickToEditHint: 'Click to edit',
    editLabel: 'Edit',
  },
};
