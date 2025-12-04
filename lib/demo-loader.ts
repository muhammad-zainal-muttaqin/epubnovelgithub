import { parseEPUB } from "./epub/epubParser"
import { saveBook } from "./db/books"
import { saveChapters } from "./db/chapters"
import { getBook } from "./db/books"

const DEMO_LOADED_KEY = "demo-epub-loaded"

export async function loadDemoEPUBIfNeeded() {
  if (typeof window === "undefined") return

  try {
    const demoLoaded = localStorage.getItem(DEMO_LOADED_KEY)
    if (demoLoaded === "true") return

    const basePath = window.location.pathname.includes("/epubnovelgithub/") ? "/epubnovelgithub" : ""
    
    let demoUrl = `${basePath}/example-demo.epub`
    
    if (basePath === "/epubnovelgithub") {
      demoUrl = "https://raw.githubusercontent.com/muhammad-zainal-muttaqin/epubnovelgithub/main/public/example-demo.epub"
    }
    
    const response = await fetch(demoUrl)
    if (!response.ok) {
      console.warn("Demo EPUB file not found, skipping demo load")
      localStorage.setItem(DEMO_LOADED_KEY, "true")
      return
    }

    const blob = await response.blob()
    const file = new File([blob], "Unnamed Memory -after the end- 1.epub", { type: "application/epub+zip" })

    const { book, chapters } = await parseEPUB(file)

    const existingBook = await getBook(book.id)
    if (existingBook) {
      localStorage.setItem(DEMO_LOADED_KEY, "true")
      return
    }

    await saveBook(book)
    await saveChapters(chapters)

    localStorage.setItem(DEMO_LOADED_KEY, "true")
    console.log("Demo EPUB loaded successfully:", book.title)
  } catch (error) {
    console.error("Failed to load demo EPUB:", error)
    localStorage.setItem(DEMO_LOADED_KEY, "true")
  }
}

