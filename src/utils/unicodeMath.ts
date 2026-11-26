/**
 * Microsoft Word UnicodeMath-inspired linear math auto-conversion engine.
 * Supports:
 * - Backslash keywords + Spacebar: \alpha, \theta, \pi, \pm, \times, \div, \le, \ge, \neq, \approx, \infty, \angle, \triangle, \perp, \parallel, \degree, \rightarrow, \rightleftharpoons, etc.
 * - ASCII operators + Spacebar: >=, <=, !=, +-, ->, =>, <=>
 * - Linear fractions on Spacebar: a/b -> \frac{a}{b}, (a+b)/(c+d) -> \frac{a+b}{c+d}
 * - Linear scripts on Spacebar: x^2 -> x^{2}, x^(n+1) -> x^{n+1}, H_2 -> H_{2}, H_(2O) -> H_{2O}
 * - Linear radicals on Spacebar: \sqrt(x) -> \sqrt{x}, \sqrt(3&x) -> \sqrt[3]{x}
 * - Linear accents on Spacebar: \vec(F) -> \vec{F}, \bar(x) -> \bar{x}, \hat(i) -> \hat{i}
 */

export const WORD_SYMBOL_COMMANDS: Record<string, string> = {
  // Lowercase Greek
  '\\alpha': '\\alpha',
  '\\beta': '\\beta',
  '\\gamma': '\\gamma',
  '\\delta': '\\delta',
  '\\epsilon': '\\epsilon',
  '\\varepsilon': '\\varepsilon',
  '\\zeta': '\\zeta',
  '\\eta': '\\eta',
  '\\theta': '\\theta',
  '\\vartheta': '\\vartheta',
  '\\iota': '\\iota',
  '\\kappa': '\\kappa',
  '\\lambda': '\\lambda',
  '\\mu': '\\mu',
  '\\nu': '\\nu',
  '\\xi': '\\xi',
  '\\pi': '\\pi',
  '\\rho': '\\rho',
  '\\sigma': '\\sigma',
  '\\tau': '\\tau',
  '\\upsilon': '\\upsilon',
  '\\phi': '\\phi',
  '\\varphi': '\\varphi',
  '\\chi': '\\chi',
  '\\psi': '\\psi',
  '\\omega': '\\omega',
  // Uppercase Greek
  '\\Gamma': '\\Gamma',
  '\\Delta': '\\Delta',
  '\\Theta': '\\Theta',
  '\\Lambda': '\\Lambda',
  '\\Xi': '\\Xi',
  '\\Pi': '\\Pi',
  '\\Sigma': '\\Sigma',
  '\\Phi': '\\Phi',
  '\\Psi': '\\Psi',
  '\\Omega': '\\Omega',
  // Operators & Relations
  '\\pm': '\\pm',
  '\\mp': '\\mp',
  '\\times': '\\times',
  '\\div': '\\div',
  '\\cdot': '\\cdot',
  '\\le': '\\le',
  '\\leq': '\\le',
  '\\ge': '\\ge',
  '\\geq': '\\ge',
  '\\ne': '\\neq',
  '\\neq': '\\neq',
  '\\approx': '\\approx',
  '\\equiv': '\\equiv',
  '\\propto': '\\propto',
  '\\sim': '\\sim',
  '\\cong': '\\cong',
  '\\infty': '\\infty',
  '\\partial': '\\partial',
  '\\nabla': '\\nabla',
  '\\therefore': '\\therefore',
  '\\because': '\\because',
  // Geometry & Sets
  '\\degree': '^\\circ',
  '\\deg': '^\\circ',
  '\\angle': '\\angle',
  '\\triangle': '\\triangle',
  '\\perp': '\\perp',
  '\\parallel': '\\parallel',
  '\\in': '\\in',
  '\\notin': '\\notin',
  '\\subset': '\\subset',
  '\\subseteq': '\\subseteq',
  '\\cup': '\\cup',
  '\\cap': '\\cap',
  '\\emptyset': '\\emptyset',
  '\\forall': '\\forall',
  '\\exists': '\\exists',
  // Arrows
  '\\to': '\\rightarrow',
  '\\rightarrow': '\\rightarrow',
  '\\leftarrow': '\\leftarrow',
  '\\leftrightarrow': '\\leftrightarrow',
  '\\Rightarrow': '\\Rightarrow',
  '\\Leftrightarrow': '\\Leftrightarrow',
  '\\rightleftharpoons': '\\rightleftharpoons',
  '\\eq': '\\rightleftharpoons',
  // Big ops
  '\\sum': '\\sum',
  '\\prod': '\\prod',
  '\\int': '\\int',
  '\\iint': '\\iint',
  '\\oint': '\\oint',
  '\\lim': '\\lim',
  // Functions
  '\\sin': '\\sin',
  '\\cos': '\\cos',
  '\\tan': '\\tan',
  '\\cot': '\\cot',
  '\\sec': '\\sec',
  '\\csc': '\\csc',
  '\\log': '\\log',
  '\\ln': '\\ln',
};

