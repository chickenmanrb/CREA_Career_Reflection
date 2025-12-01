"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function getInitial(key: string) {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) ?? "";
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState(() => getInitial("crea_candidate_name"));
  const [email, setEmail] = useState(() => getInitial("crea_candidate_email"));

  const isEmailValid = email.trim().length > 3 && email.includes("@");
  const isNameValid = name.trim().length > 1;
  const canStart = isEmailValid && isNameValid;

  const handleStart = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!canStart) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("crea_candidate_name", name.trim());
      localStorage.setItem("crea_candidate_email", email.trim());
    }
    router.push("/interview");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-slate-900">Career Pathway Reflection</h1>
            <p className="text-slate-600 text-sm">
              Work through six reflection prompts and get tailored feedback on clarity, specificity, and alignment to your goals. The flow is fully text-based—write, get a brief AI follow-up, then score your responses to see strengths and gaps.
            </p>
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src="https://player.vimeo.com/video/1050996776?h=4e172c34f7&badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="Intro Video"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">What to expect</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Six (6) Custom Career Reflection sessions with an AI coach, designed to get you thinking in the right direction. Use this to clarify your career story and next steps.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Ready?</h3>
              <p className="text-sm text-slate-600">Enter your info, then start the reflection.</p>
              <form className="mt-3 space-y-3" onSubmit={handleStart}>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Name</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                  {!isNameValid && (
                    <p className="text-[11px] text-amber-600">Please enter your name.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  {!isEmailValid && (
                    <p className="text-[11px] text-amber-600">Enter a valid email.</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#05b6ff] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#0aa3e2] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canStart}
                >
                  Start reflection
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
