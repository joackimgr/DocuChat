'use client'

import Link from 'next/link'

type NewPdfLinkProps = {
    docId: string
}

export default function NewPdfLink({ docId }: NewPdfLinkProps) {
    function cleanup() {
        fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docId }),
            keepalive: true,
        }).catch((error) => console.error('Could not delete the document', error))
    }

    return (
        <Link
            href="/"
            onClick={cleanup}
            className="inline-flex shrink-0 items-center rounded-md border border-green-400 bg-green-100 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-green-200 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            New PDF
        </Link>
    )
}
