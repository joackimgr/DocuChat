import { File } from 'lucide-react'
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone"

type IdleViewProps = {
  getRootProps: () => DropzoneRootProps
  getInputProps: () => DropzoneInputProps
  active: { border: string, icon: string}
  isFilled: boolean
}

export default function IdleView({ getRootProps, getInputProps, active, isFilled }: IdleViewProps) {

    return (
        <div {...getRootProps()} className={`flex flex-col justify-center items-center w-auto m-auto gap-2 border-2 ${active.border}
          bg-linear-to-br py-6 px-8 rounded-2xl shadow-sm shadow-red-100 to-white
          transition-all duration-200 hover:shadow-md hover:shadow-red-100 cursor-pointer`}>
          <File size={50} className={`${active.icon} ${isFilled ? "animate-bounce" : ""}`} fill={isFilled ? "currentColor" : "none"} />
          <input {...getInputProps()} />
          <p className="text-lg flex-wrap text-red-400">
            Drag &apos;n&apos; drop your pdf here, or click to select files
          </p>
        </div>
    )
}