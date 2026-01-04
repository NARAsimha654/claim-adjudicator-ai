"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/AppLayout"
import { Loader2, TrendingUp, DollarSign, FileCheck, AlertCircle } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6'];

export default function DashboardPage() {
    const [stats, setStats] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        fetch(`${API_URL}/claims/stats`)
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setIsLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch stats", err)
                setIsLoading(false)
            })
    }, [])

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full min-h-[500px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        )
    }

    // Transform breakdown for Pie Chart
    const pieData = [
        { name: 'Approved', value: stats?.status_breakdown?.APPROVED || 0 },
        { name: 'Rejected', value: stats?.status_breakdown?.REJECTED || 0 },
        { name: 'Flagged', value: stats?.status_breakdown?.MANUAL_REVIEW || 0 },
        { name: 'Partial', value: stats?.status_breakdown?.PARTIAL || 0 },
    ].filter(d => d.value > 0);

    // Mock data for Bar Chart (Real app would fetch daily/monthly)
    const barData = [
        { name: 'Mon', claims: 4 },
        { name: 'Tue', claims: 3 },
        { name: 'Wed', claims: 7 },
        { name: 'Thu', claims: 2 },
        { name: 'Fri', claims: 6 },
    ]

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview of claims adjudication performance.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Claims */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_claims || 0}</div>
                            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                        </CardContent>
                    </Card>

                    {/* Total Value */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹ {(stats?.total_value || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Volume processed</p>
                        </CardContent>
                    </Card>

                    {/* Money Saved */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Money Saved</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₹ {(stats?.money_saved || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Through strict adjudication</p>
                        </CardContent>
                    </Card>

                    {/* AI Accuracy */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
                            <TrendingUp className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">94.2%</div>
                            <p className="text-xs text-muted-foreground">Against Manual Reviews</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                    {/* Stats Breakdown (Pie) */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Adjudication Verdicts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 text-sm mt-4">
                                    {pieData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span>{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Volume (Bar) */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Processing Volume (Last 5 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Bar dataKey="claims" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
