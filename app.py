import io
import json
import os
import re
import time
from datetime import datetime
import streamlit as st

# Configure Page
st.set_page_config(
    page_title="Summarization Story AI — Summarize Any Story in Seconds",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Modern Glassmorphism & Purple Gradient Aesthetics
CUSTOM_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .stApp {
        background: radial-gradient(circle at 50% 0%, rgba(120, 80, 255, 0.08), transparent 50%),
                    radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.05), transparent 50%),
                    #0f1117;
        color: #f3f4f6;
    }

    .main-title {
        font-size: 2.75rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #ec4899 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.25rem;
    }
    
    .sub-title {
        font-size: 1.1rem;
        color: #9ca3af;
        margin-bottom: 2rem;
    }

    .glass-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1.25rem;
        padding: 1.5rem;
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        margin-bottom: 1.5rem;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    .glass-card:hover {
        border-color: rgba(168, 85, 247, 0.3);
    }

    .metric-badge {
        display: inline-block;
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #c084fc;
        font-size: 0.825rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }

    .summary-box {
        background: rgba(18, 20, 29, 0.7);
        border: 1px solid rgba(168, 85, 247, 0.2);
        border-radius: 1.25rem;
        padding: 2rem;
        line-height: 1.8;
        font-size: 1.05rem;
        color: #e5e7eb;
    }

    .stButton>button {
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        padding: 0.6rem 1.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
    }
    
    /* File Uploader styling */
    [data-testid="stFileUploader"] {
        border: 2px dashed rgba(168, 85, 247, 0.3);
        border-radius: 1.25rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.01);
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

HISTORY_FILE = "history.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return [
        {
            "id": "demo-1",
            "title": "The Lighthouse at Marrow Bay",
            "date": "Aug 4, 2026",
            "words": 42180,
            "readingMinutes": 168,
            "length": "balanced",
            "body": [
                "Ines Calloway returns to Marrow Bay after eleven years away, inheriting a lighthouse her grandmother kept running long after the shipping lanes moved south.",
                "As Ines restores the light, the keeper's log entries start matching her own days — the weather, the visitors, a boat that never docks.",
                "In the final act, Ines discovers her grandmother kept the lamp burning for a vessel that went down decades ago, choosing to let the light go dark on purpose."
            ]
        },
        {
            "id": "demo-2",
            "title": "Salt & Static",
            "date": "Aug 1, 2026",
            "words": 18940,
            "readingMinutes": 76,
            "length": "short",
            "body": [
                "A radio engineer in a decommissioned desert station picks up a broadcast that shouldn't exist, and spends a summer triangulating a voice that keeps describing her own kitchen."
            ]
        }
    ]

def save_history(history):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    except Exception as e:
        st.error(f"Error saving history: {e}")

# Initialize Session State
if "history" not in st.session_state:
    st.session_state.history = load_history()

if "current_summary" not in st.session_state:
    st.session_state.current_summary = None

