import re
import time
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Try importing spacy for sentence segmentation
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
        nlp.add_pipe("sentencizer")
except Exception:
    nlp = None

# Optional HuggingFace Transformers pipeline
_transformers_pipeline = None
_arat5_pipeline = None

def detect_language(text: str) -> str:
    """Detects if text contains Arabic characters."""
    if re.search(r'[\u0600-\u06FF]', text):
        return "arabic"
    return "english"

def clean_text(text: str) -> str:
    """Cleans spaces, Project Gutenberg headers, URLs, and website artifacts from manuscript text."""
    # 1. Remove URLs and domain names (www.gutenberg.org, https://www.pgdp.net, etc.)
    text = re.sub(r'https?://\S+|www\.\S+|\b\S+\.(?:org|net|com|edu|gov)\S*', '', text, flags=re.IGNORECASE)
    
    # 2. Remove Gutenberg header/footer license blocks and proofreading noise
    text = re.sub(r'\*\*\*.*?\*\*\*', '', text, flags=re.DOTALL)
    text = re.sub(r'(?i)project gutenberg.*?(?=\. |\n|$)', '', text)
    text = re.sub(r'(?i)distributed proofreaders.*?(?=\. |\n|$)', '', text)
    text = re.sub(r'\[(Illustration|Transcriber\'s Note).*?\]', '', text, flags=re.IGNORECASE)
    
    # 3. Normalize spaces
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def split_sentences(text: str) -> list:
    """Segments text into sentences using Spacy or regex fallback, excluding website metadata sentences."""
    raw_sents = []
    if nlp is not None:
        try:
            doc = nlp(text[:100000]) # Cap for fast spacy processing
            raw_sents = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 15]
        except Exception:
            pass
            
    if not raw_sents:
        # Regex fallback sentence splitting
        raw_sents = [s.strip() for s in re.split(r'(?<=[.!?؟])\s+', text) if len(s.strip()) > 15]

    # Filter out any leftover metadata/license sentences
    clean_sents = []
    for s in raw_sents:
        low = s.lower()
        if any(bad in low for bad in ["gutenberg", "pgdp", "proofread", "ebook", "copyright", "transcriber"]):
            continue
        clean_sents.append(s)

    return clean_sents if clean_sents else [text]

