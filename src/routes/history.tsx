import { createFileRoute } from "@tanstack/react-router";

import { AmbientBackground } from "@/components/site/AmbientBackground";
import { RecentSummaries } from "@/components/site/RecentSummaries";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — StorySummarizer AI" },
      {
        name: "description",
        content: "Browse, reopen, and delete your previously generated AI story summaries.",
      },
      { property: "og:title", content: "History — StorySummarizer AI" },
      {
        property: "og:description",
        content: "All of your past story summaries in one organised library.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="relative px-4 pt-32 pb-24 sm:pt-40">
      <AmbientBackground />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">History</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Your <span className="text-gradient">summary library</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Every story you have summarized, newest first.
        </p>
        <div className="mt-12">
          <RecentSummaries />
        </div>
      </div>
    </div>
  );
}