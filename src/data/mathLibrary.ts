export interface SymbolItem {
  display: string;
  title: string;
  latex: string;
  keywords?: string;
}

export interface FormulaPreset {
  id: string;
  title: string;
  category: 'Algebra' | 'Geometry & Trig' | 'Calculus' | 'Physics' | 'Chemistry' | 'Biology';
  latex: string;
  keywords: string;
}

export interface QuickInlineMathItem {
  id: string;
  label: string;
  title: string;
  /** If instantLatex is set, inserts chip directly at cursor without opening modal. */
  instantLatex?: string;
  /** If templateLatex is set, opens Visual Equation Studio pre-populated with this template. */
  templateKey?: 'frac' | 'sup' | 'sub' | 'sqrt' | 'int' | 'matrix';
}

export const QUICK_INLINE_MATH: QuickInlineMathItem[] = [
  { id: 'q-frac', label: 'a/b', title: 'Insert fraction', templateKey: 'frac' },
  { id: 'q-sup', label: 'x²', title: 'Insert power / exponent', templateKey: 'sup' },
  { id: 'q-sub', label: 'xₙ', title: 'Insert subscript', templateKey: 'sub' },
  { id: 'q-sqrt', label: '√x', title: 'Insert square root', templateKey: 'sqrt' },
  { id: 'q-deg', label: '°', title: 'Degree symbol', instantLatex: '^\\circ' },
  { id: 'q-pm', label: '±', title: 'Plus-minus', instantLatex: '\\pm' },
  { id: 'q-mul', label: '×', title: 'Multiply', instantLatex: '\\times' },
  { id: 'q-div', label: '÷', title: 'Divide', instantLatex: '\\div' },
  { id: 'q-le', label: '≤', title: 'Less than or equal', instantLatex: '\\le' },
  { id: 'q-ge', label: '≥', title: 'Greater than or equal', instantLatex: '\\ge' },
  { id: 'q-theta', label: 'θ', title: 'Theta', instantLatex: '\\theta' },
  { id: 'q-pi', label: 'π', title: 'Pi', instantLatex: '\\pi' },
  { id: 'q-arrow', label: '→', title: 'Arrow', instantLatex: '\\rightarrow' },
  { id: 'q-eq', label: '⇌', title: 'Reversible reaction', instantLatex: '\\rightleftharpoons' },
];

export const OPERATOR_SYMBOLS: SymbolItem[] = [
  { display: '+', title: 'Plus', latex: '+', keywords: 'add plus' },
  { display: '−', title: 'Minus', latex: '-', keywords: 'subtract minus' },
  { display: '±', title: 'Plus-minus', latex: '\\pm', keywords: 'plus minus' },
  { display: '∓', title: 'Minus-plus', latex: '\\mp', keywords: 'minus plus' },
  { display: '×', title: 'Multiply', latex: '\\times', keywords: 'times multiply cross' },
  { display: '÷', title: 'Divide', latex: '\\div', keywords: 'divide' },
  { display: '·', title: 'Dot product', latex: '\\cdot', keywords: 'dot multiply' },
  { display: '=', title: 'Equals', latex: '=', keywords: 'equal' },
  { display: '≠', title: 'Not equal', latex: '\\neq', keywords: 'not equal' },
  { display: '≈', title: 'Approximately equal', latex: '\\approx', keywords: 'approx' },
  { display: '≡', title: 'Identical / Triple bond', latex: '\\equiv', keywords: 'equivalent triple bond' },
  { display: '∝', title: 'Proportional to', latex: '\\propto', keywords: 'proportional' },
  { display: '<', title: 'Less than', latex: '<', keywords: 'less' },
  { display: '>', title: 'Greater than', latex: '>', keywords: 'greater' },
  { display: '≤', title: 'Less or equal', latex: '\\le', keywords: 'less equal' },
  { display: '≥', title: 'Greater or equal', latex: '\\ge', keywords: 'greater equal' },
  { display: '≪', title: 'Much less than', latex: '\\ll', keywords: 'much less' },
  { display: '≫', title: 'Much greater than', latex: '\\gg', keywords: 'much greater' },
  { display: '∞', title: 'Infinity', latex: '\\infty', keywords: 'infinity' },
  { display: '∂', title: 'Partial derivative', latex: '\\partial', keywords: 'partial derivative' },
  { display: '∇', title: 'Nabla / Del', latex: '\\nabla', keywords: 'nabla gradient del' },
  { display: '∴', title: 'Therefore', latex: '\\therefore', keywords: 'therefore' },
  { display: '∵', title: 'Because', latex: '\\because', keywords: 'because since' },
  { display: '⇒', title: 'Implies', latex: '\\Rightarrow', keywords: 'implies arrow' },
  { display: '⇔', title: 'If and only if', latex: '\\Leftrightarrow', keywords: 'iff equivalent' },
  { display: '→', title: 'Right arrow / Tends to', latex: '\\rightarrow', keywords: 'arrow tends to' },
  { display: '↔', title: 'Double arrow', latex: '\\leftrightarrow', keywords: 'arrow both' },
  { display: '…', title: 'Ellipsis', latex: '\\ldots', keywords: 'dots ellipsis' },
];

