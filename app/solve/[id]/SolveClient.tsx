"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { InlineMath, BlockMath } from "react-katex";
import MatrixInput from "@/components/MatrixInput";
import { Problem } from "@/lib/problems";

type CellStatus = "correct" | "incorrect" | "neutral";
type Status = "idle" | "checking" | "correct" | "incorrect";

interface Props {
  problem: Problem;
}

export default function SolveClient({ problem }: Props) {
  const emptyValues = () =>
    Array.from({ length: problem.answerRows }, () =>
      Array.from({ length: problem.answerCols }, () => "")
    );

  const [values, setValues] = useState<string[][]>(emptyValues);
  const [cellStatus, setCellStatus] = useState<CellStatus[][]>(
    Array.from({ length: problem.answerRows }, () =>
      Array.from({ length: problem.answerCols }, () => "neutral" as CellStatus)
    )
  );
  const [status, setStatus] = useState<Status>("idle");
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleChange = useCallback(
    (r: number, c: number, val: string) => {
      setValues((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = val;
        return next;
      });
      // Reset cell status when editing
      setCellStatus((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = "neutral";
        return next;
      });
      setStatus("idle");
    },
    []
  );

  const handleCheck = () => {
    setStatus("checking");
    const newCellStatus: CellStatus[][] = values.map((row, r) =>
      row.map((val, c) => {
        const num = Number(val.trim());
        return num === problem.answer[r][c] ? "correct" : "incorrect";
      })
    );
    setCellStatus(newCellStatus);
    const allCorrect = newCellStatus.every((row) => row.every((s) => s === "correct"));
    setStatus(allCorrect ? "correct" : "incorrect");
  };

  const handleReset = () => {
    setValues(emptyValues());
    setCellStatus(
      Array.from({ length: problem.answerRows }, () =>
        Array.from({ length: problem.answerCols }, () => "neutral")
      )
    );
    setStatus("idle");
    setShowSteps(false);
    setCurrentStep(0);
    setShowAnswer(false);
  };

  const answerLatex = (() => {
    const inner = problem.answer
      .map((row) => row.join(" & "))
      .join(" \\\\ ");
    return `AB = \\begin{pmatrix} ${inner} \\end{pmatrix}`;
  })();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">ホーム</Link>
        <span>/</span>
        <Link href="/problems" className="hover:text-indigo-600">問題一覧</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{problem.title}</span>
      </div>

      {/* Problem card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
            {problem.category}
          </span>
          <h2 className="text-xl font-bold text-gray-800">{problem.title}</h2>
          <p className="text-gray-600 mt-1">{problem.description}</p>
        </div>

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* Answer input */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            答えを入力してください <InlineMath math="AB =" />
          </p>
          <MatrixInput
            rows={problem.answerRows}
            cols={problem.answerCols}
            values={values}
            onChange={handleChange}
            cellStatus={cellStatus}
            disabled={status === "correct" || showAnswer}
          />
        </div>

        {/* Result message */}
        {status === "correct" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            <span className="text-2xl">🎉</span>
            <span className="font-semibold">正解！素晴らしい！</span>
          </div>
        )}
        {status === "incorrect" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            <span className="text-xl">❌</span>
            <span className="font-semibold">不正解。赤いセルを確認してください。</span>
          </div>
        )}

        {/* 解答表示ボックス */}
        {showAnswer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
            <p className="text-sm font-bold text-amber-700">📖 解答</p>
            <div className="overflow-x-auto">
              <BlockMath math={answerLatex} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          {status !== "correct" && !showAnswer && (
            <button
              onClick={handleCheck}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              答え合わせ
            </button>
          )}
          <button
            onClick={() => {
              setShowSteps((v) => !v);
              setCurrentStep(0);
            }}
            className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {showSteps ? "ヒントを閉じる" : "💡 ヒント・解法ステップ"}
          </button>
          {!showAnswer && status !== "correct" && (
            <button
              onClick={() => setShowAnswer(true)}
              className="border border-amber-300 text-amber-600 hover:bg-amber-50 font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              📖 解答を表示
            </button>
          )}
          <button
            onClick={handleReset}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            リセット
          </button>
        </div>
      </div>

      {/* Steps panel */}
      {showSteps && (
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-700 text-lg">解法ステップ</h3>

          {/* Step list */}
          <div className="space-y-3">
            {problem.steps.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 transition-all ${
                  i === currentStep
                    ? "bg-indigo-50 border border-indigo-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-indigo-600 mr-1">
                    Step {i + 1}.
                  </span>
                  {step.description}
                </p>
                <div className="overflow-x-auto">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {currentStep < problem.steps.length - 1 && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                次のステップ →
              </button>
            )}
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                ← 前のステップ
              </button>
            )}
            {currentStep === problem.steps.length - 1 && (
              <span className="text-sm text-green-600 font-semibold self-center ml-2">
                ✓ 全ステップ完了
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
