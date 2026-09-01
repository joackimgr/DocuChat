'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button } from '@/components/ui/button'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type PdfPreviewModalProps = {
  pdfFile: File
  pdfName: string
  onClose: () => void
}

export default function PdfPreviewModal({ pdfFile, pdfName, onClose }: PdfPreviewModalProps) {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-xl max-w-[90vw] max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between w-full text-gray-400 p-6">
          <span className="text-black">{pdfName}</span>
          <Button onClick={onClose} className="hover:text-gray-600 cursor-pointer">✕</Button>
        </div>
        <div className="overflow-scroll">
          <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={pageNumber} width={600} />
          </Document>
        </div>
        <div className="flex w-full items-center justify-center p-3 gap-4 text-black bg-gray-400/40">
          <button disabled={pageNumber <= 1} className="cursor-pointer" onClick={() => setPageNumber(p => p - 1)}>‹ Prev</button>
          <p>Page {pageNumber} of {numPages}</p>
          <button disabled={pageNumber >= numPages} className="cursor-pointer" onClick={() => setPageNumber(p => p + 1)}>Next ›</button>
        </div>
      </div>
    </div>
  )
}