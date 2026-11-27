'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import PdfUpload from './PdfUpload'
import { type ModelConfig, type ProgressHandler } from "./ModelModal";
type ExtractedPage = {
  pageNumber: number
  text: string
}

type PdfChunk = {
  id: string
  pageNumber: number
  text: string
}

async function extractPdfPages(
  file: File
): Promise<ExtractedPage[]> {
  const { pdfjs } = await import("react-pdf")
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

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

function chunkPdfPage(pages: ExtractedPage[]): PdfChunk[] {
  const chunks: PdfChunk[] = []
  const chunkSize = 500
  const overlap = 100
  const stepSize = chunkSize - overlap
  for (const page of pages) {
    const words = page.text.split(/\s+/)
    for (let start = 0; start < words.length; start += stepSize) {
      const chunkWords = words.slice(start, start + chunkSize)
      const chunkText = chunkWords.join(' ')
      const chunk: PdfChunk = {
        id: `page-${page.pageNumber}-start-${start}`,
        pageNumber: page.pageNumber,
        text: chunkText,
      }
      chunks.push(chunk)
    }
  }
  return chunks
}

export default function Home() {
  const [status, setStatus] = useState<"idle" | "uploading" | "accepted" | "rejected">("idle");
  const [pdfName, setPdfName] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfChunks, setPdfChunks] = useState<PdfChunk[]>([])
  const [docId, setDocId] = useState<string>()

  const router = useRouter()
  
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
        const chunks = chunkPdfPage(extractedPages)
        setPdfChunks(chunks)
        setDocId(crypto.randomUUID())
        console.log(chunks)
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
    setDocId(undefined)
  }

  async function handleModelConfig(config: ModelConfig, onProgress?: ProgressHandler) {
    const chunks = pdfChunks.map(chunk => ({ text: chunk.text, page: chunk.pageNumber }))
    const BATCH = 20
    let inserted = 0

    if (chunks.length === 0) {
      throw new Error("The PDF produced no text to read.")
    }

    onProgress?.(0, chunks.length)

    try {
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH)

        const rs = await fetch('/api/embeddings', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            docId,
            docName: pdfName,
            chunks: batch
          })
        })

        const data = await rs.json()

        if (!rs.ok) {
          throw new Error(data.error ?? "Storing the document failed.")
        }

        inserted += data.inserted
        onProgress?.(inserted, chunks.length)
      }

      console.log("Chunks:", chunks.length, "Saved:", inserted)

      if (!docId) {
        throw new Error("No document id — cannot open the chat page.")
      }

      const params = new URLSearchParams({
        docId,
        name: pdfName,
        model: config.llm.model,
      })

      router.push(`/chat?${params.toString()}`)
    } catch (error) {
      console.error("Embedding request failed:", error)
      throw error
    }
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
          onModelConfig={handleModelConfig}
        />
    </section>
  );

}