"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    PlusCircle,
    History,
    FileText,
    LogOut,
    Bell,
    Menu,
    X,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface AppLayoutProps {
    children: React.ReactNode
    hideSidebar?: boolean
}

export function AppLayout({ children, hideSidebar = false }: AppLayoutProps) {
    const pathname = usePathname()
    const { role, logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const allNavItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
        { label: "New Claim", href: "/claims/new", icon: PlusCircle, roles: ["admin", "guest"] },
        { label: "Claim History", href: "/claims", icon: History, roles: ["admin"] },
        { label: "Policy Rules", href: "/policy", icon: FileText, roles: ["admin", "guest"] },
    ]

    const navItems = allNavItems.filter(item => item.roles.includes(role || ""))

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">

            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar (Desktop) */}
            {!hideSidebar && (
                <aside className="hidden md:flex w-64 flex-col bg-card/40 backdrop-blur-xl border-r border-white/5 z-20">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-white">Plum AI</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Adjudicator</span>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 mt-4">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                                        isActive
                                            ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"></div>
                                    )}
                                    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 mt-auto">
                        <div className="glass-card p-4 rounded-2xl mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full premium-gradient p-[2px]">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                                        {role === "admin" ? "AD" : "GS"}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate uppercase">{role}</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", role === "admin" ? "bg-emerald-500" : "bg-amber-500")}></div>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{role === "admin" ? "Full Access" : "Read Only"}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-red-500/20"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">

                {/* Top Header */}
                <header className="h-20 bg-background/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-10 shrink-0">
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                        <span className="font-bold text-white tracking-tight">Plum AI</span>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Welcome back, <span className="text-white capitalize font-semibold">{role}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-muted-foreground hover:text-white transition-all hover:bg-white/10">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-slide-up">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-card border-r border-white/10 p-8 flex flex-col animate-slide-in">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-primary w-8 h-8" />
                                <span className="text-xl font-bold text-white">Plum AI</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">
                                <X className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>
                        <nav className="space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all",
                                        pathname === item.href ? "bg-primary/20 text-white border border-primary/20" : "text-muted-foreground hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "")} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-red-400 bg-red-500/5 mt-4"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
