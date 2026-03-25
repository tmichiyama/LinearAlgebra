"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { BlockMath, InlineMath } from "react-katex";
import MatrixInput from "@/components/MatrixInput";
import { generateInverseProblem, InverseProblem } from "@/lib/inverse-generator";

// ------------------------------------------------------------------ types

type CellStatus = "correct" | "incorrect" | "neutral";
type FieldStatus = "correct" | "incorrect" | "neutral";
type ValStatus = "idle" | "correct" | "incorrect";

// ------------------------------------------------------------------ helpers

const makeEmpty = (n: number): string[][] =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));

const makeNeutral = (n: number): CellStatus[][] =>
  Array.from({ length: n }, () =>
    Array.from({ length: n }, (): CellStatus => "neutral")
  );

// ------------------------------------------------------------------ sub-component: fraction denominator input

interface DetInputProps {
  value: string;
  status: FieldStatus;
  disabled: boolean;
  onChange: (v: string) => void;
}

function DetInput({ value, status, disabled, onChange }: DetInputProps) {
  const borderColor =
    status === "correct"   ? "border-green-500 bg-green-50 text-green-800" :
    status === "incorrect" ? "border-red-400 bg-red-50 text-red-700" :
                             "border-indigo-300 bg-white text-gray-800";

  return (
    /* 1行目: "1", 区切り線, 入力欄 を縦に並べる */
    <div className="inline-flex flex-col items-center gap-0.5">
      <span className="text-base font-semibold text-gray-600 leading-none">1</span>
      <div className="w-full border-t-2 border-gray-400" />
      <input
        type="text"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="?"
        className={[
          "w-14 h-11 text-center text-lg font-mono rounded-lg border-2 outline-none",
          "transition-all focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          borderColor,
        ].join(" ")}
      />
    </div>
  );
}

// ------------------------------------------------------------------ main component

