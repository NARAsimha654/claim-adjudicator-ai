from typing import List, Optional, Dict, Any
from datetime import date
from pydantic import BaseModel, Field, validator
from .base import ClaimType

# --- 1. Submission Input (The API Request) ---
class ClaimSubmission(BaseModel):
    """
    Initial output received from the frontend/upload API.
    Just the raw files and minimal user-claimed metadata.
    """
    member_id: str = Field(..., description="Employee/Member ID")
    claimed_amount: float = Field(..., gt=0, description="Total amount claimed by user")
    files: List[str] = Field(..., description="List of uploaded file paths/URLs")
    
    # Optional metadata if we trust the user, but we usually trust the Extraction more
    submission_date: date = Field(default_factory=date.today)

# --- 2. Extracted Components (The AI Output) ---
class ExtractedLineItem(BaseModel):
    description: str
    category: str = Field(..., description="Pharmacy, Consultation, Lab, Procedure, etc.")
    amount: float
    discount: float = 0.0
    # Added for Strict Adjudication Phase 4 (Branded vs Generic)
    pharmacy_type: Optional[str] = Field(None, description="Branded or Generic")

class DocumentInsight(BaseModel):
    """Insight gained from correlating multiple documents."""
    doc_type: str = Field(..., description="Prescription, Invoice, Receipt, Discharge Summary")
    filename: str
    summary: str
    confidence: float

class MultiDocInsights(BaseModel):
    """Signals derived from comparing multiple documents."""
    prescription_found: bool = False
    items_verified_on_prescription: List[str] = Field(default_factory=list)
    unverified_items: List[str] = Field(default_factory=list)
    detected_fraud_signals: List[str] = Field(default_factory=list)
    hospital_consistency_check: str = "PENDING" # PASS/FAIL/FLAG

class ExtractedUnstructuredData(BaseModel):
    """
    Raw structured data extracted from documents by AI.
    """
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    doctor_name: Optional[str] = None
    doctor_registration_no: Optional[str] = None
    treatment_date: Optional[date] = None
    diagnosis: Optional[str] = None
    hospital_name: Optional[str] = None
    total_amount: Optional[float] = None
    line_items: List[ExtractedLineItem] = Field(default_factory=list)
    
    # Multi-doc insights
    multi_doc_insights: Optional[MultiDocInsights] = None
    document_summaries: List[DocumentInsight] = Field(default_factory=list)
    
    # Flags for manual review if AI was unsure
    extraction_confidence: float = Field(0.0, ge=0.0, le=1.0)
    missing_fields: List[str] = Field(default_factory=list)

# --- 3. Normalized Domain Model (The Source of Truth) ---
class NormalizedClaim(BaseModel):
    """
    The unified claim object used by the Adjudicator.
    Combines User Input (trusted for Identity) + AI Extraction (trusted for Medical details).
    """
    claim_id: str
    member_id: str
    patient_name: Optional[str] = None # For Member Check
    patient_age: Optional[int] = None
    claim_submission_date: date = Field(default_factory=date.today) # For Late Submission Check
    
    # Financials
    total_claimed_amount: float
    
    # Medical Details (from Extraction)
    treatment_date: date
    diagnosis: str
    bill_line_items: List[ExtractedLineItem]
    
    # Provider Details
    doctor_reg_no: Optional[str] = None
    hospital_name: Optional[str] = None
    is_network_hospital: bool = False
    
    # Metadata
    submission_files: List[str]
    ai_confidence_score: float
    multi_doc_insights: Optional[MultiDocInsights] = None

    @validator('treatment_date', pre=True)
    def parse_date(cls, v):
        if isinstance(v, str):
            # Fallback or custom parsing logic if needed
            return date.fromisoformat(v)
        return v
