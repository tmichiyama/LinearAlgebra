export type Matrix = number[][];

export interface Step {
  description: string;
  formula: string;
}

export interface Problem {
  id: string;
  category: string;
  title: string;
  description: string;
  /** LaTeX string for the full question displayed to the user */
  questionLatex: string;
  /** The answer as a matrix */
  answer: Matrix;
  /** Size of the answer grid */
  answerRows: number;
  answerCols: number;
  /** Step-by-step hint */
  steps: Step[];
}

export const problems: Problem[] = [
  {
    id: "matrix-mult-2x2-01",
    category: "行列の積",
    title: "2×2 行列の積 (基本)",
    description: "次の行列の積 AB を求めよ。",
    questionLatex:
      "A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix}, \\quad B = \\begin{pmatrix} 1 & -1 \\\\ 4 & 2 \\end{pmatrix}",
    answer: [
      [6, 0],
      [12, 6],
    ],
    answerRows: 2,
    answerCols: 2,
    steps: [
      {
        description: "行列の積 AB の (i, j) 成分は、A の第 i 行と B の第 j 列の内積です。",
        formula: "(AB)_{ij} = \\sum_{k} a_{ik} b_{kj}",
      },
      {
        description: "(1,1) 成分：A の第1行 [2, 1] と B の第1列 [1, 4] の内積",
        formula: "2 \\times 1 + 1 \\times 4 = 2 + 4 = 6",
      },
      {
        description: "(1,2) 成分：A の第1行 [2, 1] と B の第2列 [-1, 2] の内積",
        formula: "2 \\times (-1) + 1 \\times 2 = -2 + 2 = 0",
      },
      {
        description: "(2,1) 成分：A の第2行 [0, 3] と B の第1列 [1, 4] の内積",
        formula: "0 \\times 1 + 3 \\times 4 = 0 + 12 = 12",
      },
      {
        description: "(2,2) 成分：A の第2行 [0, 3] と B の第2列 [-1, 2] の内積",
        formula: "0 \\times (-1) + 3 \\times 2 = 0 + 6 = 6",
      },
      {
        description: "まとめると：",
        formula:
          "AB = \\begin{pmatrix} 6 & 0 \\\\ 12 & 6 \\end{pmatrix}",
      },
    ],
  },
];

export function getProblem(id: string): Problem | undefined {
  return problems.find((p) => p.id === id);
}
