"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Type, Moon, Sun, List, ArrowUp } from 'lucide-react'
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ReaderFooterProps {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  onFontDecrease: () => void
  onFontIncrease: () => void
  onThemeToggle: (event?: React.MouseEvent<HTMLElement>) => void
  onChapterListToggle: () => void
  onBackToTop: () => void
  theme: "light" | "dark"
  chapterIndex?: number
}

export function ReaderFooter({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onFontDecrease,
  onFontIncrease,
  onThemeToggle,
  onChapterListToggle,
  onBackToTop,
  theme,
  chapterIndex,
}: ReaderFooterProps) {
  const [isAtBottom, setIsAtBottom] = useState(false)
  const isTransitioningRef = useRef(false)
  const prevChapterRef = useRef(chapterIndex)

  // When chapter changes, keep current state until scroll restoration completes
  useEffect(() => {
    if (prevChapterRef.current !== chapterIndex) {
      isTransitioningRef.current = true
      prevChapterRef.current = chapterIndex

      // Allow state updates after scroll restoration (150ms delay in chapter-content + buffer)
      const timer = setTimeout(() => {
        isTransitioningRef.current = false
        // Check actual scroll position now
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollY = window.scrollY
        setIsAtBottom((windowHeight + scrollY) >= documentHeight - 50)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [chapterIndex])

  useEffect(() => {
    const handleScroll = () => {
      // Don't update during chapter transition
      if (isTransitioningRef.current) return

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollY = window.scrollY

      // Check if we are near the bottom (within 50px)
      setIsAtBottom((windowHeight + scrollY) >= documentHeight - 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer
      className={cn(
        "fixed bottom-0 z-40 w-full flex justify-center transition-all duration-300 ease-in-out",
        !isAtBottom ? "pb-6" : "pb-0"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
          !isAtBottom
            ? "w-[95%] max-w-3xl h-14 rounded-full bg-[#f9f7f1]/98 backdrop-blur-xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-2.5 dark:bg-background/98 dark:shadow-[0_-8px_30px_rgb(0,0,0,0.2)]"
            : "w-full h-auto bg-[#f9f7f1]/98 backdrop-blur supports-[backdrop-filter]:bg-[#f9f7f1]/60 px-4 dark:bg-background/98 dark:supports-[backdrop-filter]:bg-background/60 pb-[env(safe-area-inset-bottom)] rounded-none"
        )}
      >
        <div className={cn("container mx-auto max-w-5xl px-2 py-2 w-full", !isAtBottom && "px-4")}>
          <div className="sm:hidden grid grid-cols-7 items-center gap-0">
            <Button variant="ghost" size="sm" onClick={onChapterListToggle} className="h-9 w-full justify-center rounded-full">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onFontDecrease} className="h-9 w-full justify-center rounded-full">
              <Type className="h-3.5 w-3.5" />
              <span className="text-xs">−</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onFontIncrease} className="h-9 w-full justify-center rounded-full">
              <Type className="h-4 w-4" />
              <span className="text-xs">+</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => onThemeToggle(e)} className="h-9 w-full justify-center rounded-full">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onBackToTop} className="h-9 w-full justify-center rounded-full">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onPrev} disabled={!hasPrev} className="h-9 w-full justify-center rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext} disabled={!hasNext} className="h-9 w-full justify-center rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center justify-between gap-2 h-full">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onChapterListToggle} className="rounded-full">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onFontDecrease} className="rounded-full">
                <Type className="h-3.5 w-3.5" />
                <span className="ml-0.5 text-xs">−</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onFontIncrease} className="rounded-full">
                <Type className="h-4 w-4" />
                <span className="ml-0.5 text-xs">+</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => onThemeToggle(e)} className="rounded-full">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBackToTop} className="rounded-full">
                <ArrowUp className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Top</span>
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onPrev} disabled={!hasPrev} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Prev</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onNext} disabled={!hasNext} className="rounded-full">
                <span className="mr-1 hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
