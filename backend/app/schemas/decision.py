from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from .base import AdjudicationStatus

class DeductionDetail(BaseModel):
    """Explanation of a specific deduction."""
    amount: float
    reason: str
    rule_id: Optional[str] = None

class AdjudicationDecision(BaseModel):
    """
    The final output of the Policy Engine.
    This is what the user sees.
    """
    claim_id: str
    verdict: AdjudicationStatus
    
    # Financial Breakdown
    claimed_amount: float
    approved_amount: float
    deductions: List[DeductionDetail] = Field(default_factory=list)
    
    # Explainability & Trust
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Heuristic score min(ai, rules)")
    rejection_reasons: List[str] = Field(default_factory=list)
    
    # Traceability
    failed_rules: List[str] = Field(default_factory=list)
    decision_trace: List[Dict[str, str]] = Field(
        ..., 
        description="Ordered log of rule evaluations. E.g. {'step': 'Eligibility', 'status': 'PASS', 'note': 'Policy Active'}"
    )
    
    # User-Friendly Output (Matching new spec)
    notes: Optional[str] = Field(None, description="Additional observations or summary")
    next_steps: Optional[str] = Field(None, description="Actionable advice for the user")
    action_item: Optional[str] = None # Deprecated but kept for compatibility temporarily
