from typing import List, Dict, Optional, Any
from datetime import date
from pydantic import BaseModel

class SubLimit(BaseModel):
    covered: bool
    sub_limit: float
    copay_percentage: Optional[float] = 0.0
    pre_authorization_required: bool = False

class WaitingPeriods(BaseModel):
    initial_waiting: int
    pre_existing_diseases: int
    specific_ailments: Dict[str, int]

class CoverageDetails(BaseModel):
    annual_limit: float
    per_claim_limit: float
    consultation_fees: SubLimit
    diagnostic_tests: SubLimit
    pharmacy: SubLimit
    dental: SubLimit
    # Using generic dict for sections that might vary or simple models
    alternative_medicine: Dict[str, Any] = {}
    vision: Dict[str, Any] = {}

class PolicyConfig(BaseModel):
    """
    Schema for the policy_terms.json file.
    Ensures the config loaded at runtime matches expected structure.
    """
    policy_id: str
    policy_name: str
    effective_date: date
    exclusions: List[str]
    coverage_details: CoverageDetails
    waiting_periods: WaitingPeriods
    network_hospitals: List[str]
    
    # For loose validation of extra fields. 
    # Sections typed as Dict[str, Any] allow flexibility for MVP without strict schema updates.
    claim_requirements: Dict[str, Any]
    cashless_facilities: Dict[str, Any]
