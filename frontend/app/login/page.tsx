"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Shield, User, ArrowRight, Lock, AlertCircle, Bot, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function LoginPage() {
    const [mode, setMode] = useState<"select" | "admin-login">("select")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const handleGuestLogin = () => {
        setIsLoading(true)
        login("guest")
        setTimeout(() => {
            router.push("/claims/new")
        }, 800)
    }

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        setTimeout(() => {
            const success = login("admin", password)
            if (success) {
                router.push("/dashboard")
            } else {
                setError("CRYPTOGRAPHIC_MISMATCH: Invalid Security Key")
                setIsLoading(false)
            }
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8 overflow-hidden relative">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Brand Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 premium-gradient rounded-[2rem] mb-6 shadow-2xl shadow-primary/30 relative group">
                        <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping group-hover:animate-none opacity-20"></div>
                        <Shield className="w-10 h-10 text-white relative z-10" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Nexus Vault</h1>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em]">Integrated Intelligence Core</p>
                    </div>
                </div>

                {mode === "select" ? (
                    <div className="grid gap-6">
                        <div
                            className="glass-card p-8 rounded-[2.5rem] cursor-pointer hover:border-primary/50 hover:bg-primary/[0.03] transition-all duration-500 group relative border-white/5"
                            onClick={handleGuestLogin}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 ring-1 ring-white/10 group-hover:ring-primary/50">
                                    <User className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Guest Access</h3>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Submit & Track Fragments</p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-2" />
                            </div>
                        </div>

                        <div
                            className="glass-card p-8 rounded-[2.5rem] cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] transition-all duration-500 group relative border-white/5"
                            onClick={() => setMode("admin-login")}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-500 ring-1 ring-white/10 group-hover:ring-emerald-500/50">
                                    <Lock className="w-7 h-7 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">System Audit</h3>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Full Strategy & Oversight</p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-emerald-400 transition-all group-hover:translate-x-2" />
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Hardware ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card p-10 rounded-[3rem] border-white/5 animate-in zoom-in-95 duration-500">
                        <div className="mb-8 space-y-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Identity Proof</h3>
                                <Bot className="text-primary w-6 h-6 animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Enter Protocol Credentials</p>
                        </div>

                        <form onSubmit={handleAdminLogin} className="space-y-8">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-400 transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="Secure Access Key"
                                        className="pl-14 h-16 bg-white/5 border-white/10 rounded-2xl text-lg text-white placeholder:text-muted-foreground/20 focus:ring-emerald-500/50 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-2xl shadow-emerald-600/30 transition-all group disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Activity className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Verify Credentials"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-12 text-muted-foreground hover:text-white uppercase font-black text-[10px] tracking-widest transition-all"
                                    onClick={() => { setMode("select"); setError(null); }}
                                    disabled={isLoading}
                                >
                                    Cancel Authentication
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
