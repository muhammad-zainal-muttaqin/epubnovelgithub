"use client"

import { Button } from "@/components/ui/button"
import { Home, ChevronRight, FolderPlus, ArrowUpDown, ArrowLeft, Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MobileMenu } from "./mobile-menu"
import { useTheme } from "next-themes"
import type { SortBy } from "@/lib/db/books"
import { toggleThemeWithTransition } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface LibraryHeaderProps {
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

export function LibraryHeader({
  currentFolderName,
  bookCount,
  onBackToRoot,
  onHomeClick,
  onCreateFolder,
  sortBy,
  onSortChange,
}: LibraryHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            ? "w-[95%] max-w-3xl h-12 rounded-full border border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-[0_8px_32px_rgb(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] px-2 dark:border-white/10 dark:bg-[#0a0f18]/70 dark:shadow-[0_8px_32px_rgb(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]"
            : "w-full h-14 border-b border-slate-200/50 bg-white/80 px-4 dark:border-white/5 dark:bg-[#0a0f18]/80 rounded-none"
        )}
      >
        <div className={cn("container mx-auto flex items-center justify-between h-full", !isScrolled && "max-w-5xl")}>
          <div className="flex md:hidden items-center gap-2 flex-1">
            <MobileMenu
              currentFolderName={currentFolderName}
              bookCount={bookCount}
              onBackToRoot={onBackToRoot}
              onHomeClick={onHomeClick}
              onCreateFolder={onCreateFolder}
              sortBy={sortBy}
              onSortChange={onSortChange}
            />
            <div className="flex items-baseline gap-2 overflow-hidden">
              {currentFolderName ? (
                <div className="flex items-center gap-1 text-base text-muted-foreground overflow-hidden">
                  <span className="truncate font-semibold text-foreground">{currentFolderName}</span>
                </div>
              ) : (
                <h1 className="text-lg font-semibold truncate">Library</h1>
              )}
            </div>
          </div>

          <div className="flex md:hidden">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
                aria-label="Toggle theme"
                className={cn("text-muted-foreground transition-all duration-300 rounded-full", isScrolled ? "h-9 w-9" : "h-9 w-9")}
              >
                <Sun className={cn("rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0", isScrolled ? "h-4 w-4" : "h-4 w-4")} />
                <Moon className={cn("absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100", isScrolled ? "h-4 w-4" : "h-4 w-4")} />
              </Button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onHomeClick}
              className="h-9 w-9 rounded-full"
              title="Back to Home"
            >
              <Home className="h-4 w-4" />
            </Button>

            {currentFolderName && onBackToRoot && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackToRoot}
                className="h-9 w-9 rounded-full"
                title="Back to Library Root"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex items-baseline gap-2">
              {currentFolderName ? (
                <div className="flex items-center gap-2 text-lg text-muted-foreground">
                  <button
                    onClick={onBackToRoot}
                    className="hover:text-foreground transition-colors cursor-pointer"
                    title="Back to Library Root"
                  >
                    Library
                  </button>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-semibold text-foreground">{currentFolderName}</span>
                </div>
              ) : (
                <h1 className="text-lg font-semibold">Library</h1>
              )}
              <span className="text-xs text-muted-foreground">
                {bookCount} {bookCount === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full h-9">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className={cn("hidden lg:inline transition-all duration-300", isScrolled ? "hidden" : "inline")}>{sortLabels[sortBy]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSortChange("name")}>
                  {sortLabels.name}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("addedAt")}>
                  {sortLabels.addedAt}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("lastReadAt")}>
                  {sortLabels.lastReadAt}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("progress")}>
                  {sortLabels.progress}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!currentFolderName && (
              <Button variant="ghost" size="sm" onClick={onCreateFolder} className="gap-2 rounded-full h-9">
                <FolderPlus className="h-4 w-4" />
                <span className={cn("hidden lg:inline transition-all duration-300", isScrolled ? "hidden" : "inline")}>New Folder</span>
              </Button>
            )}

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
                aria-label="Toggle theme"
                className="h-9 w-9 rounded-full"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