export const GEOMETRY_SET_SYMBOLS: SymbolItem[] = [
  { display: '°', title: 'Degree', latex: '^\\circ', keywords: 'degree angle temperature' },
  { display: '′', title: 'Prime / Minute', latex: '\\prime', keywords: 'prime minute derivative' },
  { display: '∠', title: 'Angle', latex: '\\angle', keywords: 'angle geometry' },
  { display: '△', title: 'Triangle', latex: '\\triangle', keywords: 'triangle geometry' },
  { display: '⊥', title: 'Perpendicular', latex: '\\perp', keywords: 'perpendicular' },
  { display: '∥', title: 'Parallel', latex: '\\parallel', keywords: 'parallel' },
  { display: '≅', title: 'Congruent', latex: '\\cong', keywords: 'congruent geometry' },
  { display: '∼', title: 'Similar', latex: '\\sim', keywords: 'similar geometry' },
  { display: '∈', title: 'Element of', latex: '\\in', keywords: 'in member set' },
  { display: '∉', title: 'Not element of', latex: '\\notin', keywords: 'not in set' },
  { display: '⊂', title: 'Proper subset', latex: '\\subset', keywords: 'subset set' },
  { display: '⊆', title: 'Subset or equal', latex: '\\subseteq', keywords: 'subset equal set' },
  { display: '∪', title: 'Union', latex: '\\cup', keywords: 'union set' },
  { display: '∩', title: 'Intersection', latex: '\\cap', keywords: 'intersection set' },
  { display: '∅', title: 'Empty set', latex: '\\emptyset', keywords: 'empty null set' },
  { display: '∀', title: 'For all', latex: '\\forall', keywords: 'for all logic' },
  { display: '∃', title: 'There exists', latex: '\\exists', keywords: 'exists logic' },
  { display: 'ℕ', title: 'Natural numbers', latex: '\\mathbb{N}', keywords: 'natural numbers set' },
  { display: 'ℤ', title: 'Integers', latex: '\\mathbb{Z}', keywords: 'integers set' },
  { display: 'ℚ', title: 'Rational numbers', latex: '\\mathbb{Q}', keywords: 'rational numbers set' },
  { display: 'ℝ', title: 'Real numbers', latex: '\\mathbb{R}', keywords: 'real numbers set' },
  { display: 'ℂ', title: 'Complex numbers', latex: '\\mathbb{C}', keywords: 'complex numbers set' },
];

export const GREEK_LOWER_SYMBOLS: SymbolItem[] = [
  { display: 'α', title: 'Alpha', latex: '\\alpha' },
  { display: 'β', title: 'Beta', latex: '\\beta' },
  { display: 'γ', title: 'Gamma', latex: '\\gamma' },
  { display: 'δ', title: 'Delta', latex: '\\delta' },
  { display: 'ε', title: 'Epsilon', latex: '\\varepsilon' },
  { display: 'ζ', title: 'Zeta', latex: '\\zeta' },
  { display: 'η', title: 'Eta', latex: '\\eta' },
  { display: 'θ', title: 'Theta', latex: '\\theta' },
  { display: 'κ', title: 'Kappa', latex: '\\kappa' },
  { display: 'λ', title: 'Lambda', latex: '\\lambda' },
  { display: 'μ', title: 'Mu', latex: '\\mu' },
  { display: 'ν', title: 'Nu', latex: '\\nu' },
  { display: 'ξ', title: 'Xi', latex: '\\xi' },
  { display: 'π', title: 'Pi', latex: '\\pi' },
  { display: 'ρ', title: 'Rho', latex: '\\rho' },
  { display: 'σ', title: 'Sigma', latex: '\\sigma' },
  { display: 'τ', title: 'Tau', latex: '\\tau' },
  { display: 'φ', title: 'Phi', latex: '\\phi' },
  { display: 'χ', title: 'Chi', latex: '\\chi' },
  { display: 'ψ', title: 'Psi', latex: '\\psi' },
  { display: 'ω', title: 'Omega', latex: '\\omega' },
];

