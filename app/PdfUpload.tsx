'use client'

import { File, UploadCloud, X } from 'lucide-react'
import { useState } from 'react'
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone"
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import ModelModal from "./ModelModal"
import { type ModelConfig } from './ModelModal'

const PdfPreviewModal = dynamic(() => import('./PdfPreviewModal'), {
    ssr: false,
    loading: () =>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="rounded-xl bg-white px-8 py-6 text-gray-500">Loading preview…</div>
        </div>
})

type PdfUploadProps = {
    getRootProps: () => DropzoneRootProps
    getInputProps: () => DropzoneInputProps
    active: { border: string, icon: string}
    isFilled: boolean
    pdfName: string
    pdfFile: File | null
    status: "idle" | "uploading" | "accepted" | "rejected"
    setIdle: () => void
    onModelConfig: (config: ModelConfig) => void
}

export default function PdfUpload({ getRootProps, getInputProps, active, isFilled, pdfName, pdfFile, status, setIdle, onModelConfig }: PdfUploadProps) {
    const [preview, setPreview] = useState(false)
    const [showModelModal, setShowModelModal] = useState(false)

    return (
        <>
            {status == "idle" &&
                <Card
                    {...getRootProps()}
                    className={`group w-full max-w-xl cursor-pointer border-2 border-dashed transition-all animate-in fade-in-0 duration-200
                        ${isFilled
                        ? "border-green-500 bg-green-100/70 shadow-lg shadow-green-200 ring-0 scale-[1.02]"
                        : "border-red-200 bg-white hover:border-red-300 hover:shadow-md hover:shadow-red-100"}`}
                    >
                    <CardContent className="flex flex-col items-center justify-center gap-5 py-14 text-center">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-300
                        ${isFilled ? "bg-green-100" : "bg-red-50"}`}>
                        <File size={40} className={`${active.icon} transition-transform duration-300 ${isFilled ? "scale-110" : "group-hover:scale-105"}`} />
                        </div>

                        <div>
                        <p className="text-xl font-semibold text-gray-800">
                            {isFilled ? "Drop it!" : "Drag & drop your PDF here"}
                        </p>
                        <p className="mt-1 text-md text-gray-500">Only PDF files are accepted — one file max</p>
                        </div>

                        <Button size="lg" className={`bg-red-300 ${isFilled ? "bg-green-400" : ""} hover:bg-red-400 cursor-pointer text-lg`}>
                        <UploadCloud size={16} /> Browse files
                        </Button>

                        <input {...getInputProps()} />
                    </CardContent>
                </Card>
            }
            {status == "accepted" && (
                <>
                    <Card className={`group w-full max-w-xl border-2 border-dashed border-green-500 bg-green-100/10 shadow-lg shadow-green-200 ring-0 scale-[1.02] animate-in fade-in-0 duration-200`}>
                        <CardContent className='flex flex-col items-center justify-center gap-5 py-14 text-center'>        
                        <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-300 bg-green-100`}>
                            <File size={40} className={`${active.icon} transition-transform duration-300 ${isFilled ? "scale-110" : "group-hover:scale-105"}`} />
                        </div>
                        <p className={`text-lg flex-wrap ${active.icon}`}>File Name: {pdfName}</p>
                        <div className="flex justify-between gap-4 mt-3">
                            <Button size="lg" onClick={() => setPreview(true)} className={`bg-green-300 hover:bg-green-400 cursor-pointer text-lg`}>Preview PDF</Button>
                            <Button size="lg" onClick={() => setShowModelModal(true)} className={`bg-green-300 hover:bg-green-400 cursor-pointer text-lg`}>Chat with PDF</Button>
                        </div>
                        </CardContent>
                    </Card>

                    {preview && pdfFile && (
                        <PdfPreviewModal pdfFile={pdfFile} pdfName={pdfName} onClose={() => setPreview(false)} />    
                    )}

                    {showModelModal && (
                        <ModelModal onSubmit={onModelConfig} onClose={() => setShowModelModal(false)}/>
                    )}
                </>
            )}
            {status == "rejected" && (
                <Card className='group w-full max-w-xl border-2 border-dashed border-red-500 bg-red-100/10 shadow-lg shadow-red-200 ring-0 scale-[1.02]'>
                    <CardContent className='flex flex-col items-center justify-center gap-5 py-14 text-center'>
                        <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-300
                            ${isFilled ? "bg-green-100" : "bg-red-50"}`}>
                            <X  size={40} className={`${active.icon} transition-transform duration-300 ${isFilled ? "scale-110" : "group-hover:scale-105"}`} />
                        </div>
                         <div>
                            <p className="mt-1 text-lg text-gray-500">This file type isn&apos;t accepted!</p>
                        </div>
                        <Button onClick={setIdle} size='lg' className='bg-red-300 ${isFilled ? "bg-green-400" : ""} hover:bg-red-400 cursor-pointer text-lg'>Try again</Button>
                    </CardContent>
                </Card>
            )}
            {status == "uploading" &&
                <Card className="w-full max-w-xl border-2 border-dashed border-yellow-300 bg-yellow-50/50 shadow-lg shadow-yellow-100 animate-in fade-in-0 duration-200">
                    <CardContent className="flex flex-col items-center justify-center gap-5 py-14 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                        <Spinner className="text-yellow-500 animate-spin size-4" />
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-gray-800">Uploading…</p>
                        <p className="mt-1 text-md text-gray-500">Sending your PDF to the server</p>
                    </div>
                    </CardContent>
                </Card>
            }</>
    )
}