"use client";

import { InlineMath } from "react-katex";

interface MatrixProps {
  data: number[][];
  label?: string;
  highlight?: { row: number; col: number } | null;
}

/**
 * Renders a matrix using KaTeX with optional cell highlighting.
 */
export default function Matrix({ data, label, highlight }: MatrixProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  // Build LaTeX for the matrix
  const inner = data
    .map((row, ri) =>
      row
        .map((val, ci) => {
          const isHighlighted = highlight?.row === ri && highlight?.col === ci;
          return isHighlighted ? `\\boxed{${val}}` : String(val);
        })
        .join(" & ")
    )
    .join(" \\\\ ");

  const latex = `\\begin{pmatrix} ${inner} \\end{pmatrix}`;

  return (
    <span className="inline-flex items-center gap-1">
      {label && (
        <span className="font-semibold text-indigo-700 mr-1">
          <InlineMath math={label} />
        </span>
      )}
      <InlineMath math={latex} />
      <span className="text-xs text-gray-400 ml-1">
        ({rows}×{cols})
      </span>
    </span>
  );
}
