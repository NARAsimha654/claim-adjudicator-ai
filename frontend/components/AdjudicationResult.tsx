"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { AdjudicationResponse } from "@/lib/api"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import {
    Mail,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Download,
    FileText,
    ShieldCheck,
    BarChart3
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ResultProps {
    data: AdjudicationResponse
}

export function AdjudicationResult({ data }: ResultProps) {
    const [showTrace, setShowTrace] = React.useState(false)
    const [contactInfo, setContactInfo] = React.useState("")
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const { role } = useAuth()

    const getStatusTheme = (verdict: string) => {
        switch (verdict) {
            case "APPROVED": return {
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                glow: "shadow-emerald-500/20",
                icon: <CheckCircle className="w-16 h-16 text-emerald-400" />
            }
            case "REJECTED": return {
                color: "text-rose-400",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20",
                glow: "shadow-rose-500/20",
                icon: <XCircle className="w-16 h-16 text-rose-400" />
            }
            default: return {
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                glow: "shadow-amber-500/20",
                icon: <Clock className="w-16 h-16 text-amber-400" />
            }
        }
    }

    const theme = getStatusTheme(data.verdict)

    if (role === "guest" && data.verdict === "MANUAL_REVIEW") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto"
            >
                <div className="glass-card rounded-[2.5rem] border-t-8 border-amber-500/50 p-12 text-center">
                    <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-1 ring-amber-500/20">
                        <Clock className="w-12 h-12 text-amber-500" />
                    </div>

                    <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Strategy Pending</h2>
                    <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                        Our AI has flagged complexities in this claim. A senior medical analyst will perform a side-by-side audit to ensure maximum accuracy.
                    </p>

                    {!isSubmitted ? (
                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-left space-y-6">
                            <div>
                                <h4 className="font-bold text-white mb-1">Deployment Notification</h4>
                                <p className="text-xs text-muted-foreground">Enter your secure handle for status updates.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Email or Encrypted ID"
                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-lg text-white placeholder:text-muted-foreground/30 focus:ring-primary/50"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={() => setIsSubmitted(true)}
                                    disabled={!contactInfo}
                                    className="w-full h-14 premium-gradient rounded-xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                                >
                                    Activate Alert
                                    <Send className="ml-3 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-500 bg-primary/10 p-10 rounded-[2rem] border border-primary/20">
                            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                            <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Verified</h4>
                            <p className="text-muted-foreground">Protocol ID: <span className="text-white font-mono">{data.claim_id}</span></p>
                        </div>
                    )}
                </div>
            </motion.div>
        )
    }

    const handleDownload = () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        window.open(`${API_URL}/claims/${data.claim_id}/pdf`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto space-y-8 pb-20"
        >
            {/* Verdict Hero Card */}
            <div className={cn(
                "glass-card rounded-[3rem] overflow-hidden border-t-[12px] relative transition-all duration-700",
                theme.border,
                theme.glow
            )}>
                <div className="absolute top-8 right-8 z-10">
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl h-12 px-6 font-bold text-white shadow-xl backdrop-blur-md"
                    >
                        <Download className="w-4 h-4 mr-2" /> Settlement PDF
                    </Button>
                </div>

                <div className="p-12 md:p-16 text-center space-y-8 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex flex-col items-center">
                        <div className="mb-8 p-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner">
                            {theme.icon}
                        </div>

                        <div className={cn("px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4 shadow-sm border", theme.bg, theme.color, theme.border)}>
                            {data.verdict.replace('_', ' ')}
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-6xl font-black tracking-tighter text-white">
                                ₹{data.approved_amount.toLocaleString()}
                            </h2>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Certified Settlement Amount</p>
                        </div>

                        {/* Confidence Meter */}
                        <div className="mt-10 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Audit Confidence</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.confidence_score * 100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]",
                                            data.confidence_score > 0.8 ? "bg-emerald-500" : data.confidence_score > 0.5 ? "bg-amber-500" : "bg-rose-500"
                                        )}
                                    />
                                </div>
                                <span className="text-sm font-black text-white">{Math.round(data.confidence_score * 100)}%</span>
                            </div>
                        </div>

                        {(data.next_steps || data.notes) && (
                            <div className="mt-12 glass-card border-white/5 p-6 rounded-2xl max-w-xl w-full text-left bg-white/[0.02]">
                                {data.notes && <p className="text-sm font-bold text-white mb-1">Note: {data.notes}</p>}
                                {data.next_steps && <p className="text-xs text-muted-foreground leading-relaxed italic">"{data.next_steps}"</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Financial Ledger */}
                <div className="glass-card p-10 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="text-primary w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Settlement Ledger</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                            <span className="text-sm font-semibold text-muted-foreground font-mono">GROSS_CLAIM</span>
                            <span className="text-xl font-bold text-white">₹{data.claimed_amount.toLocaleString()}</span>
                        </div>

                        {data.deductions.length > 0 && (
                            <div className="py-2 space-y-4">
                                {data.deductions.map((d, i) => (
                                    <div key={i} className="flex justify-between items-start group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-tighter">Adjustment</span>
                                            <span className="text-sm font-medium text-muted-foreground group-hover:text-rose-400 transition-colors uppercase">{d.reason}</span>
                                        </div>
                                        <span className="text-sm font-bold text-rose-500">-₹{d.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center py-6 border-t-[3px] border-white/5 mt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Final Outcome</span>
                                <span className="text-2xl font-black text-white">NET_APPROVED</span>
                            </div>
                            <span className="text-4xl font-black text-emerald-400">₹{data.approved_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Audit Trace & Decisions */}
                <div className="glass-card p-10 rounded-[2.5rem] flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <FileText className="text-primary w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Adjudication Protocol</h3>
                    </div>

                    <div className="flex-1 space-y-6">
                        {data.rejection_reasons.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Protocol Failures</p>
                                <div className="space-y-3">
                                    {data.rejection_reasons.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                            <span className="text-sm font-bold text-rose-500 italic">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3 font-bold text-emerald-400 text-sm">
                                <ShieldCheck className="w-5 h-5" />
                                All Protocol Rules Satisfied
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => setShowTrace(!showTrace)}
                                className="flex items-center justify-between w-full h-14 px-6 bg-white/5 rounded-2xl border border-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all"
                            >
                                <span className="uppercase tracking-widest">Full Execution Log</span>
                                {showTrace ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>

                            {showTrace && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    {data.decision_trace.map((step, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className={cn(
                                                "w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 shadow-sm",
                                                step.status === 'PASS' ? 'bg-emerald-500 shadow-emerald-500/50' : step.status === 'FLAG' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-rose-500 shadow-rose-500/50'
                                            )} />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{step.step}</p>
                                                <p className="text-sm font-medium text-white/80 leading-relaxed uppercase">{step.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
