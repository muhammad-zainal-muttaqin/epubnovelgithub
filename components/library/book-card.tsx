"use client"

import { formatDistanceToNow } from "date-fns"
import { BookOpen, Clock3, FolderInput, MoreVertical, Trash2, Pencil } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Book } from "@/lib/types"

interface BookCardProps {
  book: Book
  onDelete: (bookId: string) => void
  onMove?: (bookId: string) => void
  onRename?: (bookId: string) => void
}

export function BookCard({ book, onDelete, onMove, onRename }: BookCardProps) {
  const router = useRouter()

  const progressValue = Math.max(0, Math.min(100, Math.round(book.progress || 0)))
  const statusLabel = progressValue >= 99 ? "Finished" : progressValue > 0 ? "In progress" : "Unread"
  const statusColor =
    progressValue >= 99 ? "bg-green-500" : progressValue > 0 ? "bg-primary" : "bg-muted-foreground/40"
  const lastReadLabel = book.lastReadAt
    ? `Read ${formatDistanceToNow(book.lastReadAt, { addSuffix: true })}`
    : "Not opened yet"

  const handleRead = () => {
    const chapterIndex = book.currentChapter || 0
    router.push(`/reader?bookId=${book.id}&chapterId=${chapterIndex}`)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete(book.id)
    }
  }

  const handleMove = () => {
    if (onMove) {
      onMove(book.id)
    }
  }

  return (
    <Card className="group overflow-hidden border border-primary/10 bg-card/80 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative h-44 w-full overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-28 sm:flex-shrink-0">
            {book.cover ? (
              <Image
                src={book.cover || "/placeholder.svg"}
                alt={book.title}
                fill
                sizes="(max-width: 640px) 100vw, 176px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-muted/70">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressValue}%` }}
                aria-hidden
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 font-semibold leading-tight" title={book.title}>
                  {book.title}
                </h3>
                <p className="line-clamp-1 text-xs text-muted-foreground" title={book.author}>
                  {book.author || "Unknown author"}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onMove && (
                    <DropdownMenuItem onClick={() => setTimeout(handleMove, 50)}>
                      <FolderInput className="mr-2 h-4 w-4" />
                      Move to folder
                    </DropdownMenuItem>
                  )}
                  {onRename && (
                    <DropdownMenuItem onClick={() => onRename(book.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {book.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{book.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${statusColor}`} />
                <span>
                  {statusLabel} - {progressValue}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{lastReadLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{book.totalChapters} chapters</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{progressValue}%</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button size="sm" onClick={handleRead} className="w-full sm:flex-1">
                <BookOpen className="mr-1.5 h-4 w-4" />
                {progressValue > 0 ? "Continue" : "Read"}
              </Button>
              {onMove && (
                <Button size="sm" variant="outline" onClick={handleMove} className="w-full sm:w-auto sm:flex-shrink-0">
                  <FolderInput className="mr-1.5 h-4 w-4" />
                  Move
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
