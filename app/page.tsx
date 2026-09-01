'use client'

import { useState } from "react";
import { useDropzone } from "react-dropzone";
// import dynamic from 'next/dynamic'
// import IdleView from './IdleView'
// import RejectView from './RejectView'
// const AcceptView = dynamic(() => import('./AcceptView'), {
//   ssr: false,
// })
import PdfUpload from './PdfUpload'

export default function Home() {
  const [status, setStatus] = useState<"idle" | "accepted" | "rejected">("idle");
  const [pdfName, setPdfName] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] }, 
    maxFiles: 1,
    onDrop: (file) => {
      setStatus(file.length > 0 ? "accepted" : "rejected"); 
      console.log(file); 
      if (file[0]) {
        setPdfName(file[0].name)}
        setPdfFile(file[0])
      }
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
        {/* {status === "idle" &&
            <IdleView 
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              active={active}
              isFilled={isFilled}
            />
        }
        {status === "accepted" && 
            <AcceptView
              active={active}
              isFilled={isFilled}
              pdfName={pdfName}
              pdfFile={pdfFile}
            />
        }
        {status === "rejected" && 
            <RejectView
              active={active}
            />
        } */}
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