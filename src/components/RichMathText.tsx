import React from 'react';
import katex from 'katex';
import { tokenizeMathText } from '../utils/formatters';

interface RichMathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

function renderFormattedProse(text: string, keyPrefix: string): React.ReactNode[] {
  // Supports **bold**, __underline__, *italic*, and newlines safely as React elements
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      out.push(<br key={`${keyPrefix}-br-${lineIdx}`} />);
    }
    const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    let partIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > cursor) {
        out.push(line.slice(cursor, match.index));
      }
      const token = match[0];
      const key = `${keyPrefix}-${lineIdx}-${partIdx++}`;
      if (token.startsWith('**') && token.endsWith('**')) {
        out.push(
          <strong key={key} className="font-semibold">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('__') && token.endsWith('__')) {
        out.push(
          <span key={key} className="underline underline-offset-2">
            {token.slice(2, -2)}
          </span>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        out.push(
          <em key={key} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      }
      cursor = tokenRegex.lastIndex;
    }

    if (cursor < line.length) {
      out.push(line.slice(cursor));
    }
  });

  return out;
}

export const RichMathText: React.FC<RichMathTextProps> = ({ text, className, inline = false }) => {
  if (!text) return null;

  const segments = tokenizeMathText(text);

  const content = segments.map((seg, idx) => {
    if (seg.type === 'text') {
      return <React.Fragment key={idx}>{renderFormattedProse(seg.value, `t-${idx}`)}</React.Fragment>;
    }

    try {
      const html = katex.renderToString(seg.latex, {
        displayMode: seg.display,
        throwOnError: false,
        strict: false,
        trust: false,
      });

      if (seg.display) {
        return (
          <span
            key={idx}
            className="block my-1.5 text-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      return (
        <span
          key={idx}
          className="inline-block align-baseline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return (
        <code key={idx} className="text-[0.9em] text-red-700 bg-red-50 px-1 rounded">
          {seg.latex}
        </code>
      );
    }
  });

  if (inline) {
    return <span className={className}>{content}</span>;
  }
  return <div className={className}>{content}</div>;
};
