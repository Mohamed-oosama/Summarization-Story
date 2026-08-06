import { motion } from "motion/react";
import {
  BarChart3,
  Clock,
  Copy,
  Cpu,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StorySummary } from "@/lib/story-data";

type Props = {
  summary: StorySummary;
  onRegenerate: () => void;
  onLengthChange: (dir: "shorter" | "longer") => void;
  onNewStory: () => void;
};

export function SummaryResult({ summary, onRegenerate, onLengthChange, onNewStory }: Props) {
  const methodLabel =
    summary.method === "tfidf-extractive"
      ? "Extractive (TF-IDF)"
      : "Abstractive (Transformer)";

  const MethodIcon = summary.method === "tfidf-extractive" ? BarChart3 : Cpu;

  function downloadTxt() {
    const header = `STORY SUMMARY: ${summary.title}\nDate: ${summary.date}\nMethod: ${methodLabel}\n${"=".repeat(60)}\n\n`;
    const fullText = header + summary.body.join("\n\n");
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${summary.title.replace(/[^a-zA-Z0-9]/g, "_")}_summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("TXT summary downloaded");
  }

  function downloadPdf() {
    const header = `STORY SUMMARY: ${summary.title}\nDate: ${summary.date}\nMethod: ${methodLabel}\n${"=".repeat(60)}\n\n`;
    const fullText = header + summary.body.join("\n\n");
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${summary.title.replace(/[^a-zA-Z0-9]/g, "_")}_summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Summary file downloaded");
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-[2rem] p-6 sm:p-9"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">AI Summary</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          <MethodIcon className="size-3.5" />
          {methodLabel}
        </span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{summary.title}</h2>

      <div className="mt-7 space-y-4 text-[15px] leading-relaxed text-foreground/85">
        {summary.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          variant="hero"
          onClick={() => {
            void navigator.clipboard?.writeText(summary.body.join("\n\n"));
            toast.success("Summary copied to clipboard");
          }}
        >
          <Copy /> Copy Summary
        </Button>
        <Button variant="glass" onClick={downloadPdf}>
          <Download /> Download PDF
        </Button>
        <Button variant="glass" onClick={downloadTxt}>
          <Download /> Download TXT
        </Button>
      </div>

      <button
        onClick={onNewStory}
        className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ← Summarize another story
      </button>
    </motion.section>
  );
}