import { motion } from "motion/react";
import { CalendarDays, ExternalLink, Trash2, BarChart3, Cpu } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSummaryHistory } from "@/hooks/useSummaryHistory";
import type { StorySummary } from "@/lib/story-data";

export function RecentSummaries({ onOpen }: { onOpen?: (s: StorySummary) => void }) {
  const { summaries, deleteSummary } = useSummaryHistory();

  if (summaries.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
        No summaries in history — upload a story to generate your first summary.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {summaries.map((s, i) => {
        const MethodIcon = s.method === "tfidf-extractive" ? BarChart3 : Cpu;
        const methodLabel = s.method === "tfidf-extractive" ? "TF-IDF" : "Transformer";

        return (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
            className="glass flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary capitalize">
                {s.length} summary
              </span>
              {s.method && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <MethodIcon className="size-3 text-primary" /> {methodLabel}
                </span>
              )}
            </div>

            <h3 className="mt-3 text-base leading-snug font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.body[0]}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> {s.date} · {s.words.toLocaleString()} words
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="hero" size="sm" className="flex-1" onClick={() => onOpen?.(s)}>
                <ExternalLink /> Open
              </Button>
              <Button
                variant="subtle"
                size="sm"
                aria-label={`Delete ${s.title}`}
                onClick={() => {
                  deleteSummary(s.id);
                  toast.success(`Deleted "${s.title}"`);
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}