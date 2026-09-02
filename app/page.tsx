'use client'

import { useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import PdfUpload from './PdfUpload'

export default function Home() {
  const [status, setStatus] = useState<"idle" | "accepted" | "rejected">("idle");
  const [pdfName, setPdfName] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] }, 
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (!acceptedFiles[0]) { setStatus("rejected"); return;}
      const fd = new FormData()
      fd.append('file', acceptedFiles[0])
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
        const data = await res.json()
        console.log(data)
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
        />
    </section>
  );

}