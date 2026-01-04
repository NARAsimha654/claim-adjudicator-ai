"use client"

import * as React from "react"
import { AppLayout } from "@/components/AppLayout"
import { ClaimForm } from "@/components/ClaimForm"
import { AdjudicationResult } from "@/components/AdjudicationResult"
import { ArrowLeft } from "lucide-react"

export default function NewClaimPage() {
    const [result, setResult] = React.useState<any>(null)

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto py-8">

                {!result && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">New Claim Submission</h1>
                        <p className="text-slate-500">Upload documents for AI-powered adjudication.</p>
                    </div>
                )}

                {result ? (
                    <div className="space-y-6">
                        <button
                            onClick={() => setResult(null)}
                            className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> Submit Another Claim
                        </button>
                        <AdjudicationResult data={result} />
                    </div>
                ) : (
                    <ClaimForm onSuccess={setResult} />
                )}

            </div>
        </AppLayout>
    )
}