export const GREEK_UPPER_SYMBOLS: SymbolItem[] = [
  { display: 'Γ', title: 'Capital Gamma', latex: '\\Gamma' },
  { display: 'Δ', title: 'Capital Delta', latex: '\\Delta' },
  { display: 'Θ', title: 'Capital Theta', latex: '\\Theta' },
  { display: 'Λ', title: 'Capital Lambda', latex: '\\Lambda' },
  { display: 'Π', title: 'Capital Pi', latex: '\\Pi' },
  { display: 'Σ', title: 'Capital Sigma', latex: '\\Sigma' },
  { display: 'Φ', title: 'Capital Phi', latex: '\\Phi' },
  { display: 'Ψ', title: 'Capital Psi', latex: '\\Psi' },
  { display: 'Ω', title: 'Ohm / Omega', latex: '\\Omega' },
];

export const TRIG_FUNC_ITEMS: { label: string; title: string; latex: string }[] = [
  { label: 'sin', title: 'Sine', latex: '\\sin' },
  { label: 'cos', title: 'Cosine', latex: '\\cos' },
  { label: 'tan', title: 'Tangent', latex: '\\tan' },
  { label: 'cot', title: 'Cotangent', latex: '\\cot' },
  { label: 'sec', title: 'Secant', latex: '\\sec' },
  { label: 'csc', title: 'Cosecant', latex: '\\csc' },
  { label: 'sin⁻¹', title: 'Inverse sine', latex: '\\sin^{-1}' },
  { label: 'cos⁻¹', title: 'Inverse cosine', latex: '\\cos^{-1}' },
  { label: 'tan⁻¹', title: 'Inverse tangent', latex: '\\tan^{-1}' },
  { label: 'log', title: 'Logarithm', latex: '\\log' },
  { label: 'log₁₀', title: 'Log base 10', latex: '\\log_{10}' },
  { label: 'ln', title: 'Natural log', latex: '\\ln' },
  { label: 'eˣ', title: 'Exponential', latex: 'e^{x}' },
];

export const CHEM_QUICK_ITEMS: { label: string; title: string; latex: string }[] = [
  { label: '→', title: 'Reaction arrow', latex: '\\rightarrow' },
  { label: '⇌', title: 'Reversible arrow', latex: '\\rightleftharpoons' },
  { label: '↑', title: 'Gas evolved', latex: '\\uparrow' },
  { label: '↓', title: 'Precipitate', latex: '\\downarrow' },
  { label: '≡', title: 'Triple bond', latex: '\\equiv' },
  { label: 'H₂O', title: 'Water', latex: '\\text{H}_2\\text{O}' },
  { label: 'H₂SO₄', title: 'Sulfuric acid', latex: '\\text{H}_2\\text{SO}_4' },
  { label: 'HNO₃', title: 'Nitric acid', latex: '\\text{HNO}_3' },
  { label: 'HCl', title: 'Hydrochloric acid', latex: '\\text{HCl}' },
  { label: 'NaOH', title: 'Sodium hydroxide', latex: '\\text{NaOH}' },
  { label: 'CO₂', title: 'Carbon dioxide', latex: '\\text{CO}_2' },
  { label: 'NH₃', title: 'Ammonia', latex: '\\text{NH}_3' },
  { label: 'CH₄', title: 'Methane', latex: '\\text{CH}_4' },
  { label: 'C₆H₆', title: 'Benzene', latex: '\\text{C}_6\\text{H}_6' },
  { label: 'CaCO₃', title: 'Calcium carbonate', latex: '\\text{CaCO}_3' },
  { label: '-COOH', title: 'Carboxylic group', latex: '-\\text{COOH}' },
  { label: '-OH', title: 'Hydroxyl group', latex: '-\\text{OH}' },
  { label: 'Fe²⁺', title: 'Ferrous ion', latex: '\\text{Fe}^{2+}' },
  { label: 'Fe³⁺', title: 'Ferric ion', latex: '\\text{Fe}^{3+}' },
  { label: 'SO₄²⁻', title: 'Sulfate ion', latex: '\\text{SO}_4^{2-}' },
  { label: 'NH₄⁺', title: 'Ammonium ion', latex: '\\text{NH}_4^{+}' },
  { label: 'm s⁻¹', title: 'Velocity unit', latex: '\\text{m s}^{-1}' },
  { label: 'm s⁻²', title: 'Acceleration unit', latex: '\\text{m s}^{-2}' },
  { label: 'kg m⁻³', title: 'Density unit', latex: '\\text{kg m}^{-3}' },
  { label: 'kJ mol⁻¹', title: 'Molar enthalpy', latex: '\\text{kJ mol}^{-1}' },
  { label: 'ΔH', title: 'Enthalpy change', latex: '\\Delta H' },
];

