"use client"

import { useSearchParams } from "next/navigation"
import { ReaderPageContent } from "./_components/reader-client"

export default function ReaderPage() {
  const searchParams = useSearchParams()
  const bookId = searchParams.get("bookId") || ""
  const chapterId = searchParams.get("chapterId") || "0"

  return <ReaderPageContent bookId={bookId} chapterId={chapterId} />
}
