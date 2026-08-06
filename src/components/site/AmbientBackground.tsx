/** Soft AI-themed aurora blobs + subtle grid, used behind hero sections. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="animate-aurora absolute -top-40 -left-32 size-[36rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div
        className="animate-aurora absolute -top-24 right-[-10rem] size-[30rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-brand)", animationDelay: "-6s" }}
      />
      <div
        className="animate-aurora absolute bottom-[-14rem] left-1/3 size-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-brand)", animationDelay: "-11s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 100% 90% at 50% 30%, black 60%, transparent 100%)",
        }}
      />
    </div>
  );
}