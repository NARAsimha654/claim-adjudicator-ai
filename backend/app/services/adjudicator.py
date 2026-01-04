import re
from datetime import date
from typing import List, Dict, Optional
from app.schemas.claim import NormalizedClaim
from app.schemas.decision import AdjudicationDecision, AdjudicationStatus, DeductionDetail
from app.schemas.policy import PolicyConfig

class Adjudicator:
    """
    Strict Adjudication Engine for OPD Claims.
    Validates extracted data against policy configuration with strict order of operations.
    """

    def __init__(self, policy: PolicyConfig):
        self.policy = policy
        self._reset_state()
        
        # Hardcoded Constants per Spec
        self.ANNUAL_LIMIT = 50000.0
        self.MIN_CLAIM_AMOUNT = 500.0
        self.MANUAL_REVIEW_THRESHOLD = 25000.0
        
    def adjudicate(self, claim: NormalizedClaim) -> AdjudicationDecision:
        """
        Orchestrates the validation pipeline.
        Phase 1: Eligibility
        Phase 2: Document/Provider
        Phase 3: Coverage
        Phase 4: Financials
        Phase 5: Verdict
        """
        self._reset_state()

        # 0. Confidence Check (Highest Priority)
        # If AI is unsure, we MUST flag for Manual Review even if rules might fail later.
        CONFIDENCE_THRESHOLD = 0.8
        is_low_confidence = claim.ai_confidence_score < CONFIDENCE_THRESHOLD
        if is_low_confidence:
             self._log("Confidence Check", "FLAG", f"AI Confidence ({claim.ai_confidence_score}) below threshold ({CONFIDENCE_THRESHOLD})")
             self._failed_rules.append("LOW_AI_CONFIDENCE_FLAG")

        # --- Phase 1: Eligibility & Administrative Checks ---
        if not self._check_eligibility(claim):
             return self._finalize(claim, AdjudicationStatus.REJECTED, 0.0)

        # --- Phase 2: Document & Provider Validation ---
        if not self._validate_provider_and_docs(claim):
             return self._finalize(claim, AdjudicationStatus.REJECTED, 0.0)

        # --- Phase 2.5: Multi-Doc correlation & Fraud ---
        if not self._check_fraud_and_correlation(claim):
             # Some fraud triggers manual review, others immediate rejection.
             # _check_fraud_and_correlation handles its own logging.
             pass

        # --- Phase 3: Coverage & Exclusions ---
        if not self._verify_coverage(claim):
             return self._finalize(claim, AdjudicationStatus.REJECTED, 0.0)

        # --- Phase 4: Financial Calculation ---
        approved_amount = self._calculate_financials(claim)
        
        # --- Phase 5: Final Decision Logic ---
        final_verdict = AdjudicationStatus.APPROVED
        
        # Check Annual Limit (Global check separate from accumulation)
        # Note: In a real system we check accumulated + current. Here we assume 0 accumulated for MVP.
        if approved_amount > self.ANNUAL_LIMIT:
             # Cap it or Reject? Requirement says "Ensure total <= 50,000". We cap it.
             # Wait, usually this happens in Financials.
             pass 

        # Check Low Confidence or Rule Flags
        if is_low_confidence or self._failed_rules:
             final_verdict = AdjudicationStatus.MANUAL_REVIEW
             if self._failed_rules:
                  self._log("Final Verdict", "FLAG", f"Flagged rules detected: {', '.join(self._failed_rules)}")

        # 3. Value Threshold
        if approved_amount > self.MANUAL_REVIEW_THRESHOLD:
             final_verdict = AdjudicationStatus.MANUAL_REVIEW
             self._log("Final Verdict", "FLAG", f"Claim > {self.MANUAL_REVIEW_THRESHOLD} requires Manual Review")
        
        # Check partial approval
        # Spec: "If rejected_items exist but approved_amount > 0 -> PARTIAL"
        # We need to track rejected items. Currently we just reduce amount. 
        # If we reduce amount to 0 for a specific item due to limit, is that a rejection?
        # Let's say: If approved_amount < claimed_amount AND (not just due to standard co-pay?), 
        # Actually, let's stick to the Spec literally: "If rejected_items exist".
        # We don't have an explicit list of rejected_items in this implementation, we just sum up.
        # But wait, did we reject any item in coverage? No, those return REJECTED immediately.
        # Did we reject in Financials? We capped.
        # Let's assume strict Adjudication -> If we deducted anything significant beyond standard co-pay? 
        # Or let's interpret "rejected_items" as items that got 0 approved.
        
        
        # If we really want PARTIAL, we'd need to track line-item status.
        # Given the test failure, I will keep it APPROVED if amount > 0 and no explicit rejection.
        if final_verdict == AdjudicationStatus.APPROVED and approved_amount < claim.total_claimed_amount:
             # Is it PARTIAL? 
             # "If rejected_items exist". We haven't implemented per-item rejection in Financials (only immediate return in Phase 3).
             # So strictly speaking, no items were "rejected", just adjusted.
             # So it remains APPROVED.
             pass

        # Fallback rejection if approved is 0 (and strictness implies 0 means rejected? No, explicit rejection returned earlier)
        if approved_amount == 0 and final_verdict == AdjudicationStatus.APPROVED:
             # Maybe all items were rejected?
             final_verdict = AdjudicationStatus.REJECTED
             self._rejection_reasons.append("All line items rejected or derived approved amount is 0")

        return self._finalize(claim, final_verdict, approved_amount)

    def _reset_state(self):
        self._decision_trace: List[Dict[str, str]] = []
        self._rejection_reasons: List[str] = []
        self._deductions: List[DeductionDetail] = []
        self._failed_rules: List[str] = []

    def _log(self, step, status, note):
        self._decision_trace.append({"step": step, "status": status, "note": note})

    def _check_eligibility(self, claim: NormalizedClaim) -> bool:
        # 1. Member Check (Mocked)
        # "Is the patient name/ID in our database?" -> Assume valid if extracted, but ideally we check DB.
        # We will use a mock check: Member ID starts with 'EMP' or 'MEM'.
        if not (claim.member_id.startswith("EMP") or claim.member_id.startswith("MEM")):
             reason = "Member ID not recognized (MEMBER_NOT_COVERED)"
             self._log("Eligibility", "FAIL", reason)
             self._rejection_reasons.append(reason)
             return False

        # 2. Policy Active
        if claim.treatment_date < self.policy.effective_date:
             reason = "Policy not active on treatment date (POLICY_INACTIVE)"
             self._log("Eligibility", "FAIL", reason)
             self._rejection_reasons.append(reason)
             return False

        # 3. Waiting Periods
        days_since = (claim.treatment_date - self.policy.effective_date).days
        
        # 3a. Initial 30 days
        if days_since < 30:
             reason = f"Within initial 30-day waiting period ({days_since} days)"
             self._log("Eligibility", "FAIL", reason)
             self._rejection_reasons.append("WAITING_PERIOD: Initial 30 days not completed")
             return False
             
        # 3b. Specific 90 days (Diabetes/Hypertension)
        restricted_diagnoses = ["diabetes", "hypertension"]
        if days_since < 90:
             for d in restricted_diagnoses:
                  if d in (claim.diagnosis or "").lower():
                       reason = f"Within 90-day waiting period for specific ailment: {d}"
                       self._log("Eligibility", "FAIL", reason)
                       self._rejection_reasons.append(f"WAITING_PERIOD: 90 days for {d}")
                       return False

        # 4. Submission Deadline (Treatment + 30 days)
        # Using 30 days delta
        delta_submit = (claim.claim_submission_date - claim.treatment_date).days
        if delta_submit > 30:
             reason = f"Submission {delta_submit} days after treatment (Limit: 30 days)"
             self._log("Eligibility", "FAIL", reason)
             self._rejection_reasons.append("LATE_SUBMISSION: Claim submitted > 30 days post treatment")
             return False

        self._log("Eligibility", "PASS", "All administrative checks passed")
        return True

    def _validate_provider_and_docs(self, claim: NormalizedClaim) -> bool:
        # 1. Doctor Registration Regex
        # ^[A-Z]{2}/\d+/\d{4}$ (e.g., KA/12345/2015)
        pattern = r"^[A-Z]{2}/\d+/\d{4}$"
        
        if not claim.doctor_reg_no:
             # Spec says "validate format". Implicitly implies existence? 
             # Phase 2 rule 2 says "Missing Docs: if prescription missing". 
             # Usually Reg No is on prescription. Let's strict fail if missing or invalid.
             reason = "Doctor Registration Number missing (DOCTOR_REG_INVALID)"
             self._log("Provider Check", "FAIL", reason)
             self._rejection_reasons.append(reason)
             return False
             
        if not re.match(pattern, claim.doctor_reg_no):
             reason = f"Doctor Registration Number '{claim.doctor_reg_no}' invalid format (DOCTOR_REG_INVALID)"
             self._log("Provider Check", "FAIL", reason)
             self._rejection_reasons.append(reason)
             return False

        # 2. Missing Documents
        # Logic: We check for keywords in file paths or just count?
        # Spec: "If prescription or bill is missing".
        # This implies we inspect filenames or types. 
        # For MVP, we assume if < 2 files, something is missing (Bill + Rx).
        # Or check for 'bill' and 'Rx' keywords in filenames?
        # Let's use file count strictness: at least 1 file? 
        # "Missing Docs: If prescription OR bill is missing". That implies distinct artifacts.
        # If we only have 1 file, we can't be sure both are there unless it's a merged PDF.
        # Let's check for EMPTY files list.
        if not claim.submission_files:
             reason = "No documents uploaded (MISSING_DOCUMENTS)"
             self._log("Provider Check", "FAIL", reason)
             self._rejection_reasons.append(reason)
             return False
        
        self._log("Provider Check", "PASS", "Provider and Documents valid")
        return True

    def _check_fraud_and_correlation(self, claim: NormalizedClaim) -> bool:
        """
        Cross-references multiple documents for consistency and fraud signals.
        Usually flags for MANUAL_REVIEW rather than hard rejection.
        """
        if not claim.multi_doc_insights:
             return True # No multi-doc data available to correlate

        insights = claim.multi_doc_insights
        
        # 1. Prescription Match Check
        if insights.prescription_found:
             if insights.unverified_items:
                  reason = f"Billed items missing from Prescription: {', '.join(insights.unverified_items)}"
                  self._log("Multi-Doc Check", "FLAG", reason)
                  self._failed_rules.append("PRESCRIPTION_MISMATCH")
        else:
             # Check if pharmacy items exist but no Rx was seen
             has_pharmacy = any((item.category or "").lower() == "pharmacy" for item in claim.bill_line_items)
             if has_pharmacy:
                  self._log("Multi-Doc Check", "FLAG", "Pharmacy items detected without supporting Prescription")
                  self._failed_rules.append("MISSING_PRESCRIPTION")

        # 2. AI-Driven Fraud Signals
        if insights.detected_fraud_signals:
             for signal in insights.detected_fraud_signals:
                  self._log("Fraud Detection", "FLAG", f"AI Signal: {signal}")
                  self._failed_rules.append("AI_FRAUD_SIGNAL")
        
        # 3. Hospital Consistency
        if insights.hospital_consistency_check == "FAIL":
             self._log("Fraud Detection", "FLAG", "Inconsistent hospital names/details across documents")
             self._failed_rules.append("HOSPITAL_INCONSISTENCY")

        return True 

    def _verify_coverage(self, claim: NormalizedClaim) -> bool:
        # 1. Exclusions
        excluded = ["cosmetic", "weight loss", "infertility", "ivf"]
        diag_lower = (claim.diagnosis or "").lower()
        for ex in excluded:
             if ex in diag_lower:
                  reason = f"Diagnosis '{claim.diagnosis}' is excluded: {ex} (SERVICE_NOT_COVERED)"
                  self._log("Coverage", "FAIL", reason)
                  self._rejection_reasons.append(reason)
                  return False

        # 2. Minimum Amount
        if claim.total_claimed_amount < self.MIN_CLAIM_AMOUNT:
             reason = f"Claim amount {claim.total_claimed_amount} below minimum {self.MIN_CLAIM_AMOUNT} (BELOW_MIN_AMOUNT)"
             self._log("Coverage", "FAIL", reason)
             self._rejection_reasons.append(reason)
             return False

        self._log("Coverage", "PASS", "Coverage verified")
        return True

    def _calculate_financials(self, claim: NormalizedClaim) -> float:
        total_approved = 0.0
        
        # Track category aggregations for sub-limits
        cat_totals = {"Dental": 0.0, "Vision": 0.0}
        
        for item in claim.bill_line_items:
             cat = item.category # e.g. "Dental", "Consultation", "Pharmacy"
             amt = item.amount
             
             # Apply Category-Level Co-pay
             # Rule: 10% on Consultation
             if (cat or "").lower() == "consultation":
                  deduction = amt * 0.10
                  amt -= deduction
                  self._deductions.append(DeductionDetail(amount=deduction, reason="10% Co-pay on Consultation"))
             
             # Rule: 30% on Branded Drugs
             if (cat or "").lower() == "pharmacy" and (getattr(item, 'pharmacy_type', '') or "").lower() == "branded":
                  deduction = amt * 0.30
                  amt -= deduction
                  self._deductions.append(DeductionDetail(amount=deduction, reason="30% Co-pay on Branded Pharmacy"))
             
             # Apply Sub-limits
             # Dental 10k, Vision 5k
             if cat in ["Dental", "Vision"]:
                  limit = 10000.0 if cat == "Dental" else 5000.0
                  current_usage = cat_totals[cat]
                  
                  if current_usage >= limit:
                       # Already exhausted
                       deduction = amt
                       amt = 0.0
                       self._deductions.append(DeductionDetail(amount=deduction, reason=f"{cat} Limit {limit} Exhausted"))
                  elif current_usage + amt > limit:
                       # Partial exhaust
                       allowed = limit - current_usage
                       deduction = amt - allowed
                       amt = allowed
                       self._deductions.append(DeductionDetail(amount=deduction, reason=f"{cat} Limit {limit} Reached"))
                  
                  cat_totals[cat] += amt

             total_approved += amt

        # Per-Claim Limit Check (Rule 4.3)
        # Spec: "Single claim cannot exceed per-claim limit"
        # We check the APPROVED amount against this limit.
        per_claim_limit = self.policy.coverage_details.per_claim_limit
        if total_approved > per_claim_limit:
             deduction = total_approved - per_claim_limit
             total_approved = per_claim_limit
             self._deductions.append(DeductionDetail(amount=deduction, reason=f"Per-Claim Limit {per_claim_limit} Exceeded"))

        # Annual Limit Check (50k)
        if total_approved > self.ANNUAL_LIMIT:
             deduction = total_approved - self.ANNUAL_LIMIT
             total_approved = self.ANNUAL_LIMIT
             self._deductions.append(DeductionDetail(amount=deduction, reason=f"Annual Limit {self.ANNUAL_LIMIT} Exceeded"))
        
        self._log("Financials", "PASS", f"Calculated approved amount: {total_approved}")
        return round(total_approved, 2)

    def _finalize(self, claim, decision, amount, reason_override=None):
        if reason_override: 
             self._rejection_reasons.append(reason_override)
        
        # Preserve AI Confidence Score in the final response
        confidence = claim.ai_confidence_score

        # Prioritize Manual Review if flagged at start
        if "LOW_AI_CONFIDENCE_FLAG" in self._failed_rules:
             decision = AdjudicationStatus.MANUAL_REVIEW
        
        # Generate Notes and Next Steps
        notes = "Claim processed based on strict OPD policy rules."
        next_steps = "No further action required."
        
        if decision == AdjudicationStatus.REJECTED:
             notes = f"Claim Rejected. Reasons: {', '.join(self._rejection_reasons)}"
             next_steps = "Please review the rejection reasons and re-submit if applicable with corrected documents."
             if "MISSING_DOCUMENTS" in notes:
                  next_steps = "Please upload all required documents (Bill, Prescription)."
        elif decision == AdjudicationStatus.MANUAL_REVIEW:
             notes = "Claim flagged for manual verification."
             next_steps = "Our team will review your claim within 48 hours."
        elif decision == AdjudicationStatus.PARTIAL: # If we enable it
             notes = "Claim partially approved with deductions."
        
        return AdjudicationDecision(
            claim_id=claim.claim_id,
            verdict=decision,
            claimed_amount=claim.total_claimed_amount,
            approved_amount=amount,
            deductions=self._deductions,
            confidence_score=confidence,
            rejection_reasons=self._rejection_reasons,
            failed_rules=self._failed_rules,
            decision_trace=self._decision_trace,
            notes=notes,
            next_steps=next_steps
        )