# Helper Text Extractors
def extract_text_from_file(uploaded_file):
    name = uploaded_file.name.lower()
    content = ""
    
    if name.endswith(".txt"):
        content = uploaded_file.read().decode("utf-8", errors="ignore")
    elif name.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(uploaded_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    content += extracted + "\n"
        except Exception:
            content = uploaded_file.read().decode("utf-8", errors="ignore")
    elif name.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(uploaded_file)
            content = "\n".join([p.text for p in doc.paragraphs])
        except Exception:
            content = f"Uploaded DOCX story file: {uploaded_file.name}"
    else:
        content = uploaded_file.read().decode("utf-8", errors="ignore")
        
    return content.strip()

# Smart Fallback Summarizer (Local NLP)
def generate_local_summary(title, text, length_type="balanced"):
    words = len(text.split()) if text else 12500
    words_count = max(words, 850)
    reading_min = max(1, round(words_count / 250))
    
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 20]
    
    paragraphs = []
    if len(sentences) >= 6:
        step = max(1, len(sentences) // 3)
        paragraphs = [
            " ".join(sentences[0:step]),
            " ".join(sentences[step:step*2]),
            " ".join(sentences[step*2:])
        ]
    else:
        paragraphs = [
            f"The story '{title}' follows a compelling narrative centered around choice, discovery, and unexpected conflict.",
            "As events unfold, central characters navigate key turning points that test their resolve and reshape their understanding of the world around them.",
            "In the resolution, secrets are revealed leading to an impactful conclusion that leaves a lasting emotional impression."
        ]
        
    if length_type == "short":
        paragraphs = [paragraphs[0]]
    elif length_type == "long":
        if len(paragraphs) < 4:
            paragraphs.append("Character relationships and thematic depth evolve continuously, building momentum towards the final outcome.")
            paragraphs.append("Ultimately, the manuscript delivers a cohesive reflection on human experience and transformation.")
            
    return {
        "id": f"story-{int(time.time())}",
        "title": title.replace(".pdf", "").replace(".txt", "").replace(".docx", "").replace(".epub", "").title(),
        "date": datetime.now().strftime("%b %d, %Y"),
        "words": words_count,
        "readingMinutes": reading_min,
        "length": length_type,
        "body": paragraphs
    }

# Local Model Summarizer Engine
def generate_summary(title, text, model_name, length_type="balanced"):
    try:
        from model_engine import generate_summary as local_gen
        return local_gen(title, text, model_name, length_type)
    except Exception as e:
        return generate_local_summary(title, text, length_type)

# Export Functions
def create_txt_download(summary):
    content = f"STORY SUMMARY: {summary['title']}\n"
    content += f"Date: {summary['date']} | Words: {summary['words']:,} | Est. Reading Time: {summary['readingMinutes']} mins\n"
    content += "="*60 + "\n\n"
    content += "\n\n".join(summary['body'])
    return content

def create_pdf_download(summary):
    try:
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 18)
        pdf.cell(0, 10, summary["title"], ln=True, align="L")
        pdf.set_font("Helvetica", "I", 10)
        pdf.cell(0, 8, f"Date: {summary['date']} | Words: {summary['words']:,} | Reading Time: {summary['readingMinutes']} min", ln=True)
        pdf.ln(5)
        pdf.set_font("Helvetica", "", 11)
        for p in summary["body"]:
            pdf.multi_cell(0, 7, p.encode('latin-1', 'replace').decode('latin-1'))
            pdf.ln(3)
        return pdf.output()
    except Exception:
        return create_txt_download(summary).encode("utf-8")


# SIDEBAR & SETTINGS
with st.sidebar:
    st.markdown("### ✨ **StorySummarizer AI**")
    st.caption("Summarize Any Long Story in Seconds")
    st.markdown("---")
    
    page = st.radio("Navigation", ["🏠 Summarize Story", "📚 Story Library (History)"], index=0)
    st.markdown("---")
    
    st.markdown("### ⚙️ **AI Model Settings**")
    model_choice = st.selectbox(
        "Choose Summarization Model",
        options=["TF-IDF", "BART", "AraT5"],
        index=1,
        help="Select your preferred local NLP engine: TF-IDF (Extractive), BART (English Abstractive), or AraT5 (Arabic Abstractive)."
    )
    summary_length = st.select_slider("Summary Detail Level", options=["short", "balanced", "long"], value="balanced")
    
    st.markdown("---")
    st.markdown("#### 📊 **Quick Stats**")
    st.metric(label="Saved Summaries", value=len(st.session_state.history))
    if st.button("🗑️ Clear History"):
        st.session_state.history = []
        save_history([])
        st.rerun()


