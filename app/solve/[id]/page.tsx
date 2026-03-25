import { notFound } from "next/navigation";
import { getProblem } from "@/lib/problems";
import SolveClient from "./SolveClient";

interface Props {
  params: { id: string };
}

export default function SolvePage({ params }: Props) {
  const problem = getProblem(params.id);
  if (!problem) notFound();

  return <SolveClient problem={problem} />;
}
