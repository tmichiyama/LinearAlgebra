// ================================================================
// 逆行列練習問題ジェネレータ
//
// 答えの形式: A⁻¹ = (1 / det(A)) × adj(A)
//   - det(A) : 整数（ユーザーが入力）
//   - adj(A) : 各成分が整数の随伴行列（ユーザーが入力）
//   - 逆行列自体は分数になりうるが、上記2つを分けることで整数入力で完結
// ================================================================

export interface InverseStep {
  description: string;
  formula: string;
}

export interface InverseProblem {
  id: string;
  size: 2 | 3;
  matrix: number[][];
  questionLatex: string;
  det: number;       // 答え①: 行列式の値
  adj: number[][];   // 答え②: 随伴行列（余因子行列の転置）の各成分
  steps: InverseStep[];
}

// ---------------------------------------------------------------- utils

function randInt(range: number): number {
  return Math.floor(Math.random() * (range * 2 + 1)) - range;
}

function det2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function det3(m: number[][]): number {
  const [a, b, c] = m[0];
  const [d, e, f] = m[1];
  const [g, h, k] = m[2];
  return a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
}

function multiply(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      A[i].reduce((s, _, t) => s + A[i][t] * B[t][j], 0)
    )
  );
}

function toPmatrix(M: number[][]): string {
  const inner = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\begin{pmatrix} ${inner} \\end{pmatrix}`;
}

function toVmatrix(M: number[][]): string {
  const inner = M.map((row) => row.join(" & ")).join(" \\\\ ");
  return `\\begin{vmatrix} ${inner} \\end{vmatrix}`;
}

/** 負の数を括弧で囲む */
function ns(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

/** 引き算を自然な符号で: subTerm(+4)→"- 4"  subTerm(-3)→"+ 3" */
function subTerm(val: number): string {
  return val >= 0 ? `- ${val}` : `+ ${Math.abs(val)}`;
}

// ---------------------------------------------------------------- adjugate

/** 3×3 行列の (i,j) 余因子 */
function cofactor3(M: number[][], i: number, j: number): number {
  const minor = M.filter((_, r) => r !== i).map((row) =>
    row.filter((_, c) => c !== j)
  );
  return Math.pow(-1, i + j) * det2(minor);
}

/** 2×2 随伴行列: adj(A) = [[d,-b],[-c,a]] */
function adjugate2(M: number[][]): number[][] {
  return [
    [ M[1][1], -M[0][1]],
    [-M[1][0],  M[0][0]],
  ];
}

/** 3×3 随伴行列: adj(A)_ij = C_ji */
function adjugate3(M: number[][]): number[][] {
  return Array.from({ length: 3 }, (_, i) =>
    Array.from({ length: 3 }, (_, j) => cofactor3(M, j, i))
  );
}

// ---------------------------------------------------------------- step builders

function stepsFor2x2(M: number[][], d: number): InverseStep[] {
  const [[a, b], [c, e]] = M;
  const ad = a * e;
  const bc = b * c;
  const adj = adjugate2(M);

  return [
    {
      description: "行列式 det(A) を計算します。",
      formula: `\\det(A) = ${ns(a)} \\times ${ns(e)} - ${ns(b)} \\times ${ns(c)} = ${ad} ${subTerm(bc)} = ${d}`,
    },
    {
      description: "2×2 逆行列の公式を確認します。",
      formula: String.raw`A^{-1} = \frac{1}{\det(A)} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}`,
    },
    {
      description: "随伴行列 adj(A) を求めます（対角要素を入れ替え、非対角要素の符号を反転）。",
      formula: `\\mathrm{adj}(A) = \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} = ${toPmatrix(adj)}`,
    },
    {
      description: `よって逆行列は次の通りです。`,
      formula: `A^{-1} = \\frac{1}{${d}} ${toPmatrix(adj)}`,
    },
  ];
}

function stepsFor3x3(M: number[][], d: number): InverseStep[] {
  const [a, b, c] = M[0];
  const [dd, e, f] = M[1];
  const [g, h, k] = M[2];

  const eikfh = e * k - f * h;
  const dikfg = dd * k - f * g;
  const dheg  = dd * h - e * g;

  const cofactors: number[][] = Array.from({ length: 3 }, (_, i) =>
    Array.from({ length: 3 }, (_, j) => cofactor3(M, i, j))
  );
  const adj = adjugate3(M);

  function cofactorStep(i: number, j: number): InverseStep {
    const minor = M.filter((_, r) => r !== i).map((row) =>
      row.filter((_, col) => col !== j)
    );
    const sign = (i + j) % 2 === 0 ? "+1" : "-1";
    const [m00, m01] = minor[0];
    const [m10, m11] = minor[1];
    const cij = cofactors[i][j];

    return {
      description: `余因子 C_{${i + 1}${j + 1}} を求めます（符号 = (-1)^{${i + 1}+${j + 1}} = ${sign}）。`,
      formula: `C_{${i+1}${j+1}} = (${sign})${toVmatrix(minor)}
        = (${sign})\\bigl(${ns(m00)}\\times${ns(m11)} - ${ns(m01)}\\times${ns(m10)}\\bigr)
        = (${sign})(${m00*m11} ${subTerm(m01*m10)}) = ${cij}`,
    };
  }

  return [
    {
      description: "行列式 det(A) を第1行の余因子展開で求めます。",
      formula: `\\det(A) = ${ns(a)}(${ns(e)}\\times${ns(k)} - ${ns(f)}\\times${ns(h)})
        - ${ns(b)}(${ns(dd)}\\times${ns(k)} - ${ns(f)}\\times${ns(g)})
        + ${ns(c)}(${ns(dd)}\\times${ns(h)} - ${ns(e)}\\times${ns(g)})
        = ${a}(${eikfh}) - ${b}(${dikfg}) + ${c}(${dheg}) = ${d}`,
    },
    {
      description: "逆行列の公式を確認します。",
      formula: String.raw`A^{-1} = \frac{1}{\det(A)}\,\mathrm{adj}(A), \qquad \mathrm{adj}(A)_{ij} = C_{ji}`,
    },
    cofactorStep(0, 0),
    cofactorStep(0, 1),
    cofactorStep(0, 2),
    cofactorStep(1, 0),
    cofactorStep(1, 1),
    cofactorStep(1, 2),
    cofactorStep(2, 0),
    cofactorStep(2, 1),
    cofactorStep(2, 2),
    {
      description: "余因子行列を転置して随伴行列 adj(A) を作ります。",
      formula: `\\mathrm{adj}(A) = ${toPmatrix(cofactors)}^{\\!\\top} = ${toPmatrix(adj)}`,
    },
    {
      description: "逆行列を (1/det) × adj(A) の形でまとめます。",
      formula: `A^{-1} = \\frac{1}{${d}}\\,${toPmatrix(adj)}`,
    },
  ];
}

// ---------------------------------------------------------------- matrix generators

function generateMatrix2x2(): number[][] {
  let M: number[][];
  do {
    M = [[randInt(4), randInt(4)], [randInt(4), randInt(4)]];
  } while (det2(M) === 0 || M.flat().every((v) => v === 0));
  return M;
}

function generateMatrix3x3(): number[][] {
  let M: number[][];
  do {
    M = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => randInt(3)));
  } while (
    det3(M) === 0 ||
    Math.abs(det3(M)) > 20 || // 大きすぎる行列式を除外
    M.flat().every((v) => v === 0)
  );
  return M;
}

// ---------------------------------------------------------------- export

export function generateInverseProblem(size: 2 | 3): InverseProblem {
  const matrix = size === 2 ? generateMatrix2x2() : generateMatrix3x3();
  const d      = size === 2 ? det2(matrix)       : det3(matrix);
  const adj    = size === 2 ? adjugate2(matrix)   : adjugate3(matrix);
  const steps  = size === 2 ? stepsFor2x2(matrix, d) : stepsFor3x3(matrix, d);

  return {
    id: `inv-${size}x${size}-${Date.now()}`,
    size,
    matrix,
    questionLatex: `A = ${toPmatrix(matrix)}`,
    det: d,
    adj,
    steps,
  };
}
