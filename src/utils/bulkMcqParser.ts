import { MCQItem } from '../types/paper';
import { createId } from './formatters';

/**
 * Parses pasted plain-text MCQs (Bangla or English) into structured MCQItem[].
 * Supports formats like:
 *   1. Question text
 *   a) Option 1   /  ক) অপশন ১
 *   b) Option 2   /  খ) অপশন ২
 *   c) Option 3   /  গ) অপশন ৩
 *   d) Option 4   /  ঘ) অপশন ৪
 */
export function parseBulkMcqs(rawText: string): MCQItem[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const optionRe = /^(?:\(?([কখগঘabcdABCD])[).:\]]\s+)(.+)$/;
  const qNumRe = /^(?:[০-৯0-9]+[.)।:\-]\s+)(.+)$/;

  const items: MCQItem[] = [];
  let currentQ: string | null = null;
  let currentOpts: string[] = [];

  const flush = () => {
    if (!currentQ && currentOpts.length === 0) return;
    const padded = [...currentOpts];
    while (padded.length < 4) padded.push('');
    items.push({
      id: createId('mcq'),
      type: 'mcq',
      question: currentQ ?? '',
      options: [padded[0], padded[1], padded[2], padded[3]],
      marks: 1,
    });
    currentQ = null;
    currentOpts = [];
  };

  for (const line of lines) {
    const optMatch = line.match(optionRe);
    if (optMatch && currentQ !== null) {
      currentOpts.push(optMatch[2].trim());
      if (currentOpts.length === 4) {
        flush();
      }
      continue;
    }

    // New question line
    if (currentQ !== null) {
      flush();
    }
    const qMatch = line.match(qNumRe);
    currentQ = (qMatch ? qMatch[1] : line).trim();
  }

  flush();
  return items;
}
