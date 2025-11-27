"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeminiAnalysis, QuestionKey } from "@/types/interview";

type ScoreCardProps = {
  score: GeminiAnalysis | null;
  loading?: boolean;
  questionKey?: QuestionKey;
  showAll?: boolean;
};

export function ScoreCard({ score, loading, questionKey, showAll = true }: ScoreCardProps) {
  const questionLabels: Record<string, string> = {
    q1_attracts: "Attraction to pathway",
    q2_concerns: "Concerns/Risks",
    q3_questions: "Questions/Curiosities",
    q4_direct_skills: "Directly Applicable Skills",
    q5_improve_skills: "Improvement Areas",
    q6_connect: "Networking Strategy",
  };
  const orderedKeys: QuestionKey[] = [
    "q1_attracts",
    "q2_concerns",
    "q3_questions",
    "q4_direct_skills",
    "q5_improve_skills",
    "q6_connect",
  ];

  const keysToRender = showAll || !questionKey ? orderedKeys : [questionKey];

  if (loading) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle>Scoring in progress…</CardTitle>
          <CardDescription>Parsing your answers and generating feedback.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle>No scores yet</CardTitle>
          <CardDescription>Submit a transcript to see scores.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {keysToRender.map((key) => {
        const data = score.questions[key];
        return (
          <Card key={key} className="border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{questionLabels[key]}</CardTitle>
              <CardDescription>Scores for this question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Content</span><span className="font-semibold">{data?.score_content ?? 0}</span></div>
              <div className="flex justify-between"><span>Communication clarity</span><span className="font-semibold">{data?.score_communication_clarity ?? 0}</span></div>
              <div className="flex justify-between"><span>Conciseness & efficiency</span><span className="font-semibold">{data?.score_conciseness_efficiency ?? 0}</span></div>
              <div className="flex justify-between"><span>Specificity</span><span className="font-semibold">{data?.score_specificity ?? 0}</span></div>
              <div>
                <p className="font-semibold">Strengths</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {(data?.strengths ?? []).length === 0 ? <li>No strengths captured yet.</li> : data?.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold">Weaknesses</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {(data?.weaknesses ?? []).length === 0 ? <li>No weaknesses captured yet.</li> : data?.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
