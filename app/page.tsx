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
    onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setStatus(acceptedFiles.length > 0 ? "accepted" : "rejected"); 
      if (acceptedFiles[0]) {
        setPdfName(acceptedFiles[0].name)
        setPdfFile(acceptedFiles[0])
      }}
   });

  function setIdle() {
    setStatus('idle')
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