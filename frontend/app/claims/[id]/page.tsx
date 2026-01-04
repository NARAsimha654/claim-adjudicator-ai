"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    FileText,
    Database,
    Activity,
    Lock,
    Scale,
    Trash2,
    Save
} from "lucide-react"
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
            alert("Protocol Violation: Manual override requires justificaton logs.")
            return
        }

        setIsUpdating(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        try {
            const formData = new FormData()
            formData.append("verdict", verdict)
            formData.append("notes", notes)

            const res = await fetch(`${API_URL}/claims/${id}/review`, {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                alert(`SUCCESS: Node updated. Verdict ${verdict} synced to ledger.`)
                fetchClaim()
                router.push('/dashboard')
            } else {
                alert("NODE_SYNC_FAILED: Could not persist override.")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) return (
        <AppLayout hideSidebar>
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#020617]">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <Activity className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-muted-foreground animate-pulse font-bold tracking-[0.2em] uppercase text-xs">Authenticating Vault Access...</p>
            </div>
        </AppLayout>
    )

    if (!claim) return (
        <AppLayout hideSidebar>
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
                <ShieldAlert className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Access Denied</h2>
                <p className="text-muted-foreground mb-8 uppercase tracking-widest text-[10px] font-black">Reference ID Not Found in Distributed Ledger</p>
                <Button onClick={() => router.push('/dashboard')} className="premium-gradient px-8 h-12 rounded-xl text-white font-bold uppercase tracking-widest border-none">Return to Nexus</Button>
            </div>
        </AppLayout>
    )

    const insights = claim.claim_data.multi_doc_insights

    return (
        <AppLayout hideSidebar={true}>
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[#020617]">

                {/* Tactical Header */}
                <header className="h-24 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-10 shrink-0 z-50 backdrop-blur-3xl">
                    <div className="flex items-center gap-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/dashboard')}
                            className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="font-black text-xl text-white italic tracking-tighter">{claim.claim_id}</h1>
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1">Secure Audit Workspace</Badge>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Operator: System Admin • Node: ADJ-NORTH-1</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mr-4">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white rounded-xl h-12 px-6 font-bold hover:bg-white/10"
                            onClick={() => router.push('/dashboard')}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Abort Audit
                        </Button>
                        <Button
                            className="premium-gradient text-white rounded-xl h-12 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 border-none"
                            onClick={() => handleOverride("APPROVED")}
                        >
                            <Save className="w-4 h-4 mr-3" /> Commit Changes
                        </Button>
                    </div>
                </header>

                {/* Audit Vault Split Workspace */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Source Container (Left) */}
                    <div className="w-[55%] border-r border-white/5 overflow-y-auto bg-black/40 p-12 scrollbar-none">
                        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary w-5 h-5" />
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Document Evidence Core</h3>
                                </div>
                                <Badge variant="outline" className="border-white/10 bg-white/5 text-white text-[10px] uppercase font-bold px-3">{claim.claim_data.submission_files.length} Fragments Identified</Badge>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-indigo-500/30 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-[#0a0f1e] rounded-[2.5rem] border border-white/5 p-16 font-mono text-sm leading-[2] text-slate-300 selection:bg-primary/30 min-h-[800px] shadow-2xl overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                                    <p className="whitespace-pre-wrap leading-loose">
                                        {rawText || "// SYTEM_ERR: Evidence text unavailable for current fragment."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logic Container (Right) */}
                    <div className="w-[45%] overflow-y-auto bg-[#020617] p-12 scrollbar-none">
                        <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">

                            {/* Risk Insights Panel */}
                            {insights && (
                                <div className="glass-card p-8 rounded-[2rem] border-amber-500/20 bg-amber-500/[0.03] space-y-6">
                                    <div className="flex items-center gap-3 text-amber-500 font-black text-xs uppercase tracking-widest">
                                        <ShieldAlert className="w-5 h-5" /> Neural Anomalies
                                    </div>
                                    <div className="space-y-4">
                                        {insights.detected_fraud_signals.map((s: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                                <span className="text-amber-500 font-bold">!</span>
                                                <p className="text-xs font-medium text-amber-200/70 leading-relaxed uppercase">{s}</p>
                                            </div>
                                        ))}
                                        {!insights.prescription_found && (
                                            <div className="flex gap-4 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                                <span className="text-rose-500 font-bold">X</span>
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-relaxed">PRESCRIPTION_FRAGMENT_MISSING: Audit Risk Critical</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Data Reconciliation Form */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-3">
                                    <Database className="text-primary w-5 h-5" />
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Reconciliation Parameters</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <TacticalInput
                                        label="Patient Identifier"
                                        value={editableData?.patient_name}
                                        onChange={(value) => setEditableData({ ...editableData, patient_name: value })}
                                    />
                                    <TacticalInput
                                        label="Clinical Diagnosis"
                                        value={editableData?.diagnosis}
                                        onChange={(value) => setEditableData({ ...editableData, diagnosis: value })}
                                    />
                                    <TacticalInput
                                        label="Adjudicated Hospital"
                                        value={editableData?.hospital_name}
                                        onChange={(value) => setEditableData({ ...editableData, hospital_name: value })}
                                        error={claim.claim_data.multi_doc_insights?.hospital_consistency_check === "FAIL"}
                                    />
                                    <TacticalInput
                                        label="Timestamp"
                                        type="date"
                                        value={editableData?.treatment_date}
                                        onChange={(value) => setEditableData({ ...editableData, treatment_date: value })}
                                    />
                                </div>
                            </div>

                            {/* Protocol Override Panel */}
                            <div className="space-y-8 pt-12 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <Scale className="text-primary w-5 h-5" />
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Manual Decision Engine</h3>
                                </div>

                                <textarea
                                    className="w-full min-h-[160px] rounded-[1.5rem] bg-white/5 border border-white/10 p-6 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-muted-foreground/30 font-medium"
                                    placeholder="Enter exhaustive audit justification for ledger persistence..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Button
                                        variant="outline"
                                        className="h-16 rounded-[1.2rem] border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px]"
                                        onClick={() => handleOverride("REJECTED")}
                                    >
                                        <XCircle className="w-5 h-5 mr-3" /> Execute Rejection
                                    </Button>
                                    <Button
                                        className="h-16 rounded-[1.2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20"
                                        onClick={() => handleOverride("APPROVED")}
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-3" /> Authorize Payment
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

function TacticalInput({ label, value, onChange, type = "text", error = false }: { label: string; value?: string; onChange: (value: string) => void; type?: string; error?: boolean }) {
    return (
        <div className="space-y-3 group">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{label}</label>
            <Input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "h-14 bg-white/5 border-white/10 rounded-xl text-white font-bold px-5 placeholder:text-muted-foreground/20 focus:ring-primary/50",
                    error ? "border-rose-500/50 bg-rose-500/5 text-rose-400" : "",
                    !value && "border-amber-500/30 bg-amber-500/5"
                )}
            />
        </div>
    )
}
