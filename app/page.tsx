'use client'

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { File } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState<"idle" | "accepted" | "rejected">("idle");

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },   // object form is fine
    maxFiles: 1,
    onDrop: (accepted) => setStatus(accepted.length > 0 ? "accepted" : "rejected"),
  });

  const borderClasses = {
    idle: "border-red-300",
    accepted: "border-green-400",
    rejected: "border-red-500",
  };

  const borderClass = isDragActive ? "border-green-400" : borderClasses[status];

  return (
    <div {...getRootProps()} className={`flex flex-col justify-center items-center m-auto gap-2 border-2 ${borderClass}
      bg-linear-to-br  to-white py-6 px-8 rounded-2xl shadow-sm shadow-red-100
      transition-all duration-200 hover:shadow-md hover:shadow-red-100`}
    >
      <File size={50} color="oklch(70.4% 0.191 22.216)" />
      <input {...getInputProps()} />

      {status === "idle" && (
        <p className="text-lg flex-wrap text-red-400">
          Drag &apos;n&apos; drop your pdf here, or click to select files
        </p>
      )}
      {status === "accepted" && (
        <p className="text-lg flex-wrap text-green-400">PDF accepted!</p>
      )}
      {status === "rejected" && (
        <p className="text-lg flex-wrap text-red-500">
          {"File not accepted!"}
        </p>
      )}
    </div>
  );
}
