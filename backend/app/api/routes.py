import shutil
import os
import json
import uuid
from typing import List
from datetime import date
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.services.extractor import Extractor
from app.services.adjudicator import Adjudicator
from app.schemas.claim import NormalizedClaim
from app.schemas.decision import AdjudicationDecision
from app.schemas.policy import PolicyConfig
from app.services.generator import PDFGenerator
from fastapi.responses import FileResponse

router = APIRouter()
print("\n[BACKEND] Routes reloaded. Checking API key...")
# Force reload to pick up updated policy_terms.json


# Global Services Setup (Simulated Singleton)
# In production, use Dependency Injection (Depends)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POLICY_PATH = os.path.join(BASE_DIR, "config", "policy_terms.json")

# Load Policy
try:
    with open(POLICY_PATH, "r") as f:
        policy_data = json.load(f)
    # Quick fix for date parsing
    if isinstance(policy_data.get("effective_date"), str):
        policy_data["effective_date"] = date.fromisoformat(policy_data["effective_date"])
    policy_config = PolicyConfig(**policy_data)
except Exception as e:
    print(f"CRITICAL: Failed to load policy. {e}")
    policy_config = None # Will fail requests if not loaded

extractor_service = Extractor()
adjudicator_service = Adjudicator(policy_config)

from app.services.store import ClaimStore
from app.services.simulator import PolicySimulator
from app.services.database import get_supabase

store = ClaimStore()
pdf_generator = PDFGenerator()
simulator = PolicySimulator(store)
supabase_client = get_supabase()

@router.post("/policy/simulate")
async def simulate_policy(config: PolicyConfig):
    """Backtest a new policy configuration against historical data"""
    try:
        results = simulator.simulate(config)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/claims/submit", response_model=AdjudicationDecision)
