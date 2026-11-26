import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { EDUCATION_LEVELS, getSubjectsForLevel } from '../data/curriculum';
import { EducationLevel, Language, PaperHeader } from '../types/paper';
import { formatDigits } from '../utils/formatters';
import { UI_COPY, UiLang } from '../data/uiCopy';
import { ImageAttachmentControl } from './ImageAttachmentControl';

interface HeaderEditorProps {
  header: PaperHeader;
  language: Language;
  uiLang?: UiLang;
  onChange: (next: PaperHeader) => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  header,
  language,
  uiLang = 'bn',
  onChange,
}) => {
  const t = UI_COPY[uiLang];
  const [showMore, setShowMore] = useState(false);
  const levelInfo = EDUCATION_LEVELS.find((l) => l.id === header.level) ?? EDUCATION_LEVELS[2];
  const subjects = getSubjectsForLevel(header.level);

  const update = (patch: Partial<PaperHeader>) => onChange({ ...header, ...patch });

  const handleLevelChange = (newLevel: EducationLevel) => {
    const info = EDUCATION_LEVELS.find((l) => l.id === newLevel) ?? EDUCATION_LEVELS[0];
    const defaultClass = language === 'bn' ? info.classesBn[0] : info.classesEn[0];
    update({ level: newLevel, className: defaultClass });
  };

  const handleSubjectPick = (subjectId: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;
    const code = sub.codeByLevel?.[header.level] ?? '';
    update({
      subject: language === 'bn' ? sub.nameBn : sub.nameEn,
      subjectCode: code ? formatDigits(code, language) : '',
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">{t.paperSetupTitle}</h2>
        <p className="text-xs text-zinc-500 mt-1">{t.paperSetupDesc}</p>
      </div>

      {/* 5 Essential Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            {t.instituteName}
          </label>
          <input
            type="text"
            value={header.instituteName}
            onChange={(e) => update({ instituteName: e.target.value })}
            placeholder="e.g. ঢাকা রেসিডেনসিয়াল মডেল কলেজ / Ideal School & College"
            className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-[#0F4C81]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            {t.examName}
          </label>
          <input
            type="text"
            value={header.examName}
            onChange={(e) => update({ examName: e.target.value })}
            placeholder="e.g. নির্বাচনি পরীক্ষা – ২০২৬ / Annual Examination – 2026"
            className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-[#0F4C81]"
          />
        </div>

        <div className="space-y-2.5">
          <label className="block text-xs font-medium text-zinc-700">
            {t.levelSubject}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <select
              aria-label="Education Level"
              value={header.level}
              onChange={(e) => handleLevelChange(e.target.value as EducationLevel)}
              className="w-full text-base sm:text-sm px-2.5 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-900"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.labelEn}
                </option>
              ))}
            </select>

            <select
              aria-label="Subject Preset"
              value=""
              onChange={(e) => handleSubjectPick(e.target.value)}
              className="w-full text-base sm:text-sm px-2.5 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-700"
            >
              <option value="">{t.chooseNctbSubject}</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nameEn} — {sub.nameBn}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={header.subject}
            onChange={(e) => update({ subject: e.target.value })}
            placeholder="Subject title shown on paper (e.g. পদার্থবিজ্ঞান (সৃজনশীল))"
            className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-[#0F4C81]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              {t.timeLabel}
            </label>
            <input
              type="text"
              value={header.time}
              onChange={(e) => update({ time: e.target.value })}
              placeholder="e.g. ২ ঘণ্টা ৩০ মিনিট"
              className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-[#0F4C81]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              {t.fullMarksLabel}
            </label>
            <input
              type="text"
              value={header.fullMarks}
              onChange={(e) => update({ fullMarks: e.target.value })}
              placeholder="e.g. ৫০ / ৭০ / 100"
              className="w-full text-base sm:text-sm px-3 py-2.5 sm:py-2 border border-zinc-200 rounded bg-white text-zinc-900 font-mono-num placeholder:text-zinc-400 focus:border-[#0F4C81]"
            />
          </div>
        </div>
      </div>

      {/* Collapsed "More Paper Details" Toggle */}
      <div className="border-t border-zinc-200 pt-4">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="w-full flex items-center justify-between py-1.5 text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {showMore ? (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            )}
            <span className="text-sm font-medium text-zinc-800 group-hover:text-zinc-950">
              {t.morePaperDetails}
            </span>
          </div>
          <span className="text-xs text-zinc-400">
            {showMore ? t.hideOptional : t.optionalSummary}
          </span>
        </button>

        {showMore && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  list="bd-class-suggestions"
                  value={header.className}
                  onChange={(e) => update({ className: e.target.value })}
                  placeholder="e.g. দশম শ্রেণি (বিজ্ঞান)"
                  className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400"
                />
                <datalist id="bd-class-suggestions">
                  {(language === 'bn' ? levelInfo.classesBn : levelInfo.classesEn).map((cls) => (
                    <option key={cls} value={cls} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Address / EIIN
                </label>
                <input
                  type="text"
                  value={header.instituteSubline}
                  onChange={(e) => update({ instituteSubline: e.target.value })}
                  placeholder="e.g. মোহাম্মদপুর, ঢাকা-১২০৭"
                  className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={header.subjectCode}
                  onChange={(e) => update({ subjectCode: e.target.value })}
                  placeholder="e.g. ১৩৬ / 136"
                  className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 font-mono-num placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Set Code
                </label>
                <input
                  type="text"
                  value={header.setCode}
                  onChange={(e) => update({ setCode: e.target.value })}
                  placeholder="e.g. ক / A"
                  className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Exam Date
                </label>
                <input
                  type="text"
                  value={header.date}
                  onChange={(e) => update({ date: e.target.value })}
                  placeholder="e.g. ২২ নভেম্বর ২০২৬"
                  className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  General Instructions (দ্রষ্টব্য / N.B.)
                </label>
                <textarea
                  rows={2}
                  value={header.instructions}
                  onChange={(e) => update({ instructions: e.target.value })}
                  placeholder="e.g. ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। যেকোনো ৫টি প্রশ্নের উত্তর দাও।"
                  className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-900 placeholder:text-zinc-400 resize-y"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <ImageAttachmentControl
                  image={header.logo}
                  onChange={(logo) => update({ logo })}
                  label="Add Institute Logo"
                  compact
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
