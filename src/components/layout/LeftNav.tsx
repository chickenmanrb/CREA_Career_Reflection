"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { FlowStep } from "@/types/flow";

type LeftNavProps = {
  steps: FlowStep[];
  currentId: string;
  onSelect: (id: string) => void;
};

type StepState = "done" | "active" | "upcoming";

type NavGroup = {
  id: string;
  title: string;
  steps: FlowStep[];
  startIdx: number;
  endIdx: number;
  kind: "intro" | "question";
};

function getState(idx: number, currentIdx: number): StepState {
  if (idx < currentIdx) return "done";
  if (idx === currentIdx) return "active";
  return "upcoming";
}

function getQuestionKey(step: FlowStep) {
  const match = step.id.match(/^q(\d+)-/);
  return match ? `q${match[1]}` : null;
}

function buildGroups(steps: FlowStep[]): NavGroup[] {
  const groups: NavGroup[] = [];
  const map = new Map<string, NavGroup>();

  steps.forEach((step, idx) => {
    const key = getQuestionKey(step);

    // Intro and any non-question steps render as standalone rows.
    if (!key || step.type === "intro") {
      groups.push({
        id: step.id,
        title: step.title,
        steps: [step],
        startIdx: idx,
        endIdx: idx,
        kind: step.type === "intro" ? "intro" : "question",
      });
      return;
    }

    if (!map.has(key)) {
      const group: NavGroup = {
        id: key,
        title: step.title,
        steps: [],
        startIdx: idx,
        endIdx: idx,
        kind: "question",
      };
      map.set(key, group);
      groups.push(group);
    }

    const group = map.get(key)!;
    group.steps.push(step);
    group.startIdx = Math.min(group.startIdx, idx);
    group.endIdx = Math.max(group.endIdx, idx);

    // Prefer the question title for the parent label if present.
    if (step.type === "question") {
      group.title = step.title;
    }
  });

  return groups;
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

const ChildIcon = ({ type }: { type: FlowStep["type"] }) => {
  if (type === "agent") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z" />
        <path d="M8 11v1a4 4 0 0 0 8 0v-1" />
        <path d="M10 19h4" />
      </svg>
    );
  }

  if (type === "review") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 12.5 10 15l7-7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 3.5h7.5L19 8v12.5H7Z" />
      <path d="M14.5 3.5v4.5H19" />
    </svg>
  );
};

function childLabel(type: FlowStep["type"]) {
  if (type === "agent") return "Live Answer";
  if (type === "review") return "Debrief";
  return "Question Prep";
}

export function LeftNav({ steps, currentId, onSelect }: LeftNavProps) {
  const currentIdx = Math.max(0, steps.findIndex((s) => s.id === currentId));

  const groups = useMemo(() => buildGroups(steps), [steps]);
  const questionGroups = groups.filter((g) => g.kind === "question");
  const totalQuestions = questionGroups.length;
  const completedQuestions = questionGroups.filter((g) => g.endIdx < currentIdx).length;

  const activeGroupId = groups.find((g) => g.steps.some((s) => s.id === currentId))?.id;
  const [manualOpenGroups, setManualOpenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (id: string) => {
    if (id === activeGroupId) return; // keep the active question open
    setManualOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <aside className="w-80 bg-[#f9fafb] border-r border-slate-200">
      <div className="px-4 py-4 space-y-2 border-b border-slate-200">
        <div className="text-sm font-semibold leading-tight text-[#0f1729]">Career Pathway Reflection</div>
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

      <div className="space-y-1 px-2 pb-4 pt-2">
        {groups.map((group) => {
          const hasChildren = group.steps.length > 1 || group.kind === "question";
          const groupContainsCurrent = group.steps.some((s) => s.id === currentId);
          const groupState: StepState = groupContainsCurrent
            ? "active"
            : group.endIdx < currentIdx
              ? "done"
              : "upcoming";

          const isOpen = hasChildren && (manualOpenGroups.has(group.id) || activeGroupId === group.id);

          const childContent = (
            <div className="mt-1 space-y-2 pl-2">
              {group.steps.map((step) => {
                const stepIdx = steps.findIndex((s) => s.id === step.id);
                const state = getState(stepIdx, currentIdx);
                const isActive = state === "active";
                const isDone = state === "done";

                return (
                  <button
                    key={step.id}
                    onClick={() => onSelect(step.id)}
                    className={cn(
                      "w-full rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition-all",
                      "hover:border-sky-300 hover:shadow",
                      isActive && "border-amber-400 bg-amber-50",
                      isDone && "border-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <ChildIcon type={step.type} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                          {childLabel(step.type)}
                        </div>
                        <div className="text-[13px] font-medium text-slate-900 leading-snug">
                          {step.type === "question" ? step.questionText || step.description || step.title : step.title}
                        </div>
                      </div>
                      {isDone && <span className="text-emerald-500 text-xs font-semibold">Done</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          );

          return (
            <div key={group.id} className="rounded-lg px-1 py-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetId = group.steps[0]?.id;
                    if (targetId) onSelect(targetId);
                  }}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left transition",
                    groupState === "active" && "bg-white shadow-sm",
                    groupState === "done" && "text-slate-800",
                    groupState === "upcoming" && "text-slate-600"
                  )}
                >
                  <IconCircle state={groupState} />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      groupState === "active" ? "text-[#0f1729]" : "text-slate-700"
                    )}
                  >
                    {group.title}
                  </span>
                </button>
                {hasChildren && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    aria-label={isOpen ? "Collapse" : "Expand"}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={cn("h-5 w-5 transition-transform", isOpen ? "rotate-90" : "rotate-0")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              {hasChildren && isOpen && childContent}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