const ASCII_OPERATORS: [string, string][] = [
  ['<=>', '\\Leftrightarrow'],
  ['>=', '\\ge'],
  ['<=', '\\le'],
  ['!=', '\\neq'],
  ['+-', '\\pm'],
  ['->', '\\rightarrow'],
  ['=>', '\\Rightarrow'],
  ['~=', '\\approx'],
];

const BARE_PROSE_GREEK_COMMANDS: Record<string, string> = {
  alpha: '\\alpha',
  beta: '\\beta',
  gamma: '\\gamma',
  delta: '\\delta',
  epsilon: '\\epsilon',
  zeta: '\\zeta',
  eta: '\\eta',
  theta: '\\theta',
  iota: '\\iota',
  kappa: '\\kappa',
  lambda: '\\lambda',
  mu: '\\mu',
  nu: '\\nu',
  xi: '\\xi',
  pi: '\\pi',
  rho: '\\rho',
  sigma: '\\sigma',
  tau: '\\tau',
  upsilon: '\\upsilon',
  phi: '\\phi',
  chi: '\\chi',
  psi: '\\psi',
  omega: '\\omega',
  Gamma: '\\Gamma',
  Delta: '\\Delta',
  Theta: '\\Theta',
  Lambda: '\\Lambda',
  Sigma: '\\Sigma',
  Phi: '\\Phi',
  Psi: '\\Psi',
  Omega: '\\Omega',
  infty: '\\infty',
  inf: '\\infty',
};

function stripOuterParens(expr: string): string {
  if (expr.startsWith('(') && expr.endsWith(')')) {
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') depth++;
      else if (expr[i] === ')') depth--;
      if (depth === 0 && i < expr.length - 1) return expr;
    }
    return expr.slice(1, -1);
  }
  return expr;
}

/**
 * Extracts a balanced parenthesized group or simple operand ending at `endIdx` (exclusive).
 */
function extractBackwardOperand(src: string, endIdx: number): { start: number; text: string } | null {
  if (endIdx <= 0) return null;
  const last = src[endIdx - 1];
  if (last === ')') {
    let depth = 0;
    for (let i = endIdx - 1; i >= 0; i--) {
      if (src[i] === ')') depth++;
      else if (src[i] === '(') depth--;
      if (depth === 0) {
        return { start: i, text: stripOuterParens(src.slice(i, endIdx)) };
      }
    }
    return null;
  }
  // Simple operand: alphanumeric, Greek/LaTeX command, dot, or braced group
  if (last === '}') {
    let depth = 0;
    for (let i = endIdx - 1; i >= 0; i--) {
      if (src[i] === '}') depth++;
      else if (src[i] === '{') depth--;
      if (depth === 0) {
        return { start: i, text: src.slice(i + 1, endIdx - 1) };
      }
    }
  }
  const slice = src.slice(0, endIdx);
  const m = slice.match(/(\\[a-zA-Z]+|[a-zA-Z0-9.]+)$/);
  if (!m) return null;
  return { start: endIdx - m[1].length, text: m[1] };
}

/**
 * Given the current linear math string before the cursor when the user presses Space,
 * returns the updated string (with the trailing token converted to LaTeX) or null if nothing converted.
 */
