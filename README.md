# Summarization Story AI 📖✨

> **A Modern, Multi-Model Local Story Summarization Platform for English & Arabic Manuscripts.**

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🚀 Overview

**Summarization Story AI** is an advanced NLP application designed to summarize long story manuscripts, books, and narrative documents. It seamlessly combines **Extractive** (TF-IDF term ranking) and **Abstractive** deep learning models (**BART** & **AraT5v2**) with automated language detection.

The system features a **FastAPI backend engine**, a **Glassmorphism React frontend**, and a **Streamlit application**, running 100% locally with zero cloud API dependencies.

---

## ✨ Features

- 🧠 **Dual Summarization Engines**:
  - **Extractive (TF-IDF)**: Extracts verbatim key sentences based on term frequency & inverse document frequency weights.
  - **Abstractive (Transformers)**: Generates fluent, rewritten plot overviews using state-of-the-art neural models.
- 🌐 **Automatic Language Detection & Model Routing**:
  - **English Manuscripts**: Uses `facebook/bart-large-cnn`.
  - **Arabic Manuscripts**: Uses `fatmaserry/AraT5v2-arabic-summarization`.
- 📊 **NLP Evaluation Metrics**:
  - Built-in `ROUGE-1`, `ROUGE-2`, `ROUGE-L`, and `BLEU` calculation for model output validation.
- 📁 **Multi-Format Support**: Reads `.pdf`, `.docx`, and `.txt` story files seamlessly.
- 🎨 **Modern Glassmorphism UI**: High-performance React + Tailwind CSS web interface with instant TXT/PDF summary export.
- ⚡ **100% Offline & Private**: Runs locally on CPU/GPU without external API keys.

---

## 🛠️ System Architecture

```text
User Upload (PDF / DOCX / TXT)
            │
            ▼
┌───────────────────────────────┐
│     Text Extraction & Clean   │  (Strip URLs, Gutenberg headers, formatting)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│   Language Detection (Spacy)  │
└───────────────┬───────────────┘
                │
        ┌───────┴───────┐
        │               │
  [ Arabic ]       [ English ]
        │               │
        ▼               ▼
┌───────────────┐ ┌───────────────┐
│ AraT5v2 Model │ │  BART Model   │
└───────┬───────┘ └───────┬───────┘
        │               │
        └───────┬───────┘
                │
                ▼
┌───────────────────────────────┐
│ Multi-Paragraph Summary Output│
└───────────────────────────────┘
```

---

## 📂 Project Structure

```text
Summarization Story/
├── model_engine.py         # Core NLP pipelines (TF-IDF, BART, AraT5v2, ROUGE/BLEU evaluation)
├── server.py               # FastAPI REST API server (/api/summarize, /api/health)
├── app.py                  # Streamlit dashboard application
├── Summarization_Project.ipynb # Model experimentation & benchmark notebook
├── src/                    # React + Vite frontend source code
│   ├── components/         # Glassmorphism UI components (Navbar, Dropzone, Results)
│   ├── routes/             # TanStack Router pages
│   └── styles.css          # Tailwind CSS styling & design tokens
├── public/                 # Static web assets
├── package.json            # Node.js dependencies & scripts
└── requirements.txt        # Python dependencies
```

---

## 💻 Installation & Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ (for React Web App)

### 2. Clone Repository
```bash
git clone https://github.com/your-username/Summarization-Story-AI.git
cd Summarization-Story-AI
```

### 3. Backend Setup (Python)
Create and activate a virtual environment:
```bash
python -m venv llm_env
# Windows:
llm_env\Scripts\activate
# Linux/macOS:
source llm_env/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Start the FastAPI backend server:
```bash
python server.py
```
> Server will run live at `http://localhost:8000`

---

### 4. Frontend Setup (React / Vite)
Open a new terminal window:
```bash
npm install
npm run dev
```
> Web UI will run live at `http://localhost:8080`

---

### 5. Streamlit Application (Optional)
To run the Streamlit dashboard:
```bash
streamlit run app.py
```

---

## 📡 API Endpoints

### `GET /api/health`
Returns backend health and active engine status.

**Response:**
```json
{
  "status": "ok",
  "model": "Summarization_Project Engine"
}
```

### `POST /api/summarize`
Summarizes an uploaded story file or raw text.

**Parameters (Form-Data):**
- `file`: PDF / DOCX / TXT file upload.
- `text`: (Optional) Raw text string.
- `method`: `transformer-abstractive` | `tfidf-extractive` | `hybrid`

**Response:**
```json
{
  "id": "summary-1785955",
  "title": "My Story Title",
  "words": 450,
  "readingMinutes": 2,
  "summary": [
    "Paragraph 1 of AI generated narrative summary...",
    "Paragraph 2 detailing plot escalation and character resolution..."
  ]
}
```

---

## ⚡ Machine Learning Models

| Model | Task | Source |
| :--- | :--- | :--- |
| **BART Large CNN** | English Abstractive Summarization | [`facebook/bart-large-cnn`](https://huggingface.co/facebook/bart-large-cnn) |
| **AraT5v2 Arabic** | Arabic Abstractive Summarization | [`fatmaserry/AraT5v2-arabic-summarization`](https://huggingface.co/fatmaserry/AraT5v2-arabic-summarization) |
| **TF-IDF Vectorizer** | Extractive Sentence Ranking | `scikit-learn` |
| **ROUGE & BLEU** | Summary Quality Evaluation | `rouge-score` & `nltk` |

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
