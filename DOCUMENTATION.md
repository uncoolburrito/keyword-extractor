# Keyword Extractor Tool Documentation

## 1. Project Overview

The **Keyword Extractor Tool** is a full-stack web application designed to help students, researchers, and professionals rapidly extract the most important keywords and concepts from large text documents, academic papers, and articles.

Built with a focus on ease-of-use and aesthetics, the tool provides a beautiful glassmorphic UI integrated with a powerful machine learning backend capable of analyzing text through multiple different NLP methodologies.

## 2. Architecture

The application uses a decoupled client-server architecture:

### 2.1 Frontend Client
- **Framework**: Next.js (App Router paradigm) with React
- **Styling**: Tailwind CSS v4, supporting dynamic Light and Dark mode using custom class-based variants.
- **Icons & Animation**: Lucide React for consistent iconography and Framer Motion for buttery-smooth micro-animations (page loading, drag-and-drop feedback, and hover states).
- **Core Component**: `src/app/page.tsx` drives the main application state, managing inputs (Text Paste or File Upload), managing API communication, and displaying loaded dynamic results.

### 2.2 Backend API Processing Layer
- **Framework**: FastAPI (Python) driven by Uvicorn.
- **Purpose**: Exposes robust asynchronous REST endpoints to consume text payloads and uploaded files securely.
- **Document Handlers**: Parses incoming PDF files (`pypdf`) and Word Documents (`python-docx`) into raw navigable text blocks.

## 3. Natural Language Processing Engines

Different texts require different keyword extraction methodologies. The backend houses a `KeywordEngine` interface that gives users three distinct extraction modalities:

### 3.1 Semantic Model (KeyBERT) *[Recommended]*
- **Mechanism**: Utilizes HuggingFace `sentence-transformers` to generate document-level embeddings and word-level embeddings.
- **How it works**: By calculating the cosine similarity between the full document string and individual phrases, it finds words that are semantically closest to the overall meaning of the text.
- **Best for**: Abstract research papers, nuanced articles, and summarizing meaning rather than just counting words. It also utilizes **Maximal Marginal Relevance (MMR)** to ensure the returned pool of keywords is diverse and not just variations of the same root word.

### 3.2 Advanced Model (RAKE)
- **Mechanism**: Rapid Automatic Keyword Extraction.
- **How it works**: Operates on text by parsing stop words and identifying contiguous phrases. It calculates scores based on the degree and frequency of word co-occurrences.
- **Best for**: When you specifically need multi-word key phrases rather than isolated single words, or when scanning highly structured textbook material.

### 3.3 Baseline Model (TF-IDF)
- **Mechanism**: Term Frequency - Inverse Document Frequency (`scikit-learn`).
- **How it works**: A statistical measure evaluating how relevant a word is to a document based on how frequently it appears, dramatically penalized if it's a common stop-word.
- **Best for**: Speed and analyzing extremely large datasets where deep semantic understanding is overly computationally expensive.

## 4. API Reference

The FastAPI backend exposes the following endpoints:

| Endpoint | Method | Payload Type | Description |
|---|---|---|---|
| `/api/extract/text` | `POST` | `application/json` | Accepts a JSON block containing `{ "text": "...", "method": "semantic", "top_n": 15 }`. Returns the extracted keywords and their relativity scores. |
| `/api/extract/file` | `POST` | `multipart/form-data` | Accepts a file upload (`.pdf`, `.txt`, `.docx`), and form fields for `method` and `top_n`. Parses the document natively and returns the keywords. |

---

*Built and maintained by Ramiz Rahman.*
