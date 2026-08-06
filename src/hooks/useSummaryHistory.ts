import { useEffect, useState } from "react";
import { recentSummaries, type StorySummary } from "@/lib/story-data";

const STORAGE_KEY = "story_summaries_history_v1";

export function getStoredSummaries(): StorySummary[] {
  if (typeof window === "undefined") return recentSummaries;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading summaries from localStorage:", e);
  }
  return recentSummaries;
}

export function saveStoredSummaries(items: StorySummary[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("story_summaries_updated"));
  } catch (e) {
    console.error("Error saving summaries to localStorage:", e);
  }
}

export function useSummaryHistory() {
  const [summaries, setSummaries] = useState<StorySummary[]>([]);

  useEffect(() => {
    setSummaries(getStoredSummaries());

    const handleUpdate = () => {
      setSummaries(getStoredSummaries());
    };

    window.addEventListener("story_summaries_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("story_summaries_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addSummary = (newSummary: StorySummary) => {
    const current = getStoredSummaries();
    // Prevent duplicate IDs
    const filtered = current.filter((s) => s.id !== newSummary.id);
    const updated = [newSummary, ...filtered];
    saveStoredSummaries(updated);
    setSummaries(updated);
  };

  const deleteSummary = (id: string) => {
    const current = getStoredSummaries();
    const updated = current.filter((s) => s.id !== id);
    saveStoredSummaries(updated);
    setSummaries(updated);
  };

  return {
    summaries,
    addSummary,
    deleteSummary,
  };
}
