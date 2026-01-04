"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, Bot, ShieldCheck, Zap, BarChart3, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function LandingPage() {
    const { role } = useAuth()

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 italic font-sans antialiased text-slate-900">
            {/* Nav */}
            <nav className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg shadow-indigo-200">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600">
                            Plum Adjudicator
                        </span>
                    </div>
                    <Link href={role ? (role === 'admin' ? '/dashboard' : '/claims/new') : "/login"}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all rounded-full h-11 px-8 shadow-md">
                            {role ? "Go to App" : "Try demo"}
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-24 pb-32">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 relative">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                            <span className="text-sm font-semibold text-indigo-700">Introducing ClaimSense AI v2.0</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-8">
                            Adjudicate health claims in <span className="italic font-serif text-indigo-600 underline decoration-indigo-200/50 underline-offset-8">seconds</span>, not days.
                        </h1>

                        <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
                            Our AI-first platform extracts medical data from messy files, enforces 2026 OPD policy rules instantly,
                            and flags high-risk claims for human review before you can even refresh the page.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/login">
                                <Button size="lg" className="h-16 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-lg group w-full sm:w-auto">
                                    Try it out
                                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Feature Grid */}
            <section className="py-24 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900">Engineered for Accuracy</h2>
                    <p className="text-slate-500 mt-4 text-lg">Four layers of validation protecting your loss ratio</p>
                </div>

                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Bot, title: "Llama 3 Extraction", desc: "No manual data entry. Our engine reads PDFs, handwritten bills, and digital receipts.", color: "bg-blue-50 text-blue-600" },
                        { icon: ShieldCheck, title: "Rule Enforcement", desc: "Instantly validates claims against 2026 policy terms like OPD sub-limits and copays.", color: "bg-green-50 text-green-600" },
                        { icon: Clock, title: "0ms Latency", desc: "Real-time decision making allows you to pay claims while the customer is still at the hospital.", color: "bg-indigo-50 text-indigo-600" },
                        { icon: CheckCircle2, title: "Risk Scoring", desc: "Claims are assigned a confidence score. Low confidence results trigger manual team review.", color: "bg-orange-50 text-orange-600" }
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300">
                            <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                                <f.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 border-t border-slate-50 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-sm">© 2026 Plum Claim AI. Built for the modern insurer.</p>
                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">API Keys</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
