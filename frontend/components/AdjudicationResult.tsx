"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdjudicationResponse } from "@/lib/api"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { Mail, Phone, Send, Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
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

    const getStatusColor = (verdict: string) => {
        switch (verdict) {
            case "APPROVED": return "bg-green-100 text-green-800 border-green-200"
            case "REJECTED": return "bg-red-100 text-red-800 border-red-200"
            case "MANUAL_REVIEW": return "bg-yellow-100 text-yellow-800 border-yellow-200"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getIcon = (verdict: string) => {
        switch (verdict) {
            case "APPROVED": return <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
            case "REJECTED": return <XCircle className="w-12 h-12 text-red-600 mb-4" />
            default: return <AlertTriangle className="w-12 h-12 text-yellow-600 mb-4" />
        }
    }

    // Guest Landing for Manual Review
    if (role === "guest" && data.verdict === "MANUAL_REVIEW") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto"
            >
                <Card className="border-t-8 border-yellow-500 shadow-2xl overflow-hidden">
                    <CardContent className="p-10 text-center">
                        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-yellow-600" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Under Review</h2>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            Our AI detected some ambiguities in your bill. A senior member of our
                            medical team will manually verify these details to ensure you get the maximum possible benefit.
                        </p>

                        {!isSubmitted ? (
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-left">
                                <h4 className="font-semibold text-slate-800 mb-2">How should we reach you?</h4>
                                <p className="text-sm text-slate-500 mb-6">Enter your contact details and we'll update you within 24 hours.</p>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <Input
                                            placeholder="Email or Phone Number"
                                            className="pl-11 h-12 text-lg"
                                            value={contactInfo}
                                            onChange={(e) => setContactInfo(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => setIsSubmitted(true)}
                                        disabled={!contactInfo}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg group"
                                    >
                                        Request Follow-up
                                        <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in duration-500 bg-green-50 p-8 rounded-2xl border border-green-100">
                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-green-900 mb-2">Thank you!</h4>
                                <p className="text-green-700">We've saved your info. Claim reference: <strong>{data.claim_id}</strong></p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    const handleDownload = () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        window.open(`${API_URL}/claims/${data.claim_id}/pdf`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-6"
        >
            {/* Hero Decision Card */}
            <Card className="overflow-hidden border-t-8 relative" style={{
                borderColor: data.verdict === 'APPROVED' ? '#22c55e' : data.verdict === 'REJECTED' ? '#ef4444' : '#eab308'
            }}>
                <div className="absolute top-4 right-4 z-10">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="shadow-sm">
                        Download PDF
                    </Button>
                </div>
                <CardContent className="pt-8 text-center bg-gradient-to-b from-white to-gray-50/50">
                    <div className="flex flex-col items-center">
                        {getIcon(data.verdict)}
                        <Badge className={cn("text-lg px-4 py-1 mb-2", getStatusColor(data.verdict))}>
                            {data.verdict.replace('_', ' ')}
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            ₹ {data.approved_amount.toLocaleString()}
                        </h2>
                        <p className="text-muted-foreground mt-1">Approved Amount</p>

                        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Confidence</span>
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        data.confidence_score > 0.8 ? "bg-green-500" : data.confidence_score > 0.5 ? "bg-amber-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${data.confidence_score * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{Math.round(data.confidence_score * 100)}%</span>
                        </div>

                        {(data.next_steps || data.notes) && (
                            <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-lg w-full text-left text-sm">
                                {data.notes && <p className="font-semibold text-gray-700">{data.notes}</p>}
                                {data.next_steps && <p className="text-gray-500 mt-1">{data.next_steps}</p>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between font-medium">
                            <span>Total Claimed</span>
                            <span>₹ {data.claimed_amount.toLocaleString()}</span>
                        </div>

                        {data.deductions.length > 0 && (
                            <div className="border-t pt-3 space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Deductions</p>
                                {data.deductions.map((d, i) => (
                                    <div key={i} className="flex justify-between text-sm text-red-600">
                                        <span>- {d.reason}</span>
                                        <span>₹ {d.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-lg border-t pt-3">
                            <span>Net Approved</span>
                            <span className="text-green-600">₹ {data.approved_amount.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Rejection Reasons & Trace */}
                <Card>
                    <CardHeader>
                        <CardTitle>Decision Logic</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.rejection_reasons.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-red-800 uppercase">Rejection Reasons</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    {data.rejection_reasons.map((r, i) => (
                                        <li key={i} className="text-sm text-red-600">{r}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-green-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> No rejection reasons implementation.
                            </p>
                        )}

                        <div className="mt-6 border-t pt-4">
                            <button
                                onClick={() => setShowTrace(!showTrace)}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                                <span>Full Decision Trace</span>
                                {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {showTrace && (
                                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                    {data.decision_trace.map((step, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                            <div className={cn("w-2 h-2 mt-1 rounded-full flex-shrink-0", step.status === 'PASS' ? 'bg-green-500' : 'bg-red-500', step.status === 'FLAG' && 'bg-yellow-500')} />
                                            <div>
                                                <span className="font-semibold">{step.step}:</span> <span className="text-gray-600">{step.reason}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