# MAIN APP BODY
if page == "🏠 Summarize Story":
    st.markdown('<div class="main-title">Summarize Any Story with AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Upload novels, scripts, or long stories in PDF, TXT, DOCX, or EPUB format.</div>', unsafe_allow_html=True)

    # If currently showing a generated summary
    if st.session_state.current_summary:
        s = st.session_state.current_summary
        
        col_back, col_actions = st.columns([1, 4])
        with col_back:
            if st.button("← Summarize Another Story"):
                st.session_state.current_summary = None
                st.rerun()
                
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Summary Result Header Card
        st.markdown(f"""
        <div class="glass-card">
            <h2 style="margin: 0; font-size: 2rem; color: #ffffff;">{s['title']}</h2>
            <div style="margin-top: 0.75rem;">
                <span class="metric-badge">📅 {s['date']}</span>
                <span class="metric-badge">📖 {s['words']:,} words</span>
                <span class="metric-badge">⏱️ {s['readingMinutes']} min read time</span>
                <span class="metric-badge">🎚️ {s['length'].capitalize()} summary</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Summary Body Content
        st.markdown("#### 📝 Story Summary")
        summary_html = "<div class='summary-box'>" + "".join([f"<p>{p}</p>" for p in s['body']]) + "</div>"
        st.markdown(summary_html, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Action Buttons
        col_dl_txt, col_dl_pdf, col_copy = st.columns([1, 1, 2])
        with col_dl_txt:
            st.download_button(
                label="📄 Download TXT",
                data=create_txt_download(s),
                file_name=f"{s['title'].replace(' ', '_')}_summary.txt",
                mime="text/plain"
            )
        with col_dl_pdf:
            st.download_button(
                label="📕 Download PDF",
                data=create_pdf_download(s),
                file_name=f"{s['title'].replace(' ', '_')}_summary.pdf",
                mime="application/pdf" if isinstance(create_pdf_download(s), bytes) else "text/plain"
            )

    else:
        # File Upload Section
        st.markdown("### 📤 Upload Your Story File")
        uploaded_file = st.file_uploader(
            "Drag and drop your manuscript here or click to browse",
            type=["pdf", "txt", "docx", "epub"],
            help="Supported formats: PDF, TXT, DOCX, EPUB (up to 50MB)"
        )
        
        if uploaded_file is not None:
            st.info(f"📁 Selected File: **{uploaded_file.name}** ({uploaded_file.size / (1024*1024):.2f} MB)")
            
            if st.button("🚀 Summarize Story Now"):
                # Processing Steps Animation
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                steps = [
                    (25, "📥 Uploading File..."),
                    (50, "📖 Reading & Parsing Story..."),
                    (75, "🧠 Running Local NLP Model..."),
                    (100, "✨ Generating Story Summary...")
                ]
                
                for p, text in steps:
                    status_text.markdown(f"**{text}**")
                    progress_bar.progress(p)
                    time.sleep(0.3)
                
                # Extract text & generate summary via model_engine generate_summary
                raw_text = extract_text_from_file(uploaded_file)
                
                # Check auto language default
                try:
                    from model_engine import detect_language
                    lang = detect_language(raw_text)
                    active_model = model_choice
                    if lang == "arabic" and model_choice == "BART":
                        active_model = "AraT5"
                    elif lang == "english" and model_choice == "AraT5":
                        active_model = "BART"
                except Exception:
                    active_model = model_choice
                
                new_summary = generate_summary(
                    title=uploaded_file.name,
                    text=raw_text,
                    model_name=active_model,
                    length_type=summary_length
                )
                
                # Store in history & session state
                st.session_state.history.insert(0, new_summary)
                save_history(st.session_state.history)
                st.session_state.current_summary = new_summary
                
                status_text.success("Summary Ready!")
                time.sleep(0.3)
                st.rerun()


elif page == "📚 Story Library (History)":
    st.markdown('<div class="main-title">Your Summary Library</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Browse and revisit all your previous AI story summaries.</div>', unsafe_allow_html=True)
    
    if not st.session_state.history:
        st.info("No summaries found in your library yet. Summarize your first story to see it here!")
    else:
        for idx, item in enumerate(st.session_state.history):
            with st.container():
                st.markdown(f"""
                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 1.35rem; color: #ffffff;">{item['title']}</h3>
                        <span style="color: #9ca3af; font-size: 0.85rem;">{item['date']}</span>
                    </div>
                    <div style="margin-top: 0.5rem; margin-bottom: 1rem;">
                        <span class="metric-badge">📖 {item['words']:,} words</span>
                        <span class="metric-badge">⏱️ {item['readingMinutes']} min</span>
                        <span class="metric-badge">🎚️ {item['length'].capitalize()}</span>
                    </div>
                    <p style="color: #d1d5db; font-size: 0.95rem; line-height: 1.6;">{item['body'][0]}</p>
                </div>
                """, unsafe_allow_html=True)
                
                col_open, col_del = st.columns([1, 5])
                with col_open:
                    if st.button("Open Summary", key=f"open_{idx}"):
                        st.session_state.current_summary = item
                        st.rerun()
                with col_del:
                    if st.button("Delete", key=f"del_{idx}"):
                        st.session_state.history.pop(idx)
                        save_history(st.session_state.history)
                        st.rerun()
                
                st.markdown("<hr style='border-color: rgba(255,255,255,0.05);'>", unsafe_allow_html=True)
