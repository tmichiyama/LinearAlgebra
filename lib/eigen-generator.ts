// ================================================================
// 固有値・固有ベクトル 練習問題ジェネレータ
//
// A = P · D · P⁻¹ で整数固有値を保証
// P はユニモジュラー行列（det = ±1）→ P⁻¹ も整数行列
// 固有ベクトルは正規化後を 4 択選択肢で出題
// ================================================================

export interface EigenStep {
  description: string;
  formula: string;
}

export interface EigenChoice {
  latex: string;    // 表示用 LaTeX
  isCorrect: boolean;
}

export interface VectorItem {
  eigenvalue: number;
  choices: EigenChoice[];   // 4 択
}

export interface EigenProblem {
  id: string;
  size: 2 | 3;
  matrix: number[][];
  questionLatex: string;
  eigenvalues: number[];          // 答え: 固有値リスト（重複あり）
  vectorItems: VectorItem[];      // 固有ベクトル選択肢（固有値ごと）
  steps: EigenStep[];
}

// ---------------------------------------------------------------- math utils

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function gcdArr(arr: number[]): number {
  return arr.reduce((g, v) => gcd(g, Math.abs(v)), 0);
}

function randInt(range: number): number {
  return Math.floor(Math.random() * (range * 2 + 1)) - range;
}

function randIntNonZero(range: number): number {
  let v = 0;
  while (v === 0) v = randInt(range);
  return v;
}

