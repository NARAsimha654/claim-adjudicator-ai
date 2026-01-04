import json
import time
import typing
import os
import fitz  # PyMuPDF
from groq import Groq
from datetime import date
from fastapi import HTTPException
from app.core.config import GROQ_API_KEY
from app.schemas.claim import ExtractedUnstructuredData

class Extractor:
    def __init__(self):
        if not GROQ_API_KEY:
            # Fallback for now, but we want the user to provide it
            print("[EXTRACTOR] Warning: GROQ_API_KEY not found.")
        
        self.client = Groq(api_key=GROQ_API_KEY)
        # Using Llama 3 70B - standard reliable model for JSON
        self.model_name = "llama-3.3-70b-versatile"

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Helper to extract text from PDF locally since Groq is text-only."""
        text = ""
        try:
            doc = fitz.open(pdf_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            print(f"PDF Extraction Error: {e}")
        return text

    def extract_claim_data(self, file_paths: typing.List[str]) -> ExtractedUnstructuredData:
        """
        Extracts claim data using Groq Llama 3.
        Supports Mock Mode and local PDF extraction.
        """
        # MOCK MODE: Bypass AI if service is down/limited
        if os.getenv("AI_MOCK_MODE", "").lower() == "true":
            print("[EXTRACTOR] AI_MOCK_MODE is ENABLED. Returning dummy data.")
            return ExtractedUnstructuredData(
                patient_name="Mock Patient",
                diagnosis="Test Diagnosis",
                total_amount=1000.0,
                extraction_confidence=0.9,
                line_items=[]
            )

        # 1. Gather all text
        combined_text = ""
        for path in file_paths:
            ext = path.lower().split('.')[-1]
            if ext == 'txt':
                with open(path, "r", encoding="utf-8") as f:
                    combined_text += f"\n--- {os.path.basename(path)} ---\n{f.read()}\n"
            elif ext == 'pdf':
                combined_text += f"\n--- {os.path.basename(path)} ---\n{self._extract_text_from_pdf(path)}\n"
            else:
                combined_text += f"\n[Warning: Binary format {ext} not supported by Groq text extraction]\n"

        if not combined_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in documents.")

        # 2. Construct Prompt
        schema_json = ExtractedUnstructuredData.model_json_schema()
        
        prompt = f"""
        You are an expert medical billing assistant specializing in multi-document correlation.
        Analyze the provided medical documents and extract data into the provided JSON schema.
        
        Text to analyze:
        {combined_text}
        
        JSON Schema:
        {json.dumps(schema_json, indent=2)}
        
        Critical Multi-Doc Instructions:
        1. **Categorization**: For each file, identify its type (Prescription, Invoice, Receipt, Discharge Summary).
        2. **Correlation**: Compare the Prescription (if present) with the Invoice/Bill. 
           - List items in 'items_verified_on_prescription' only if they appear on both.
           - List items in 'unverified_items' if they are on the bill but NO prescription is seen for them.
        3. **Fraud Signals**: Look for anomalies like:
           - Dates not matching across docs.
           - Duplicate invoice numbers.
           - Total amount not matching the sum of line items.
        4. **Extraction Confidence**: Score 0.0-1.0. Lower if documents are conflicting.
        5. Output ONLY pure JSON.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model_name,
                response_format={"type": "json_object"}
            )
            
            raw_json = json.loads(chat_completion.choices[0].message.content)

            # 3. Post-Process & Heuristics
            # Handle dates
            if raw_json.get("treatment_date"):
                try:
                    date.fromisoformat(str(raw_json["treatment_date"]))
                except:
                    raw_json["treatment_date"] = None

            data = ExtractedUnstructuredData(**raw_json)
            
            # Confidence Logic
            confidence = data.extraction_confidence if data.extraction_confidence > 0 else 0.9
            
            # Penalty for markers
            text_blobs = f"{data.diagnosis} {data.hospital_name} {data.total_amount}".lower()
            if any(m in text_blobs for m in ["?", "~", "maybe", "unknown"]):
                confidence = min(confidence, 0.6)
            
            # Penalty for missing pillars
            missing_pillars = sum(1 for f in [data.diagnosis, data.hospital_name, data.total_amount, data.treatment_date] if f is None)
            if missing_pillars > 0:
                confidence = max(0.2, confidence - (0.2 * missing_pillars))

            data.extraction_confidence = round(confidence, 2)
            return data

        except Exception as e:
            error_msg = str(e)
            print(f"[EXTRACTOR] Groq Error: {error_msg}")
            if "429" in error_msg:
                raise HTTPException(status_code=429, detail="Groq API Rate Limit Hit.")
            raise HTTPException(status_code=500, detail=f"Groq Extraction Failed: {error_msg}")
