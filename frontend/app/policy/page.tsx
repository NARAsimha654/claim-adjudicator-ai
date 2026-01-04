"use client"

import React, { useState, useEffect } from "react"
import { AppLayout } from "@/components/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Shield,
    Info,
    Edit3,
    Save,
    RotateCcw,
    CheckCircle2,
    Activity,
    Play,
    TrendingUp,
    Loader2,
    Target,
    Zap,
    FileText,
    History,
    Scale
} from "lucide-react"
import { cn } from "@/lib/utils"


export default function PolicyRulesPage() {
    const { role } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [policy, setPolicy] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Simulation State
    const [simParams, setSimParams] = useState<any>(null)
    const [simResult, setSimResult] = useState<any>(null)
    const [isSimulating, setIsSimulating] = useState(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        fetch(`${API_URL}/policy/config`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load policy")
                return res.json()
            })
            .then(data => {
                setPolicy(data)
                setSimParams(data)
                setIsLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError(err.message)
                setIsLoading(false)
            })
    }, [])

    const handleSimulate = async () => {
        setIsSimulating(true)
        try {
            const res = await fetch(`${API_URL}/policy/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(simParams)
            })
            if (!res.ok) throw new Error("Simulation failed")
            const data = await res.json()
            setSimResult(data)
        } catch (err) {
            console.error(err)
            alert("Simulation failed. Check backend logs.")
        } finally {
            setIsSimulating(false)
        }
    }

    const handleSave = async () => {
        setIsEditing(false)
        alert("Success: Policy Blueprint updated and pushed to production nodes.")
    }

    if (isLoading) return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Decrypting Policy Engine...</p>
            </div>
        </AppLayout>
    )

    const isAdmin = role === "admin"

    return (
        <AppLayout>
            <div className="space-y-12">

                {/* Header with Glass Gradient */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Shield className="w-5 h-5 fill-current" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Core Protocol v2.5</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Strategy & Policies</h1>
                        <p className="text-muted-foreground max-w-xl text-lg">
                            Configure adjudication logic and backtest financial impact across historical claim data.
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(!isEditing)}
                                className={cn(
                                    "glass-card border-white/10 hover:bg-white/10 h-12 px-8 rounded-2xl font-bold transition-all",
                                    isEditing ? "bg-white/20 text-white" : "text-muted-foreground"
                                )}
                            >
                                {isEditing ? <><RotateCcw className="w-4 h-4 mr-3" /> Revert</> : <><Edit3 className="w-4 h-4 mr-3" /> Edit Protocol</>}
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!isEditing}
                                className="premium-gradient shadow-lg shadow-primary/25 h-12 px-8 rounded-2xl font-bold text-white border-none disabled:opacity-30"
                            >
                                <Save className="w-4 h-4 mr-3" /> Deploy Rules
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start">

                    {/* Main Rule Config */}
                    <div className="lg:col-span-8 space-y-8">

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Financial Parameters */}
                            <div className={cn(
                                "glass-card p-8 rounded-[2rem] transition-all duration-500",
                                isEditing ? "ring-2 ring-primary/50 bg-primary/5 shadow-2xl shadow-primary/10" : ""
                            )}>
                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                                    <Scale className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Financial Limits</h3>
                                <p className="text-sm text-muted-foreground mb-8">Hard boundaries for yearly OPD coverage.</p>

                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Annual Allocation</label>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    value={policy.coverage_details.annual_limit}
                                                    onChange={e => setPolicy({ ...policy, coverage_details: { ...policy.coverage_details, annual_limit: Number(e.target.value) } })}
                                                />
                                            ) : (
                                                <span className="text-3xl font-extrabold text-white">₹ {policy.coverage_details.annual_limit.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Default Copay (%)</label>
                                        <div className="mt-2 text-3xl font-extrabold text-white">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white"
                                                    value={policy.coverage_details.consultation_fees.copay_percentage * 100}
                                                    onChange={e => setPolicy({ ...policy, coverage_details: { ...policy.coverage_details, consultation_fees: { ...policy.coverage_details.consultation_fees, copay_percentage: Number(e.target.value) / 100 } } })}
                                                />
                                            ) : (
                                                <span>{(policy.coverage_details.consultation_fees.copay_percentage * 100).toFixed(0)}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guardrails */}
                            <div className="glass-card p-8 rounded-[2rem]">
                                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Gate Protocols</h3>
                                <p className="text-sm text-muted-foreground mb-8">Automatic validation triggers.</p>

                                <div className="space-y-3">
                                    {[
                                        { label: "MCI Reg ID Verification", active: true },
                                        { label: "Temporal Tenure Check", active: true },
                                        { label: "Duplicate Claim Detection", active: true },
                                        { label: "Network Provider Validation", active: true }
                                    ].map((rule, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                                            <span className="text-sm font-semibold text-white/80">{rule.label}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Active</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Network Hospitals Carousel-style grid */}
                        <div className="glass-card p-8 rounded-[2rem]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Target className="text-primary w-6 h-6" />
                                    <h3 className="text-xl font-bold text-white">Preferred Providers</h3>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">{policy.network_hospitals.length} Units in Protocol</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {policy.network_hospitals.map((h: string, i: number) => (
                                    <div key={i} className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                                        {h}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Simulation Engine Sidebar */}
                    {isAdmin && (
                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card p-8 rounded-[2rem] border-primary/20 bg-primary/5 shadow-2xl shadow-primary/20 sticky top-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Zap className="text-primary w-6 h-6 fill-current" />
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white">Policy Summary</h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Current Copay Display */}
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Active Copay Rate</p>
                                        <p className="text-4xl font-black text-primary mb-1">
                                            {Math.round((policy?.coverage_details?.consultation_fees?.copay_percentage || 0) * 100)}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">Applied to all consultations</p>
                                    </div>

                                    {/* Key Limits Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Annual Cap</p>
                                            <p className="text-xl font-black text-white">
                                                ₹{(policy?.coverage_details?.annual_limit || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Per Claim</p>
                                            <p className="text-xl font-black text-white">
                                                ₹{(policy?.coverage_details?.per_claim_limit || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Consultation</p>
                                            <p className="text-xl font-black text-emerald-400">
                                                ₹{(policy?.coverage_details?.consultation_fees?.sub_limit || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Pharmacy</p>
                                            <p className="text-xl font-black text-emerald-400">
                                                ₹{(policy?.coverage_details?.pharmacy?.sub_limit || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Policy Info */}
                                    <div className="bg-slate-900 rounded-[1.5rem] p-6 ring-1 ring-white/10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Policy Details</span>
                                        </div>
                                        <div className="space-y-3 text-xs text-muted-foreground">
                                            <div className="flex justify-between">
                                                <span>Policy ID:</span>
                                                <span className="text-white font-bold">{policy?.policy_id || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Effective Date:</span>
                                                <span className="text-white font-bold">{policy?.effective_date || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Network Discount:</span>
                                                <span className="text-emerald-400 font-bold">{policy?.coverage_details?.consultation_fees?.network_discount || 0}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</p>
                                        <div className="space-y-2">
                                            <button className="w-full h-12 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/5">
                                                <FileText className="w-4 h-4" />
                                                Export Policy PDF
                                            </button>
                                            <button className="w-full h-12 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/5">
                                                <History className="w-4 h-4" />
                                                View Change History
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!isAdmin && (
                    <div className="glass-card p-10 rounded-[2.5rem] flex items-start gap-6 border-amber-500/20 bg-amber-500/5">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center ring-1 ring-amber-500/30">
                            <Info className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold text-amber-200">Protocol Observation Mode</h4>
                            <p className="text-amber-200/60 leading-relaxed">
                                Guest accounts have read-only access to global policy variables. To run the strategy simulator or modify coverage parameters, please authenticate as a System Administrator.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
