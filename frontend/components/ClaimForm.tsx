"use client"

import * as React from "react"
import { Upload, FileText, X, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
            // Inputs removed as per request. Backend defaults Member ID and extracts Amount.

            const result = await submitClaim(formData)
            onSuccess(result)
        } catch (err: any) {
            setError(err.message || "Failed to submit claim")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="p-10 text-center">

                    {!file ? (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-200",
                                isDragOver ? "scale-105" : ""
                            )}
                        >
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">
                                Drag & Drop your invoice here
                            </h3>
                            <p className="text-slate-500 max-w-xs">
                                Supports PDF, PNG, JPG, or TXT formats.
                                AI will extract details automatically.
                            </p>

                            <div className="relative mt-6">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".txt,.pdf,.jpg,.jpeg,.png"
                                />
                                <Button variant="outline" size="lg" onClick={() => document.getElementById('file-upload')?.click()}>
                                    Browse Files
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">{file.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{(file.size / 1024).toFixed(1)} KB</p>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setFile(null)} disabled={isLoading}>
                                    <X className="w-4 h-4 mr-2" /> Change File
                                </Button>
                                <Button size="lg" onClick={handleSubmit} disabled={isLoading} className="min-w-[150px]">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Process Claim"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}
