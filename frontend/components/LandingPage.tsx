"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, Bot, ShieldCheck, Zap, BarChart3, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

export default function LandingPage() {
    const { role } = useAuth()

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-primary/30 selection:text-white font-sans antialiased text-slate-200 overflow-hidden">

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
                <div className="absolute top-[10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/10 to-transparent"></div>
            </div>

            {/* Nav */}
            <nav className="h-24 flex items-center justify-between px-8 md:px-16 border-b border-white/5 bg-background/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-primary/20">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-2xl tracking-tighter text-white uppercase italic">Plum AI</span>
                        <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Adjudicator</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Protocol</a>
                        <a href="#" className="hover:text-white transition-colors">Compliance</a>
                        <a href="#" className="hover:text-white transition-colors">Network</a>
                    </div>
                    <Link href={role ? (role === 'admin' ? '/dashboard' : '/claims/new') : "/login"}>
                        <Button className="premium-gradient hover:scale-105 transition-all text-white rounded-xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            {role ? "Open Workspace" : "Access Demo"}
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-48 px-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-20">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Zap className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Deploying Neural Core v4.0</span>
                            <ChevronRight className="w-3 h-3 text-white/30" />
                        </div>

                        <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            Adjudicate <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-emerald-400">Instantly.</span>
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                            The ultimate AI-first platform for modern insurers. We extract medical data from any document, enforce complex 2026 OPD policies, and process settlements in <span className="text-white">under 400ms</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/login" className="flex-1 sm:flex-none">
                                <Button size="lg" className="h-16 px-12 rounded-2xl premium-gradient text-white text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/40 group w-full">
                                    Start Adjudicating
                                    <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl bg-white/5 border-white/10 text-white text-lg font-bold hover:bg-white/10 group">
                                Watch Intelligence Demo
                            </Button>
                        </div>

                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#020617] flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5"></div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-muted-foreground">
                                <span className="text-white">500+</span> Claims processed this hour
                            </p>
                        </div>
                    </div>

                    {/* Floating Tech Stat Card */}
                    <div className="hidden lg:block relative">
                        <div className="glass-card rounded-[3rem] p-12 aspect-square flex flex-col justify-between border-white/[0.08] relative group">
                            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-all duration-700"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Network Pulse</p>
                                    <h3 className="text-3xl font-black text-white italic">OPERATIONAL</h3>
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 animate-pulse">
                                    <Activity className="text-emerald-400 w-6 h-6" />
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[88%] bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    <span>AI CONFIDENCE</span>
                                    <span className="text-white">88.4%</span>
                                </div>
                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <p className="text-4xl font-black text-white italic tracking-tighter">0.4s</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">AVG LATENCY</p>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <p className="text-4xl font-black text-emerald-400 italic tracking-tighter">100%</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">COMPLIANCE</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Feature Section */}
            <section className="py-32 px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-24">
                        <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em]">Integrated Intelligence</h2>
                        <p className="text-5xl font-black text-white tracking-tighter">Engineered for the 1%.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Bot, title: "Neural Extraction", desc: "No manual data entry. Our engine deciphers messy PDFs and digital receipts instantly.", color: "text-blue-400", bg: "bg-blue-500/10" },
                            { icon: ShieldCheck, title: "Policy Integrity", desc: "Hard-coded enforcement of 2026 OPD limits, copays, and eligibility gates.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                            { icon: BarChart3, title: "Predictive Analytics", desc: "Real-time impact analysis and backtesting against historical claim datasets.", color: "text-primary", bg: "bg-primary/10" },
                            { icon: Clock, title: "Hyper-Speed", desc: "Zero-latency adjudication enables instant disbursement on the hospital floor.", color: "text-amber-400", bg: "bg-amber-500/10" }
                        ].map((f, i) => (
                            <div key={i} className="glass-card p-10 rounded-[2.5rem] border-white/[0.05] hover:border-primary/50 transition-all duration-500 group">
                                <div className={`${f.bg} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
                                    <f.icon className={cn("w-8 h-8", f.color)} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">{f.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 premium-gradient rounded-xl flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-white uppercase italic tracking-tighter">Plum AI</span>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">© 2026 Plum Claim Intelligence • Private Node</p>
                    </div>

                    <div className="flex gap-12 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                        <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                        <a href="#" className="hover:text-primary transition-colors">API Keys</a>
                        <a href="#" className="hover:text-primary transition-colors">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function Activity(props: any) {
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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
