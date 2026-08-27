'use client'

import React from "react";
import { useDropzone } from "react-dropzone"
import { File } from 'lucide-react'

export default function Home() {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone()
  

  return (
    <div {...getRootProps()} className="flex flex-col justify-center items-center m-auto gap-2 border-2 border-red-300
      bg-linear-to-br from-red-50 to-white
      py-6 px-8 rounded-2xl
      shadow-sm shadow-red-100
      transition-all duration-200
      hover:border-red-400 hover:shadow-md hover:shadow-red-100"
    >
      <File size={50} color="oklch(70.4% 0.191 22.216)"/>
      <input {...getInputProps()} />
      <p className="text-lg flex-wrap text-red-400">Drag &apos;n&apos; drop some files here, or click to select files</p>
    </div>
  );
}
