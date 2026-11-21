import React, { useState } from 'react';
import { Copy, FileText, Trash2, X } from 'lucide-react';
import {
  buildQuickBlankPaper,
  EDUCATION_LEVELS,
  getSubjectsForLevel,
  STARTER_PRESETS,
} from '../data/curriculum';
import { EducationLevel, ExamFormat, ExamPaper, Language } from '../types/paper';
import { calculateTotalMarks, countNumberedQuestions } from '../utils/formatters';

interface TemplateLibraryModalProps {
  mode: 'templates' | 'saved' | null;
  onClose: () => void;
  onLoadPaper: (paper: ExamPaper) => void;
  savedPapers: ExamPaper[];
  currentPaperId: string;
  onDeleteSaved: (id: string) => void;
  onDuplicateSaved: (paper: ExamPaper) => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  mode,
  onClose,
  onLoadPaper,
  savedPapers,
  currentPaperId,
  onDeleteSaved,
  onDuplicateSaved,
}) => {
  const [templateTab, setTemplateTab] = useState<'blank' | 'samples'>('blank');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('ssc');
  const [selectedClassIdx, setSelectedClassIdx] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState('physics');
  const [selectedFormat, setSelectedFormat] = useState<ExamFormat>('cq');
  const [selectedLang, setSelectedLang] = useState<Language>('bn');

  if (!mode) return null;

  const levelInfo =
    EDUCATION_LEVELS.find((l) => l.id === selectedLevel) ?? EDUCATION_LEVELS[2];
  const subjects = getSubjectsForLevel(selectedLevel);
  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];
  const classOptions = selectedLang === 'bn' ? levelInfo.classesBn : levelInfo.classesEn;
  const activeClass = classOptions[selectedClassIdx] ?? classOptions[0];

  const handleLevelSwitch = (lvl: EducationLevel) => {
    setSelectedLevel(lvl);
    setSelectedClassIdx(0);
    const nextSubs = getSubjectsForLevel(lvl);
    if (!nextSubs.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(nextSubs[0].id);
    }
  };

  const handleSubjectSwitch = (subId: string) => {
    setSelectedSubjectId(subId);
    const found = subjects.find((s) => s.id === subId);
    if (found) {
      setSelectedLang(found.defaultLanguage);
      if (!found.defaultFormats.includes(selectedFormat)) {
        setSelectedFormat(found.defaultFormats[0]);
      }
    }
  };

  const handleCreateCleanPaper = () => {
    const paper = buildQuickBlankPaper({
      level: selectedLevel,
      className: activeClass,
      subject: activeSubject,
      format: selectedFormat,
      language: selectedLang,
    });
    onLoadPaper(paper);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white border-t sm:border border-zinc-200 rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[86vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mt-2 sm:hidden shrink-0" />
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {mode === 'templates' ? 'Templates' : 'Saved Papers'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {mode === 'templates'
                ? 'Start with a clean blank paper for any class, or open a filled sample.'
                : 'Stored offline in this browser. Export a JSON draft anytime to back up.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-900 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean 2-Tab Switcher for Templates */}
        {mode === 'templates' && (
          <div className="grid grid-cols-2 border-b border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => setTemplateTab('blank')}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                templateTab === 'blank'
                  ? 'border-zinc-900 text-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Blank Paper (Clean Start)
            </button>
            <button
              type="button"
              onClick={() => setTemplateTab('samples')}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                templateTab === 'samples'
                  ? 'border-zinc-900 text-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Ready-Made Examples ({STARTER_PRESETS.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto thin-scroll p-4 sm:p-6 pb-safe">
          {mode === 'templates' && templateTab === 'blank' && (
            <div className="space-y-5">
              {/* Step A: Level */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-2">
                  1. Education Level
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EDUCATION_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleLevelSwitch(lvl.id)}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedLevel === lvl.id
                          ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {lvl.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step B: Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    2. Class
                  </label>
                  <select
                    value={selectedClassIdx}
                    onChange={(e) => setSelectedClassIdx(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 border border-zinc-200 rounded bg-white text-zinc-900"
                  >
                    {classOptions.map((c, idx) => (
                      <option key={c} value={idx}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    3. Subject
                  </label>
                  <select
                    value={activeSubject.id}
                    onChange={(e) => handleSubjectSwitch(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-zinc-200 rounded bg-white text-zinc-900"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nameEn} — {sub.nameBn}
                        {sub.codeByLevel?.[selectedLevel]
                          ? ` (${sub.codeByLevel[selectedLevel]})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step C: Format & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    4. Exam Format
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      [
                        { id: 'cq', label: 'CQ' },
                        { id: 'mcq', label: 'MCQ' },
                        { id: 'written', label: 'Written' },
                        { id: 'mixed', label: 'Mixed' },
                      ] as const
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`py-2 text-xs rounded border transition-colors cursor-pointer ${
                          selectedFormat === fmt.id
                            ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    5. Language
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedLang('bn')}
                      className={`py-2 text-xs rounded border transition-colors cursor-pointer ${
                        selectedLang === 'bn'
                          ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLang('en')}
                      className={`py-2 text-xs rounded border transition-colors cursor-pointer ${
                        selectedLang === 'en'
                          ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-500">
                  Creates a clean, empty paper with the right subject code, time, and layout.
                </span>
                <button
                  type="button"
                  onClick={handleCreateCleanPaper}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Create Blank Paper
                </button>
              </div>
            </div>
          )}

          {mode === 'templates' && templateTab === 'samples' && (
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded">
              {STARTER_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">{preset.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{preset.subtitle}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadPaper(preset.buildPaper());
                      onClose();
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium border border-zinc-300 text-zinc-800 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open Example
                  </button>
                </div>
              ))}
            </div>
          )}

          {mode === 'saved' && (
            <div className="space-y-3">
              {savedPapers.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-500">
                  No saved papers yet. Your active paper auto-saves here automatically.
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 border border-zinc-200 rounded">
                  {savedPapers.map((p) => {
                    const isCurrent = p.id === currentPaperId;
                    const qCount = countNumberedQuestions(p.questions);
                    const totalM = calculateTotalMarks(p.questions);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="text-sm font-medium text-zinc-900 truncate">
                              {p.header.subject || 'Untitled Paper'}
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-[#0F4C81] font-medium whitespace-nowrap">
                                · Open
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5 truncate">
                            {p.header.instituteName || 'No Institute'} · {p.header.className || 'No Class'} ·{' '}
                            {qCount} {qCount === 1 ? 'question' : 'questions'} · {totalM} marks
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => {
                                onLoadPaper(p);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs font-medium border border-zinc-300 text-zinc-800 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDuplicateSaved(p)}
                            title="Duplicate paper"
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={savedPapers.length <= 1}
                            onClick={() => onDeleteSaved(p.id)}
                            title="Delete saved paper"
                            className="p-1.5 text-zinc-400 hover:text-red-600 disabled:opacity-30 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
