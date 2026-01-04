import json
import os
from datetime import date
from app.services.adjudicator import Adjudicator
from app.schemas.policy import PolicyConfig
from app.schemas.claim import NormalizedClaim, ExtractedLineItem
from app.schemas.decision import AdjudicationStatus

def test_adjudicator_simple_approval():
    # 1. Load Policy
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    policy_path = os.path.join(base_dir, "config", "policy_terms.json")
    
    with open(policy_path, "r") as f:
        policy_data = json.load(f)
    
    # Quick fix for date parsing if json lib reads as string
    policy_data["effective_date"] = date.fromisoformat(policy_data["effective_date"])
    policy = PolicyConfig(**policy_data)

    # 2. Construct Claim (Simulating TC001: Simple Consultation - Approved)
    # Input Data: 1500 amount, Viral fever, Paracetamol+VitC, Consultation 1000 + Tests 500
    claim = NormalizedClaim(
        claim_id="TEST_001",
        member_id="EMP001",
        total_claimed_amount=1500.0,
        treatment_date=date(2024, 2, 10), # Passes 30-day initial waiting period
        claim_submission_date=date(2024, 2, 20), # Passes 30-day submission deadline
        
        # Medical Details
        diagnosis="Viral fever",
        bill_line_items=[
            ExtractedLineItem(description="Consultation Fee", category="Consultation", amount=1000.0),
            ExtractedLineItem(description="CBC Test", category="Diagnostic", amount=500.0)
        ],
        
        # Provider Details
        doctor_reg_no="KA/45678/2015", # Valid format
        hospital_name="City Clinic",
        
        # Metadata
        submission_files=["bill.pdf", "rx.pdf"], # Present
        ai_confidence_score=0.95
    )

    # 3. Run Adjudicator
    engine = Adjudicator(policy)
    decision = engine.adjudicate(claim)

    # 4. Assertions
    print(f"\nFinal Verdict: {decision.verdict}")
    print(f"Trace: {json.dumps(decision.decision_trace, indent=2)}")
    
    assert decision.verdict.value == AdjudicationStatus.APPROVED.value
    assert decision.approved_amount > 0
    assert decision.approved_amount <= 1500.0
    
    assert decision.approved_amount == 1400.0
    
    # Verify Trace Steps exist
    trace_steps = [t["step"] for t in decision.decision_trace]
    assert "Eligibility" in trace_steps
    assert "Provider Check" in trace_steps
    assert "Coverage" in trace_steps
    assert "Financials" in trace_steps

def test_adjudicator_multi_doc_mismatch():
    # 1. Load Policy
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    policy_path = os.path.join(base_dir, "config", "policy_terms.json")
    with open(policy_path, "r") as f:
        policy_data = json.load(f)
    policy_data["effective_date"] = date.fromisoformat(policy_data["effective_date"])
    policy = PolicyConfig(**policy_data)

    # 2. Construct Claim with Mismatch (Bill has items not on prescription)
    from app.schemas.claim import MultiDocInsights
    claim = NormalizedClaim(
        claim_id="TEST_MISMATCH",
        member_id="EMP001",
        total_claimed_amount=2000.0,
        treatment_date=date(2024, 2, 10),
        claim_submission_date=date(2024, 2, 15),
        diagnosis="Migraine",
        bill_line_items=[
            ExtractedLineItem(description="Consultation", category="Consultation", amount=1000.0),
            ExtractedLineItem(description="Vitamins (Unprescribed)", category="Pharmacy", amount=1000.0)
        ],
        doctor_reg_no="KA/45678/2015",
        hospital_name="City Clinic",
        submission_files=["bill.pdf", "rx.pdf"],
        ai_confidence_score=0.9,
        # Simulate AI finding it's unverified
        multi_doc_insights=MultiDocInsights(
            prescription_found=True,
            unverified_items=["Vitamins (Unprescribed)"],
            detected_fraud_signals=[]
        )
    )

    # 3. Run Adjudicator
    engine = Adjudicator(policy)
    decision = engine.adjudicate(claim)

    # 4. Assertions
    print(f"Mismatch Test Verdict: {decision.verdict}")
    # Verdict should be MANUAL_REVIEW because of the mismatch
    assert str(decision.verdict) == str(AdjudicationStatus.MANUAL_REVIEW)
    
    trace_mismatch = [t for t in decision.decision_trace if "Multi-Doc Check" in t['step']]
    assert len(trace_mismatch) > 0
    assert trace_mismatch[0]['status'] == 'FLAG'

if __name__ == "__main__":
    test_adjudicator_simple_approval()
    test_adjudicator_multi_doc_mismatch()
    print("All tests passed!")
