"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Home, ArrowLeft, FolderPlus, ArrowUpDown, Menu, BookOpen, ChevronRight } from "lucide-react"
import type { SortBy } from "@/lib/db/books"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  currentFolderName?: string
  bookCount: number
  onBackToRoot?: () => void
  onHomeClick: () => void
  onCreateFolder: () => void
  sortBy: SortBy
  onSortChange: (sortBy: SortBy) => void
}

const sortLabels: Record<SortBy, string> = {
  name: "Name (A-Z)",
  addedAt: "Date Added",
  lastReadAt: "Last Read",
  progress: "Progress",
}

export function MobileMenu({
  currentFolderName,
  bookCount,
  onBackToRoot,
  onHomeClick,
  onCreateFolder,
  sortBy,
  onSortChange,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const handleSortChange = (newSortBy: SortBy) => {
    onSortChange(newSortBy)
    setOpen(false)
  }

  const handleCreateFolder = () => {
    onCreateFolder()
    setOpen(false)
  }

  const handleBackToRoot = () => {
    onBackToRoot?.()
    setOpen(false)
  }

  const handleHomeClick = () => {
    onHomeClick()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 border-r border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f18]/95 p-0">
        <SheetHeader className="border-b border-slate-100 p-5 dark:border-white/5">
          <SheetTitle className="text-left">
            <div className="flex items-center gap-2.5">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
               </div>
               <span className="font-bold tracking-tight">EPUB Reader</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-4 space-y-6">
           {currentFolderName && (
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Folder</div>
                <div className="flex items-center gap-1.5 font-semibold text-lg">
                  <span className="truncate">{currentFolderName}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                   {bookCount} {bookCount === 1 ? "item" : "items"} inside
                </div>
              </div>
           )}

          <div className="space-y-1">
             <div className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Navigation</div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 rounded-xl font-normal"
              onClick={handleHomeClick}
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              Home
            </Button>

            {currentFolderName && onBackToRoot ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 rounded-xl font-normal"
                onClick={handleBackToRoot}
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                Back to Library
              </Button>
            ) : (
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 h-10 rounded-xl font-normal",
                        !currentFolderName && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => setOpen(false)} // Already at library root
                >
                    <BookOpen className={cn("h-4 w-4", !currentFolderName ? "text-primary" : "text-muted-foreground")} />
                    Library Root
                </Button>
            )}

            {!currentFolderName && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 rounded-xl font-normal"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="h-4 w-4 text-muted-foreground" />
                New Folder
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <div className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Sort Library</div>
            {Object.entries(sortLabels).map(([key, label]) => (
              <Button
                key={key}
                variant="ghost"
                className={cn(
                    "w-full justify-between h-10 rounded-xl font-normal group",
                    sortBy === key && "bg-slate-100 dark:bg-white/10"
                )}
                onClick={() => handleSortChange(key as SortBy)}
              >
                <span className="flex items-center gap-3">
                    <ArrowUpDown className={cn("h-4 w-4 text-muted-foreground", sortBy === key && "text-foreground")} />
                    {label}
                </span>
                {sortBy === key && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