function toPmatrix(M: number[][]): string {
  const inner = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\begin{pmatrix} ${inner} \\end{pmatrix}`;
}

function toColVec(v: number[]): string {
  return `\\begin{pmatrix} ${v.join(" \\\\ ")} \\end{pmatrix}`;
}

// ---------------------------------------------------------------- matrix ops

function matMul(A: number[][], B: number[][]): number[][] {
  const n = A.length, m = B[0].length, k = B.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      Array.from({ length: k }, (_, t) => A[i][t] * B[t][j]).reduce((s, v) => s + v, 0)
    )
  );
}

function det2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function inv2(M: number[][]): number[][] {
  const d = det2(M); // should be ±1
  return [
    [ M[1][1] / d, -M[0][1] / d],
    [-M[1][0] / d,  M[0][0] / d],
  ];
}

function det3(m: number[][]): number {
  const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, k] = m[2];
  return a*(e*k - f*h) - b*(d*k - f*g) + c*(d*h - e*g);
}

function inv3(M: number[][]): number[][] {
  const d = det3(M); // should be ±1
  const adj = [
    [M[1][1]*M[2][2]-M[1][2]*M[2][1], M[0][2]*M[2][1]-M[0][1]*M[2][2], M[0][1]*M[1][2]-M[0][2]*M[1][1]],
    [M[1][2]*M[2][0]-M[1][0]*M[2][2], M[0][0]*M[2][2]-M[0][2]*M[2][0], M[0][2]*M[1][0]-M[0][0]*M[1][2]],
    [M[1][0]*M[2][1]-M[1][1]*M[2][0], M[0][1]*M[2][0]-M[0][0]*M[2][1], M[0][0]*M[1][1]-M[0][1]*M[1][0]],
  ];
  return adj.map(row => row.map(v => v / d));
}

// ---------------------------------------------------------------- unimodular generators

function genUnimodular2(): number[][] {
  // [[1,a],[0,1]] * [[1,0],[b,1]] = [[1+ab, a],[b, 1]]
  // det = 1 always
  const a = randInt(2), b = randInt(2);
  return [[1 + a*b, a],[b, 1]];
}

function genUnimodular3(): number[][] {
  // L (lower triangular, diag ±1) * U (upper triangular, diag ±1)
  const s1 = Math.random() < 0.5 ? 1 : -1;
  const s2 = Math.random() < 0.5 ? 1 : -1;
  const s3 = Math.random() < 0.5 ? 1 : -1;
  const L = [
    [s1, 0, 0],
    [randInt(2)*s1, s2, 0],
    [randInt(2)*s1, randInt(2)*s2, s3],
  ];
  const t1 = Math.random() < 0.5 ? 1 : -1;
  const t2 = Math.random() < 0.5 ? 1 : -1;
  const t3 = Math.random() < 0.5 ? 1 : -1;
  const U = [
    [t1, randInt(2)*t1, randInt(2)*t1],
    [0, t2, randInt(2)*t2],
    [0, 0, t3],
  ];
  return matMul(L, U);
}

// ---------------------------------------------------------------- eigenvector utils

/** 固有ベクトルを正規化前の整数ベクトルにする (canonical: 最初の非ゼロ成分 > 0, GCD=1) */
function canonicalize(v: number[]): number[] {
  const g = gcdArr(v.filter(x => x !== 0));
  let c = v.map(x => x / g);
  const first = c.find(x => x !== 0)!;
  if (first < 0) c = c.map(x => -x);
  return c;
}

/** 正規化ベクトルの LaTeX: 1/√n * col */
function normalizedLatex(v: number[]): string {
  const n = v.reduce((s, x) => s + x * x, 0);
  if (n === 1) return toColVec(v);
  return `\\dfrac{1}{\\sqrt{${n}}}${toColVec(v)}`;
}

/** 固有ベクトルとして誤った選択肢を生成 */
function makeDistractors(correct: number[], allVecs: number[][], size: number): number[][] {
  const distractors: number[][] = [];
  const used = new Set<string>();
  used.add(correct.join(","));

  // 1. 他の固有ベクトル
  for (const v of allVecs) {
    const c = canonicalize(v);
    const key = c.join(",");
    if (!used.has(key)) { used.add(key); distractors.push(c); }
    if (distractors.length >= 3) break;
  }

  // 2. 成分を入れ替えたもの
  if (distractors.length < 3) {
    const perms = size === 2
      ? [[correct[1], correct[0]]]
      : [[correct[1], correct[0], correct[2]], [correct[0], correct[2], correct[1]], [correct[2], correct[1], correct[0]]];
    for (const p of perms) {
      if (p.some(x => x !== 0)) {
        const c = canonicalize(p);
        const key = c.join(",");
        if (!used.has(key)) { used.add(key); distractors.push(c); }
      }
      if (distractors.length >= 3) break;
    }
  }

  // 3. 符号を一部反転したもの
  if (distractors.length < 3) {
    for (let mask = 1; mask < (1 << size); mask++) {
      const flipped = correct.map((v, i) => (mask >> i) & 1 ? -v : v);
      if (flipped.some(x => x !== 0)) {
        const c = canonicalize(flipped);
        const key = c.join(",");
        if (!used.has(key)) { used.add(key); distractors.push(c); }
      }
      if (distractors.length >= 3) break;
    }
  }

  // 4. ランダムで埋める
  while (distractors.length < 3) {
    const r = Array.from({ length: size }, () => randIntNonZero(2));
    const c = canonicalize(r);
    const key = c.join(",");
    if (!used.has(key)) { used.add(key); distractors.push(c); }
  }

  return distractors.slice(0, 3);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------- LaTeX sign helpers

/** λ の係数項: `-3λ` or `+3λ` (先頭の `λ²` の後ろに続く) */
function lambdaTerm(coeff: number): string {
  if (coeff === 0) return "";
  if (coeff > 0) return ` - ${coeff}\\lambda`;
  return ` + ${Math.abs(coeff)}\\lambda`;
}

/** 定数項: `+ 5` or `- 5` */
function constTerm(n: number): string {
  if (n === 0) return "";
  if (n > 0) return ` + ${n}`;
  return ` - ${Math.abs(n)}`;
}

/** 因数 `(λ - lam)` の表示 */
function lamFactor(lam: number): string {
  if (lam === 0) return "\\lambda";
  if (lam > 0) return `(\\lambda - ${lam})`;
  return `(\\lambda + ${Math.abs(lam)})`;
}

/** `(A - lamI)` の表示 */
function aMinusLamI(lam: number): string {
  if (lam === 0) return "A";
  if (lam > 0) return `(A - ${lam}I)`;
  return `(A + ${Math.abs(lam)}I)`;
}

/** 行列要素 `a - λ` の表示 */
function entryMinusLam(a: number): string {
  if (a === 0) return "-\\lambda";
  if (a > 0) return `${a} - \\lambda`;
  return `${a} - \\lambda`;
}

// ---------------------------------------------------------------- step builders

function stepsFor2x2(A: number[][], eigenvalues: number[], eigenvecs: number[][]): EigenStep[] {
  const [lam1, lam2] = eigenvalues;
  const [[a, b], [c, d]] = A;
  const tr = a + d;
  const det = a*d - b*c;

  return [
    {
      description: "特性方程式 det(A − λI) = 0 を作ります。",
      formula: `\\det(A - \\lambda I) = \\begin{vmatrix} ${entryMinusLam(a)} & ${b} \\\\ ${c} & ${entryMinusLam(d)} \\end{vmatrix} = 0`,
    },
    {
      description: "行列式を展開して特性方程式を作ります。",
      formula: `(${entryMinusLam(a)})(${entryMinusLam(d)}) - (${b})(${c}) = \\lambda^2${lambdaTerm(tr)}${constTerm(det)} = 0`,
    },
    {
      description: `固有値 λ = ${lam1} の固有ベクトルを求めます。`,
      formula: `${aMinusLamI(lam1)}\\mathbf{x} = \\mathbf{0} \\implies \\mathbf{x} \\propto ${toColVec(eigenvecs[0])}`,
    },
    {
      description: `固有値 λ = ${lam2} の固有ベクトルを求めます。`,
      formula: `${aMinusLamI(lam2)}\\mathbf{x} = \\mathbf{0} \\implies \\mathbf{x} \\propto ${toColVec(eigenvecs[1])}`,
    },
    {
      description: "正規化した固有ベクトルを求めます。",
      formula: eigenvecs.map((v, i) => {
        const n = v.reduce((s, x) => s + x*x, 0);
        return `\\lambda = ${eigenvalues[i]}: \\quad ${normalizedLatex(v)}`;
      }).join(", \\qquad "),
    },
  ];
}

function stepsFor3x3(A: number[][], eigenvalues: number[], eigenvecs: number[][]): EigenStep[] {
  const lams = Array.from(new Set(eigenvalues));
  const steps: EigenStep[] = [
    {
      description: "特性方程式 det(A − λI) = 0 を展開します（3×3 は係数を直接求める）。",
      formula: `\\det(A - \\lambda I) = 0`,
    },
  ];

  for (let i = 0; i < lams.length; i++) {
    const lam = lams[i];
    const idx = eigenvalues.indexOf(lam);
    steps.push({
      description: `固有値 λ = ${lam} の固有ベクトルを求めます。`,
      formula: `${aMinusLamI(lam)}\\mathbf{x} = \\mathbf{0} \\implies \\mathbf{x} \\propto ${toColVec(eigenvecs[idx])}`,
    });
  }

  steps.push({
    description: "各固有ベクトルを正規化します。",
    formula: eigenvecs.map((v, i) => `\\lambda=${eigenvalues[i]}: ${normalizedLatex(v)}`).join(", \\quad "),
  });

  return steps;
}

// ---------------------------------------------------------------- generators

function generate2x2(): EigenProblem {
  let matrix!: number[][];
  let eigenvalues!: number[];
  let eigenvecs!: number[][];

  for (let attempt = 0; attempt < 200; attempt++) {
    // Pick 2 distinct integer eigenvalues
    const lam1 = randInt(4);
    let lam2 = randInt(4);
    if (lam2 === lam1) lam2 = lam1 + 1;

    const D = [[lam1, 0], [0, lam2]];
    const P = genUnimodular2();
    const Pinv = inv2(P);

    // A = P D P⁻¹
    const A = matMul(matMul(P, D), Pinv);

    // Must be integers, no trivial all-zero rows
    if (!A.flat().every(v => Number.isInteger(v))) continue;
    if (A.flat().every(v => v === 0)) continue;
    if (Math.max(...A.flat().map(Math.abs)) > 10) continue;

    // Eigenvectors from columns of P
    const v1 = canonicalize([P[0][0], P[1][0]]);
    const v2 = canonicalize([P[0][1], P[1][1]]);

    if (v1.every(x => x === 0) || v2.every(x => x === 0)) continue;

    matrix = A;
    eigenvalues = [lam1, lam2];
    eigenvecs = [v1, v2];
    break;
  }

  if (!matrix) {
    matrix = [[3, 1],[0, 2]];
    eigenvalues = [3, 2];
    eigenvecs = [[1, 0],[1, -1]];
  }

  const allVecs = eigenvecs;
  const vectorItems: VectorItem[] = eigenvalues.map((lam, i) => {
    const correct = eigenvecs[i];
    const distractors = makeDistractors(correct, allVecs, 2);
    const choices: EigenChoice[] = shuffle([
      { latex: normalizedLatex(correct), isCorrect: true },
      ...distractors.map(d => ({ latex: normalizedLatex(d), isCorrect: false })),
    ]);
    return { eigenvalue: lam, choices };
  });

  return {
    id: `eigen-2x2-${Date.now()}`,
    size: 2,
    matrix,
    questionLatex: `A = ${toPmatrix(matrix)}`,
    eigenvalues,
    vectorItems,
    steps: stepsFor2x2(matrix, eigenvalues, eigenvecs),
  };
}

function generate3x3(): EigenProblem {
  let matrix!: number[][];
  let eigenvalues!: number[];
  let eigenvecs!: number[][];

  for (let attempt = 0; attempt < 300; attempt++) {
    // Pick 3 distinct integer eigenvalues (small range)
    const pool = [-2,-1,0,1,2,3];
    const shuffled = shuffle(pool);
    const [lam1, lam2, lam3] = shuffled.slice(0, 3);

    const D = [[lam1,0,0],[0,lam2,0],[0,0,lam3]];
    const P = genUnimodular3();
    const Pinv = inv3(P);

    const A = matMul(matMul(P, D), Pinv);

    if (!A.flat().every(v => Number.isInteger(v))) continue;
    if (A.flat().every(v => v === 0)) continue;
    if (Math.max(...A.flat().map(Math.abs)) > 12) continue;

    const v1 = canonicalize([P[0][0], P[1][0], P[2][0]]);
    const v2 = canonicalize([P[0][1], P[1][1], P[2][1]]);
    const v3 = canonicalize([P[0][2], P[1][2], P[2][2]]);

    if ([v1,v2,v3].some(v => v.every(x => x === 0))) continue;

    matrix = A;
    eigenvalues = [lam1, lam2, lam3];
    eigenvecs = [v1, v2, v3];
    break;
  }

  if (!matrix) {
    matrix = [[2,0,0],[0,1,0],[0,0,3]];
    eigenvalues = [2,1,3];
    eigenvecs = [[1,0,0],[0,1,0],[0,0,1]];
  }

  const allVecs = eigenvecs;
  const vectorItems: VectorItem[] = eigenvalues.map((lam, i) => {
    const correct = eigenvecs[i];
    const distractors = makeDistractors(correct, allVecs, 3);
    const choices: EigenChoice[] = shuffle([
      { latex: normalizedLatex(correct), isCorrect: true },
      ...distractors.map(d => ({ latex: normalizedLatex(d), isCorrect: false })),
    ]);
    return { eigenvalue: lam, choices };
  });

  return {
    id: `eigen-3x3-${Date.now()}`,
    size: 3,
    matrix,
    questionLatex: `A = ${toPmatrix(matrix)}`,
    eigenvalues,
    vectorItems,
    steps: stepsFor3x3(matrix, eigenvalues, eigenvecs),
  };
}

export function generateEigenProblem(size: 2 | 3): EigenProblem {
  return size === 2 ? generate2x2() : generate3x3();
}
