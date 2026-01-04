"use client"

import * as React from "react"
import { AppLayout } from "@/components/AppLayout"
import {
    Loader2,
    TrendingUp,
    DollarSign,
    FileCheck,
    Zap,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts"
import { cn } from "@/lib/utils"

const VERDICT_COLORS = {
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    MANUAL_REVIEW: '#f59e0b',
    PARTIAL: '#3b82f6'
};

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
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Cloud Data...</p>
                    </div>
                </div>
            </AppLayout>
        )
    }

    // High-Fidelity Chart Data
    const trendData = [
        { time: '08:00', claims: 2, savings: 450 },
        { time: '10:00', claims: 5, savings: 1200 },
        { time: '12:00', claims: 12, savings: 3500 },
        { time: '14:00', claims: 8, savings: 2100 },
        { time: '16:00', claims: 15, savings: 4800 },
        { time: '18:00', claims: 10, savings: 2900 },
        { time: '20:00', claims: 4, savings: 1100 },
    ];

    const distributionData = [
        { name: 'Approved', value: stats?.status_breakdown?.APPROVED || 0, key: 'APPROVED' },
        { name: 'Review', value: stats?.status_breakdown?.MANUAL_REVIEW || 0, key: 'MANUAL_REVIEW' },
        { name: 'Rejected', value: stats?.status_breakdown?.REJECTED || 0, key: 'REJECTED' },
        { name: 'Partial', value: stats?.status_breakdown?.PARTIAL || 0, key: 'PARTIAL' },
    ].filter(d => d.value > 0);

    return (
        <AppLayout>
            <div className="space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="text-xs font-bold uppercase tracking-widest">System Overview</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Performance Dashboard</h1>
                        <p className="text-muted-foreground max-w-lg text-lg">
                            Real-time adjudication metrics and AI efficiency insights.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 glass-card rounded-xl flex items-center gap-2 text-sm font-semibold">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Live API</span>
                        </div>
                        <div className="px-4 py-2 glass-card rounded-xl flex items-center gap-2 text-sm font-semibold text-white">
                            <span>Last 24h</span>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Claims"
                        value={stats?.total_claims || 0}
                        change="+12.5%"
                        isUp={true}
                        icon={<FileCheck className="w-5 h-5" />}
                        subtext="Claims received today"
                    />
                    <StatCard
                        title="Total Value"
                        value={`₹${(stats?.total_value || 0).toLocaleString()}`}
                        change="+8.2%"
                        isUp={true}
                        icon={<DollarSign className="w-5 h-5" />}
                        subtext="Net volume processed"
                    />
                    <StatCard
                        title="Money Saved"
                        value={`₹${(stats?.money_saved || 0).toLocaleString()}`}
                        change="+14.1%"
                        isUp={true}
                        icon={<TrendingUp className="w-5 h-5" />}
                        subtext="Efficiency savings"
                        highlight="text-emerald-400"
                    />
                    <StatCard
                        title="AI Automation"
                        value="88.4%"
                        change="-1.2%"
                        isUp={false}
                        icon={<Activity className="w-5 h-5" />}
                        subtext="Auto-adjudication rate"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Insights Chart (Area) */}
                    <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Savings Trend</h3>
                                <p className="text-sm text-muted-foreground">Adjudication impact over the day</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                                    <span className="text-xs font-semibold text-white">Savings</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="savings"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSavings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Verdict Breakdown (Bar) */}
                    <div className="glass-card p-8 rounded-3xl">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-1">Verdict Mix</h3>
                            <p className="text-sm text-muted-foreground">Distribution by adjudication result</p>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#fff', fontSize: 12, fontWeight: 600 }}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                                        {distributionData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={VERDICT_COLORS[entry.key as keyof typeof VERDICT_COLORS]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            {distributionData.map((item: any, id: number) => (
                                <div key={id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: VERDICT_COLORS[item.key as keyof typeof VERDICT_COLORS] }}></div>
                                        <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-white">{item.value} Claims</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

function StatCard({ title, value, change, isUp, icon, subtext, highlight = "text-white" }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl group hover:border-primary/50 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 text-muted-foreground group-hover:text-primary">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
                    isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                )}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className={cn("text-3xl font-extrabold tracking-tight", highlight)}>{value}</p>
                <p className="text-[10px] text-muted-foreground pt-1">{subtext}</p>
            </div>
        </div>
    )
}
