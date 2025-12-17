"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import type { FlowStep } from "@/types/flow";

type LeftNavProps = {
  steps: FlowStep[];
  currentId: string;
  onSelect: (id: string) => void;
  title: string;
};

type StepState = "done" | "active" | "upcoming";

function getState(idx: number, currentIdx: number): StepState {
  if (idx < currentIdx) return "done";
  if (idx === currentIdx) return "active";
  return "upcoming";
}

function IconCircle({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white shadow-sm">
        ✓
      </span>
    );
  }

  if (state === "active") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-sky-500">
        <span className="h-2 w-2 rounded-full bg-sky-500" />
      </span>
    );
  }

  return <span className="h-4 w-4 rounded-full border border-slate-300" />;
}
export function LeftNav({ steps, currentId, onSelect, title }: LeftNavProps) {
  const navSteps = useMemo(
    () => steps.filter((step) => step.type === "intro" || step.type === "agent" || step.type === "finish"),
    [steps]
  );
  const currentIdx = Math.max(0, navSteps.findIndex((s) => s.id === currentId));
  const agentSteps = navSteps.filter((step) => step.type === "agent");
  const currentAgentIdx = agentSteps.findIndex((step) => step.id === currentId);
  const completedQuestions = currentAgentIdx >= 0 ? currentAgentIdx : 0;
  const totalQuestions = agentSteps.length;

  return (
    <aside className="w-80 bg-[#f9fafb] border-r border-slate-200">
      <div className="px-4 py-4 space-y-2 border-b border-slate-200">
        <div className="text-sm font-semibold leading-tight text-[#0f1729]">
          {title}
        </div>
        <div className="text-xs text-muted-foreground">
          {completedQuestions} / {totalQuestions} prompts completed
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: totalQuestions ? `${(completedQuestions / totalQuestions) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <div className="space-y-2 px-2 pb-4 pt-2">
        {navSteps.map((step, index) => {
          const state = getState(index, currentIdx);
          const isActive = state === "active";
          const isDone = state === "done";

          return (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition-all",
              "hover:border-sky-300 hover:shadow",
              isActive && "border-amber-400 bg-amber-50",
              isDone && "border-slate-200"
            )}
          >
            <IconCircle state={state} />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-slate-900 leading-snug">
                {step.type === "agent" ? step.questionText ?? step.title : step.title}
              </div>
            </div>
            {isDone && <span className="text-emerald-500 text-xs font-semibold">Done</span>}
          </button>
          );
        })}
      </div>
    </aside>
  );
}
