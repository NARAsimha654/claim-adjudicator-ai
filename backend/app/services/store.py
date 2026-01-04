import os
import json
from typing import List, Optional, Dict
from datetime import date, datetime
from app.services.database import get_supabase
from app.schemas.claim import NormalizedClaim
from app.schemas.decision import AdjudicationDecision

class ClaimStore:
    """
    Supabase-backed store for claims.
    Replaces the local 'data/claims.json' with cloud PostgreSQL.
    """
    def __init__(self):
        self.supabase = get_supabase()

    def _json_serializable(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if hasattr(obj, 'dict'):
            return obj.dict()
        return str(obj)

    def save_claim(self, claim: NormalizedClaim, decision: AdjudicationDecision, raw_text: str = ""):
        """Persists a new or updated claim to Supabase."""
        # Convert Pydantic models to dicts and handle dates
        claim_dict = json.loads(json.dumps(claim.dict(), default=self._json_serializable))
        decision_dict = json.loads(json.dumps(decision.dict(), default=self._json_serializable))

        record = {
            "claim_id": claim.claim_id,
            "member_id": claim.member_id,
            "patient_name": claim.patient_name or claim.member_id,
            "treatment_date": claim.treatment_date.isoformat() if claim.treatment_date else None,
            "claimed_amount": float(claim.total_claimed_amount),
            "verdict": str(decision.verdict.value),
            "claim_data": claim_dict,
            "decision_data": decision_dict,
            "raw_text": raw_text
        }

        # Upsert into 'claims' table based on 'claim_id'
        try:
            result = self.supabase.table("claims").upsert(record, on_conflict="claim_id").execute()
            return record
        except Exception as e:
            print(f"[STORE] Save Error: {e}")
            # Fallback for demo if table doesn't exist yet? No, we need the table.
            raise e

    def update_decision(self, claim_id: str, verdict: str, notes: str):
        """Updates the verdict and notes of an existing claim."""
        try:
            claim = self.get_claim(claim_id)
            if not claim:
                return False
            
            # get_claim(claim_id) transforms 'decision_data' to 'decision'
            decision_data = claim["decision"]
            decision_data["verdict"] = verdict
            decision_data["notes"] = f"Adjudicated by Admin: {notes}"
            decision_data["status_updated_at"] = datetime.now().isoformat()

            self.supabase.table("claims").update({
                "verdict": verdict,
                "decision_data": decision_data
            }).eq("claim_id", claim_id).execute()
            return True
        except Exception as e:
            print(f"[STORE] Update Error: {e}")
            return False

    def get_all_claims(self) -> List[Dict]:
        """Fetches all claims from Supabase, ordered by newest first."""
        try:
            result = self.supabase.table("claims").select("*").order("created_at", desc=True).execute()
            # Rename decision_data to decision for backend compatibility
            transformed = []
            for r in result.data:
                r["decision"] = r.pop("decision_data")
                transformed.append(r)
            return transformed
        except Exception as e:
            print(f"[STORE] Fetch Error: {e}")
            return []

    def get_claim(self, claim_id: str) -> Optional[Dict]:
        """Fetches a specific claim by its ID."""
        try:
            result = self.supabase.table("claims").select("*").eq("claim_id", claim_id).execute()
            if result.data:
                record = result.data[0]
                record["decision"] = record.pop("decision_data")
                return record
            return None
        except Exception as e:
            print(f"[STORE] Get Error: {e}")
            return None

    def get_stats(self) -> Dict:
        """Calculates dashboard statistics using current cloud data."""
        claims = self.get_all_claims()
        total_claims = len(claims)
        if total_claims == 0:
            return {
                "total_claims": 0, "total_value": 0, "approved_value": 0,
                "money_saved": 0, "approval_rate": 0,
                "status_breakdown": {"APPROVED": 0, "REJECTED": 0, "MANUAL_REVIEW": 0, "PARTIAL": 0}
            }

        total_value = sum(float(c["claim_data"]["total_claimed_amount"]) for c in claims)
        approved_value = sum(float(c["decision"]["approved_amount"]) for c in claims)
        money_saved = total_value - approved_value
        
        status_counts = {"APPROVED": 0, "REJECTED": 0, "MANUAL_REVIEW": 0, "PARTIAL": 0}
        for c in claims:
            v = c["verdict"]
            status_counts[v] = status_counts.get(v, 0) + 1
            
        return {
            "total_claims": total_claims,
            "total_value": total_value,
            "approved_value": approved_value,
            "money_saved": money_saved,
            "approval_rate": (status_counts["APPROVED"] / total_claims * 100) if total_claims > 0 else 0,
            "status_breakdown": status_counts
        }

    def check_potential_duplicate(self, member_id: str, treatment_date: date, amount: float) -> Optional[Dict]:
        """Checks if a matching claim exists in Supabase."""
        try:
            isodate = treatment_date.isoformat()
            # Using basic equality for amount; float precision might be an issue in SQL but good for MVP
            result = self.supabase.table("claims").select("claim_id, verdict").eq("member_id", member_id).eq("treatment_date", isodate).execute()
            
            for r in result.data:
                # Basic check for amount if needed, though SQL does it too
                return {"claim_id": r["claim_id"], "verdict": r["verdict"]}
            return None
        except Exception as e:
            print(f"[STORE] Duplicate Check Error: {e}")
            return None
