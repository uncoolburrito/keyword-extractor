import io
from pypdf import PdfReader
import docx

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from a byte array based on its filename's extension.
    Basic reference stripping is attempted.
    """
    filename_lower = filename.lower()
    text = ""
    
    if filename_lower.endswith('.pdf'):
        text = _extract_from_pdf(file_bytes)
    elif filename_lower.endswith('.docx'):
        text = _extract_from_docx(file_bytes)
    elif filename_lower.endswith('.txt'):
        text = file_bytes.decode('utf-8', errors='ignore')
    else:
        raise ValueError(f"Unsupported file type: {filename}")
        
    return _clean_and_strip_references(text)

def _extract_from_pdf(file_bytes: bytes) -> str:
    text = []
    reader = PdfReader(io.BytesIO(file_bytes))
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text.append(extracted)
    return "\n".join(text)

def _extract_from_docx(file_bytes: bytes) -> str:
    text = []
    doc = docx.Document(io.BytesIO(file_bytes))
    for para in doc.paragraphs:
        if para.text.strip():
            text.append(para.text)
    return "\n".join(text)

def _clean_and_strip_references(text: str) -> str:
    """
    Attempts to chop off the references section.
    This is a naive heuristic specifically targeting research papers.
    """
    keywords = ["\nReferences\n", "\nREFERENCES\n", "\nBibliography\n", "\nBIBLIOGRAPHY\n"]
    
    # We check the last 15% of the text to prevent matching earlier occurrences like "References in this paper..."
    search_start = int(len(text) * 0.70)
    
    for kw in keywords:
        pos = text.rfind(kw, search_start)
        if pos != -1:
            text = text[:pos]
            break
            
    # Very minor general clean (strip wide spaces, etc, but NLP engines handle tokenization)
    return text.strip()