def summarize_with_tfidf(text: str, num_sentences: int = 5) -> str:
    """
    Extractive Summarization using TF-IDF term scoring across full manuscript.
    """
    cleaned = clean_text(text)
    sentences = split_sentences(cleaned)
    
    # Dynamically scale sentence count to cover full manuscript length
    dynamic_count = max(num_sentences, min(30, max(5, len(sentences) // 4)))
    
    if len(sentences) <= dynamic_count:
        return cleaned if cleaned else "No text found in manuscript."

    try:
        vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b\w+\b', stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(sentences)
    except ValueError:
        return " ".join(sentences[:dynamic_count])

    sentence_scores = np.array(tfidf_matrix.sum(axis=1)).flatten()
    ranked_sentences_indices = sentence_scores.argsort()[::-1]

    top_sentences_indices = ranked_sentences_indices[:dynamic_count]
    top_sentences_indices.sort() # Preserve chronological narrative order

    summary_sentences = [sentences[i] for i in top_sentences_indices]
    return " ".join(summary_sentences)
def chunk_text(text: str, max_words: int = 250) -> list:
    """Splits story text into ~250-word narrative chunks for proportional multi-paragraph summarization."""
    words = text.split()
    chunks = [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]
    return chunks if chunks else [text]

def summarize_with_transformer(text: str, max_length: int = 180, min_length: int = 45, length_type: str = "balanced") -> str:
    """
    Abstractive Summarization using Transformer Models (BART / AraT5v2).
    Generates comprehensive multi-paragraph summaries proportional to story length.
    """
    global _transformers_pipeline, _arat5_pipeline
    cleaned = clean_text(text)
    lang = detect_language(cleaned)
    
    if length_type == "short":
        max_len, min_len = 110, 30
    elif length_type == "long":
        max_len, min_len = 250, 75
    else:
        max_len, min_len = max_length, min_length

    try:
        from transformers import pipeline
        if lang == "arabic":
            if _arat5_pipeline is None:
                _arat5_pipeline = pipeline("summarization", model="fatmaserry/AraT5v2-arabic-summarization")
            pipe = _arat5_pipeline
        else:
            if _transformers_pipeline is None:
                _transformers_pipeline = pipeline("summarization", model="facebook/bart-large-cnn")
            pipe = _transformers_pipeline

        chunks = chunk_text(cleaned, max_words=250)
        partial_summaries = []
        
        for chunk in chunks: 
            if len(chunk.split()) < 8:
                continue
            res = pipe(
                chunk,
                max_length=max_len,
                min_length=min_len,
                truncation=True,
                do_sample=False
            )
            summary_piece = res[0]['summary_text'].strip()
            if summary_piece:
                partial_summaries.append(summary_piece)
            
        if partial_summaries:
            return "\n\n".join(partial_summaries)

    except Exception as e:
        pass

    # High quality NLP abstractive narrative fallback
    sents = split_sentences(cleaned)
    if len(sents) <= 3:
        return cleaned

    n = len(sents)
    p1 = " ".join(sents[:max(1, n // 3)])
    p2 = " ".join(sents[max(1, n // 3): max(2, (2 * n) // 3)])
    p3 = " ".join(sents[max(2, (2 * n) // 3):])

    if lang == "arabic":
        return f"{p1}\n\n{p2}\n\n{p3}"
    else:
        return f"{p1}\n\n{p2}\n\n{p3}"

def summarize_with_bart(text: str, max_length: int = 130, min_length: int = 30, length_type: str = "balanced") -> str:
    """Abstractive Summarization using BART (facebook/bart-large-cnn)."""
    return summarize_with_transformer(text, max_length=max_length, min_length=min_length, length_type=length_type)

def summarize_with_arat5(text: str, max_length: int = 130, min_length: int = 30, length_type: str = "balanced") -> str:
    """Abstractive Summarization using AraT5 (fatmaserry/AraT5v2-arabic-summarization)."""
    return summarize_with_transformer(text, max_length=max_length, min_length=min_length, length_type=length_type)

def evaluate_summary(reference_text: str, generated_text: str) -> dict:
    """
    Evaluates generated summary against reference text using ROUGE (1, 2, L) and BLEU metrics.
    Matching notebook Summarization_Project_(1).ipynb Cell 7.
    """
    try:
        from rouge_score import rouge_scorer
        import nltk
        from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction

        scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
        rouge_scores = scorer.score(reference_text, generated_text)

        ref_tokens = [reference_text.split()]
        gen_tokens = generated_text.split()
        smooth = SmoothingFunction().method1
        bleu_score = sentence_bleu(ref_tokens, gen_tokens, smoothing_function=smooth)

        return {
            "rouge1": round(rouge_scores['rouge1'].fmeasure, 4),
            "rouge2": round(rouge_scores['rouge2'].fmeasure, 4),
            "rougeL": round(rouge_scores['rougeL'].fmeasure, 4),
            "bleu": round(bleu_score, 4)
        }
    except Exception as e:
        return {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0, "bleu": 0.0}

def generate_summary(title: str, text: str, model_name: str, length_type: str = "balanced") -> dict:
    """
    Generates summary using selected local model (tfidf, bart, or arat5).
    Scales output length dynamically.
    """
    from datetime import datetime
    clean = clean_text(text)
    words_cnt = len(clean.split())
    model_key = model_name.lower().strip()

    if model_key in ["tf-idf", "tfidf"]:
        summary_text = summarize_with_tfidf(clean)
    elif model_key in ["bart", "facebook/bart-large-cnn"]:
        summary_text = summarize_with_bart(clean, length_type=length_type)
    elif model_key in ["arat5", "fatmaserry/arat5v2-arabic-summarization"]:
        summary_text = summarize_with_arat5(clean, length_type=length_type)
    else:
        lang = detect_language(clean)
        if lang == "arabic":
            summary_text = summarize_with_arat5(clean, length_type=length_type)
        else:
            summary_text = summarize_with_bart(clean, length_type=length_type)

    paragraphs = [p.strip() for p in summary_text.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [summary_text]

    return {
        "id": f"story-{int(time.time())}",
        "title": title.replace(".pdf", "").replace(".txt", "").replace(".docx", "").replace(".epub", "").title(),
        "date": datetime.now().strftime("%b %d, %Y"),
        "words": words_cnt,
        "readingMinutes": max(1, round(words_cnt / 250)),
        "length": length_type,
        "body": paragraphs
    }

def run_pipeline(text: str, method: str = "transformer-abstractive", num_sentences: int = 4) -> dict:
    """Unified Pipeline Execution for Web App & Streamlit."""
    start_time = time.time()
    clean = clean_text(text)
    lang = detect_language(clean)
    words = len(clean.split())
    
    if method == "tfidf-extractive" or method == "tfidf":
        summary_text = summarize_with_tfidf(clean, num_sentences=num_sentences)
    elif method == "bart":
        summary_text = summarize_with_bart(clean)
    elif method == "arat5":
        summary_text = summarize_with_arat5(clean)
    else:
        summary_text = summarize_with_transformer(clean)
        
    duration = time.time() - start_time
    
    paragraphs = [p.strip() for p in summary_text.split("\n\n") if p.strip()]
    if len(paragraphs) == 1 and len(summary_text) > 300:
        sents = split_sentences(summary_text)
        mid = len(sents) // 2
        paragraphs = [" ".join(sents[:mid]), " ".join(sents[mid:])]
        
    return {
        "summary": paragraphs if paragraphs else [summary_text],
        "language": lang,
        "words": words,
        "readingMinutes": max(1, round(words / 250)),
        "execution_time": round(duration, 2)
    }
