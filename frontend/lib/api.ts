export interface AdjudicationResponse {
    claim_id: string;
    verdict: "APPROVED" | "REJECTED" | "PARTIAL" | "MANUAL_REVIEW";
    claimed_amount: number;
    approved_amount: number;
    deductions: Array<{ amount: number; reason: string }>;
    confidence_score: number;
    rejection_reasons: string[];
    failed_rules: string[];
    decision_trace: Array<{ step: string; status: "PASS" | "FAIL" | "FLAG"; reason: string; note?: string }>;
    notes?: string;
    next_steps?: string;
}

export async function submitClaim(formData: FormData): Promise<AdjudicationResponse> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${API_URL}/claims/submit`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${errorText}`);
    }

    return response.json();
}
