import { Problem, Matrix } from "./problems";

// ------------------------------------------------------------------ helpers

/** [-range, range] の整数をランダムに返す */
function randInt(range: number): number {
  return Math.floor(Math.random() * (range * 2 + 1)) - range;
}

/** m×n 整数行列をランダム生成 */
function randomMatrix(rows: number, cols: number, range: number): Matrix {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => randInt(range))
  );
}

/** m×k 行列 A と k×n 行列 B の積（m×n 行列）を計算 */
function multiply(A: Matrix, B: Matrix): Matrix {
  const m = A.length;
  const k = B.length;
  const n = B[0].length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      A[i].reduce((sum, _, t) => sum + A[i][t] * B[t][j], 0)
    )
  );
}

/** 行列を LaTeX の pmatrix に変換 */
function matrixToLatex(M: Matrix): string {
  const inner = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\begin{pmatrix} ${inner} \\end{pmatrix}`;
}

/**
 * (i,j) 成分の計算式を LaTeX で生成。
 * 例) A[i] = [2,-1,3], B の第j列 = [1,4,-2]
 *  → "2 \times 1 + (-1) \times 4 + 3 \times (-2) = 2 - 4 - 6 = -8"
 */
function cellFormulaLatex(A: Matrix, B: Matrix, i: number, j: number): string {
  const k = A[0].length;

  // 各項を "a × b" の形で組み立て
  const terms = Array.from({ length: k }, (_, t) => {
    const a = A[i][t];
    const b = B[t][j];
    const aStr = a < 0 ? `(${a})` : String(a);
    const bStr = b < 0 ? `(${b})` : String(b);
    return { expr: `${aStr} \\times ${bStr}`, val: a * b };
  });

  // 展開した積の並び: "2 \times 1 + (-1) \times 4 + ..."
  const expanded = terms
    .map((t, idx) => (idx === 0 ? t.expr : (t.val >= 0 ? `+ ${t.expr}` : `${t.expr}`)))
    .join(" ");

  // 計算済みの値の並び: "2 - 4 - 6"
  const evaluated = terms
    .map((t, idx) => {
      if (idx === 0) return String(t.val);
      return t.val >= 0 ? `+ ${t.val}` : `- ${Math.abs(t.val)}`;
    })
    .join(" ");

  const total = terms.reduce((s, t) => s + t.val, 0);

  return `${expanded} = ${evaluated} = ${total}`;
}

/** 列ベクトル（B の j 列）を取り出して表示用文字列に */
function colVector(B: Matrix, j: number): string {
  return B.map((row) => row[j]).join(", ");
}

/** 序数文字列 */
function ordinal(n: number): string {
  return `第${n + 1}`;
}

// ------------------------------------------------------------------ export

/**
 * ランダムな行列の積問題を生成。
 *  - A: m×k,  B: k×n  (m, k, n ∈ {2, 3})
 *  - 非正方行列も含む
 *  - 答えは常に整数
 */
export function generateMatrixMultProblem(id?: string): Problem {
  // ランダムに次元を選ぶ
  const pick = () => (Math.random() < 0.5 ? 2 : 3);
  const m = pick(); // A の行数
  const k = pick(); // A の列数 = B の行数
  const n = pick(); // B の列数

  // k が大きいほどエントリを小さくして答えが爆発しないよう調整
  const range = k === 3 ? 3 : 4;

  let A: Matrix, B: Matrix, AB: Matrix;

  // ゼロ行列 / 全成分同一の自明な答えを除外
  do {
    A = randomMatrix(m, k, range);
    B = randomMatrix(k, n, range);
    AB = multiply(A, B);
  } while (
    AB.flat().every((v) => v === 0) ||
    AB.flat().every((v) => v === AB[0][0])
  );

  const problemId = id ?? `rnd-${Date.now()}`;
  const dimLabel = `${m}×${k} × ${k}×${n}`;

  // 各成分のステップを生成
  const cellSteps = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const rowVec = A[i].join(", ");
      const colVec = colVector(B, j);
      cellSteps.push({
        description: `(${i + 1},${j + 1}) 成分：A の${ordinal(i)}行 [${rowVec}] と B の${ordinal(j)}列 [${colVec}] の内積`,
        formula: cellFormulaLatex(A, B, i, j),
      });
    }
  }

  return {
    id: problemId,
    category: "行列の積",
    title: `${dimLabel} 行列の積`,
    description: "次の行列の積 AB を求めよ。",
    questionLatex: `A = ${matrixToLatex(A)}, \\quad B = ${matrixToLatex(B)}`,
    answer: AB,
    answerRows: m,
    answerCols: n,
    steps: [
      {
        description: `A は ${m}×${k} 行列、B は ${k}×${n} 行列なので、積 AB は ${m}×${n} 行列になります。(i,j) 成分は A の第i行と B の第j列の内積です。`,
        formula: `(AB)_{ij} = \\sum_{t=1}^{${k}} a_{it}\\, b_{tj}`,
      },
      ...cellSteps,
      {
        description: "まとめると：",
        formula: `AB = ${matrixToLatex(AB)}`,
      },
    ],
  };
}