async def submit_claim(
    member_id: str = Form("EMP001"), # Default for demo if not provided
    claimed_amount: float = Form(None), # Optional, fallback to extraction
    submission_date: str = Form(None, description="YYYY-MM-DD. Defaults to today."),
    files: List[UploadFile] = File(...)
):
    """
    Orchestrates the Claim Adjudication Process:
    1. Save Uploaded Files
    2. AI Extraction (Gemini)
    3. Construct Normalized Claim
    4. Run Adjudication Rules
    5. Return Decision
    """
    if not policy_config:
        raise HTTPException(status_code=500, detail="System Misconfiguration: Policy not loaded")

    # 1. Upload Files to Supabase Storage
    saved_file_paths = [] # We now store cloud keys/URLs
    local_temp_paths = [] # For LLM processing
    
    upload_dir = os.path.join(BASE_DIR, "temp_uploads", str(uuid.uuid4()))
    os.makedirs(upload_dir, exist_ok=True)

    try:
        bucket_name = os.getenv("SUPABASE_BUCKET", "claim-documents")
        
        for file in files:
            # Generate unique name for cloud storage
            file_ext = file.filename.split('.')[-1]
            cloud_name = f"{uuid.uuid4()}.{file_ext}"
            
            # Save locally for Gemini/Groq processing (temp)
            local_path = os.path.join(upload_dir, file.filename)
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            local_temp_paths.append(local_path)
            
            # Upload to Supabase
            try:
                with open(local_path, "rb") as f:
                    supabase_client.storage.from_(bucket_name).upload(path=cloud_name, file=f)
                
                # Get Public URL (Assuming bucket is public)
                public_url = supabase_client.storage.from_(bucket_name).get_public_url(cloud_name)
                saved_file_paths.append(public_url)
            except Exception as se:
                print(f"[STORAGE ERROR] {se}")
                # Fallback to local path for demo if storage fails
                saved_file_paths.append(local_path)

        # 2. Extract Data (AI) - Still uses local paths for processing
        extracted_data = extractor_service.extract_claim_data(local_temp_paths)
        
        # 2.5. Capture Raw Text for persistence (Optimized for cloud review view)
        raw_full_text = ""
        for local_path in local_temp_paths:
            ext = local_path.lower().split('.')[-1]
            if ext == 'txt':
                with open(local_path, "r", encoding="utf-8") as f:
                    raw_full_text += f"\n--- {os.path.basename(local_path)} ---\n{f.read()}\n"
            elif ext == 'pdf':
                raw_full_text += f"\n--- {os.path.basename(local_path)} ---\n{extractor_service._extract_text_from_pdf(local_path)}\n"

        # 3. Construct Normalized Claim
        # Fallback for amount if user didn't provide it
        final_amount = claimed_amount if (claimed_amount is not None and claimed_amount > 0) else (extracted_data.total_amount or 0.0)
        
        # Handle Date: Prefer extracted treatment date, fallback to today
        treatment_date = extracted_data.treatment_date or date.today()
        
        # Check for potential duplicates first
        duplicate = store.check_potential_duplicate(member_id, treatment_date, final_amount)
        if duplicate:
            if not extracted_data.multi_doc_insights:
                from app.schemas.claim import MultiDocInsights
                extracted_data.multi_doc_insights = MultiDocInsights()
            if f"POTENTIAL_DUPLICATE: Identical claim found (ID: {duplicate['claim_id']})" not in extracted_data.multi_doc_insights.detected_fraud_signals:
                extracted_data.multi_doc_insights.detected_fraud_signals.append(
                    f"POTENTIAL_DUPLICATE: Identical claim found (ID: {duplicate['claim_id']})"
                )

        normalized_claim = NormalizedClaim(
            claim_id=f"CLM-{uuid.uuid4().hex[:8].upper()}",
            member_id=member_id,
            patient_name=extracted_data.patient_name or member_id,
            patient_age=extracted_data.patient_age,
            total_claimed_amount=final_amount,
            claim_submission_date=date.fromisoformat(submission_date) if submission_date else date.today(),
            treatment_date=treatment_date,
            diagnosis=extracted_data.diagnosis or "Unknown",
            bill_line_items=extracted_data.line_items,
            doctor_reg_no=extracted_data.doctor_registration_no,
            hospital_name=extracted_data.hospital_name,
            submission_files=saved_file_paths, # Cloud URLs
            ai_confidence_score=extracted_data.extraction_confidence,
            multi_doc_insights=extracted_data.multi_doc_insights
        )
        
        # 4. Adjudicate
        decision = adjudicator_service.adjudicate(normalized_claim)
        
        # 5. Persist (Including raw text for review workspace)
        store.save_claim(normalized_claim, decision, raw_text=raw_full_text)
        
        return decision

    except HTTPException as he:
        # Re-raise specific status codes (e.g. 429)
        raise he
    except Exception as e:
        print(f"CRITICAL ERROR in submit_claim: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
    finally:
        # Cleanup temp files (Optional: keep them for debugging in this demo? User said temp storage is fine)
        # Uncomment to clean up immediately:
        # shutil.rmtree(upload_dir, ignore_errors=True)
        pass

# --- New Endpoints for Dashboard ---

@router.get("/claims")
async def get_claims():
    """Get history of all claims"""
    return store.get_all_claims()

@router.get("/claims/stats")
async def get_stats():
    """Get dashboard statistics"""
    return store.get_stats()

@router.get("/claims/{claim_id}")
async def get_claim_detail(claim_id: str):
    """Get full details of a specific claim"""
    claim = store.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.get("/claims/{claim_id}/pdf")
async def get_claim_pdf(claim_id: str):
    """Generate and return Settlement Advice PDF"""
    claim = store.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Generate temporary PDF
    temp_dir = os.path.join(BASE_DIR, "temp_reports")
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{claim_id}_advice.pdf")
    
    pdf_generator.generate_settlement_advice(
        claim_data=claim["claim_data"],
        decision_data=claim["decision"],
        output_path=file_path
    )
    
    return FileResponse(
        path=file_path,
        filename=f"Settlement_Advice_{claim_id}.pdf",
        media_type="application/pdf"
    )

@router.get("/claims/{claim_id}/text")
async def get_claim_text(claim_id: str):
    """Retrieve raw text from database for split-screen review"""
    claim = store.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    return {"text": claim.get("raw_text", "No text available for this claim.")}

@router.post("/claims/{claim_id}/review")
async def review_claim(claim_id: str, verdict: str = Form(...), notes: str = Form(...)):
    """Manual Review override (Persisted)"""
    success = store.update_decision(claim_id, verdict, notes)
    if not success:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"status": "Updated", "new_verdict": verdict}

@router.get("/policy/config")
async def get_policy():
    """Get current policy adjudication rules"""
    if not policy_config:
        raise HTTPException(status_code=500, detail="Policy not loaded")
    return policy_config
