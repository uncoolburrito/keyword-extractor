# Research Paper Keyword Extractor

An intelligent full-stack application that leverages natural language processing (NLP) to extract semantic keywords from research papers (PDF, DOCX, TXT, or raw text) and displays them in a gorgeous glassmorphic interface.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS v4, Lucide React
- **Backend**: FastAPI (Python), Uvicorn
- **NLP Engine**: KeyBERT (sentence-transformers), RAKE, TF-IDF, pypdf, python-docx

## Prerequisites
- Node.js (v18+)
- Python 3.10+
- npm or yarn

## Setup Instructions

### 1. Backend Setup
Navigate into the `backend` directory, create a virtual environment, and install dependencies.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> **Note on First Run**: If you use the Semantic (KeyBERT) extraction method for the first time, it will download a lightweight transformer model (~80 MB) automatically in the background before processing.

Start the API server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
In a new terminal window, navigate into the `frontend` directory and start the Next.js development server.
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
- Open your browser and go to http://localhost:3000 or check from deployed link: 
- Drag and drop a research paper (PDF/DOCX/TXT) or paste the abstract directly.
- Select your Preferred Keyword extraction Engine (Semantic KeyBERT is recommended for high-quality, abstract-level embedding extraction).
- Click 'Extract Keywords' and review your results.
- Export as JSON/CSV or Copy directly to clipboard.
