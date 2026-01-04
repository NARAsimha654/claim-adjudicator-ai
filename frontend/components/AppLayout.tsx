"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    PlusCircle,
    History,
    FileText,
    Settings,
    LogOut,
    Bell,
    Menu,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Assuming Button is available
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Using primitives for now if not available

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
        <div className="flex h-screen bg-slate-50">

            {/* Sidebar (Desktop) */}
            {!hideSidebar && (
                <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Plum Claims</span>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                {role === "admin" ? "AD" : "GS"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate uppercase">{role}</p>
                                <p className="text-xs text-slate-500 truncate">{role === "admin" ? "Full Access" : "Read Only"}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6 text-slate-600" />
                        </button>
                        <span className="font-bold text-slate-900">Plum Claims</span>
                    </div>

                    <div className="flex-1 max-w-xl hidden md:block">
                        {/* Could put Search here */}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-[80%] max-w-xs bg-white shadow-xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xl font-bold">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                                        pathname === item.href ? "bg-primary/10 text-primary" : "text-slate-600"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

        </div>
    )
}
