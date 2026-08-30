import { CircleX } from 'lucide-react'

type RejectViewProps = {
  active: { border: string, icon: string}
}

export default function RejectView({ active }: RejectViewProps) {

    return (
        <div className={`flex flex-col justify-center items-center w-auto m-auto gap-2 border-2 ${active.border}
        bg-linear-to-br py-6 px-8 rounded-2xl shadow-sm  to-white
        transition-all duration-200 hover:shadow-md hover:shadow-green-100`}>
          <CircleX size={50} className={`${active.icon} animate-pulse`} />
          <p className={`text-lg flex-wrap ${active.icon}`}>This file type isn&apos;t supported</p>
        </div>
    )
}