export default function InversePracticePage() {
  const [size, setSize]   = useState<2 | 3>(2);
  const [problem, setProblem] = useState<InverseProblem | null>(null);

  // --- answer states ---
  const [detInput, setDetInput]     = useState("");
  const [detStatus, setDetStatus]   = useState<FieldStatus>("neutral");
  const [adjValues, setAdjValues]   = useState<string[][]>([]);
  const [adjStatus, setAdjStatus]   = useState<CellStatus[][]>([]);
  const [valStatus, setValStatus]   = useState<ValStatus>("idle");
  const [showAnswer, setShowAnswer] = useState(false);

  // --- hint states ---
  const [showSteps, setShowSteps]     = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // --- stats ---
  const [streak, setStreak]             = useState(0);
  const [total, setTotal]               = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const detRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------- load

  const loadNew = useCallback((nextSize: 2 | 3) => {
    const p = generateInverseProblem(nextSize);
    setProblem(p);
    setDetInput("");
    setDetStatus("neutral");
    setAdjValues(makeEmpty(nextSize));
    setAdjStatus(makeNeutral(nextSize));
    setValStatus("idle");
    setShowAnswer(false);
    setShowSteps(false);
    setCurrentStep(0);
    setTimeout(() => detRef.current?.focus(), 50);
  }, []);

  useEffect(() => { loadNew(size); }, [size, loadNew]);

  // ---------------------------------------------------------------- handlers

  const handleDetChange = useCallback((v: string) => {
    setDetInput(v);
    setDetStatus("neutral");
    setValStatus("idle");
  }, []);

  const handleAdjChange = useCallback((r: number, c: number, val: string) => {
    setAdjValues((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
    setAdjStatus((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = "neutral";
      return next;
    });
    setValStatus("idle");
  }, []);

  const handleCheck = useCallback(() => {
    if (!problem) return;

    // Check det
    const detNum = Number(detInput.trim());
    const detOk  = !isNaN(detNum) && detNum === problem.det;
    setDetStatus(detOk ? "correct" : "incorrect");

    // Check adj
    const newAdjStatus: CellStatus[][] = adjValues.map((row, r) =>
      row.map((val, c) => {
        const num = Number(val.trim());
        return !isNaN(num) && val.trim() !== "" && num === problem.adj[r][c]
          ? "correct"
          : "incorrect";
      })
    );
    setAdjStatus(newAdjStatus);

    const allOk =
      detOk && newAdjStatus.every((row) => row.every((s) => s === "correct"));
    setValStatus(allOk ? "correct" : "incorrect");
    setTotal((t) => t + 1);
    if (allOk) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [problem, detInput, adjValues]);

  const allFilled =
    detInput.trim() !== "" && adjValues.flat().every((v) => v.trim() !== "");

  const answerLatex = (() => {
    if (!problem) return "";
    const inner = problem.adj
      .map((row) => row.join(" & "))
      .join(" \\\\ ");
    return `A^{-1} = \\dfrac{1}{${problem.det}} \\begin{pmatrix} ${inner} \\end{pmatrix}`;
  })();

  // ---------------------------------------------------------------- render

  if (!problem) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-lg">問題を準備中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-600">ホーム</Link>
        <span>/</span>
        <Link href="/problems" className="hover:text-teal-600">問題一覧</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">逆行列 ランダム練習</span>
      </div>

      {/* Size selector */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([2, 3] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={[
              "px-6 py-2 rounded-lg font-semibold text-sm transition-all",
              size === s
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
        {[
          { label: "解いた問題", value: total,        color: "text-teal-600"  },
          { label: "正解",       value: correctCount, color: "text-green-600" },
          { label: "🔥 連続正解", value: streak,       color: "text-orange-500"},
        ].map(({ label, value, color }, i) => (
          <div key={i} className="flex items-center gap-4">
            {i > 0 && <div className="w-px h-10 bg-gray-200" />}
            <div className="text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
        {total > 0 && (
          <>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {Math.round((correctCount / total) * 100)}%
              </div>
              <div className="text-xs text-gray-500">正解率</div>
            </div>
          </>
        )}
      </div>

      {/* Problem card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="inline-block text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
            逆行列 / {size}×{size}
          </span>
          <button
            onClick={() => loadNew(size)}
            className="text-sm text-gray-500 hover:text-teal-600 border border-gray-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            スキップ →
          </button>
        </div>

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
          <BlockMath math={problem.questionLatex} />
        </div>

        {/* ---- Answer section ---- */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600">
            逆行列 <InlineMath math="A^{-1}" /> を次の形で求めよ。
          </p>

          {/* Answer format hint （静的表示） */}
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 w-fit">
            答えの形式：
            <InlineMath math={`A^{-1} = \\dfrac{1}{\\square} \\begin{pmatrix} ${
              Array.from({length: size}, () =>
                Array.from({length: size}, () => "\\square").join(" & ")
            ).join(" \\\\ ")} \\end{pmatrix}`} />
          </div>

          {/* Answer inputs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* A^{-1} = ラベル */}
            <span className="text-gray-600 font-medium text-base">
              <InlineMath math="A^{-1} =" />
            </span>

            {/* 1/det 入力 */}
            <DetInput
              value={detInput}
              status={detStatus}
              disabled={valStatus === "correct" || showAnswer}
              onChange={handleDetChange}
            />

            {/* × 記号 */}
            <span className="text-gray-400 text-2xl font-light select-none">×</span>

            {/* adj(A) 入力グリッド */}
            <MatrixInput
              rows={size}
              cols={size}
              values={adjValues}
              onChange={handleAdjChange}
              cellStatus={adjStatus}
              disabled={valStatus === "correct" || showAnswer}
            />
          </div>

          {/* フィードバック詳細 */}
          {valStatus === "incorrect" && (
            <div className="flex flex-wrap gap-2 text-xs mt-1">
              {detStatus === "incorrect" && (
                <span className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1">
                  ❌ det(A) が違います
                </span>
              )}
              {adjStatus.flat().some((s) => s === "incorrect") && (
                <span className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1">
                  ❌ adj(A) に誤りがあります（赤いセルを確認）
                </span>
              )}
            </div>
          )}
        </div>

        {/* Result messages */}
        {valStatus === "correct" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            <span className="text-2xl">{streak >= 3 ? "🔥" : "🎉"}</span>
            <span className="font-semibold">
              正解！{streak >= 3 ? ` ${streak}連続正解！` : ""}
            </span>
          </div>
        )}
        {valStatus === "incorrect" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            <span className="text-xl">❌</span>
            <span className="font-semibold">不正解。上の詳細を確認してください。</span>
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
          {valStatus === "correct" ? (
            <button
              onClick={() => loadNew(size)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              次の問題 →
            </button>
          ) : showAnswer ? (
            <button
              onClick={() => loadNew(size)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              次の問題 →
            </button>
          ) : (
            <button
              onClick={handleCheck}
              disabled={!allFilled}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              答え合わせ
            </button>
          )}
          <button
            onClick={() => { setShowSteps((v) => !v); setCurrentStep(0); }}
            className="border border-teal-300 text-teal-600 hover:bg-teal-50 font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {showSteps ? "ヒントを閉じる" : "💡 ヒント"}
          </button>
          {valStatus !== "correct" && !showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="border border-amber-300 text-amber-600 hover:bg-amber-50 font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              📖 解答を表示
            </button>
          )}
        </div>
      </div>

      {/* Steps panel */}
      {showSteps && (
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-700 text-lg">解法ステップ</h3>
            <span className="text-xs text-gray-400">{currentStep + 1} / {problem.steps.length}</span>
          </div>
          <div className="space-y-3">
            {problem.steps.slice(0, currentStep + 1).map((step, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 transition-all ${
                  i === currentStep
                    ? "bg-teal-50 border border-teal-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-teal-600 mr-1">Step {i + 1}.</span>
                  {step.description}
                </p>
                <div className="overflow-x-auto">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {currentStep < problem.steps.length - 1 && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
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
