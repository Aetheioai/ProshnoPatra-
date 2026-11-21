export type BigOpCommand = '\\int' | '\\iint' | '\\oint' | '\\sum' | '\\prod' | '\\lim';

export type AccentKind =
  | 'vec'
  | 'bar'
  | 'overline'
  | 'hat'
  | 'widehat'
  | 'dot'
  | 'ddot'
  | 'underline'
  | 'overrightarrow';

export type DelimStyle = 'paren' | 'bracket' | 'brace' | 'abs' | 'norm' | 'floor' | 'ceil';

export type MatrixEnv = 'pmatrix' | 'bmatrix' | 'vmatrix' | 'cases';

export type MathNode =
  | { id: string; type: 'char'; value: string }
  | { id: string; type: 'symbol'; latex: string; display: string }
  | { id: string; type: 'frac'; num: MathNode[]; den: MathNode[] }
  | { id: string; type: 'sup'; content: MathNode[] }
  | { id: string; type: 'sub'; content: MathNode[] }
  | { id: string; type: 'sqrt'; index?: MathNode[]; content: MathNode[] }
  | {
      id: string;
      type: 'bigop';
      op: BigOpCommand;
      display: string;
      lower: MathNode[];
      upper?: MathNode[];
    }
  | {
      id: string;
      type: 'chemArrow';
      arrow: 'right' | 'left' | 'eq';
      above: MathNode[];
      below?: MathNode[];
    }
  | { id: string; type: 'accent'; accent: AccentKind; content: MathNode[] }
  | { id: string; type: 'delim'; style: DelimStyle; content: MathNode[] }
  | { id: string; type: 'binom'; top: MathNode[]; bottom: MathNode[] }
  | { id: string; type: 'isotope'; mass: MathNode[]; atomic: MathNode[]; element: MathNode[] }
  | { id: string; type: 'matrix'; env: MatrixEnv; rows: number; cols: number; cells: MathNode[][] };

export type SlotKey =
  | 'num'
  | 'den'
  | 'content'
  | 'index'
  | 'lower'
  | 'upper'
  | 'above'
  | 'below'
  | 'top'
  | 'bottom'
  | 'mass'
  | 'atomic'
  | 'element'
  | 'cell';

export interface SlotPathSegment {
  nodeId: string;
  slot: SlotKey;
  cellIndex?: number;
}

export interface MathCursor {
  path: SlotPathSegment[]; // empty means root array
  index: number; // 0..list.length
}

