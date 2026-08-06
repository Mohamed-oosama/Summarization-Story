export type StoryFile = {
  name: string;
  size: number;
  type: string;
  rawFile?: File;
  url?: string;
};

export type SummaryLength = "short" | "balanced" | "long";

export type SummarizationMethod = "tfidf-extractive" | "transformer-abstractive";

export type StorySummary = {
  id: string;
  title: string;
  date: string;
  words: number;
  readingMinutes: number;
  length: SummaryLength;
  method?: SummarizationMethod;
  body: string[];
};

export const SUPPORTED_FORMATS = ["PDF", "TXT", "DOCX"] as const;

export const PROCESSING_STEPS = [
  "Uploading File",
  "Reading Story",
  "Understanding Content",
  "Generating Summary",
] as const;

export const demoSummary: StorySummary = {
  id: "demo",
  title: "The Lighthouse at Marrow Bay",
  date: "Aug 4, 2026",
  words: 42180,
  readingMinutes: 168,
  length: "balanced",
  body: [
    "Ines Calloway returns to Marrow Bay after eleven years away, inheriting a lighthouse her grandmother kept running long after the shipping lanes moved south. The town greets her with the particular politeness reserved for people who left, and the keeper's log she finds in the lamp room begins in a handwriting she doesn't recognise.",
    "As Ines restores the light, the log's entries start matching her own days — the weather, the visitors, a boat that never docks. She enlists Teo, a marine surveyor mapping the shoal, who believes the pattern is coincidence until the log predicts the storm that strands them both on the rock for three nights.",
    "In the final act Ines discovers her grandmother kept the lamp burning for a single vessel that went down the year Ines was born, and that the log is a record of grief rather than prophecy. She chooses to let the light go dark on purpose for the first time, and Marrow Bay, unexpectedly, keeps living.",
  ],
};

export const recentSummaries: StorySummary[] = [
  {
    id: "s1",
    title: "The Lighthouse at Marrow Bay",
    date: "Aug 4, 2026",
    words: 42180,
    readingMinutes: 168,
    length: "balanced",
    body: demoSummary.body,
  },
  {
    id: "s2",
    title: "Salt & Static",
    date: "Aug 1, 2026",
    words: 18940,
    readingMinutes: 76,
    length: "short",
    body: [
      "A radio engineer in a decommissioned desert station picks up a broadcast that shouldn't exist, and spends a summer triangulating a voice that keeps describing her own kitchen.",
    ],
  },
  {
    id: "s3",
    title: "Nine Letters to a Cartographer",
    date: "Jul 27, 2026",
    words: 63400,
    readingMinutes: 254,
    length: "long",
    body: [
      "An epistolary novel tracing two mapmakers across a shifting border, where every letter redraws a country that neither of them will be allowed to return to.",
    ],
  },
  {
    id: "s4",
    title: "The Orchard Protocol",
    date: "Jul 19, 2026",
    words: 51120,
    readingMinutes: 205,
    length: "balanced",
    body: [
      "A near-future co-op grows the last viable apple cultivar under algorithmic supervision, until the model begins recommending decisions no farmer can explain.",
    ],
  },
  {
    id: "s5",
    title: "Winterhouse Rules",
    date: "Jul 11, 2026",
    words: 29760,
    readingMinutes: 119,
    length: "short",
    body: [
      "Six strangers snowed into a mountain hotel invent a game to pass the time, and slowly realise one of them wrote the rules before arriving.",
    ],
  },
  {
    id: "s6",
    title: "A Brief History of Falling",
    date: "Jul 3, 2026",
    words: 37450,
    readingMinutes: 150,
    length: "long",
    body: [
      "A retired trapeze artist reconstructs the night of her last performance through the contradictory memories of everyone who was in the tent.",
    ],
  },
];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}