export function convertWordLinearOnSpace(beforeCursor: string): string | null {
  if (!beforeCursor || beforeCursor.endsWith(' ')) return null;

  // 1. Check \sqrt(n&x) or \sqrt(x)
  const sqrtMatch = beforeCursor.match(/\\sqrt\(([^()]+)\)$/);
  if (sqrtMatch) {
    const inner = sqrtMatch[1];
    const ampIdx = inner.indexOf('&');
    const replacement =
      ampIdx !== -1
        ? `\\sqrt[${inner.slice(0, ampIdx).trim()}]{${inner.slice(ampIdx + 1).trim()}}`
        : `\\sqrt{${inner.trim()}}`;
    return beforeCursor.slice(0, beforeCursor.length - sqrtMatch[0].length) + replacement;
  }

  // 2. Check \vec(x), \bar(x), \hat(x), \dot(x)
  const accentMatch = beforeCursor.match(/\\(vec|bar|hat|dot|overline)\(([^()]+)\)$/);
  if (accentMatch) {
    const [, cmd, inner] = accentMatch;
    const replacement = `\\${cmd}{${inner.trim()}}`;
    return beforeCursor.slice(0, beforeCursor.length - accentMatch[0].length) + replacement;
  }

  // 3. Check \command at end
  const cmdMatch = beforeCursor.match(/(\\[a-zA-Z]+)$/);
  if (cmdMatch && WORD_SYMBOL_COMMANDS[cmdMatch[1]]) {
    const replacement = WORD_SYMBOL_COMMANDS[cmdMatch[1]];
    if (replacement !== cmdMatch[1]) {
      return beforeCursor.slice(0, beforeCursor.length - cmdMatch[1].length) + replacement;
    }
    return null;
  }

  // 4. Check ASCII operators (>=, <=, !=, +-, ->, =>, <=>)
  for (const [ascii, latex] of ASCII_OPERATORS) {
    if (beforeCursor.endsWith(ascii)) {
      return beforeCursor.slice(0, beforeCursor.length - ascii.length) + latex;
    }
  }

  // 5. Check linear fraction: num/den
  const den = extractBackwardOperand(beforeCursor, beforeCursor.length);
  if (den && den.start > 0 && beforeCursor[den.start - 1] === '/') {
    const num = extractBackwardOperand(beforeCursor, den.start - 1);
    if (num && num.text.length > 0 && den.text.length > 0) {
      return (
        beforeCursor.slice(0, num.start) + `\\frac{${num.text}}{${den.text}}`
      );
    }
  }

  // 6. Check linear superscript/subscript with parens or multi-char: x^(n+1) or H_(2O) or x^2 or H_2
  const scriptMatch = beforeCursor.match(/(\^|_)(?:\(([^()]+)\)|([a-zA-Z0-9+-]+))$/);
  if (scriptMatch && scriptMatch.index !== undefined && scriptMatch.index > 0) {
    const op = scriptMatch[1];
    const body = scriptMatch[2] ?? scriptMatch[3];
    // Avoid re-wrapping if already braced
    if (body) {
      return (
        beforeCursor.slice(0, scriptMatch.index) + `${op}{${body}}`
      );
    }
  }

  return null;
}

/**
 * Safe inline prose auto-converter when typing directly inside a question text box
 * (without Alt+= or opening the Equation Builder).
 * Only triggers on unambiguous math tokens before Spacebar so normal Bangla/English prose is never disrupted.
 */
