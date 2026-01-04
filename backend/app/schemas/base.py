from enum import Enum
from typing import Literal

class AdjudicationStatus(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PARTIAL = "PARTIAL"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class ClaimType(str, Enum):
    OPD = "OPD"
    # Future extensibility
    IPD = "IPD"

class Currency(str, Enum):
    INR = "INR"
    USD = "USD"
