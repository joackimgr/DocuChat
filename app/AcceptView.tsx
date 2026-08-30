import { File } from 'lucide-react'

type AcceptViewProps = {
  active: { border: string, icon: string}
  isFilled: boolean
  pdfName: string
}

export default function AcceptView({ active, isFilled, pdfName}: AcceptViewProps) {

    return (
        <div className={`flex flex-col justify-center items-center w-auto m-auto gap-2 border-2 ${active.border}
        bg-linear-to-br py-6 px-8 rounded-2xl shadow-sm  to-white
        transition-all duration-200 hover:shadow-md hover:shadow-green-100`}>
          <File size={50} className={`${active.icon} ${isFilled ? "animate-bounce" : ""}`} fill={isFilled ? "currentColor" : "none"} />
          <p className={`text-lg flex-wrap ${active.icon}`}>{pdfName}</p>
          <div className="flex justify-between gap-4 mt-3">
            <button className={`text-lg flex-wrap ${active.icon} ${active.border} border-2 py-2 px-4 rounded-md cursor-pointer hover:bg-green-400 hover:text-white transition-all duration-200`}>Review PDF</button>
            <button className={`text-lg flex-wrap ${active.icon} ${active.border} border-2 py-2 px-4 rounded-md cursor-pointer hover:bg-green-400 hover:text-white transition-all duration-200`}>Chat with PDF</button>
          </div>
        </div>
    )
}