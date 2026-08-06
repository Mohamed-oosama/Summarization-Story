import { motion } from "motion/react";
import { BrainCircuit, Check, Loader2 } from "lucide-react";

import { PROCESSING_STEPS } from "@/lib/story-data";

type Props = {
  activeStep: number;
  secondsLeft: number;
  fileName: string;
};

export function ProcessingCard({ activeStep, secondsLeft, fileName }: Props) {
  const pct = Math.round(((activeStep + 0.5) / PROCESSING_STEPS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass mx-auto w-full max-w-xl rounded-[2rem] p-8 text-center"
    >
      <div className="relative mx-auto grid size-24 place-items-center">
        <motion.span
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-gradient-brand absolute inset-0 rounded-full blur-xl"
        />
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40"
        />
        <span className="bg-gradient-brand relative grid size-16 place-items-center rounded-full text-primary-foreground">
          <BrainCircuit className="size-7" />
        </span>
      </div>

      <h2 className="mt-6 text-xl font-semibold tracking-tight">Understanding your story</h2>
      <p className="mt-1.5 truncate text-sm text-muted-foreground">{fileName}</p>

      <div className="mt-7 grid gap-2.5 text-left">
        {PROCESSING_STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                active ? "bg-primary/10" : done ? "bg-muted/60" : "bg-transparent"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-primary-foreground ${
                  done ? "bg-gradient-brand" : active ? "bg-primary" : "bg-muted"
                }`}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
              </span>
              <span
                className={`text-sm ${done || active ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-7">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="bg-gradient-brand h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Estimated time remaining · {secondsLeft}s
        </p>
      </div>
    </motion.div>
  );
}