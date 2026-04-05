from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel
import uvicorn

from services.file_extractor import extract_text_from_bytes
from services.keyword_engine import KeywordEngine

app = FastAPI(title="Keyword Extractor API")

# Update CORS later with specific origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = KeywordEngine()

class TextExtractionRequest(BaseModel):
    text: str
    method: str = "semantic"  # baseline, advanced, semantic
    top_n: int = 15

class Keyword(BaseModel):
    word: str
    score: float

class ExtractionResponse(BaseModel):
    keywords: List[Keyword]
    method_used: str

@app.post("/api/extract/text", response_model=ExtractionResponse)
async def extract_from_text(request: TextExtractionRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        keywords = engine.extract(request.text, request.method, request.top_n)
        return ExtractionResponse(
            keywords=[Keyword(word=k[0], score=k[1]) for k in keywords],
            method_used=request.method
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract/file", response_model=ExtractionResponse)
async def extract_from_file(
    file: UploadFile = File(...),
    method: str = Form("semantic"),
    top_n: int = Form(15)
):
    valid_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]
    
    if file.content_type not in valid_content_types and not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

    try:
        contents = await file.read()
        extracted_text = extract_text_from_bytes(contents, file.filename)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in file")

        keywords = engine.extract(extracted_text, method, top_n)
        return ExtractionResponse(
            keywords=[Keyword(word=k[0], score=k[1]) for k in keywords],
            method_used=method
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