export function convertProseMathOnSpace(
  textBeforeCursor: string
): { consumedChars: number; latex: string } | null {
  if (!textBeforeCursor || textBeforeCursor.endsWith(' ')) return null;

  // 1. \sqrt(n&x) or sqrt(n&x) or \sqrt(x) or sqrt(x)
  const sqrtMatch = textBeforeCursor.match(/(?:^|[\s(+\-=,])(\\?sqrt\(([^()]+)\))$/);
  if (sqrtMatch) {
    const fullToken = sqrtMatch[1];
    const inner = sqrtMatch[2];
    const ampIdx = inner.indexOf('&');
    const latex =
      ampIdx !== -1
        ? `\\sqrt[${inner.slice(0, ampIdx).trim()}]{${inner.slice(ampIdx + 1).trim()}}`
        : `\\sqrt{${inner.trim()}}`;
    return { consumedChars: fullToken.length, latex };
  }

  // 2. \vec(x), \bar(x), \hat(x), \dot(x), \overline(x)
  const accentMatch = textBeforeCursor.match(/\\(vec|bar|hat|dot|overline)\(([^()]+)\)$/);
  if (accentMatch) {
    return {
      consumedChars: accentMatch[0].length,
      latex: `\\${accentMatch[1]}{${accentMatch[2].trim()}}`,
    };
  }

  // 3. \command (e.g. \alpha, \theta, \pi, \Delta, \Omega, \times, \rightarrow)
  const cmdMatch = textBeforeCursor.match(/(\\[a-zA-Z]+)$/);
  if (cmdMatch && WORD_SYMBOL_COMMANDS[cmdMatch[1]]) {
    return {
      consumedChars: cmdMatch[1].length,
      latex: WORD_SYMBOL_COMMANDS[cmdMatch[1]],
    };
  }

  // 3b. Bare Greek/math words without backslash (e.g. theta, alpha, pi, Delta, Omega, inf)
  const bareWordMatch = textBeforeCursor.match(/(?:^|[\s(+\-=,;:])([a-zA-Z]+)$/);
  if (bareWordMatch && BARE_PROSE_GREEK_COMMANDS[bareWordMatch[1]]) {
    return {
      consumedChars: bareWordMatch[1].length,
      latex: BARE_PROSE_GREEK_COMMANDS[bareWordMatch[1]],
    };
  }

  // 4. ASCII math operators (>=, <=, !=, +-, ->, =>, <=>, ~=)
  for (const [ascii, latex] of ASCII_OPERATORS) {
    if (textBeforeCursor.endsWith(ascii)) {
      return { consumedChars: ascii.length, latex };
    }
  }

  // 5. Numeric fractions (1/2) or parenthesized fractions ((a+b)/c, a/(b+c))
  const parenFrac = textBeforeCursor.match(
    /(?:^|\s)(\([^()]+\)\/\([^()]+\)|\([^()]+\)\/[a-zA-Z0-9]+|[a-zA-Z0-9]+\/\([^()]+\))$/
  );
  if (parenFrac) {
    const raw = parenFrac[1];
    const slashIdx = findTopLevelSlash(raw);
    if (slashIdx !== -1) {
      const num = stripOuterParens(raw.slice(0, slashIdx));
      const den = stripOuterParens(raw.slice(slashIdx + 1));
      return { consumedChars: raw.length, latex: `\\frac{${num}}{${den}}` };
    }
  }
  const numFrac = textBeforeCursor.match(/(?:^|\s)(\d+\/\d+)$/);
  if (numFrac) {
    const raw = numFrac[1];
    const [num, den] = raw.split('/');
    return { consumedChars: raw.length, latex: `\\frac{${num}}{${den}}` };
  }

  // 6. Scripts in prose: x^2, 10^-3, x^(n+1), H_2, R_1, v_0
  const scriptMatch = textBeforeCursor.match(
    /([a-zA-Z0-9]+)(\^|_)(?:\(([^()]+)\)|([a-zA-Z0-9+-]+))$/
  );
  if (scriptMatch) {
    const [, base, op, parenBody, plainBody] = scriptMatch;
    const body = parenBody ?? plainBody;
    if (body) {
      return {
        consumedChars: scriptMatch[0].length,
        latex: `${base}${op}{${body}}`,
      };
    }
  }

  return null;
}

function findTopLevelSlash(expr: string): number {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') depth = Math.max(0, depth - 1);
    else if (expr[i] === '/' && depth === 0) return i;
  }
  return -1;
}

/**
 * Converts a full linear Word-style equation string to clean LaTeX on submit (e.g. Enter).
 */
export function finalizeWordLinearToLatex(input: string): string {
  let out = input.trim();
  if (!out) return '';
  // Apply space-conversion pass at the end if user pressed Enter instead of Space
  const converted = convertWordLinearOnSpace(out);
  if (converted !== null) {
    out = converted;
  }
  // Also convert any remaining inline \deg, \eq, or simple a/b tokens separated by spaces
  out = out.replace(/\\sqrt\(([^()]+)\)/g, (_, inner: string) => {
    const amp = inner.indexOf('&');
    return amp !== -1
      ? `\\sqrt[${inner.slice(0, amp).trim()}]{${inner.slice(amp + 1).trim()}}`
      : `\\sqrt{${inner.trim()}}`;
  });
  out = out.replace(/\\(vec|bar|hat|dot|overline)\(([^()]+)\)/g, '\\$1{$2}');
  out = out.replace(/(\^|_)\(([^()]+)\)/g, '$1{$2}');
  return out;
}
