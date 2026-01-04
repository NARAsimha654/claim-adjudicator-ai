"use client"

import React, { useState } from "react"
import { AppLayout } from "@/components/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, ArrowRight, ShieldCheck, Clock, XCircle } from "lucide-react"
import { AdjudicationResult } from "@/components/AdjudicationResult"

export default function TrackClaimPage() {
    const [claimId, setClaimId] = useState("")
    const [result, setResult] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!claimId) return

        setIsLoading(true)
        setError("")
        setResult(null)

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${API_URL}/claims/${claimId}`)
            if (!res.ok) throw new Error("Claim ID not found. Please check and try again.")
            const data = await res.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto py-12 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Track Your Claim</h1>
                    <p className="text-slate-500 text-lg">Enter your tracking ID to see the latest adjudication status.</p>
                </div>

                <form onSubmit={handleTrack} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            value={claimId}
                            onChange={(e) => setClaimId(e.target.value.toUpperCase())}
                            placeholder="e.g. CLM-A1B2C3D4"
                            className="h-14 pl-12 text-lg border-2 border-slate-100 focus:border-indigo-500 rounded-2xl"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-2xl"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
                    </Button>
                </form>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tracking Results</h2>
                            <p className="text-xs text-slate-400">Last updated: {new Date(result.created_at).toLocaleString()}</p>
                        </div>
                        <AdjudicationResult data={result.decision} />
                    </div>
                )}

                {!result && !isLoading && !error && (
                    <div className="grid grid-cols-3 gap-6 pt-12">
                        {[
                            { icon: ShieldCheck, label: "Secure", sub: "AES-256 Encrypted" },
                            { icon: Clock, label: "Live", sub: "Real-time updates" },
                            { icon: ArrowRight, label: "Fast", sub: "Instant AI checks" }
                        ].map((item, i) => (
                            <div key={i} className="text-center space-y-2">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <item.icon className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
