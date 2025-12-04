"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Search, Check, Book } from "lucide-react"
import type { Chapter, TOCChapter } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChapterSidebarProps {
  chapters: Chapter[]
  currentChapterIndex: number
  onChapterSelect: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  tocChapters?: TOCChapter[]
}

export function ChapterSidebar({
  chapters,
  currentChapterIndex,
  onChapterSelect,
  open,
  onOpenChange,
  tocChapters,
}: ChapterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const chaptersToShow = tocChapters && tocChapters.length > 0 ? tocChapters : chapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    startIndex: ch.index,
    endIndex: ch.index,
    href: ch.href
  }))

  const filteredChapters = chaptersToShow.filter((chapter) => 
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (index: number) => {
    onChapterSelect(index)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 border-r border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f18]/95">
        <SheetHeader className="border-b border-slate-100 p-5 dark:border-white/5">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Book className="h-4 w-4" />
            </div>
            Table of Contents
          </SheetTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Filter chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-xl border-slate-200 bg-slate-50/50 pl-9 text-sm shadow-none dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-3 space-y-1">
            {filteredChapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">No chapters found</p>
              </div>
            ) : (
              filteredChapters.map((chapter) => {
                const isActive = currentChapterIndex >= chapter.startIndex && currentChapterIndex <= chapter.endIndex
                
                return (
                  <Button
                    key={chapter.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal mb-1 h-auto py-3 px-3 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium" 
                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => handleSelect(chapter.startIndex)}
                    title={chapter.title}
                  >
                    <div className="flex w-full items-start gap-3">
                      <span className={cn("text-[10px] font-mono mt-0.5 opacity-50", isActive && "opacity-100")}>
                        {(chapter.startIndex + 1).toString().padStart(3, '0')}
                      </span>
                      <span className="flex-1 text-sm leading-snug break-words whitespace-normal line-clamp-2">
                        {chapter.title}
                      </span>
                      {isActive && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
                    </div>
                  </Button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
