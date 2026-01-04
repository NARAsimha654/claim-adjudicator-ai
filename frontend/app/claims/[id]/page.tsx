"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { AdjudicationResult } from "@/components/AdjudicationResult"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, CheckCircle2, XCircle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ClaimReviewPage() {
    const { id } = useParams()
    const router = useRouter()
    const [claim, setClaim] = React.useState<any>(null)
    const [rawText, setRawText] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [notes, setNotes] = React.useState("")

    // Editable state for AI data
    const [editableData, setEditableData] = React.useState<any>({})

    const fetchClaim = React.useCallback(async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        try {
            const [claimRes, textRes] = await Promise.all([
                fetch(`${API_URL}/claims/${id}`),
                fetch(`${API_URL}/claims/${id}/text`)
            ])
            const claimData = await claimRes.json()
            const textData = await textRes.json()

            setClaim(claimData)
            setRawText(textData.text)
            setEditableData(claimData.claim_data)
            setIsLoading(false)
        } catch (err) {
            console.error("Failed to fetch data", err)
            setIsLoading(false)
        }
    }, [id])

    React.useEffect(() => {
        fetchClaim()
    }, [fetchClaim])

    const handleOverride = async (verdict: string) => {
        if (!notes) {
            alert("Please provide notes for the manual override.")
            return
        }

        setIsUpdating(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        try {
            const formData = new FormData()
            formData.append("verdict", verdict)
            formData.append("notes", notes)
            // In a real app we'd also send the 'editableData' to update the claim_data

            const res = await fetch(`${API_URL}/claims/${id}/review`, {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                alert(`Claim successfully ${verdict.toLowerCase()}ed!`)
                fetchClaim()
            } else {
                alert("Failed to update claim")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) return <AppLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
    if (!claim) return <AppLayout><div className="text-center py-20"><h2 className="text-2xl font-bold">Claim Not Found</h2><Button onClick={() => router.push('/claims')}>Back</Button></div></AppLayout>

    const insights = claim.claim_data.multi_doc_insights

    return (
        <AppLayout hideSidebar={true}>
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
                {/* Top Toolbar */}
                <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/claims')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold text-lg">{claim.claim_id}</h1>
                        <Badge className="bg-amber-100 text-amber-700 uppercase text-[10px] font-bold tracking-wider">Review Mode</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push('/claims')}>Discard Changes</Button>
                        <Button size="sm" className="bg-indigo-600" onClick={() => handleOverride("APPROVED")}>Approve & Close</Button>
                    </div>
                </div>

                {/* Split Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Document View (The Source) */}
                    <div className="w-1/2 border-r border-slate-200 overflow-y-auto bg-slate-100 p-8">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Content</h3>
                                <Badge variant="outline" className="bg-white">{claim.claim_data.submission_files.length} Files</Badge>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 shadow-inner min-h-full font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 italic font-sans antialiased text-slate-800">
                                {rawText || "No text content available."}
                            </div>
                        </div>
                    </div>

                    {/* Right: Data Entry (The AI Extractions) */}
                    <div className="w-1/2 overflow-y-auto bg-white p-8">
                        <div className="max-w-2xl mx-auto space-y-8">

                            {/* Proactive Insights / Fraud Flags */}
                            {insights && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                                        <ShieldAlert className="w-5 h-5" /> AI Observations
                                    </div>
                                    <ul className="text-sm text-amber-800 space-y-2">
                                        {insights.detected_fraud_signals.map((s: string, i: number) => (
                                            <li key={i} className="flex gap-2">• {s}</li>
                                        ))}
                                        {!insights.prescription_found && (
                                            <li className="flex gap-2 font-bold text-red-700">• No Prescription document identified (Flagged)</li>
                                        )}
                                        {insights.unverified_items?.length > 0 && (
                                            <li key="unverified" className="flex gap-2 text-red-600 font-bold">
                                                • Items found on bill but NOT prescription: {insights.unverified_items.join(", ")}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Patient & Provider Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
                                        <Input
                                            value={editableData?.patient_name || ""}
                                            onChange={e => setEditableData({ ...editableData, patient_name: e.target.value })}
                                            className={cn(
                                                "h-12 border-slate-200 focus:ring-indigo-500",
                                                !editableData?.patient_name && "border-amber-500 bg-amber-50"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Diagnosis</label>
                                        <Input
                                            value={editableData?.diagnosis || ""}
                                            onChange={e => setEditableData({ ...editableData, diagnosis: e.target.value })}
                                            className={cn(
                                                "h-12 border-slate-200 focus:ring-indigo-500",
                                                !editableData?.diagnosis && "border-amber-500 bg-amber-50"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Hospital Name</label>
                                        <Input
                                            value={editableData?.hospital_name || ""}
                                            onChange={e => setEditableData({ ...editableData, hospital_name: e.target.value })}
                                            className={cn(
                                                "h-12 border-slate-200 focus:ring-indigo-500",
                                                claim.claim_data.multi_doc_insights?.hospital_consistency_check === "FAIL" && "border-red-500 bg-red-50 text-red-700"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Treatment Date</label>
                                        <Input
                                            type="date"
                                            value={editableData?.treatment_date || ""}
                                            onChange={e => setEditableData({ ...editableData, treatment_date: e.target.value })}
                                            className="h-12 border-slate-200 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900">Review Actions</h3>
                                <textarea
                                    className="w-full min-h-[100px] rounded-xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Add manual review notes here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-14 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleOverride("REJECTED")}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" /> Reject Claim
                                    </Button>
                                    <Button
                                        className="h-14 rounded-xl bg-green-600 hover:bg-green-700"
                                        onClick={() => handleOverride("APPROVED")}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
