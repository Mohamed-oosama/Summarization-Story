import { motion } from "motion/react";
import { BarChart3, Cpu, FileText, Sparkles, UploadCloud, X, Check } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SUPPORTED_FORMATS, formatBytes, type StoryFile, type SummarizationMethod } from "@/lib/story-data";
import { cn } from "@/lib/utils";

type Props = {
  file: StoryFile | null;
  progress: number;
  uploading: boolean;
  onSelect: (file: StoryFile) => void;
  onRemove: () => void;
  onSummarize: (method: SummarizationMethod) => void;
};

export function UploadDropzone({
  file,
  progress,
  uploading,
  onSelect,
  onRemove,
  onSummarize,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [method, setMethod] = useState<SummarizationMethod>("transformer-abstractive");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    const f = list?.[0];
    if (!f) return;
    onSelect({ name: f.name, size: f.size, type: f.name.split(".").pop()?.toUpperCase() ?? "FILE", rawFile: f });
  }

  return (
    <div className="glass rounded-[2rem] p-4 sm:p-6">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300",
            dragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/60 hover:bg-muted/40",
          )}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-gradient-brand grid size-16 place-items-center rounded-3xl text-primary-foreground shadow-glow"
          >
            <UploadCloud className="size-7" />
          </motion.div>
          <p className="mt-5 text-lg font-semibold tracking-tight">
            Drag &amp; drop your story here
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            or browse from your device — max 50 MB per file
          </p>
          <Button
            variant="hero"
            size="lg"
            className="mt-6"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Browse Files
          </Button>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUPPORTED_FORMATS.map((f) => (
              <span
                key={f}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/70 bg-card/60 p-5 sm:p-6"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <span className="bg-gradient-brand grid size-12 shrink-0 place-items-center rounded-2xl text-primary-foreground">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{file.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {file.type} · {formatBytes(file.size)}
              </p>
            </div>
            <button
              onClick={onRemove}
              aria-label="Remove file"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{uploading ? "Uploading…" : "Upload complete"}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Summarization Method Selection */}
          <div className="mt-6 text-left">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Choose Summarization Method
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {/* Option 1: TF-IDF Extractive */}
              <div
                onClick={() => setMethod("tfidf-extractive")}
                className={cn(
                  "relative cursor-pointer rounded-2xl border p-4 transition-all duration-300",
                  method === "tfidf-extractive"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
                      <BarChart3 className="size-4" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">Extractive (TF-IDF)</p>
                  </div>
                  {method === "tfidf-extractive" && (
                    <span className="bg-gradient-brand grid size-5 place-items-center rounded-full text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Extracts key verbatim sentences based on term frequency &amp; inverse document scoring.
                </p>
              </div>

              {/* Option 2: Transformer Abstractive */}
              <div
                onClick={() => setMethod("transformer-abstractive")}
                className={cn(
                  "relative cursor-pointer rounded-2xl border p-4 transition-all duration-300",
                  method === "transformer-abstractive"
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Cpu className="size-4" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">Abstractive (Transformer)</p>
                  </div>
                  {method === "transformer-abstractive" && (
                    <span className="bg-gradient-brand grid size-5 place-items-center rounded-full text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Synthesizes a fluent, re-written plot overview using long-context Transformer AI models.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="hero"
              size="lg"
              disabled={uploading}
              onClick={() => onSummarize(method)}
            >
              Summarize Story
            </Button>
            <Button variant="subtle" size="lg" onClick={onRemove}>
              Remove File
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}