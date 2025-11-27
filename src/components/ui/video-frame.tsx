"use client";

type VideoFrameProps = {
  title: string;
  description: string;
};

export function VideoFrame({ title, description }: VideoFrameProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0f1729]">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0f1729]">Instructions</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>Complete 6 reflection questions, each following the same three-step process:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><span className="font-semibold">Prep</span> - Review the prompt and jot a quick outline.</li>
              <li><span className="font-semibold">Write Answer</span> - Enter your response in text; the AI will give a brief follow-up prompt.</li>
              <li><span className="font-semibold">Scoring & Feedback</span> - Submit to see detailed scores and targeted strengths/weaknesses.</li>
            </ul>
            <p>
              After completing all questions, you will see a summary of your performance. Come back and practice multiple times to build momentum.
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
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
  );
}
