'use client'

import { File } from 'lucide-react'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type AcceptViewProps = {
  active: { border: string, icon: string}
  isFilled: boolean
  pdfName: string
  pdfFile: File | null
}

export default function AcceptView({ active, isFilled, pdfName, pdfFile }: AcceptViewProps) {
    const [preview, setPreview] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [numPages, setNumPages] = useState(0)


    return (
        <div className={`flex flex-col justify-center items-center w-auto m-auto gap-2 border-2 ${active.border}
        bg-linear-to-br py-6 px-8 rounded-2xl shadow-sm  to-white
        transition-all duration-200 hover:shadow-md hover:shadow-green-100`}>
          <File size={50} className={`${active.icon} ${isFilled ? "animate-bounce" : ""}`} fill={isFilled ? "currentColor" : "none"} />
          <p className={`text-lg flex-wrap ${active.icon}`}>{pdfName}</p>
          <div className="flex justify-between gap-4 mt-3">
            <button onClick={() => setPreview(true)} className={`text-lg flex-wrap ${active.icon} ${active.border} border-2 py-2 px-4 rounded-md cursor-pointer hover:bg-green-400 hover:text-white transition-all duration-200`}>Preview PDF</button>
            <button className={`text-lg flex-wrap ${active.icon} ${active.border} border-2 py-2 px-4 rounded-md cursor-pointer hover:bg-green-400 hover:text-white transition-all duration-200`}>Chat with PDF</button>
          </div>
          {preview && pdfFile && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setPreview(false)}          // click backdrop to close
            >
              <div
                className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-xl max-w-[90vw] max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between w-full text-gray-400 p-6">
                  <span className="text-black">{pdfName}</span>
                  <button onClick={() => setPreview(false)} className="hover:text-gray-600 cursor-pointer">✕</button>
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
          )}
        </div>
    )
}