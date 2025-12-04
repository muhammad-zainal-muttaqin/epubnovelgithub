"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ChapterContentProps {
  content: string
  fontSize: number
  fontFamily: "sans" | "serif" | "mono" | "merriweather" | "open-sans" | "literata" | "garamond" | "opendyslexic"
  lineHeight: number
  maxWidth: number
  textAlign: "left" | "center" | "right" | "justify"
  onScroll?: (scrollPercentage: number) => void
  isTranslating?: boolean
  pendingChunks?: number
  initialScrollPercent?: number
}

export function ChapterContent({
  content,
  fontSize,
  fontFamily,
  lineHeight,
  maxWidth,
  textAlign,
  onScroll,
  isTranslating,
  pendingChunks = 0,
  initialScrollPercent,
}: ChapterContentProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !onScroll || !readyRef.current) return

      const element = contentRef.current
      const scrollHeight = element.scrollHeight - element.clientHeight
      const percentage = scrollHeight > 0 ? Math.min((element.scrollTop / scrollHeight) * 100, 100) : 100
      onScroll(percentage)
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener("scroll", handleScroll)
      return () => element.removeEventListener("scroll", handleScroll)
    }
  }, [onScroll])

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a")
      if (!link) return

      const href = link.getAttribute("href")
      if (!href?.match(/\?bookId=([^&]+)&chapterId=(\d+)/)) return

      e.preventDefault()
      router.push(href)
    }

    contentRef.current?.addEventListener("click", handleLinkClick)
    return () => contentRef.current?.removeEventListener("click", handleLinkClick)
  }, [router])

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el || initialScrollPercent == null) {
      if (el) readyRef.current = true
      return
    }

    readyRef.current = false
    const clamped = Math.max(0, Math.min(100, initialScrollPercent))
    let attempts = 0

    const applyScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) {
        readyRef.current = true
        onScroll?.(100)
        return
      }

      el.scrollTop = Math.round((clamped / 100) * maxScroll)
      attempts += 1

      if (Math.abs(el.scrollTop - Math.round((clamped / 100) * maxScroll)) < 2 || attempts >= 5) {
        readyRef.current = true
        if (onScroll) {
          const scrollHeight = el.scrollHeight - el.clientHeight
          onScroll(scrollHeight > 0 ? Math.min((el.scrollTop / scrollHeight) * 100, 100) : 100)
        }
        return
      }

      requestAnimationFrame(applyScroll)
    }

    return () => cancelAnimationFrame(requestAnimationFrame(applyScroll))
  }, [content, initialScrollPercent, onScroll])

  const fontFamilyMap = {
    sans: "font-sans", serif: "font-serif", mono: "font-mono",
    merriweather: "font-[family-name:var(--font-merriweather)]",
    "open-sans": "font-[family-name:var(--font-open-sans)]",
    literata: "font-[family-name:var(--font-literata)]",
    garamond: "font-[family-name:var(--font-garamond)]",
    opendyslexic: "font-['OpenDyslexic']",
  }
  const textAlignMap = { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify" }

  return (
    <div ref={contentRef} className="h-full overflow-y-auto scrollbar-hide chapter-scroll" data-chapter-content>
      <article
        className={cn(
          "prose prose-neutral dark:prose-invert mx-auto px-4 pt-24 pb-32 pb-[calc(8rem+env(safe-area-inset-bottom))]",
          "break-words overflow-wrap-anywhere",
          "[&_*:not(.bg-muted)]:!bg-transparent [&_*]:!font-[inherit]",
          "[&_*]:!text-[length:inherit] [&_*]:!leading-[inherit]",
          "[&_p]:!mb-4 [&_p]:!mt-0 [&_p]:!leading-relaxed [&_p]:break-words",
          "[&_div]:!mb-4 [&_div]:!mt-0 [&_div]:break-words",
          "[&_span]:!bg-transparent [&_span]:break-words",
          "[&_pre]:!whitespace-pre-wrap [&_pre]:!break-words",
          fontFamilyMap[fontFamily], textAlignMap[textAlign]
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight, maxWidth: `${maxWidth}px` }}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  )
}
