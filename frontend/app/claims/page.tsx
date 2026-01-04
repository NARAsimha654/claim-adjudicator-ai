"use client"

import * as React from "react"
import { AppLayout } from "@/components/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Filter, FileText, Activity, ShieldCheck, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const VERDICT_THEMES = {
    APPROVED: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        icon: <CheckCircle2 className="w-3 h-3" />
    },
    REJECTED: {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/20",
        icon: <XCircle className="w-3 h-3" />
    },
    MANUAL_REVIEW: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        icon: <Clock className="w-3 h-3" />
    },
};

export default function ClaimHistoryPage() {
    const [claims, setClaims] = React.useState<any[]>([])
    const [search, setSearch] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        fetch(`${API_URL}/claims`)
            .then(res => res.json())
            .then(data => {
                setClaims(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
                setIsLoading(false)
            })
            .catch(err => setIsLoading(false))
    }, [])

    const filtered = claims.filter(c =>
        c.claim_id.toLowerCase().includes(search.toLowerCase()) ||
        c.patient_name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AppLayout>
            <div className="space-y-10 animate-slide-up">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Activity className="w-5 h-5 fill-current" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Synchronization Active</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Secure Claim Ledger</h1>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Real-time audit history of all adjudicated claims within the Plum network.
                        </p>
                    </div>
                    <Link href="/claims/new">
                        <Button className="premium-gradient h-14 px-8 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30 border-none hover:scale-105 transition-all">
                            + Initialize Claim
                        </Button>
                    </Link>
                </div>

                {/* Tactical Search & Filters */}
                <div className="glass-card p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search Ledger ID, Patient Name, or Clinical Code..."
                            className="bg-white/5 border-white/5 pl-12 h-14 rounded-2xl text-white placeholder:text-muted-foreground/30 focus:ring-primary/50 text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" className="h-14 w-14 rounded-2xl bg-white/5 border-white/5 text-white hover:bg-white/10">
                            <Filter className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="flex-1 md:flex-none h-14 px-6 rounded-2xl bg-white/5 border-white/10 text-white font-bold hover:bg-white/10">
                            Export PDF Report
                        </Button>
                    </div>
                </div>

                {/* High-Fidelity Table List */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">ID / Fragment</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Patient Entity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Adjudication Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Settlement (₹)</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Sync Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Nexus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((claim) => {
                                    const theme = VERDICT_THEMES[claim.decision.verdict as keyof typeof VERDICT_THEMES] || VERDICT_THEMES.MANUAL_REVIEW;
                                    return (
                                        <tr key={claim.claim_id} className="group hover:bg-white/[0.03] transition-all cursor-pointer" onClick={() => (window.location.href = `/claims/${claim.claim_id}`)}>
                                            <td className="px-8 py-6 font-mono text-sm text-white group-hover:text-primary transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                                                    {claim.claim_id}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white">{claim.patient_name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Verified Member</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                                                    theme.bg, theme.text, theme.border
                                                )}>
                                                    <Activity className="w-3 h-3" />
                                                    {claim.decision.verdict.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-white text-base font-mono">
                                                ₹{claim.claim_data.total_claimed_amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white/70">{new Date(claim.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black">{new Date(claim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Link href={`/claims/${claim.claim_id}`}>
                                                    <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white text-muted-foreground transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filtered.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-32 text-center space-y-4">
                                            <ShieldCheck className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                                                No Matching Records in Current Workspace
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

function XCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    )
}
