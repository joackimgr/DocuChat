'use client'

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import PdfUpload from './PdfUpload'
import { type ModelConfig } from "./ModelModal";
import { pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ExtractedPage = {
  pageNumber: number
  text: string
}

async function extractPdfPages(
  file: File
): Promise<ExtractedPage[]> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const loadingTask = pdfjs.getDocument({
    data: bytes
  })
  const pdf = await loadingTask.promise
  const extractedPages: ExtractedPage[] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const curPage = await pdf.getPage(pageNumber)
    const curContent = await curPage.getTextContent()
    const pageText = curContent.items.map((item) => {
      if (!("str" in item)) return ""

      return item.str + (item.hasEOL ? "\n" : " ")
    })
    .join("")
    .trim()

    extractedPages.push({
      pageNumber,
      text: pageText,
    })
  }
  return extractedPages
}

export default function Home() {
  const [status, setStatus] = useState<"idle" | "uploading" | "accepted" | "rejected">("idle");
  const [pdfName, setPdfName] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null)
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] }, 
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) { setStatus("rejected"); return;}

      const file = acceptedFiles[0]

      const fd = new FormData()
      fd.append('file', file)
      setStatus("uploading")
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd})
        if (!res.ok) { 
          const err = await res.json()
          setStatus("rejected")
          setPdfFile(null)
          setPdfName('')
          console.error(err.error)
          return;
        }
        const extractedPages = await extractPdfPages(file)
        console.log(extractedPages)
        // const data = await res.json()
        // console.log(data)
      } catch (e) {
          console.error(e)
          setStatus("rejected")
          setPdfFile(null)
          setPdfName('')
          return;
      }
      setPdfName(acceptedFiles[0].name)
      setPdfFile(acceptedFiles[0])
      setStatus("accepted")
  }});

  function setIdle() {
    setStatus('idle')
    setPdfFile(null)
    setPdfName('')
  }

  const styles = {
    idle:     { border: "border-red-300", icon: "text-red-400" },
    uploading: { border: "border-yellow-300", icon: "text-yellow-400" },
    accepted: { border: "border-green-400", icon: "text-green-400" },
    rejected: { border: "border-red-500", icon: "text-red-500" },
  };

  const active = isDragActive ? styles.accepted : styles[status];
  const isFilled = isDragActive || status == "accepted";

  return (
    <section className="flex justify-center items-center min-h-screen">
        <PdfUpload 
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          active={active}
          isFilled={isFilled}
          pdfName={pdfName}
          pdfFile={pdfFile}
          status={status}
          setIdle={setIdle}
          onModelConfig={setModelConfig}
        />
    </section>
  );

}