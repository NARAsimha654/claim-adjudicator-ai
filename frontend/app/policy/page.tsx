"use client"

import React, { useState, useEffect } from "react"
import { AppLayout } from "@/components/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Info, Edit3, Save, RotateCcw, CheckCircle2, Activity, Play, TrendingUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PolicyRulesPage() {
    const { role } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [policy, setPolicy] = useState<any>({ max_opd_limit: 0, copay_percentage: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Simulation State
    const [simParams, setSimParams] = useState<any>({ copay_percentage: 0 })
    const [simResult, setSimResult] = useState<any>(null)
    const [isSimulating, setIsSimulating] = useState(false)

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        fetch(`${API_URL}/policy/config`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load policy")
                return res.json()
            })
            .then(data => {
                setPolicy(data)
                setSimParams(data) // Initialize with current policy
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        try {
            const res = await fetch(`${API_URL}/policy/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(simParams)
            })
            const data = await res.json()
            setSimResult(data)
        } catch (err) {
            console.error("Simulation failed", err)
        } finally {
            setIsSimulating(false)
        }
    }

    if (isLoading) return <AppLayout><div className="flex items-center justify-center min-h-[400px]">Loading Policy Rules...</div></AppLayout>

    if (error || !policy) return (
        <AppLayout>
            <div className="p-8 text-center bg-red-50 border border-red-100 rounded-3xl">
                <h2 className="text-xl font-bold text-red-900">Oops! Something went wrong</h2>
                <p className="text-red-700 mt-2">{error || "Could not retrieve policy data."}</p>
                <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">Retry</Button>
            </div>
        </AppLayout>
    )

    const handleSave = async () => {
        setIsEditing(false)
        alert("Policy saved locally (Simulation)")
    }

    const isAdmin = role === "admin"

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Policy Rules & Strategy</h1>
                        <p className="text-slate-500">2026 Outpatient Department (OPD) Coverage Parameters</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleSimulate}
                                className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 h-11 px-6 rounded-xl"
                            >
                                <Activity className="w-4 h-4 mr-2" /> Simulation Mode
                            </Button>
                            <Button
                                variant={isEditing ? "outline" : "default"}
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-slate-900 hover:bg-slate-800 h-11 px-6 rounded-xl"
                            >
                                {isEditing ? <><RotateCcw className="w-4 h-4 mr-2" /> Cancel</> : <><Edit3 className="w-4 h-4 mr-2" /> Edit Rules</>}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start text-xs font-bold text-slate-500 uppercase">
                    {/* Left Side: Policy Rules */}
                    <div className={isAdmin ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Financial Limits */}
                            <Card className={isEditing ? "border-indigo-200 ring-2 ring-indigo-50" : ""}>
                                <CardHeader>
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-2">
                                        <Shield className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <CardTitle>Financial Coverage</CardTitle>
                                    <CardDescription>Hard limits for OPD claims per policy year.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Annual OPD Limit</Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={policy.max_opd_limit || 0}
                                                onChange={e => setPolicy({ ...policy, max_opd_limit: Number(e.target.value) })}
                                            />
                                        ) : (
                                            <div className="text-2xl font-bold">₹ {policy.max_opd_limit?.toLocaleString() || "0"}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Copay Percentage (%)</Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={(policy.copay_percentage || 0) * 100}
                                                onChange={e => setPolicy({ ...policy, copay_percentage: Number(e.target.value) / 100 })}
                                            />
                                        ) : (
                                            <div className="text-2xl font-bold">{((policy.copay_percentage || 0) * 100).toFixed(0)}%</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Eligibility Rules */}
                            <Card>
                                <CardHeader>
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-2">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    </div>
                                    <CardTitle>Eligibility Gates</CardTitle>
                                    <CardDescription>Rules that trigger automatic rejection.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { label: "Active Policy Check", active: true },
                                        { label: "Valid Doctor MCI ID", active: true },
                                        { label: "Within Policy Tenure", active: true },
                                        { label: "Member Relationship Match", active: true }
                                    ].map((rule, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <span className="text-sm font-medium">{rule.label}</span>
                                            <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Side: Simulation Panel (Admin Only) */}
                    {isAdmin && (
                        <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <Card className="border-t-4 border-indigo-600 shadow-xl bg-white sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Backtesting Strategy</CardTitle>
                                    <CardDescription>Simulate impact on historical claims</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-700">Proposed Copay (%)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="0" max="50" step="5"
                                                value={(simParams?.copay_percentage || 0) * 100}
                                                onChange={e => setSimParams({ ...simParams, copay_percentage: parseInt(e.target.value) / 100 })}
                                                className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <span className="text-sm font-mono font-bold w-10">{Math.round((simParams?.copay_percentage || 0) * 100)}%</span>
                                        </div>
                                    </div>

                                    <Button onClick={handleSimulate} disabled={isSimulating} className="w-full bg-indigo-600 h-12 rounded-xl text-white">
                                        {isSimulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                        Run Impact Analysis
                                    </Button>

                                    {simResult && (
                                        <div className="pt-6 border-t border-slate-100 space-y-4 animate-in fade-in duration-500">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                                    <p className="text-[10px] uppercase font-bold text-indigo-400">Net Impact</p>
                                                    <p className={cn("text-lg font-bold", simResult.net_impact_amount <= 0 ? "text-green-600" : "text-red-600")}>
                                                        {simResult.net_impact_amount > 0 ? "+" : ""}
                                                        ₹ {Math.abs(simResult.net_impact_amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Savings Change</p>
                                                    <p className={cn("text-lg font-bold", simResult.percentage_change <= 0 ? "text-green-600" : "text-red-600")}>
                                                        {simResult.percentage_change.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900 rounded-xl p-4 text-white">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Business Insight</span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    Increasing copay to {Math.round((simParams.copay_percentage) * 100)}% would have saved ₹ {Math.abs(simResult.net_impact_amount).toLocaleString()} across {simResult.total_claims_analyzed} historical claims.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-8">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-xl px-12 rounded-2xl h-14" onClick={handleSave}>
                            <Save className="w-5 h-5 mr-3" /> Save Changes
                        </Button>
                    </div>
                )}

                {!isAdmin && (
                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
                        <Info className="w-6 h-6 text-amber-600 shrink-0" />
                        <div>
                            <h4 className="font-bold text-amber-900">Guest View</h4>
                            <p className="text-amber-800 text-sm mt-1">
                                You are viewing the live policy engine configuration. Only administrative users can modify these parameters or run impact simulations.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
