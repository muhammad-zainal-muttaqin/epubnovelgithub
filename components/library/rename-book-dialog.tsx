"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RenameBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string, author: string) => void
  initialTitle: string
  initialAuthor: string
}

export function RenameBookDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTitle,
  initialAuthor,
}: RenameBookDialogProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setTitle(initialTitle || "")
      setAuthor(initialAuthor || "")
      setError("")
    }
  }, [open, initialTitle, initialAuthor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    
    if (!trimmedTitle) {
      setError("Book title cannot be empty")
      return
    }

    onSubmit(trimmedTitle, author.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Book Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="book-title">Title</Label>
              <Input
                id="book-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError("")
                }}
                placeholder="Enter book title"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-author">Author</Label>
              <Input
                id="book-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

