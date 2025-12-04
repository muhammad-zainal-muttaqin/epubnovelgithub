import { saveBook } from "./db/books"
import { saveChapters } from "./db/chapters"
import { getBook } from "./db/books"
import demoData from "./demo-data.json"
import type { Chapter } from "./types"

const DEMO_LOADED_KEY = "demo-epub-loaded"

export async function loadDemoEPUBIfNeeded() {
  if (typeof window === "undefined") return

  try {
    const demoLoaded = localStorage.getItem(DEMO_LOADED_KEY)
    if (demoLoaded === "true") return

    const { book, chapters: rawChapters } = demoData as any

    book.addedAt = Date.now()
    
    const existingBook = await getBook(book.id)
    if (existingBook) {
      localStorage.setItem(DEMO_LOADED_KEY, "true")
      return
    }

    const chapters: Chapter[] = rawChapters.map((ch: any) => ({
      id: ch.id,
      bookId: book.id,
      index: ch.index,
      title: ch.title,
      content: ch.content,
      href: `demo-${ch.index}.xhtml`
    }))

    await saveBook(book)
    await saveChapters(chapters)

    localStorage.setItem(DEMO_LOADED_KEY, "true")
    console.log("Demo loaded successfully:", book.title)
  } catch (error) {
    console.error("Failed to load demo:", error)
    localStorage.setItem(DEMO_LOADED_KEY, "true")
  }
}

