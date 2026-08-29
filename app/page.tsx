'use client'

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { File } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState<"idle" | "accepted" | "rejected">("idle");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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

  const styles = {
    idle:     { border: "border-red-300", icon: "text-red-400" },
    accepted: { border: "border-green-400", icon: "text-green-400" },
    rejected: { border: "border-red-500", icon: "text-red-500" },
  };

  const active = isDragActive ? styles.accepted : styles[status];
  const isFilled = isDragActive || status == "accepted";

  return (
    <div {...getRootProps()} className={`flex flex-col justify-center items-center m-auto gap-2 border-2 ${borderClass}
      bg-linear-to-br py-6 px-8 rounded-2xl shadow-sm shadow-red-100 to-white
      transition-all duration-200 hover:shadow-md hover:shadow-red-100 cursor-pointer`}
    >
      <File size={50} className={`${active.icon} ${isFilled ? "animate-bounce" : ""}`} fill={isFilled ? "currentColor" : "none"} />
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
