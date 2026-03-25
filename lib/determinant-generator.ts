// ================================================================
// 行列式練習問題ジェネレータ
// 2×2: det = ad - bc
// 3×3: 第1行による余因子展開
// ================================================================

export interface DetStep {
  description: string;
  formula: string;
}

export interface DetProblem {
  id: string;
  size: 2 | 3;
  matrix: number[][];
  /** KaTeX に渡す問題式（det(A) = |...|） */
  questionLatex: string;
  answer: number;
  steps: DetStep[];
}

// ---------------------------------------------------------------- utils

function randInt(range: number): number {
  return Math.floor(Math.random() * (range * 2 + 1)) - range;
}

function randomMatrix(n: number, range: number): number[][] {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randInt(range))
  );
}

/** 2×2 行列式 */
function det2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

/** 3×3 行列式 */
function det3(m: number[][]): number {
  const [a, b, c] = m[0];
  const [d, e, f] = m[1];
  const [g, h, k] = m[2];
  return a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
}

/** 行列 → \begin{vmatrix}...\end{vmatrix} */
function toVmatrix(M: number[][]): string {
  const inner = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\begin{vmatrix} ${inner} \\end{vmatrix}`;
}

/** 負の数を括弧で囲む（積の途中式用） */
function ns(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

/**
 * 引き算を + / - で自然に表現する
 *   subTerm(+4) → "- 4"
 *   subTerm(-3) → "+ 3"
 */
function subTerm(val: number): string {
  return val >= 0 ? `- ${val}` : `+ ${Math.abs(val)}`;
}

// ---------------------------------------------------------------- step generators

function steps2x2(M: number[][], result: number): DetStep[] {
  const a = M[0][0], b = M[0][1];
  const c = M[1][0], d = M[1][1];
  const ad = a * d;
  const bc = b * c;

  return [
    {
      description: "2×2 行列式の公式を適用します。",
      formula:
        "\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc",
    },
    {
      description: "各値を代入して計算します。",
      formula: `\\det(A) = ${ns(a)} \\times ${ns(d)} - ${ns(b)} \\times ${ns(c)} = ${ad} ${subTerm(bc)} = ${result}`,
    },
  ];
}

function steps3x3(M: number[][], result: number): DetStep[] {
  const [a, b, c] = M[0];
  const [d, e, f] = M[1];
  const [g, h, k] = M[2];

  // 3つの 2×2 小行列式
  const sub11 = [[e, f], [h, k]];
  const sub12 = [[d, f], [g, k]];
  const sub13 = [[d, e], [g, h]];

  const d11 = det2(sub11); // M₁₁
  const d12 = det2(sub12); // M₁₂
  const d13 = det2(sub13); // M₁₃

  // 各項の値
  const t1 =  a * d11;
  const t2 =  b * d12; // 符号は後でマイナス
  const t3 =  c * d13;

  return [
    {
      description: "第1行に沿って余因子展開します（C₁₁ = +M₁₁, C₁₂ = −M₁₂, C₁₃ = +M₁₃）。",
      formula:
        "\\det(A) = a_{11} M_{11} - a_{12} M_{12} + a_{13} M_{13}",
    },
    {
      description: `小行列式 M₁₁：第1行・第1列を除いた 2×2 行列式`,
      formula: `M_{11} = ${toVmatrix(sub11)} = ${ns(e)} \\times ${ns(k)} - ${ns(f)} \\times ${ns(h)} = ${e * k} ${subTerm(f * h)} = ${d11}`,
    },
    {
      description: `小行列式 M₁₂：第1行・第2列を除いた 2×2 行列式`,
      formula: `M_{12} = ${toVmatrix(sub12)} = ${ns(d)} \\times ${ns(k)} - ${ns(f)} \\times ${ns(g)} = ${d * k} ${subTerm(f * g)} = ${d12}`,
    },
    {
      description: `小行列式 M₁₃：第1行・第3列を除いた 2×2 行列式`,
      formula: `M_{13} = ${toVmatrix(sub13)} = ${ns(d)} \\times ${ns(h)} - ${ns(e)} \\times ${ns(g)} = ${d * h} ${subTerm(e * g)} = ${d13}`,
    },
    {
      description: "3つの項をまとめます。",
      formula: `\\det(A) = ${ns(a)} \\times ${ns(d11)} - ${ns(b)} \\times ${ns(d12)} + ${ns(c)} \\times ${ns(d13)} = ${t1} ${subTerm(t2)} + ${t3} = ${result}`,
    },
  ];
}

// ---------------------------------------------------------------- export

/**
 * ランダムな行列式問題を生成する。
 * - 2×2: エントリ範囲 [-4, 4]
 * - 3×3: エントリ範囲 [-3, 3]
 * - 全ゼロ行列は除外。det = 0 の問題も学習上有効なので許容する。
 */
export function generateDetProblem(size: 2 | 3): DetProblem {
  const range = size === 2 ? 4 : 3;
  let matrix: number[][];
  let answer: number;

  do {
    matrix = randomMatrix(size, range);
    answer = size === 2 ? det2(matrix) : det3(matrix);
  } while (matrix.flat().every((v) => v === 0));

  const steps =
    size === 2 ? steps2x2(matrix, answer) : steps3x3(matrix, answer);

  return {
    id: `det-${size}x${size}-${Date.now()}`,
    size,
    matrix,
    questionLatex: `\\det(A) = ${toVmatrix(matrix)}`,
    answer,
    steps,
  };
}
