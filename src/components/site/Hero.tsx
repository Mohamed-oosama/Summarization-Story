import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

import { AmbientBackground } from "@/components/site/AmbientBackground";
import { FloatingBooks } from "@/components/site/FloatingBooks";

export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-24 sm:pt-40 sm:pb-32">
      <AmbientBackground />
      <FloatingBooks />
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Summarize Any Story with <span className="text-gradient">AI in Seconds</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Upload your story as PDF, TXT, or DOCX and instantly receive a concise AI-generated
          summary.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.24 }}
        className="mx-auto mt-12 max-w-3xl"
      >
        {children}
      </motion.div>
    </section>
  );
}