let uidCounter = 0;
export function mathUid(): string {
  uidCounter += 1;
  return `m_${uidCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

export function samePath(a: SlotPathSegment[], b: SlotPathSegment[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (seg, i) =>
      seg.nodeId === b[i].nodeId &&
      seg.slot === b[i].slot &&
      seg.cellIndex === b[i].cellIndex
  );
}

export const SYMBOL_LOOKUP: Record<string, string> = {
  // Lowercase Greek
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ϵ',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\vartheta': 'ϑ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'ϕ',
  '\\varphi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  // Uppercase Greek
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Theta': 'Θ',
  '\\Lambda': 'Λ',
  '\\Xi': 'Ξ',
  '\\Pi': 'Π',
  '\\Sigma': 'Σ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',
  // Arithmetic & Relations
  '\\pm': '±',
  '\\mp': '∓',
  '\\times': '×',
  '\\div': '÷',
  '\\cdot': '·',
  '\\ast': '∗',
  '\\circ': '°',
  '\\le': '≤',
  '\\leq': '≤',
  '\\ge': '≥',
  '\\geq': '≥',
  '\\neq': '≠',
  '\\ne': '≠',
  '\\approx': '≈',
  '\\equiv': '≡',
  '\\propto': '∝',
  '\\sim': '∼',
  '\\simeq': '≃',
  '\\cong': '≅',
  '\\ll': '≪',
  '\\gg': '≫',
  '\\infty': '∞',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\hbar': 'ℏ',
  '\\ell': 'ℓ',
  '\\prime': '′',
  // Logic, Sets & Geometry
  '\\therefore': '∴',
  '\\because': '∵',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\supset': '⊃',
  '\\supseteq': '⊇',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\emptyset': '∅',
  '\\varnothing': '∅',
  '\\land': '∧',
  '\\lor': '∨',
  '\\neg': '¬',
  '\\angle': '∠',
  '\\measuredangle': '∡',
  '\\triangle': '△',
  '\\perp': '⊥',
  '\\parallel': '∥',
  '\\degree': '°',
  // Arrows
  '\\rightarrow': '→',
  '\\to': '→',
  '\\leftarrow': '←',
  '\\leftrightarrow': '↔',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\Leftrightarrow': '⇔',
  '\\iff': '⇔',
  '\\implies': '⇒',
  '\\rightleftharpoons': '⇌',
  '\\uparrow': '↑',
  '\\downarrow': '↓',
  '\\mapsto': '↦',
  // Number sets (direct shortcuts)
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{Z}': 'ℤ',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{C}': 'ℂ',
  // Standard Functions
  '\\sin': 'sin',
  '\\cos': 'cos',
  '\\tan': 'tan',
  '\\cot': 'cot',
  '\\sec': 'sec',
  '\\csc': 'csc',
  '\\arcsin': 'arcsin',
  '\\arccos': 'arccos',
  '\\arctan': 'arctan',
  '\\sinh': 'sinh',
  '\\cosh': 'cosh',
  '\\tanh': 'tanh',
  '\\log': 'log',
  '\\ln': 'ln',
  '\\exp': 'exp',
  '\\det': 'det',
  '\\deg': 'deg',
  '\\max': 'max',
  '\\min': 'min',
  '\\arg': 'arg',
  '\\ldots': '…',
  '\\cdots': '⋯',
  '\\%': '%',
  '\\ ': ' ',
  '\\,': ' ',
  '\\;': ' ',
};

const DELIM_LATEX_MAP: Record<DelimStyle, { left: string; right: string; openVis: string; closeVis: string }> = {
  paren: { left: '\\left(', right: '\\right)', openVis: '(', closeVis: ')' },
  bracket: { left: '\\left[', right: '\\right]', openVis: '[', closeVis: ']' },
  brace: { left: '\\left\\{', right: '\\right\\}', openVis: '{', closeVis: '}' },
  abs: { left: '\\left|', right: '\\right|', openVis: '|', closeVis: '|' },
  norm: { left: '\\left\\|', right: '\\right\\|', openVis: '‖', closeVis: '‖' },
  floor: { left: '\\left\\lfloor', right: '\\right\\rfloor', openVis: '⌊', closeVis: '⌋' },
  ceil: { left: '\\left\\lceil', right: '\\right\\rceil', openVis: '⌈', closeVis: '⌉' },
};

export function getDelimVisual(style: DelimStyle): { open: string; close: string } {
  const entry = DELIM_LATEX_MAP[style];
  return { open: entry.openVis, close: entry.closeVis };
}

function splitTopLevel(src: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depthBrace = 0;
  let depthEnv = 0;
  let last = 0;

  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\\') {
      if (src.startsWith('\\begin{', i)) {
        depthEnv++;
        i += 6;
        continue;
      }
      if (src.startsWith('\\end{', i)) {
        depthEnv = Math.max(0, depthEnv - 1);
        i += 4;
        continue;
      }
      if (depthBrace === 0 && depthEnv === 0 && delimiter === '\\\\' && src.startsWith('\\\\', i)) {
        parts.push(src.slice(last, i));
        last = i + 2;
        i += 1;
        continue;
      }
      i++;
      continue;
    }
    if (src[i] === '{') depthBrace++;
    else if (src[i] === '}') depthBrace = Math.max(0, depthBrace - 1);
    else if (depthBrace === 0 && depthEnv === 0 && delimiter !== '\\\\' && src.startsWith(delimiter, i)) {
      parts.push(src.slice(last, i));
      last = i + delimiter.length;
      i += delimiter.length - 1;
    }
  }
  parts.push(src.slice(last));
  return parts;
}

// Parse LaTeX string into Visual Math AST so existing formulas open cleanly with zero code
export function parseLatexToAst(input: string): MathNode[] {
  let pos = 0;
  const src = input.trim();

  function peek(): string {
    return src[pos] ?? '';
  }

  function skipSpaces() {
    while (pos < src.length && /\s/.test(src[pos])) pos++;
  }

  function readBracedGroup(): string {
    skipSpaces();
    if (src[pos] === '{') {
      pos++;
      let depth = 1;
      const start = pos;
      while (pos < src.length && depth > 0) {
        if (src[pos] === '\\' && pos + 1 < src.length) {
          pos += 2;
          continue;
        }
        if (src[pos] === '{') depth++;
        else if (src[pos] === '}') depth--;
        if (depth > 0) pos++;
      }
      const content = src.slice(start, pos);
      if (src[pos] === '}') pos++;
      return content;
    }
    if (src[pos] === '\\') {
      const start = pos;
      pos++;
      if (pos < src.length && /[a-zA-Z]/.test(src[pos])) {
        while (pos < src.length && /[a-zA-Z]/.test(src[pos])) pos++;
      } else if (pos < src.length) {
        pos++;
      }
      return src.slice(start, pos);
    }
    const ch = src[pos] ?? '';
    pos++;
    return ch;
  }

  function readOptionalBracket(): string | null {
    skipSpaces();
    if (src[pos] !== '[') return null;
    pos++;
    const start = pos;
    let depth = 1;
    while (pos < src.length && depth > 0) {
      if (src[pos] === '\\' && pos + 1 < src.length) {
        pos += 2;
        continue;
      }
      if (src[pos] === '[') depth++;
      else if (src[pos] === ']') depth--;
      if (depth > 0) pos++;
    }
    const content = src.slice(start, pos);
    if (src[pos] === ']') pos++;
    return content;
  }

  function readDelimiterToken(): string {
    skipSpaces();
    if (src[pos] === '\\') {
      const start = pos;
      pos++;
      if (pos < src.length && /[a-zA-Z]/.test(src[pos])) {
        while (pos < src.length && /[a-zA-Z]/.test(src[pos])) pos++;
      } else if (pos < src.length) {
        pos++;
      }
      return src.slice(start, pos);
    }
    const ch = src[pos] ?? '';
    pos++;
    return ch;
  }

  function parseList(): MathNode[] {
    const nodes: MathNode[] = [];

    while (pos < src.length) {
      const ch = peek();

      if (/\s/.test(ch)) {
        pos++;
        continue;
      }

      // Detect isotope notation: {}_{Z}^{A}\text{X} or {}_{Z}^{A}X
      if (src.startsWith('{}_', pos)) {
        const saved = pos;
        pos += 3; // after "{}_"
        const atomicStr = readBracedGroup();
        skipSpaces();
        if (src[pos] === '^') {
          pos++;
          const massStr = readBracedGroup();
          skipSpaces();
          let elNodes: MathNode[] = [];
          if (src.startsWith('\\text{', pos) || src.startsWith('\\mathrm{', pos)) {
            const cmdEnd = src.indexOf('{', pos);
            pos = cmdEnd;
            const inner = readBracedGroup();
            elNodes = Array.from(inner).map((c) => ({ id: mathUid(), type: 'char', value: c }));
          } else if (pos < src.length && /[A-Za-z]/.test(src[pos])) {
            let sym = src[pos++];
            while (pos < src.length && /[a-z]/.test(src[pos])) sym += src[pos++];
            elNodes = Array.from(sym).map((c) => ({ id: mathUid(), type: 'char', value: c }));
          }
          nodes.push({
            id: mathUid(),
            type: 'isotope',
            mass: parseLatexToAst(massStr),
            atomic: parseLatexToAst(atomicStr),
            element: elNodes,
          });
          continue;
        }
        pos = saved;
      }

      if (ch === '{') {
        const inner = readBracedGroup();
        nodes.push(...parseLatexToAst(inner));
        continue;
      }

      if (ch === '^') {
        pos++;
        const arg = readBracedGroup();
        if (arg.trim() === '\\circ') {
          nodes.push({ id: mathUid(), type: 'symbol', latex: '^\\circ', display: '°' });
        } else {
          nodes.push({ id: mathUid(), type: 'sup', content: parseLatexToAst(arg) });
        }
        continue;
      }

      if (ch === '_') {
        pos++;
        const arg = readBracedGroup();
        nodes.push({ id: mathUid(), type: 'sub', content: parseLatexToAst(arg) });
        continue;
      }

      if (ch === '\\') {
        pos++;
        if (pos >= src.length) break;

        // Single-char escaped command (\ , \, \; \% \{ \})
        if (!/[a-zA-Z]/.test(src[pos])) {
          const esc = `\\${src[pos]}`;
          pos++;
          if (esc === '\\ ' || esc === '\\,' || esc === '\\;') {
            nodes.push({ id: mathUid(), type: 'char', value: ' ' });
          } else if (SYMBOL_LOOKUP[esc]) {
            nodes.push({ id: mathUid(), type: 'symbol', latex: esc, display: SYMBOL_LOOKUP[esc] });
          } else {
            nodes.push({ id: mathUid(), type: 'char', value: esc.slice(1) });
          }
          continue;
        }

        const cmdStart = pos;
        while (pos < src.length && /[a-zA-Z]/.test(src[pos])) pos++;
        const cmd = `\\${src.slice(cmdStart, pos)}`;

        // Matrix / Cases environment: \begin{pmatrix}...\end{pmatrix}
        if (cmd === '\\begin') {
          const envName = readBracedGroup();
          const endToken = `\\end{${envName}}`;
          let depth = 1;
          const bodyStart = pos;
          let bodyEnd = src.length;
          while (pos < src.length && depth > 0) {
            if (src.startsWith(`\\begin{${envName}}`, pos)) {
              depth++;
              pos += `\\begin{${envName}}`.length;
              continue;
            }
            if (src.startsWith(endToken, pos)) {
              depth--;
              if (depth === 0) {
                bodyEnd = pos;
                pos += endToken.length;
                break;
              }
              pos += endToken.length;
              continue;
            }
            pos++;
          }
          const body = src.slice(bodyStart, bodyEnd).trim();
          const validEnv: MatrixEnv =
            envName === 'bmatrix' || envName === 'vmatrix' || envName === 'cases'
              ? envName
              : 'pmatrix';
          const rawRows = splitTopLevel(body, '\\\\').filter(
            (r, idx, arr) => r.trim().length > 0 || idx < arr.length - 1
          );
          const parsedRows = (rawRows.length > 0 ? rawRows : [' & ']).map((r) =>
            splitTopLevel(r, '&').map((cell) => parseLatexToAst(cell.trim()))
          );
          const colCount = Math.max(
            validEnv === 'cases' ? 2 : 1,
            ...parsedRows.map((r) => r.length)
          );
          const flatCells: MathNode[][] = [];
          for (const r of parsedRows) {
            for (let c = 0; c < colCount; c++) {
              flatCells.push(r[c] ?? []);
            }
          }
          nodes.push({
            id: mathUid(),
            type: 'matrix',
            env: validEnv,
            rows: parsedRows.length,
            cols: colCount,
            cells: flatCells,
          });
          continue;
        }

        // Auto-sizing delimiters: \left( ... \right)
        if (cmd === '\\left') {
          const leftTok = readDelimiterToken();
          let depth = 1;
          const contentStart = pos;
          let contentEnd = src.length;
          while (pos < src.length && depth > 0) {
            if (src.startsWith('\\left', pos) && !/[a-zA-Z]/.test(src[pos + 5] ?? '')) {
              depth++;
              pos += 5;
              readDelimiterToken();
              continue;
            }
            if (src.startsWith('\\right', pos) && !/[a-zA-Z]/.test(src[pos + 6] ?? '')) {
              depth--;
              if (depth === 0) {
                contentEnd = pos;
                pos += 6;
                readDelimiterToken();
                break;
              }
              pos += 6;
              readDelimiterToken();
              continue;
            }
            pos++;
          }
          const inner = src.slice(contentStart, contentEnd);
          const style: DelimStyle =
            leftTok === '['
              ? 'bracket'
              : leftTok === '\\{'
              ? 'brace'
              : leftTok === '|'
              ? 'abs'
              : leftTok === '\\|'
              ? 'norm'
              : leftTok === '\\lfloor'
              ? 'floor'
              : leftTok === '\\lceil'
              ? 'ceil'
              : 'paren';
          nodes.push({
            id: mathUid(),
            type: 'delim',
            style,
            content: parseLatexToAst(inner),
          });
          continue;
        }

        if (cmd === '\\frac' || cmd === '\\dfrac' || cmd === '\\tfrac') {
          const numStr = readBracedGroup();
          const denStr = readBracedGroup();
          nodes.push({
            id: mathUid(),
            type: 'frac',
            num: parseLatexToAst(numStr),
            den: parseLatexToAst(denStr),
          });
          continue;
        }

        if (cmd === '\\binom' || cmd === '\\dbinom' || cmd === '\\tbinom') {
          const topStr = readBracedGroup();
          const bottomStr = readBracedGroup();
          nodes.push({
            id: mathUid(),
            type: 'binom',
            top: parseLatexToAst(topStr),
            bottom: parseLatexToAst(bottomStr),
          });
          continue;
        }

        if (cmd === '\\sqrt') {
          const opt = readOptionalBracket();
          const body = readBracedGroup();
          nodes.push({
            id: mathUid(),
            type: 'sqrt',
            index: opt !== null ? parseLatexToAst(opt) : undefined,
            content: parseLatexToAst(body),
          });
          continue;
        }

        if (cmd === '\\mathbb') {
          const inner = readBracedGroup().trim();
          const full = `\\mathbb{${inner}}`;
          nodes.push({
            id: mathUid(),
            type: 'symbol',
            latex: full,
            display: SYMBOL_LOOKUP[full] ?? inner,
          });
          continue;
        }

        if (cmd === '\\text' || cmd === '\\mathrm' || cmd === '\\mathbf') {
          const inner = readBracedGroup();
          for (const c of inner) {
            nodes.push({ id: mathUid(), type: 'char', value: c });
          }
          continue;
        }

        if (cmd === '\\xrightarrow' || cmd === '\\xrightleftharpoons' || cmd === '\\xleftarrow') {
          const belowOpt = readOptionalBracket();
          const aboveStr = readBracedGroup();
          nodes.push({
            id: mathUid(),
            type: 'chemArrow',
            arrow:
              cmd === '\\xrightleftharpoons'
                ? 'eq'
                : cmd === '\\xleftarrow'
                ? 'left'
                : 'right',
            above: parseLatexToAst(aboveStr),
            below: belowOpt !== null ? parseLatexToAst(belowOpt) : undefined,
          });
          continue;
        }

        if (
          cmd === '\\vec' ||
          cmd === '\\bar' ||
          cmd === '\\overline' ||
          cmd === '\\hat' ||
          cmd === '\\widehat' ||
          cmd === '\\dot' ||
          cmd === '\\ddot' ||
          cmd === '\\underline' ||
          cmd === '\\overrightarrow'
        ) {
          const body = readBracedGroup();
          const accent = cmd.slice(1) as AccentKind;
          nodes.push({
            id: mathUid(),
            type: 'accent',
            accent,
            content: parseLatexToAst(body),
          });
          continue;
        }

        if (
          cmd === '\\int' ||
          cmd === '\\iint' ||
          cmd === '\\oint' ||
          cmd === '\\sum' ||
          cmd === '\\prod' ||
          cmd === '\\lim'
        ) {
          let lower: MathNode[] = [];
          let upper: MathNode[] | undefined = cmd === '\\lim' ? undefined : [];
          for (let k = 0; k < 2; k++) {
            skipSpaces();
            if (src[pos] === '_') {
              pos++;
              lower = parseLatexToAst(readBracedGroup());
            } else if (src[pos] === '^' && cmd !== '\\lim') {
              pos++;
              upper = parseLatexToAst(readBracedGroup());
            }
          }
          const displayMap: Record<BigOpCommand, string> = {
            '\\int': '∫',
            '\\iint': '∬',
            '\\oint': '∮',
            '\\sum': '∑',
            '\\prod': '∏',
            '\\lim': 'lim',
          };
          nodes.push({
            id: mathUid(),
            type: 'bigop',
            op: cmd,
            display: displayMap[cmd],
            lower,
            upper,
          });
          continue;
        }

        if (SYMBOL_LOOKUP[cmd]) {
          nodes.push({ id: mathUid(), type: 'symbol', latex: cmd, display: SYMBOL_LOOKUP[cmd] });
          continue;
        }

        nodes.push({
          id: mathUid(),
          type: 'symbol',
          latex: cmd,
          display: cmd.slice(1),
        });
        continue;
      }

      nodes.push({ id: mathUid(), type: 'char', value: ch });
      pos++;
    }

    return nodes;
  }

  return parseList();
}

const KNOWN_TEXT_WORDS = new Set([
  'kg', 'km', 'cm', 'mm', 'mg', 'ml', 'mL', 'mol', 'kJ', 'Hz', 'Pa', 'pH', 'pOH', 'Ka', 'Kb',
  'Fe', 'Na', 'Cl', 'Ca', 'Mg', 'Al', 'Zn', 'Cu', 'Ag', 'Au', 'He', 'Ne', 'Ar', 'Br', 'Li',
  'Si', 'Mn', 'Cr', 'Ni', 'Pt', 'Pb', 'Hg', 'Ba', 'Sr', 'Sn', 'Sb', 'As', 'Bi', 'Co', 'Cd',
  'CH', 'NH', 'OH', 'CO', 'SO', 'NO', 'HI', 'HCl', 'NaCl', 'NaOH', 'KOH', 'HNO', 'HCN', 'CHO',
  'COOH', 'COONa', 'aq', 'atm', 'cal', 'eV', 'MeV', 'nm', 'pm', 'dm', 'mA', 'kW', 'kWh', 'MHz',
  'max', 'min', 'sin', 'cos', 'tan', 'log', 'ln', 'sec', 'csc', 'cot', 'lim', 'if', 'for', 'and',
  'or', 'when',
]);

// Serialize Visual Math AST back to crisp KaTeX-compatible LaTeX
export function astToLatex(nodes: MathNode[]): string {
  let out = '';
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i];

    if (node.type === 'char') {
      if (node.value === ' ') {
        out += '\\ ';
        i++;
        continue;
      }
      if (node.value === '%') {
        out += '\\%';
        i++;
        continue;
      }
      if (/[^\x00-\x7F]/.test(node.value)) {
        let run = node.value;
        i++;
        while (
          i < nodes.length &&
          nodes[i].type === 'char' &&
          /[^\x00-\x7F]/.test((nodes[i] as { value: string }).value)
        ) {
          run += (nodes[i] as { value: string }).value;
          i++;
        }
        out += `\\text{${run}}`;
        continue;
      }
      if (/[a-zA-Z]/.test(node.value)) {
        let run = node.value;
        let j = i + 1;
        while (
          j < nodes.length &&
          nodes[j].type === 'char' &&
          /[a-zA-Z]/.test((nodes[j] as { value: string }).value)
        ) {
          run += (nodes[j] as { value: string }).value;
          j++;
        }
        if (run.length >= 3 || KNOWN_TEXT_WORDS.has(run)) {
          out += `\\text{${run}}`;
          i = j;
          continue;
        }
      }

      out += node.value;
      i++;
      continue;
    }

    if (node.type === 'symbol') {
      if (node.latex.startsWith('^') || node.latex.startsWith('_')) {
        out += node.latex;
      } else if (/^\\[a-zA-Z]+$/.test(node.latex)) {
        out += `${node.latex} `;
      } else {
        out += node.latex;
      }
      i++;
      continue;
    }

    if (node.type === 'frac') {
      out += `\\frac{${astToLatex(node.num) || '\\square'}}{${astToLatex(node.den) || '\\square'}}`;
      i++;
      continue;
    }

    if (node.type === 'binom') {
      out += `\\binom{${astToLatex(node.top) || 'n'}}{${astToLatex(node.bottom) || 'r'}}`;
      i++;
      continue;
    }

    if (node.type === 'sup') {
      const inner = astToLatex(node.content);
      out += `^{${inner || '\\square'}}`;
      i++;
      continue;
    }

    if (node.type === 'sub') {
      const inner = astToLatex(node.content);
      out += `_{${inner || '\\square'}}`;
      i++;
      continue;
    }

    if (node.type === 'sqrt') {
      const body = astToLatex(node.content) || '\\square';
      if (node.index !== undefined) {
        const idx = astToLatex(node.index) || 'n';
        out += `\\sqrt[${idx}]{${body}}`;
      } else {
        out += `\\sqrt{${body}}`;
      }
      i++;
      continue;
    }

    if (node.type === 'bigop') {
      const lower = astToLatex(node.lower);
      const upper = node.upper ? astToLatex(node.upper) : '';
      out += node.op;
      if (lower) out += `_{${lower}}`;
      if (upper) out += `^{${upper}}`;
      out += ' ';
      i++;
      continue;
    }

    if (node.type === 'chemArrow') {
      const above = astToLatex(node.above);
      const below = node.below ? astToLatex(node.below) : '';
      if (!above && !below) {
        out +=
          node.arrow === 'eq'
            ? '\\rightleftharpoons '
            : node.arrow === 'left'
            ? '\\leftarrow '
            : '\\rightarrow ';
      } else {
        const cmd =
          node.arrow === 'eq'
            ? '\\xrightleftharpoons'
            : node.arrow === 'left'
            ? '\\xleftarrow'
            : '\\xrightarrow';
        out += below ? `${cmd}[${below}]{${above}}` : `${cmd}{${above}}`;
      }
      i++;
      continue;
    }

    if (node.type === 'accent') {
      const inner = astToLatex(node.content) || 'x';
      out += `\\${node.accent}{${inner}}`;
      i++;
      continue;
    }

    if (node.type === 'delim') {
      const d = DELIM_LATEX_MAP[node.style];
      const inner = astToLatex(node.content) || '\\square';
      out += `${d.left} ${inner} ${d.right}`;
      i++;
      continue;
    }

    if (node.type === 'isotope') {
      const m = astToLatex(node.mass) || 'A';
      const z = astToLatex(node.atomic) || 'Z';
      const el = astToLatex(node.element) || '\\text{X}';
      out += `{}_{${z}}^{${m}}${el}`;
      i++;
      continue;
    }

    if (node.type === 'matrix') {
      const rowStrings: string[] = [];
      for (let r = 0; r < node.rows; r++) {
        const cols: string[] = [];
        for (let c = 0; c < node.cols; c++) {
          const cell = node.cells[r * node.cols + c] ?? [];
          cols.push(astToLatex(cell) || '\\square');
        }
        rowStrings.push(cols.join(' & '));
      }
      out += `\\begin{${node.env}} ${rowStrings.join(' \\\\ ')} \\end{${node.env}}`;
      i++;
      continue;
    }

    i++;
  }

  return out.trim();
}

// Helper to get the MathNode[] array at a given SlotPathSegment[]
export function getSlotList(root: MathNode[], path: SlotPathSegment[]): MathNode[] | null {
  let list = root;
  for (const seg of path) {
    const found = list.find((n) => n.id === seg.nodeId);
    if (!found) return null;
    if (found.type === 'matrix' && seg.slot === 'cell' && typeof seg.cellIndex === 'number') {
      const cell = found.cells[seg.cellIndex];
      if (!cell) return null;
      list = cell;
      continue;
    }
    const slotArr = (found as Record<string, unknown>)[seg.slot];
    if (!Array.isArray(slotArr)) return null;
    list = slotArr as MathNode[];
  }
  return list;
}

// Helper to immutably update the MathNode[] array at a given SlotPathSegment[]
export function updateSlotList(
  root: MathNode[],
  path: SlotPathSegment[],
  updater: (list: MathNode[]) => MathNode[]
): MathNode[] {
  if (path.length === 0) {
    return updater(root);
  }
  const [head, ...rest] = path;
  return root.map((node) => {
    if (node.id !== head.nodeId) return node;
    if (node.type === 'matrix' && head.slot === 'cell' && typeof head.cellIndex === 'number') {
      const nextCells = node.cells.map((cell, idx) =>
        idx === head.cellIndex ? updateSlotList(cell, rest, updater) : cell
      );
      return { ...node, cells: nextCells };
    }
    const current = (node as Record<string, unknown>)[head.slot];
    if (!Array.isArray(current)) return node;
    return {
      ...node,
      [head.slot]: updateSlotList(current as MathNode[], rest, updater),
    };
  });
}

// Update a matrix node's dimensions anywhere in the AST
export function mutateMatrixInAst(
  root: MathNode[],
  nodeId: string,
  action: 'addRow' | 'removeRow' | 'addCol' | 'removeCol'
): MathNode[] {
  const mapNode = (node: MathNode): MathNode => {
    if (node.type === 'matrix' && node.id === nodeId) {
      const { rows, cols, cells } = node;
      if (action === 'addRow' && rows < 5) {
        const nextCells = [...cells, ...Array.from({ length: cols }, () => [])];
        return { ...node, rows: rows + 1, cells: nextCells };
      }
      if (action === 'removeRow' && rows > 1) {
        return { ...node, rows: rows - 1, cells: cells.slice(0, (rows - 1) * cols) };
      }
      if (action === 'addCol' && cols < 5 && node.env !== 'cases') {
        const nextCells: MathNode[][] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) nextCells.push(cells[r * cols + c] ?? []);
          nextCells.push([]);
        }
        return { ...node, cols: cols + 1, cells: nextCells };
      }
      if (action === 'removeCol' && cols > 1 && node.env !== 'cases') {
        const nextCells: MathNode[][] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols - 1; c++) nextCells.push(cells[r * cols + c] ?? []);
        }
        return { ...node, cols: cols - 1, cells: nextCells };
      }
      return node;
    }

    switch (node.type) {
      case 'frac':
        return { ...node, num: mutateMatrixInAst(node.num, nodeId, action), den: mutateMatrixInAst(node.den, nodeId, action) };
      case 'sup':
      case 'sub':
      case 'accent':
      case 'delim':
        return { ...node, content: mutateMatrixInAst(node.content, nodeId, action) };
      case 'sqrt':
        return {
          ...node,
          index: node.index ? mutateMatrixInAst(node.index, nodeId, action) : undefined,
          content: mutateMatrixInAst(node.content, nodeId, action),
        };
      case 'bigop':
        return {
          ...node,
          lower: mutateMatrixInAst(node.lower, nodeId, action),
          upper: node.upper ? mutateMatrixInAst(node.upper, nodeId, action) : undefined,
        };
      case 'chemArrow':
        return {
          ...node,
          above: mutateMatrixInAst(node.above, nodeId, action),
          below: node.below ? mutateMatrixInAst(node.below, nodeId, action) : undefined,
        };
      case 'binom':
        return {
          ...node,
          top: mutateMatrixInAst(node.top, nodeId, action),
          bottom: mutateMatrixInAst(node.bottom, nodeId, action),
        };
      case 'isotope':
        return {
          ...node,
          mass: mutateMatrixInAst(node.mass, nodeId, action),
          atomic: mutateMatrixInAst(node.atomic, nodeId, action),
          element: mutateMatrixInAst(node.element, nodeId, action),
        };
      case 'matrix':
        return {
          ...node,
          cells: node.cells.map((cell) => mutateMatrixInAst(cell, nodeId, action)),
        };
      default:
        return node;
    }
  };

  return root.map(mapNode);
}

// Get ordered slot segments for a single node
export function getNodeSlotSegments(node: MathNode): SlotPathSegment[] {
  switch (node.type) {
    case 'frac':
      return [
        { nodeId: node.id, slot: 'num' },
        { nodeId: node.id, slot: 'den' },
      ];
    case 'binom':
      return [
        { nodeId: node.id, slot: 'top' },
        { nodeId: node.id, slot: 'bottom' },
      ];
    case 'sqrt':
      return node.index !== undefined
        ? [
            { nodeId: node.id, slot: 'index' },
            { nodeId: node.id, slot: 'content' },
          ]
        : [{ nodeId: node.id, slot: 'content' }];
    case 'sup':
    case 'sub':
    case 'accent':
    case 'delim':
      return [{ nodeId: node.id, slot: 'content' }];
    case 'bigop':
      return node.upper !== undefined
        ? [
            { nodeId: node.id, slot: 'lower' },
            { nodeId: node.id, slot: 'upper' },
          ]
        : [{ nodeId: node.id, slot: 'lower' }];
    case 'chemArrow':
      return node.below !== undefined
        ? [
            { nodeId: node.id, slot: 'above' },
            { nodeId: node.id, slot: 'below' },
          ]
        : [{ nodeId: node.id, slot: 'above' }];
    case 'isotope':
      return [
        { nodeId: node.id, slot: 'mass' },
        { nodeId: node.id, slot: 'atomic' },
        { nodeId: node.id, slot: 'element' },
      ];
    case 'matrix':
      return node.cells.map((_, idx) => ({ nodeId: node.id, slot: 'cell', cellIndex: idx }));
    default:
      return [];
  }
}

// Collect ordered list of all editable slot paths for seamless Tab & Next-Box navigation
export function collectAllSlotPaths(
  nodes: MathNode[],
  prefix: SlotPathSegment[] = []
): SlotPathSegment[][] {
  const result: SlotPathSegment[][] = [];
  if (prefix.length === 0) {
    result.push([]);
  }

  for (const node of nodes) {
    const segs = getNodeSlotSegments(node);
    for (const seg of segs) {
      const nextPath = [...prefix, seg];
      result.push(nextPath);
      const childList = getSlotList(nodes, [seg]);
      if (childList) {
        result.push(...collectAllSlotPaths(childList, nextPath));
      }
    }
  }
  return result;
}

export function isNodeEmpty(node: MathNode): boolean {
  const segs = getNodeSlotSegments(node);
  if (segs.length === 0) return false;
  return segs.every((seg) => {
    const list = getSlotList([node], [seg]);
    return !list || list.length === 0;
  });
}

// Smart text auto-replacements while typing (e.g. "pi" -> π, ">=" -> ≥, "->" -> →)
export const SMART_TYPING_SHORTCUTS: { trigger: string; latex: string; display: string }[] = [
  { trigger: '>=', latex: '\\ge', display: '≥' },
  { trigger: '<=', latex: '\\le', display: '≤' },
  { trigger: '!=', latex: '\\neq', display: '≠' },
  { trigger: '+-', latex: '\\pm', display: '±' },
  { trigger: '->', latex: '\\rightarrow', display: '→' },
  { trigger: '=>', latex: '\\Rightarrow', display: '⇒' },
  { trigger: '<=>', latex: '\\Leftrightarrow', display: '⇔' },
  { trigger: '~=', latex: '\\approx', display: '≈' },
  { trigger: 'alpha', latex: '\\alpha', display: 'α' },
  { trigger: 'beta', latex: '\\beta', display: 'β' },
  { trigger: 'gamma', latex: '\\gamma', display: 'γ' },
  { trigger: 'delta', latex: '\\delta', display: 'δ' },
  { trigger: 'Delta', latex: '\\Delta', display: 'Δ' },
  { trigger: 'theta', latex: '\\theta', display: 'θ' },
  { trigger: 'lambda', latex: '\\lambda', display: 'λ' },
  { trigger: 'sigma', latex: '\\sigma', display: 'σ' },
  { trigger: 'omega', latex: '\\omega', display: 'ω' },
  { trigger: 'Omega', latex: '\\Omega', display: 'Ω' },
  { trigger: 'pi', latex: '\\pi', display: 'π' },
  { trigger: 'inf', latex: '\\infty', display: '∞' },
];
