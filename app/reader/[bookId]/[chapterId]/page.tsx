"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { getBook, updateBook } from "@/lib/db/books"
import { getChaptersByBook } from "@/lib/db/chapters"
import { updateProgress } from "@/lib/db/progress"
import type { Book, Chapter, ReaderSettings, TOCChapter } from "@/lib/types"
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/keys"
import { ReaderHeader } from "@/components/reader/reader-header"
import { ReaderFooter } from "@/components/reader/reader-footer"
import { ChapterSidebar } from "@/components/reader/chapter-sidebar"
import { ChapterContent } from "@/components/reader/chapter-content"
import { ProgressBar } from "@/components/reader/progress-bar"
import { SettingsDialog } from "@/components/reader/settings-dialog"
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "sonner"

export default function ReaderPage() {
  const params = useParams()
  const bookId = params.bookId as string
  const chapterId = params.chapterId as string
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [tocChapters, setTocChapters] = useState<TOCChapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS)
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    return DEFAULT_SETTINGS
  })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>("")
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS)
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookData = await getBook(bookId)
        if (!bookData) {
          router.push("/library")
          return
        }

        const chaptersData = await getChaptersByBook(bookId)
        if (chaptersData.length === 0) {
          router.push("/library")
          return
        }

        setBook(bookData)
        setChapters(chaptersData)

        const chapterIndex = Number.parseInt(chapterId)
        if (chapterIndex >= 0 && chapterIndex < chaptersData.length) {
          setCurrentChapterIndex(chapterIndex)
        } else {
          setCurrentChapterIndex(0)
        }
        
        const savedTOCChapters = localStorage.getItem(`toc-chapters-${bookId}`)
        if (savedTOCChapters) {
          setTocChapters(JSON.parse(savedTOCChapters))
        }
      } catch (error) {
        console.error("Error loading reader data:", error)
        router.push("/library")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [bookId, router])

  useEffect(() => {
    const chapterIndex = Number.parseInt(chapterId)
    if (!isNaN(chapterIndex) && chapterIndex >= 0 && chapters.length > 0 && chapterIndex < chapters.length) {
      setCurrentChapterIndex(chapterIndex)
      setScrollProgress(0)
      setTranslatedContent(null)
      setCurrentLanguage("")
    }
  }, [chapterId, chapters.length])

  useEffect(() => {
    if (!book || chapters.length === 0) return

    const saveProgressData = async () => {
      const currentChapter = chapters[currentChapterIndex]
      if (!currentChapter) return

      const overallProgress = Math.min(((currentChapterIndex + scrollProgress / 100) / chapters.length) * 100, 100)

      await updateProgress(book.id, {
        chapterId: currentChapter.id,
        chapterIndex: currentChapterIndex,
        scrollPosition: scrollProgress,
        percentage: overallProgress,
      })

      await updateBook(book.id, {
        currentChapter: currentChapterIndex,
        progress: overallProgress,
        lastReadAt: Date.now(),
      })
    }

    const timer = setTimeout(saveProgressData, 1000)
    return () => clearTimeout(timer)
  }, [book, chapters, currentChapterIndex, scrollProgress])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          handlePrevChapter()
          break
        case "ArrowRight":
          e.preventDefault()
          handleNextChapter()
          break
        case "[":
          e.preventDefault()
          handleFontDecrease()
          break
        case "]":
          e.preventDefault()
          handleFontIncrease()
          break
        case "t":
          e.preventDefault()
          handleThemeToggle()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentChapterIndex, chapters.length, settings])

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const newIndex = currentChapterIndex - 1
      setCurrentChapterIndex(newIndex)
      setScrollProgress(0)
      router.push(`/reader/${bookId}/${newIndex}`)
    }
  }, [currentChapterIndex, bookId, router])

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      const newIndex = currentChapterIndex + 1
      setCurrentChapterIndex(newIndex)
      setScrollProgress(0)
      router.push(`/reader/${bookId}/${newIndex}`)
    }
  }, [currentChapterIndex, chapters.length, bookId, router])

  const handleChapterSelect = useCallback(
    (index: number) => {
      setCurrentChapterIndex(index)
      setScrollProgress(0)
      router.push(`/reader/${bookId}/${index}`)
    },
    [bookId, router],
  )

  const handleFontDecrease = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.max(14, prev.fontSize - 1),
    }))
  }, [])

  const handleFontIncrease = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(24, prev.fontSize + 1),
    }))
  }, [])

  const handleThemeToggle = useCallback((event?: React.MouseEvent<HTMLElement>) => {
    const newTheme = theme === "light" ? "dark" : "light"
    
    if (event) {
      const { toggleThemeWithTransition } = require("@/lib/theme-transition")
      toggleThemeWithTransition(event, setTheme, theme)
    } else {
      setTheme(newTheme)
    }
    
    setSettings((prev) => ({
      ...prev,
      theme: newTheme as "light" | "dark",
    }))
  }, [theme, setTheme])

  const handleSettingsChange = useCallback((updates: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleTranslate = useCallback(async (targetLang: string) => {
    const currentChapter = chapters[currentChapterIndex]
    if (!currentChapter) return

    if (currentLanguage === targetLang && translatedContent) return
    
    const cacheKey = `${currentChapter.id}-${targetLang}`
    if (translationCache[cacheKey]) {
      setTranslatedContent(translationCache[cacheKey])
      setCurrentLanguage(targetLang)
      toast.success(`Loaded translation from cache`)
      return
    }

    if (!settings.apiKey) {
      setSettingsOpen(true)
      toast.error("API Key Required", { description: "Please enter your Gemini API Key in settings." })
      return
    }

    setIsTranslating(true)
    try {
      const imgTags: string[] = []
      const contentWithPlaceholders = currentChapter.content.replace(/<img[^>]*>/g, (match) => {
        imgTags.push(match)
        return `__IMG_PLACEHOLDER_${imgTags.length - 1}__`
      })

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-google-api-key": settings.apiKey,
        },
        body: JSON.stringify({
          text: contentWithPlaceholders,
          targetLang,
          bookTitle: book?.title || "",
          chapterTitle: displayChapterTitle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      let restoredContent = data.translatedText
      imgTags.forEach((tag, index) => {
        const placeholderRegex = new RegExp(`__\\s*IMG_PLACEHOLDER_${index}\\s*__`, "gi")
        restoredContent = restoredContent.replace(placeholderRegex, tag)
      })

      setTranslatedContent(restoredContent)
      setCurrentLanguage(targetLang)
      setTranslationCache(prev => ({ ...prev, [cacheKey]: restoredContent }))
      toast.success(`Translated to ${targetLang}`)
    } catch (error: any) {
      console.error("Translation error:", error)
      toast.error("Translation Failed", { description: error.message })
    } finally {
      setIsTranslating(false)
    }
  }, [chapters, currentChapterIndex, settings.apiKey, currentLanguage, translatedContent])

  const handleBackToTop = useCallback(() => {
    const selectors = [
      '[data-chapter-content]',
      '.overflow-y-auto',
      'div[class*="overflow-y-auto"]'
    ]
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        const originalScrollBehavior = element.style.scrollBehavior
        element.style.scrollBehavior = 'auto'
        
        const startPosition = element.scrollTop
        const distance = startPosition
        const duration = Math.min(800, Math.max(300, distance * 0.5))
        let startTime: number | null = null

        const easeInOutCubic = (t: number): number => {
          return t < 0.5 
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime
          const timeElapsed = currentTime - startTime
          const progress = Math.min(timeElapsed / duration, 1)
          
          const easedProgress = easeInOutCubic(progress)
          element.scrollTop = startPosition - (distance * easedProgress)
          
          if (progress < 1) {
            requestAnimationFrame(animation)
          } else {
            element.style.scrollBehavior = originalScrollBehavior
          }
        }
        
        requestAnimationFrame(animation)
        return
      }
    }
    
    const startPosition = window.pageYOffset
    const distance = startPosition
    const duration = Math.min(800, Math.max(300, distance * 0.5))
    let startTime: number | null = null

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      const easedProgress = easeInOutCubic(progress)
      window.scrollTo(0, startPosition - (distance * easedProgress))
      
      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }
    
    requestAnimationFrame(animation)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!book || chapters.length === 0) {
    return null
  }

  const currentChapter = chapters[currentChapterIndex]
  const overallProgress = Math.min(((currentChapterIndex + scrollProgress / 100) / chapters.length) * 100, 100)

  let displayChapterTitle = currentChapter?.title || ""
  if (tocChapters && tocChapters.length > 0) {
    const tocGroup = tocChapters.find(
      (tc) => currentChapterIndex >= tc.startIndex && currentChapterIndex <= tc.endIndex,
    )
    if (tocGroup) {
      displayChapterTitle = tocGroup.title
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <ProgressBar progress={overallProgress} />

      <ReaderHeader
        bookTitle={book.title}
        chapterTitle={displayChapterTitle}
        progress={overallProgress}
        onSettingsClick={() => setSettingsOpen(true)}
        bookFolderId={book.folderId}
        apiKey={settings.apiKey}
        isTranslating={isTranslating}
        currentLanguage={currentLanguage}
        onTranslate={handleTranslate}
      />

      <main className="flex-1">
        <ChapterContent
          content={translatedContent || currentChapter.content}
          fontSize={settings.fontSize}
          fontFamily={settings.fontFamily}
          lineHeight={settings.lineHeight}
          maxWidth={settings.maxWidth}
          textAlign={settings.textAlign}
          onScroll={setScrollProgress}
        />
      </main>

      <ReaderFooter
        hasPrev={currentChapterIndex > 0}
        hasNext={currentChapterIndex < chapters.length - 1}
        onPrev={handlePrevChapter}
        onNext={handleNextChapter}
        onFontDecrease={handleFontDecrease}
        onFontIncrease={handleFontIncrease}
        onThemeToggle={handleThemeToggle}
        onChapterListToggle={() => setSidebarOpen(true)}
        onBackToTop={handleBackToTop}
        theme={(theme as "light" | "dark") || "light"}
      />

      <ChapterSidebar
        chapters={chapters}
        currentChapterIndex={currentChapterIndex}
        onChapterSelect={handleChapterSelect}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        tocChapters={tocChapters}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <Toaster />
    </div>
  )
}
