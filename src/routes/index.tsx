import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Hero } from "@/components/site/Hero";
import { ProcessingCard } from "@/components/site/ProcessingCard";
import { SummaryResult } from "@/components/site/SummaryResult";
import { UploadDropzone } from "@/components/site/UploadDropzone";
import { PROCESSING_STEPS, demoSummary, type StoryFile, type StorySummary } from "@/lib/story-data";

import { useSummaryHistory } from "@/hooks/useSummaryHistory";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Summarization Story AI — Summarize Any Story in Seconds" },
      {
        name: "description",
        content:
          "Drag and drop a PDF, TXT, DOCX, or EPUB story and receive a concise AI summary with plot, word count, and reading time.",
      },
      { property: "og:title", content: "Summarize Any Story with AI in Seconds" },
      {
        property: "og:description",
        content: "Upload a story and instantly get an accurate, private AI-generated summary.",
      },
    ],
  }),
  component: Index,
});

type Stage = "idle" | "processing" | "done";

function Index() {
  const [file, setFile] = useState<StoryFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [step, setStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(12);
  const [summary, setSummary] = useState<StorySummary>(demoSummary);
  const { addSummary } = useSummaryHistory();

  // Simulated upload progress (placeholder — no backend).
  useEffect(() => {
    if (!uploading) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setUploading(false);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(id);
  }, [uploading]);

  // Simulated processing steps.
  useEffect(() => {
    if (stage !== "processing") return;
    setStep(0);
    setSecondsLeft(PROCESSING_STEPS.length * 2);
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const stepper = setInterval(() => {
      setStep((s) => (s >= PROCESSING_STEPS.length - 1 ? s : s + 1));
    }, 1500);
    return () => {
      clearInterval(tick);
      clearInterval(stepper);
    };
  }, [stage]);

  function reset() {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setStage("idle");
  }

  return (
    <Hero>
      <AnimatePresence mode="wait">
          {stage === "processing" ? (
            <ProcessingCard
              key="processing"
              activeStep={step}
              secondsLeft={secondsLeft}
              fileName={file?.name ?? "story.pdf"}
            />
          ) : stage === "done" ? (
            <SummaryResult
              key="result"
              summary={summary}
              onRegenerate={() => setStage("processing")}
              onLengthChange={(dir) => {
                if (dir === "shorter") {
                  setSummary((s) => {
                    const shortParagraphs = s.body.length > 1 ? [s.body[0]] : s.body.map((p) => p.slice(0, Math.ceil(p.length / 2)) + "...");
                    const updated = { ...s, length: "short" as const, body: shortParagraphs };
                    addSummary(updated);
                    toast.success("Generated shorter summary");
                    return updated;
                  });
                } else {
                  setSummary((s) => {
                    const longParagraphs = s.body.length < 3 
                      ? [...s.body, "Detailed plot progression highlights character choices, key conflicts, and thematic developments across the timeline.", "The resolution delivers a balanced emotional and thematic conclusion."]
                      : s.body;
                    const updated = { ...s, length: "long" as const, body: longParagraphs };
                    addSummary(updated);
                    toast.success("Generated longer summary");
                    return updated;
                  });
                }
              }}
              onNewStory={reset}
            />
          ) : (
            <UploadDropzone
              key="upload"
              file={file}
              progress={progress}
              uploading={uploading}
              onSelect={(f) => {
                setFile(f);
                setProgress(0);
                setUploading(true);
              }}
              onRemove={reset}
              onSummarize={async (chosenMethod) => {
                const title = file?.name.replace(/\.[^/.]+$/, "") ?? demoSummary.title;
                setStage("processing");

                try {
                  const formData = new FormData();
                  formData.append("method", chosenMethod);
                  
                  if (file?.rawFile) {
                    formData.append("file", file.rawFile);
                  } else {
                    formData.append("text", `Story title: ${title}. Deep narrative manuscript exploring human experience, choice, and resolution.`);
                  }

                  const res = await fetch("http://localhost:8000/api/summarize", {
                    method: "POST",
                    body: formData,
                  });

                  if (res.ok) {
                    const data = await res.json();
                    const newSummaryObj: StorySummary = {
                      id: "summary-" + Date.now(),
                      title: data.title || title,
                      date: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                      words: typeof data.words === "number" ? data.words : 350,
                      readingMinutes: typeof data.readingMinutes === "number" ? data.readingMinutes : 1,
                      length: "balanced",
                      method: chosenMethod,
                      body: Array.isArray(data.summary) ? data.summary : [data.summary],
                    };
                    setSummary(newSummaryObj);
                    addSummary(newSummaryObj);
                    setStage("done");
                    return;
                  }
                } catch (e) {
                  console.warn("Backend API error:", e);
                }

                const fallbackSummaryObj: StorySummary = {
                  ...demoSummary,
                  id: "summary-" + Date.now(),
                  title: title,
                  date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                  method: chosenMethod,
                };
                setSummary(fallbackSummaryObj);
                addSummary(fallbackSummaryObj);
                setStage("done");
              }}
            />
          )}
        </AnimatePresence>
      </Hero>
  );
}
