"use client"

import * as React from "react"
import { Upload, FileText, X, AlertCircle, Loader2, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitClaim, AdjudicationResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ClaimFormProps {
    onSuccess: (data: AdjudicationResponse) => void
}

export function ClaimForm({ onSuccess }: ClaimFormProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [file, setFile] = React.useState<File | null>(null)
    const [isDragOver, setIsDragOver] = React.useState(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) setFile(droppedFile)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) setFile(selectedFile)
    }

    const handleSubmit = async () => {
        if (!file) {
            setError("Please select a file")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("files", file)
            const result = await submitClaim(formData)
            onSuccess(result)
        } catch (err: any) {
            setError(err.message || "Failed to submit claim")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-slide-up">

            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                    <Zap className="w-3 h-3 fill-current" />
                    AI Core v3.0
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Claim Intake Portal</h2>
                <p className="text-muted-foreground text-sm">Upload medical invoices for instant AI adjudication.</p>
            </div>

            <div className={cn(
                "glass-card rounded-[2.5rem] p-12 text-center transition-all duration-500 border-2",
                isDragOver ? "border-primary bg-primary/10 scale-[1.02]" : "border-white/5 bg-white/5",
                isLoading ? "opacity-50 pointer-events-none" : ""
            )}>

                {!file ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="w-24 h-24 premium-gradient rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-500">
                            <Upload className="w-10 h-10 text-white animate-bounce-slow" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                Drop document here
                            </h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                We accept PDF, PNG, JPG, or TXT. AI automatically extracts every line item.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".txt,.pdf,.jpg,.jpeg,.png"
                            />
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl h-12 px-8 font-bold text-white transition-all"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                Browse Filesystem
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                        <div className="relative">
                            <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center border border-primary/30 ring-4 ring-primary/10">
                                <FileText className="w-10 h-10 text-primary" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-950">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white truncate max-w-[300px]">{file.name}</h3>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                Ready for processing • {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setFile(null)}
                                disabled={isLoading}
                                className="flex-1 h-14 bg-white/5 border-white/10 text-white rounded-2xl font-bold hover:bg-white/10"
                            >
                                <X className="w-4 h-4 mr-2" /> Discard
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-2 h-14 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 min-w-[200px]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    "Launch AI Scan"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 animate-pulse">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FeatureSmall icon={<Zap className="w-3 h-3" />} text="Instant OCR" />
                <FeatureSmall icon={<ShieldCheck className="w-3 h-3" />} text="Fraud Logic" />
                <FeatureSmall icon={<FileText className="w-3 h-3" />} text="Compliance" />
            </div>
        </div>
    )
}

function FeatureSmall({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/5 rounded-xl px-3 py-2 justify-center">
            <span className="text-primary">{icon}</span>
            <span className="uppercase tracking-tighter">{text}</span>
        </div>
    )
}
