from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import os
import pypdf
import docx

from model_engine import run_pipeline

app = FastAPI(title="Summarization_Project Model Backend", version="1.0")

# Enable CORS for React frontend (http://localhost:8080 or dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_upload(filename: str, content: bytes) -> str:
    fname = filename.lower()
    text = ""
    if fname.endswith(".pdf"):
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            for p in reader.pages:
                t = p.extract_text()
                if t:
                    text += t + "\n"
        except Exception:
            text = content.decode("utf-8", errors="ignore")
    elif fname.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([p.text for p in doc.paragraphs])
        except Exception:
            text = content.decode("utf-8", errors="ignore")
    else:
        text = content.decode("utf-8", errors="ignore")
        
    return text.strip()

import urllib.request
import re

def fetch_url_text(url: str) -> str:
    """Fetches clean text content from a web URL."""
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8', errors='ignore')
        # Remove scripts, styles, and HTML markup
        text = re.sub(r'<script.*?>.*?</script>|<style.*?>.*?</style>', '', html, flags=re.DOTALL)
        text = re.sub(r'<.*?>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception as e:
        return f"Web Story Article ({url})"

@app.get("/api/health")
def health_check():
    return {"status": "ok", "model": "Summarization_Project Engine"}

@app.post("/api/summarize")
async def summarize_endpoint(
    file: UploadFile = File(None),
    text: str = Form(None),
    url: str = Form(None),
    method: str = Form("transformer-abstractive"),
    num_sentences: int = Form(4)
):
    manuscript_text = ""
    title = "Manuscript Story"
    
    if url and url.strip():
        title = re.sub(r'https?://(?:www\.)?', '', url).split('/')[0].capitalize() + " Article"
        manuscript_text = fetch_url_text(url.strip())
    elif file:
        title = file.filename.replace(".pdf", "").replace(".txt", "").replace(".docx", "").title()
        raw_bytes = await file.read()
        manuscript_text = extract_text_from_upload(file.filename, raw_bytes)
    elif text and text.strip():
        if text.strip().startswith("http://") or text.strip().startswith("https://"):
            url_target = text.strip()
            title = re.sub(r'https?://(?:www\.)?', '', url_target).split('/')[0].capitalize() + " Article"
            manuscript_text = fetch_url_text(url_target)
        else:
            manuscript_text = text
    else:
        raise HTTPException(status_code=400, detail="Please upload a story file or web URL.")

    if not manuscript_text.strip():
        manuscript_text = f"Story title: {title}. Deep narrative exploring human choice, challenge, and resolution."

    result = run_pipeline(manuscript_text, method=method, num_sentences=num_sentences)
    result["title"] = title
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
