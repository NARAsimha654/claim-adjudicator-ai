"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

type Role = "guest" | "admin" | null

interface AuthContextType {
    role: Role
    login: (role: Role, password?: string) => boolean
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const savedRole = localStorage.getItem("user_role") as Role
        if (savedRole) {
            setRole(savedRole)
        }
        setIsLoading(false)
    }, [])

    const login = (newRole: Role, password?: string) => {
        if (newRole === "admin" && password !== "admin123") {
            return false
        }
        setRole(newRole)
        if (newRole) localStorage.setItem("user_role", newRole)
        return true
    }

    const logout = () => {
        setRole(null)
        localStorage.removeItem("user_role")
        router.push("/")
    }

    // Protection logic for Admin pages
    useEffect(() => {
        if (isLoading) return

        const adminOnlyPaths = ["/dashboard", "/review", "/history"]
        const isLandingPage = pathname === "/"
        const isLoginPage = pathname === "/login"

        if (adminOnlyPaths.some(path => pathname.startsWith(path)) && role !== "admin") {
            router.push("/login")
        }

        // If logged in and on landing/login, maybe redirect? 
        // For now keep landing accessible
    }, [role, pathname, isLoading, router])

    return (
        <AuthContext.Provider value={{ role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
