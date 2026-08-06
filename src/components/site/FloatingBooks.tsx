import { motion } from "motion/react";
import { BookOpen, FileText, Sparkles } from "lucide-react";

const items = [
  { icon: BookOpen, top: "12%", left: "6%", delay: 0, tilt: -8 },
  { icon: FileText, top: "62%", left: "10%", delay: 0.6, tilt: 6 },
  { icon: Sparkles, top: "20%", left: "88%", delay: 1.1, tilt: 10 },
  { icon: BookOpen, top: "70%", left: "84%", delay: 1.6, tilt: -5 },
];

/** Animated floating book / document illustrations for the hero. */
export function FloatingBooks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: [0, -16, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: item.delay },
            y: { duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
          }}
          style={{ top: item.top, left: item.left, rotate: `${item.tilt}deg` }}
          className="glass absolute grid size-16 place-items-center rounded-2xl"
        >
          <item.icon className="size-6 text-primary" />
        </motion.div>
      ))}
    </div>
  );
}