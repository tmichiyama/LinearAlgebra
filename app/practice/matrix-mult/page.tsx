"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import MatrixInput from "@/components/MatrixInput";
import { generateMatrixMultProblem } from "@/lib/generator";
import { Problem } from "@/lib/problems";

type CellStatus = "correct" | "incorrect" | "neutral";
type Phase = "dimension" | "values";
type DimStatus = "idle" | "correct" | "incorrect";
type ValStatus = "idle" | "correct" | "incorrect";

const makeEmptyValues = (rows: number, cols: number): string[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

const makeNeutralStatus = (rows: number, cols: number): CellStatus[][] =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): CellStatus => "neutral")
  );

function parseDims(title: string): { m: number; k: number; n: number } {
  const match = title.match(/(\d)×(\d) × \d×(\d)/);
  if (!match) return { m: 2, k: 2, n: 2 };
  return { m: Number(match[1]), k: Number(match[2]), n: Number(match[3]) };
}

const DIM_CHOICES: [number, number][] = [
  [2, 2],
  [2, 3],
  [3, 2],
  [3, 3],
];

export default function RandomPracticePage() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [phase, setPhase] = useState<Phase>("dimension");

  const [dimStatus, setDimStatus] = useState<DimStatus>("idle");
  const [selectedDim, setSelectedDim] = useState<[number, number] | null>(null);

  const [values, setValues] = useState<string[][]>([]);
  const [cellStatus, setCellStatus] = useState<CellStatus[][]>([]);
  const [valStatus, setValStatus] = useState<ValStatus>("idle");
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const loadNew = useCallback(() => {
    const p = generateMatrixMultProblem();
    setProblem(p);
    setPhase("dimension");
    setDimStatus("idle");
    setSelectedDim(null);
    setValues(makeEmptyValues(p.answerRows, p.answerCols));
    setCellStatus(makeNeutralStatus(p.answerRows, p.answerCols));
    setValStatus("idle");
    setShowSteps(false);
    setCurrentStep(0);
    setShowAnswer(false);
  }, []);

  useEffect(() => {
    loadNew();
  }, [loadNew]);

  const handleDimSelect = useCallback(
    (rows: number, cols: number) => {
      if (!problem || dimStatus === "correct") return;
      setSelectedDim([rows, cols]);
      const correct = rows === problem.answerRows && cols === problem.answerCols;
      setDimStatus(correct ? "correct" : "incorrect");
      if (correct) {
        setTimeout(() => setPhase("values"), 700);
      }
    },
    [problem, dimStatus]
  );

  const handleDimRetry = useCallback(() => {
    setDimStatus("idle");
    setSelectedDim(null);
  }, []);

  const handleChange = useCallback((r: number, c: number, val: string) => {
    setValues((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
    setCellStatus((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = "neutral";
      return next;
    });
    setValStatus("idle");
  }, []);

  const handleCheck = useCallback(() => {
    if (!problem) return;
    const newCellStatus: CellStatus[][] = values.map((row, r) =>
      row.map((val, c) => {
        const num = Number(val.trim());
        return isNaN(num) || val.trim() === ""
          ? "incorrect"
          : num === problem.answer[r][c]
          ? "correct"
          : "incorrect";
      })
    );
    setCellStatus(newCellStatus);
    const allCorrect = newCellStatus.every((row) => row.every((s) => s === "correct"));
    setValStatus(allCorrect ? "correct" : "incorrect");
    setTotal((t) => t + 1);
    if (allCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [problem, values]);

  if (!problem) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse">問題を準備中...</span>
      </div>
    );
  }

  const { m, k, n } = parseDims(problem.title);

  const answerLatex = (() => {
    const inner = problem.answer
      .map((row: number[]) => row.join(" & "))
      .join(" \\\\ ");
    return `AB = \\begin{pmatrix} ${inner} \\end{pmatrix}`;
  })();

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">ホーム</Link>
        <span>/</span>
        <span className="text-gray-700">行列の積</span>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 bg-white border border-gray-200 rounded-lg px-5 py-3">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-400">解いた問題</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{correctCount}</div>
          <div className="text-xs text-gray-400">正解</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{streak}</div>
          <div className="text-xs text-gray-400">連続正解</div>
        </div>
        {total > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {Math.round((correctCount / total) * 100)}%
              </div>
              <div className="text-xs text-gray-400">正解率</div>
            </div>
          </>
        )}
      </div>

      {/* Problem card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              行列の積
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {phase === "dimension" ? "Step 1: サイズ" : "Step 2: 成分"}
            </span>
          </div>
          <button
            onClick={loadNew}
            className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded transition-colors"
          >
            スキップ →
          </button>
        </div>

        {/* Question */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* Phase: dimension */}
        {phase === "dimension" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              積 <InlineMath math="AB" /> の行列のサイズは？
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIM_CHOICES.map(([r, c]) => {
                const isSelected = selectedDim?.[0] === r && selectedDim?.[1] === c;
                const isCorrect = isSelected && dimStatus === "correct";
                const isWrong = isSelected && dimStatus === "incorrect";
                const isCorrectAnswer = showAnswer && r === problem.answerRows && c === problem.answerCols;
                return (
                  <button
                    key={`${r}x${c}`}
                    onClick={() => handleDimSelect(r, c)}
                    disabled={dimStatus === "correct" || showAnswer}
                    className={[
                      "py-3 rounded border-2 font-mono font-semibold text-base transition-all",
                      "disabled:cursor-not-allowed",
                      isCorrect || isCorrectAnswer
                        ? "border-green-500 bg-green-50 text-green-800"
                        : isWrong
                        ? "border-red-400 bg-red-50 text-red-700"
                        : showAnswer
                        ? "border-gray-100 bg-gray-50 text-gray-300"
                        : dimStatus === "idle"
                        ? "border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:bg-gray-50"
                        : "border-gray-100 bg-gray-50 text-gray-400",
                    ].join(" ")}
                  >
                    {r}×{c}
                  </button>
                );
              })}
            </div>

            {dimStatus === "correct" && (
              <div className="border-l-4 border-green-500 bg-green-50 pl-4 py-2 text-sm text-green-800">
                正解 —— <InlineMath math={`${m}×${k}`} /> 行列 × <InlineMath math={`${k}×${n}`} /> 行列 = <InlineMath math={`${m}×${n}`} /> 行列。成分を入力してください。
              </div>
            )}
            {dimStatus === "incorrect" && !showAnswer && (
              <div className="space-y-2">
                <div className="border-l-4 border-red-400 bg-red-50 pl-4 py-2 text-sm text-red-800">
                  不正解。もう一度選んでください。
                </div>
                <div className="border-l-4 border-gray-300 bg-gray-50 pl-4 py-2 text-sm text-gray-700">
                  ヒント: m×k 行列と k×n 行列の積は <strong>m×n 行列</strong> になります。
                  <div className="mt-1 overflow-x-auto">
                    <InlineMath math="(m \times k) \cdot (k \times n) \rightarrow (m \times n)" />
                  </div>
                </div>
                <button
                  onClick={handleDimRetry}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
                >
                  選び直す
                </button>
              </div>
            )}

            {showAnswer && (
              <div className="border-l-4 border-gray-400 bg-gray-50 pl-4 py-3 space-y-2">
                <p className="text-sm font-semibold text-gray-700">解答</p>
                <p className="text-sm text-gray-600">AB のサイズ: <span className="font-bold">{problem.answerRows}×{problem.answerCols}</span></p>
                <div className="overflow-x-auto">
                  <BlockMath math={answerLatex} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded transition-colors"
                >
                  解答を表示
                </button>
              ) : (
                <button
                  onClick={loadNew}
                  className="bg-gray-900 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded transition-colors"
                >
                  次の問題 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phase: values */}
        {phase === "values" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600">
              <InlineMath math="AB" /> の成分をすべて入力してください
              <span className="ml-2 text-xs text-gray-400">
                ({problem.answerRows}×{problem.answerCols} 行列)
              </span>
            </p>

            <MatrixInput
              rows={problem.answerRows}
              cols={problem.answerCols}
              values={values}
              onChange={handleChange}
              cellStatus={cellStatus}
              disabled={valStatus === "correct" || showAnswer}
            />

            {valStatus === "correct" && (
              <div className="border-l-4 border-green-500 bg-green-50 pl-4 py-2 text-sm text-green-800 font-medium">
                正解{streak >= 3 ? ` — ${streak} 問連続正解` : ""}
              </div>
            )}
            {valStatus === "incorrect" && (
              <div className="border-l-4 border-red-400 bg-red-50 pl-4 py-2 text-sm text-red-800">
                不正解。赤いセルを確認してください。
              </div>
            )}

            {showAnswer && (
              <div className="border-l-4 border-gray-400 bg-gray-50 pl-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-gray-700">解答</p>
                <div className="overflow-x-auto">
                  <BlockMath math={answerLatex} />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {valStatus === "correct" ? (
                <button
                  onClick={loadNew}
                  className="bg-gray-900 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded transition-colors"
                >
                  次の問題 →
                </button>
              ) : showAnswer ? (
                <button
                  onClick={loadNew}
                  className="bg-gray-900 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded transition-colors"
                >
                  次の問題 →
                </button>
              ) : (
                <button
                  onClick={handleCheck}
                  disabled={values.flat().some((v) => v.trim() === "")}
                  className="bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded transition-colors"
                >
                  答え合わせ
                </button>
              )}
              <button
                onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2 rounded transition-colors"
              >
                {showSteps ? "ヒントを閉じる" : "ヒント"}
              </button>
              {valStatus !== "correct" && !showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2 rounded transition-colors"
                >
                  解答を表示
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Steps panel */}
      {phase === "values" && showSteps && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-gray-900">解法ステップ</h3>
          <div className="space-y-3">
            {problem.steps.slice(0, -1).slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 transition-all ${
                  i === currentStep
                    ? "bg-indigo-50 border border-indigo-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-gray-900 mr-1">Step {i + 1}.</span>
                  {step.description}
                </p>
                <div className="overflow-x-auto">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep < problem.steps.length - 2 && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                次のステップ →
              </button>
            )}
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                ← 前のステップ
              </button>
            )}
            {currentStep === problem.steps.length - 2 && (
              <span className="text-sm text-green-700 font-medium self-center ml-2">
                全ステップ完了
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
