"use client";

import { ChangeEvent } from "react";

interface MatrixInputProps {
  rows: number;
  cols: number;
  values: string[][];
  onChange: (row: number, col: number, value: string) => void;
  cellStatus?: ("correct" | "incorrect" | "neutral")[][];
  disabled?: boolean;
}

export default function MatrixInput({
  rows,
  cols,
  values,
  onChange,
  cellStatus,
  disabled = false,
}: MatrixInputProps) {
  const statusClass = (r: number, c: number) => {
    const s = cellStatus?.[r]?.[c] ?? "neutral";
    if (s === "correct")
      return "border-green-500 bg-green-50 text-green-800 focus:ring-green-400";
    if (s === "incorrect")
      return "border-red-400 bg-red-50 text-red-700 focus:ring-red-400";
    return "border-gray-300 bg-white text-gray-900 focus:ring-indigo-400";
  };

  return (
    <div className="inline-block">
      <div className="flex items-center gap-1">
        <div
          className="flex flex-col justify-between"
          style={{ height: `${rows * 52}px` }}
        >
          <span className="text-3xl text-gray-400 leading-none font-thin">⌈</span>
          <span className="text-3xl text-gray-400 leading-none font-thin">⌊</span>
        </div>

        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, 56px)` }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => (
              <input
                key={`${r}-${c}`}
                type="text"
                inputMode="numeric"
                value={values[r]?.[c] ?? ""}
                disabled={disabled}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onChange(r, c, e.target.value)
                }
                className={[
                  "w-14 h-12 text-center text-lg font-mono rounded border-2 outline-none",
                  "transition-all duration-150 focus:ring-2 focus:ring-offset-1",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  statusClass(r, c),
                ].join(" ")}
                placeholder="?"
              />
            ))
          )}
        </div>

        <div
          className="flex flex-col justify-between"
          style={{ height: `${rows * 52}px` }}
        >
          <span className="text-3xl text-gray-400 leading-none font-thin">⌉</span>
          <span className="text-3xl text-gray-400 leading-none font-thin">⌋</span>
        </div>
      </div>
    </div>
  );
}