export const FORMULA_PRESETS: FormulaPreset[] = [
  // Algebra
  {
    id: 'quad',
    title: 'Quadratic Formula',
    category: 'Algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}',
    keywords: 'quadratic roots equation algebra',
  },
  {
    id: 'binom-exp',
    title: 'Binomial Term',
    category: 'Algebra',
    latex: '\\binom{n}{r} a^{n-r} b^{r}',
    keywords: 'binomial combination ncr higher math',
  },
  {
    id: 'log-change',
    title: 'Logarithm Base Rule',
    category: 'Algebra',
    latex: '\\log_{a} b = \\frac{\\log b}{\\log a}',
    keywords: 'log logarithm base',
  },
  {
    id: 'ap-sum',
    title: 'Arithmetic Series Sum',
    category: 'Algebra',
    latex: 'S_{n} = \\frac{n}{2} \\left( 2a + (n-1)d \\right)',
    keywords: 'arithmetic progression series sum',
  },
  {
    id: 'std-dev',
    title: 'Standard Deviation',
    category: 'Algebra',
    latex: '\\sigma = \\sqrt{\\frac{\\sum_{i=1}^{n} (x_{i} - \\bar{x})^{2}}{n}}',
    keywords: 'statistics standard deviation variance',
  },

  // Geometry & Trig
  {
    id: 'pythagoras',
    title: 'Pythagorean Theorem',
    category: 'Geometry & Trig',
    latex: 'a^{2} + b^{2} = c^{2}',
    keywords: 'pythagoras triangle right angle',
  },
  {
    id: 'trig-id',
    title: 'Pythagorean Identity',
    category: 'Geometry & Trig',
    latex: '\\sin^{2}\\theta + \\cos^{2}\\theta = 1',
    keywords: 'trigonometry sin cos identity',
  },
  {
    id: 'sine-rule',
    title: 'Sine Rule',
    category: 'Geometry & Trig',
    latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R',
    keywords: 'sine rule triangle trigonometry',
  },
  {
    id: 'distance-2d',
    title: 'Distance Formula',
    category: 'Geometry & Trig',
    latex: 'd = \\sqrt{(x_{2} - x_{1})^{2} + (y_{2} - y_{1})^{2}}',
    keywords: 'coordinate geometry distance formula',
  },
  {
    id: 'circle-eq',
    title: 'General Circle Equation',
    category: 'Geometry & Trig',
    latex: 'x^{2} + y^{2} + 2gx + 2fy + c = 0',
    keywords: 'circle coordinate geometry higher math',
  },

  // Calculus
  {
    id: 'deriv-def',
    title: 'First Principle Derivative',
    category: 'Calculus',
    latex: '\\frac{dy}{dx} = \\lim_{h \\rightarrow 0} \\frac{f(x+h) - f(x)}{h}',
    keywords: 'derivative differentiation limit calculus',
  },
  {
    id: 'def-int',
    title: 'Definite Integral',
    category: 'Calculus',
    latex: '\\int_{a}^{b} f(x)\\ dx',
    keywords: 'integral integration calculus',
  },
  {
    id: 'lim-sin',
    title: 'Standard Trig Limit',
    category: 'Calculus',
    latex: '\\lim_{x \\rightarrow 0} \\frac{\\sin x}{x} = 1',
    keywords: 'limit sin x calculus',
  },
  {
    id: 'matrix-det',
    title: '2×2 Determinant',
    category: 'Calculus',
    latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc',
    keywords: 'matrix determinant linear algebra',
  },

  // Physics
  {
    id: 'kinematics-s',
    title: 'Motion Displacement',
    category: 'Physics',
    latex: 's = ut + \\frac{1}{2}at^{2}',
    keywords: 'kinematics motion physics acceleration',
  },
  {
    id: 'kinematics-v2',
    title: 'Velocity-Displacement',
    category: 'Physics',
    latex: 'v^{2} = u^{2} + 2as',
    keywords: 'kinematics velocity physics',
  },
  {
    id: 'gravitation',
    title: "Newton's Law of Gravitation",
    category: 'Physics',
    latex: 'F = G \\frac{m_{1} m_{2}}{r^{2}}',
    keywords: 'gravity newton force physics',
  },
  {
    id: 'parallel-res',
    title: 'Parallel Resistance',
    category: 'Physics',
    latex: '\\frac{1}{R_{p}} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + \\frac{1}{R_{3}}',
    keywords: 'ohm electricity resistance circuit physics',
  },
  {
    id: 'lens-eq',
    title: 'Lens / Mirror Formula',
    category: 'Physics',
    latex: '\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}',
    keywords: 'optics lens mirror focal length physics',
  },
  {
    id: 'kinetic-energy',
    title: 'Kinetic Energy',
    category: 'Physics',
    latex: 'E_{k} = \\frac{1}{2}mv^{2}',
    keywords: 'energy work kinetic physics',
  },
  {
    id: 'vector-resultant',
    title: 'Vector Resultant',
    category: 'Physics',
    latex: 'R = \\sqrt{P^{2} + Q^{2} + 2PQ\\cos\\alpha}',
    keywords: 'vector parallelogram resultant physics',
  },

  // Chemistry
  {
    id: 'ideal-gas',
    title: 'Ideal Gas Law',
    category: 'Chemistry',
    latex: 'PV = nRT',
    keywords: 'gas pressure volume chemistry',
  },
  {
    id: 'ph-def',
    title: 'pH Formula',
    category: 'Chemistry',
    latex: '\\text{pH} = -\\log_{10} \\left[ \\text{H}^{+} \\right]',
    keywords: 'acid base ph chemistry',
  },
  {
    id: 'henderson',
    title: 'Henderson-Hasselbalch',
    category: 'Chemistry',
    latex: '\\text{pH} = \\text{p}K_{a} + \\log \\frac{\\left[ \\text{Salt} \\right]}{\\left[ \\text{Acid} \\right]}',
    keywords: 'buffer solution acid pka chemistry',
  },
  {
    id: 'haber-process',
    title: 'Haber Process Equilibrium',
    category: 'Chemistry',
    latex: '\\text{N}_{2} + 3\\text{H}_{2} \\xrightleftharpoons[200\\ \\text{atm}]{450^{\\circ}\\text{C},\\ \\text{Fe}} 2\\text{NH}_{3}',
    keywords: 'ammonia equilibrium haber reaction chemistry',
  },
  {
    id: 'uranium-isotope',
    title: 'Nuclear Isotope Example',
    category: 'Chemistry',
    latex: '{}_{92}^{235}\\text{U} + {}_{0}^{1}\\text{n} \\rightarrow {}_{56}^{141}\\text{Ba} + {}_{36}^{92}\\text{Kr} + 3{}_{0}^{1}\\text{n}',
    keywords: 'nuclear fission isotope physics chemistry',
  },

  // Biology
  {
    id: 'photosynthesis',
    title: 'Photosynthesis (সালোকসংশ্লেষণ)',
    category: 'Biology',
    latex: '6\\text{CO}_{2} + 12\\text{H}_{2}\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Light}} \\text{C}_{6}\\text{H}_{12}\\text{O}_{6} + 6\\text{O}_{2} + 6\\text{H}_{2}\\text{O}',
    keywords: 'photosynthesis biology plant glucose oxygen',
  },
  {
    id: 'respiration',
    title: 'Aerobic Respiration (সবাত শ্বসন)',
    category: 'Biology',
    latex: '\\text{C}_{6}\\text{H}_{12}\\text{O}_{6} + 6\\text{O}_{2} \\rightarrow 6\\text{CO}_{2} + 6\\text{H}_{2}\\text{O} + 38\\text{ ATP}',
    keywords: 'respiration biology atp energy glucose',
  },
  {
    id: 'hardy-weinberg',
    title: 'Hardy-Weinberg Equation',
    category: 'Biology',
    latex: 'p^{2} + 2pq + q^{2} = 1',
    keywords: 'genetics allele frequency biology evolution',
  },
  {
    id: 'bmi-formula',
    title: 'BMI (দেহ ভর সূচক)',
    category: 'Biology',
    latex: '\\text{BMI} = \\frac{\\text{Weight (kg)}}{\\left(\\text{Height (m)}\\right)^{2}}',
    keywords: 'bmi nutrition health biology',
  },
  {
    id: 'magnification',
    title: 'Microscope Magnification',
    category: 'Biology',
    latex: 'M = \\frac{\\text{Image Size}}{\\text{Actual Size}}',
    keywords: 'microscope cell magnification biology',
  },
  {
    id: 'mendel-cross',
    title: 'Mendel F₁ Cross (♂ × ♀)',
    category: 'Biology',
    latex: '\\text{Tt (♂)} \\times \\text{Tt (♀)} \\rightarrow F_{2}\\ (3:1)',
    keywords: 'mendel genetics cross male female biology',
  },
];
