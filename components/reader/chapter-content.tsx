"use client"

import { useEffect, useLayoutEffect, useRef, useCallback } from "react"
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
  bookId: string
  chapterIndex: number
}

function getScrollPositions(bookId: string): Map<number, number> {
  const map = new Map<number, number>()
  if (typeof window === "undefined") return map
  try {
    const saved = localStorage.getItem(`chapter-scroll-${bookId}`)
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, number>
      Object.entries(parsed).forEach(([idx, value]) => {
        const numIdx = Number.parseInt(idx)
        if (!Number.isNaN(numIdx) && typeof value === "number") {
          map.set(numIdx, value)
        }
      })
    }
  } catch (e) {
    console.error("Failed to load scroll positions", e)
  }
  return map
}

function saveScrollPosition(bookId: string, chapterIndex: number, scrollPercent: number) {
  if (typeof window === "undefined") return
  try {
    const positions = getScrollPositions(bookId)
    positions.set(chapterIndex, scrollPercent)
    const payload: Record<string, number> = {}
    positions.forEach((value, key) => {
      payload[String(key)] = value
    })
    localStorage.setItem(`chapter-scroll-${bookId}`, JSON.stringify(payload))
  } catch (e) {
    console.error("Failed to save scroll position", e)
  }
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
  bookId,
  chapterIndex,
}: ChapterContentProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const currentScrollRef = useRef<number | null>(null)
  const bookIdRef = useRef(bookId)
  const chapterIndexRef = useRef(chapterIndex)
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    bookIdRef.current = bookId
    chapterIndexRef.current = chapterIndex
  }, [bookId, chapterIndex])

  // Save scroll position when unmounting - only if user actually scrolled
  useEffect(() => {
    return () => {
      if (hasScrolledRef.current && currentScrollRef.current !== null) {
        saveScrollPosition(bookIdRef.current, chapterIndexRef.current, currentScrollRef.current)
      }
    }
  }, [])

  const getScrollPercentage = useCallback((): number => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    return scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0
  }, [])

  const handleScroll = useCallback(() => {
    const percentage = getScrollPercentage()
    hasScrolledRef.current = true
    currentScrollRef.current = percentage
    onScroll?.(percentage)
    saveScrollPosition(bookIdRef.current, chapterIndexRef.current, percentage)
  }, [getScrollPercentage, onScroll])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

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

  // Restore scroll position when component mounts or chapter changes
  useLayoutEffect(() => {
    hasScrolledRef.current = false
    currentScrollRef.current = null

    const positions = getScrollPositions(bookId)
    const savedScrollPercent = positions.get(chapterIndex) ?? 0

    let attempts = 0
    let rafId: number | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const applyScroll = () => {
      attempts++
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

      if (scrollHeight <= 10) {
        if (attempts < 50) {
          rafId = requestAnimationFrame(applyScroll)
          return
        }
        currentScrollRef.current = 0
        return
      }

      const targetScrollTop = Math.round((savedScrollPercent / 100) * scrollHeight)
      window.scrollTo({ top: targetScrollTop, behavior: 'instant' })
      currentScrollRef.current = savedScrollPercent

      const actualScrollTop = window.scrollY || document.documentElement.scrollTop
      const actualPercent = scrollHeight > 0 ? (actualScrollTop / scrollHeight) * 100 : 0

      if (Math.abs(actualPercent - savedScrollPercent) < 5 || attempts >= 10) {
        return
      }

      rafId = requestAnimationFrame(applyScroll)
    }

    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(applyScroll)
    }, 100)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [bookId, chapterIndex, content])

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
