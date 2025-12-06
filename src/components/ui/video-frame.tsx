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
            <p>
              Engage in a guided conversation with an AI expert on acquisitions careers. It&apos;s important that you:
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Be thorough and honest. The quality of insights you get depends on the quality of reflection you put in.</li>
              <li>Take your time. Some questions deserve careful consideration.</li>
              <li>Expect to be challenged. The AI will probe deeper when responses are vague or reveal misunderstandings.</li>
              <li>Ask questions. Use this as an opportunity to clarify anything about the career path.</li>
            </ol>
            <p>
              This is a judgment-free space designed to give you clarity. Whether you walk away more confident in pursuing this path or decide it&apos;s not the right fit, that&apos;s a win. Better to know now than after investing months in the wrong direction.
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
