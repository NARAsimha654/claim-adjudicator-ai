"use client"

import * as React from "react"
import { AppLayout } from "@/components/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Filter } from "lucide-react"
import Link from "next/link"

export default function ClaimHistoryPage() {
    const [claims, setClaims] = React.useState<any[]>([])
    const [search, setSearch] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        fetch(`${API_URL}/claims`)
            .then(res => res.json())
            .then(data => {
                // Sort by date desc
                setClaims(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
                setIsLoading(false)
            })
            .catch(err => setIsLoading(false))
    }, [])

    const filtered = claims.filter(c =>
        c.claim_id.toLowerCase().includes(search.toLowerCase()) ||
        c.patient_name.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "success"
            case "REJECTED": return "destructive"
            case "MANUAL_REVIEW": return "warning"
            default: return "secondary"
        }
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Claim History</h1>
                        <p className="text-slate-500">View and manage all submitted claims.</p>
                    </div>
                    <Link href="/claims/new">
                        <Button>+ New Claim</Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID or Patient Name..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Table List */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Claim ID</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((claim) => (
                                <tr key={claim.claim_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{claim.claim_id}</td>
                                    <td className="px-6 py-4 text-slate-600">{claim.patient_name}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusColor(claim.decision.verdict) as any}>
                                            {claim.decision.verdict.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        ₹ {claim.claim_data.total_claimed_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(claim.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/claims/${claim.claim_id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No claims found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
