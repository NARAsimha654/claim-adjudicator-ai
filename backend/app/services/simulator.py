from typing import List, Dict
from app.services.adjudicator import Adjudicator
from app.services.store import ClaimStore
from app.schemas.policy import PolicyConfig
from app.schemas.claim import NormalizedClaim

class PolicySimulator:
    """ Simulates financial impact of policy changes on historical data """
    
    def __init__(self, store: ClaimStore):
        self.store = store

    def simulate(self, new_policy: PolicyConfig) -> Dict:
        """ Runs historical claims through the adjudicator with a new policy """
        historical_records = self.store.get_all_claims()
        
        # Instantiate a fresh adjudicator with new rules
        simulator_engine = Adjudicator(new_policy)
        
        old_total_approved = 0.0
        new_total_approved = 0.0
        total_claimed = 0.0
        
        impact_by_verdict = {
            "APPROVED": 0,
            "REJECTED": 0,
            "MANUAL_REVIEW": 0,
            "PARTIAL": 0
        }
        
        for record in historical_records:
            # Reconstruct NormalizedClaim from stored dict
            # In a real app we'd use Pydantic parse_obj
            claim_data = record["claim_data"]
            normalized_claim = NormalizedClaim(**claim_data)
            
            # 1. Original Stats
            old_total_approved += record["decision"]["approved_amount"]
            total_claimed += claim_data["total_claimed_amount"]
            
            # 2. Simulated Adjudication
            sim_decision = simulator_engine.adjudicate(normalized_claim)
            new_total_approved += sim_decision.approved_amount
            
            # Track status migration
            impact_by_verdict[str(sim_decision.verdict.value)] += 1

        delta = new_total_approved - old_total_approved
        savings_change = (new_total_approved / old_total_approved - 1) * 100 if old_total_approved > 0 else 0

        return {
            "total_claims_analyzed": len(historical_records),
            "total_value_processed": total_claimed,
            "current_approved_total": old_total_approved,
            "simulated_approved_total": new_total_approved,
            "net_impact_amount": delta,
            "percentage_change": savings_change,
            "verdict_distribution": impact_by_verdict
        }
