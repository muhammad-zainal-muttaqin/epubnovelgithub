"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Loader2, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFolder } from '@/lib/db/folders'
import { useEffect, useState, useRef } from 'react'
import { TranslateMenu } from "./translate-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ReaderHeaderProps {
  bookTitle: string
  chapterTitle: string
  progress: number
  onSettingsClick: () => void
  bookFolderId?: string
  apiKey?: string
  isTranslating: boolean
  currentLanguage: string
  onTranslate: (lang: string, force?: boolean) => void
  chapterIndex?: number
  onCancelTranslate?: () => void
}

export function ReaderHeader({
  bookTitle,
  chapterTitle,
  progress,
  onSettingsClick,
  bookFolderId,
  apiKey,
  isTranslating,
  currentLanguage,
  onTranslate,
  chapterIndex,
  onCancelTranslate
}: ReaderHeaderProps) {
  const router = useRouter()
  const [folderSlug, setFolderSlug] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
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
        setIsScrolled(window.scrollY > 10)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [chapterIndex])

  useEffect(() => {
    const handleScroll = () => {
      // Don't update during chapter transition
      if (isTransitioningRef.current) return
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (bookFolderId) {
      getFolder(bookFolderId).then(folder => {
        if (folder?.slug) {
          setFolderSlug(folder.slug)
        }
      }).catch(console.error)
    } else {
      setFolderSlug(null)
    }
  }, [bookFolderId])

  const handleBackClick = () => {
    if (folderSlug) {
      router.push(`/library?folder=${folderSlug}`)
    } else {
      router.push("/library")
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full flex justify-center transition-all duration-300 ease-in-out",
        isScrolled ? "pt-6" : "pt-0"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
          isScrolled
            ? "w-[95%] max-w-3xl h-12 rounded-full border border-[#e8e4dc]/60 bg-[#f9f7f1]/70 backdrop-blur-sm shadow-[0_8px_32px_rgb(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] px-2 dark:border-white/10 dark:bg-[#0a0f18]/70 dark:shadow-[0_8px_32px_rgb(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]"
            : "w-full h-14 border-b border-[#e8e4dc]/50 bg-[#f9f7f1]/80 px-4 dark:border-white/5 dark:bg-[#0a0f18]/80 rounded-none"
        )}
      >
        <div className={cn("container mx-auto flex items-center justify-between h-full", !isScrolled && "max-w-5xl")}>
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-8 w-8 shrink-0 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={cn("hidden sm:block min-w-0 overflow-hidden transition-all duration-300 ease-in-out", isScrolled ? "opacity-0 w-0" : "opacity-100")}>
              <h1 className="text-sm font-semibold leading-tight truncate">{bookTitle}</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{chapterTitle}</p>

                {isTranslating && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal animate-pulse gap-1 bg-primary/10 text-primary border-primary/20">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Translating...
                  </Badge>
                )}

                {!isTranslating && currentLanguage && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    <Globe className="h-2.5 w-2.5" />
                    {currentLanguage}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className={cn("hidden text-xs text-muted-foreground sm:inline mr-2 transition-all duration-300", isScrolled ? "text-[10px]" : "")}>{Math.round(progress)}%</span>

            <div className="sm:hidden flex items-center mr-1">
              {isTranslating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              {!isTranslating && currentLanguage && <Globe className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
            </div>

            <TranslateMenu
              apiKey={apiKey}
              isTranslating={isTranslating}
              currentLanguage={currentLanguage}
              onTranslate={onTranslate}
              onOpenSettings={onSettingsClick}
              onCancelTranslate={onCancelTranslate}
            />

            <Button variant="ghost" size="icon" onClick={onSettingsClick} className="h-8 w-8 rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
