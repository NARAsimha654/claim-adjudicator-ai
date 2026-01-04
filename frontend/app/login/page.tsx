"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Shield, User, ArrowRight, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const [mode, setMode] = useState<"select" | "admin-login">("select")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const { login } = useAuth()
    const router = useRouter()

    const handleGuestLogin = () => {
        login("guest")
        router.push("/claims/new")
    }

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const success = login("admin", password)
        if (success) {
            router.push("/dashboard")
        } else {
            setError("Invalid admin password")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome back</h1>
                    <p className="text-slate-500 mt-2">Choose your access level to continue</p>
                </div>

                {mode === "select" ? (
                    <div className="grid gap-4">
                        <Card
                            className="cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group"
                            onClick={handleGuestLogin}
                        >
                            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                    <User className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Continue as Guest</CardTitle>
                                    <CardDescription>View policy and submit new claims</CardDescription>
                                </div>
                                <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </CardHeader>
                        </Card>

                        <Card
                            className="cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group"
                            onClick={() => setMode("admin-login")}
                        >
                            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                    <Shield className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Admin Login</CardTitle>
                                    <CardDescription>Full access to dashboard and reviews</CardDescription>
                                </div>
                                <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </CardHeader>
                        </Card>
                    </div>
                ) : (
                    <Card className="animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle>Admin Verification</CardTitle>
                            <CardDescription>Enter your credential for full access</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleAdminLogin}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="password"
                                            placeholder="Admin Password"
                                            className="pl-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2 animate-in slide-in-from-top-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg">
                                    Verify & Log In
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-indigo-600"
                                    onClick={() => setMode("select")}
                                >
                                    Go back
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    )
}
