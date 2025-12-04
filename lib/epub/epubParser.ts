import JSZip from "jszip"
import type { Book, Chapter } from "@/lib/types"
import { sanitizeHtml } from "./sanitizeHtml"

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function normalizePath(path: string): string {
  return path.replace(/^\.\//, "").replace(/\/+/g, "/")
}

function resolvePath(basePath: string, relativePath: string): string {
  const base = basePath.split("/").slice(0, -1)
  const relative = relativePath.split("/")

  for (const part of relative) {
    if (part === "..") {
      base.pop()
    } else if (part !== "." && part !== "") {
      base.push(part)
    }
  }

  return base.join("/")
}

interface TOCItem {
  label: string
  href: string
  children?: TOCItem[]
}

async function parseNavXhtml(zip: JSZip, navHref: string, basePath: string): Promise<TOCItem[]> {
  const navPath = resolvePath(basePath, navHref)
  const navFile = zip.file(navPath)

  if (!navFile) return []

  const navContent = await navFile.async("text")
  const parser = new DOMParser()
  const navDoc = parser.parseFromString(navContent, "text/html")
  const tocNav = navDoc.querySelector('nav[*|type="toc"], nav#toc')

  if (!tocNav) return []

  const items: TOCItem[] = []
  const navItems = tocNav.querySelectorAll("ol > li, ul > li")

  navItems.forEach((li) => {
    const link = li.querySelector("a")
    if (!link) return
    const href = link.getAttribute("href") || ""
    const label = link.textContent?.trim() || ""
    if (href && label) items.push({ label, href: normalizePath(resolvePath(navPath, href)) })
  })

  return items
}

async function parseTocNcx(zip: JSZip, ncxHref: string, basePath: string): Promise<TOCItem[]> {
  const ncxPath = resolvePath(basePath, ncxHref)
  const ncxFile = zip.file(ncxPath)

  if (!ncxFile) return []

  const ncxContent = await ncxFile.async("text")
  const parser = new DOMParser()
  const ncxDoc = parser.parseFromString(ncxContent, "text/xml")
  const items: TOCItem[] = []
  const navPoints = ncxDoc.querySelectorAll("navPoint")

  navPoints.forEach((navPoint) => {
    const navLabel = navPoint.querySelector("navLabel text")
    const content = navPoint.querySelector("content")
    if (!navLabel || !content) return
    const label = navLabel.textContent?.trim() || ""
    const href = content.getAttribute("src") || ""
    if (href && label) items.push({ label, href: normalizePath(resolvePath(ncxPath, href)) })
  })

  return items
}

async function parseTOC(zip: JSZip, opfDoc: Document, basePath: string): Promise<TOCItem[]> {
  const navItem = opfDoc.querySelector('item[properties*="nav"]')
  if (navItem?.getAttribute("href")) {
    const items = await parseNavXhtml(zip, navItem.getAttribute("href")!, basePath)
    if (items.length > 0) return items
  }

  const tocItem = opfDoc.querySelector('item[media-type="application/x-dtbncx+xml"]')
  if (tocItem?.getAttribute("href")) {
    const items = await parseTocNcx(zip, tocItem.getAttribute("href")!, basePath)
    if (items.length > 0) return items
  }

  return []
}

function rewriteInternalLinks(
  html: string,
  hrefToIndexMap: Map<string, number>,
  bookId: string,
  currentChapterHref: string
): string {
  return html.replace(/<a([^>]*)href="([^"]*)"([^>]*)>/gi, (match, before, href, after) => {
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//") || href.startsWith("#") || (href.includes(":") && !href.startsWith("#"))) return match

    try {
      const currentDir = currentChapterHref.split("/").slice(0, -1).join("/")
      const resolvedHref = resolvePath(currentDir + "/", href)
      const normalizedHref = normalizePath(resolvedHref)
      const [baseHref, anchor] = normalizedHref.split("#")
      const chapterIndex = hrefToIndexMap.get(baseHref)

      if (chapterIndex !== undefined) {
        const newHref = `/reader?bookId=${bookId}&chapterId=${chapterIndex}${anchor ? "#" + anchor : ""}`
        return `<a${before}href="${newHref}"${after}>`
      }
    } catch (error) {
      console.error("Error rewriting link:", href, error)
    }

    return match
  })
}

async function extractImages(zip: JSZip, opfContent: string, basePath: string): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()
  const manifestRegex = /<item[^>]*media-type="image\/[^"]*"[^>]*>/g
  const matches = opfContent.match(manifestRegex) || []

  for (const match of matches) {
    const hrefMatch = match.match(/href="([^"]*)"/)
    if (!hrefMatch) continue

    const href = hrefMatch[1]
    const normalizedPath = normalizePath(resolvePath(basePath, href))

    try {
      const imageFile = zip.file(normalizedPath)
      if (!imageFile) continue

      const imageData = await imageFile.async("arraybuffer")
      const base64 = arrayBufferToBase64(imageData)
      const ext = normalizedPath.split(".").pop()?.toLowerCase()
      const mimeTypeMap: { [key: string]: string } = {
        jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", svg: "image/svg+xml"
      }
      const mimeType = mimeTypeMap[ext || ""] || "image/jpeg"
      const dataUrl = `data:${mimeType};base64,${base64}`
      imageMap.set(normalizePath(href), dataUrl)
    } catch (error) {
      console.error("Error extracting image:", normalizedPath, error)
    }
  }

  return imageMap
}

function replaceImagePaths(html: string, imageMap: Map<string, string>, chapterHref: string): string {
  const chapterDir = chapterHref.split("/").slice(0, -1).join("/")

  return html.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, (match, src) => {
    let resolvedPath = src.startsWith("http") ? src : normalizePath(resolvePath(chapterDir + "/", src))
    let dataUrl = imageMap.get(resolvedPath)

    if (!dataUrl) {
      const filename = resolvedPath.split("/").pop() || ""
      for (const [key, value] of imageMap.entries()) {
        if (key.endsWith(filename)) {
          dataUrl = value
          break
        }
      }
    }

    return dataUrl ? match.replace(src, dataUrl) : match
  })
}

export async function parseEPUB(file: File, folderId?: string | null): Promise<{ book: Book; chapters: Chapter[]; tocChapters: import("@/lib/types").TOCChapter[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const containerFile = zip.file("META-INF/container.xml")
  if (!containerFile) {
    throw new Error("Invalid EPUB: container.xml not found")
  }

  const containerContent = await containerFile.async("text")
  const opfPathMatch = containerContent.match(/full-path="([^"]+)"/)
  if (!opfPathMatch) {
    throw new Error("Invalid EPUB: OPF path not found")
  }

  const opfPath = opfPathMatch[1]
  const basePath = opfPath.substring(0, opfPath.lastIndexOf("/") + 1)

  const opfFile = zip.file(opfPath)
  if (!opfFile) {
    throw new Error("Invalid EPUB: OPF file not found")
  }

  const opfContent = await opfFile.async("text")
  const parser = new DOMParser()
  const opfDoc = parser.parseFromString(opfContent, "text/xml")

  const metadata = opfDoc.querySelector("metadata")
  const title = metadata?.querySelector("title")?.textContent || file.name.replace(".epub", "")
  const author = metadata?.querySelector("creator")?.textContent || "Unknown Author"

  const tocItems = await parseTOC(zip, opfDoc, basePath)
  const imageMap = await extractImages(zip, opfContent, basePath)

  let cover: string | undefined

  const coverMeta = opfDoc.querySelector('meta[name="cover"]')
  const coverId = coverMeta?.getAttribute("content")
  if (coverId) {
    const coverItem = opfDoc.querySelector(`item[id="${coverId}"]`)
    const coverHref = coverItem?.getAttribute("href")
    if (coverHref) {
      const normalized = normalizePath(coverHref)
      cover = imageMap.get(normalized) || imageMap.get(normalizePath(resolvePath(basePath, coverHref)))
      if (!cover) {
        for (const [key, value] of imageMap.entries()) {
          if (key.endsWith(normalized.split("/").pop()!)) {
            cover = value
            break
          }
        }
      }
    }
  }

  if (!cover) {
    for (const [key, value] of imageMap.entries()) {
      if (key.toLowerCase().includes("cover")) {
        cover = value
        break
      }
    }
  }

  if (!cover && imageMap.size > 0) cover = Array.from(imageMap.values())[0]

  const spine = opfDoc.querySelector("spine")
  const spineItems = Array.from(spine?.querySelectorAll("itemref") || [])

  const chapters: Chapter[] = []
  const bookId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

  for (let i = 0; i < spineItems.length; i++) {
    const itemref = spineItems[i]
    const idref = itemref.getAttribute("idref")
    if (!idref) continue

    const item = opfDoc.querySelector(`item[id="${idref}"]`)
    if (!item) continue

    const href = item.getAttribute("href")
    if (!href) continue

    try {
      const chapterFile = zip.file(resolvePath(basePath, href))
      if (!chapterFile) continue

      let chapterContent = await chapterFile.async("text")
      chapterContent = replaceImagePaths(chapterContent, imageMap, href)
      const sanitized = sanitizeHtml(chapterContent)
      const chapterDoc = parser.parseFromString(chapterContent, "text/html")

      let chapterTitle = chapterDoc.querySelector("h1, h2, h3")?.textContent?.trim() || ""

      if (!chapterTitle || chapterTitle === title || chapterTitle.length > 100) {
        const filename = href.split("/").pop()?.replace(/\.(xhtml|html|xml)$/i, "") || ""
        const lowerFilename = filename.toLowerCase()

        const titleMap: { [key: string]: string } = {
          cover: "Cover", copyright: "Copyright", toc: "Contents", contents: "Contents",
          titlepage: "Title Page", title: "Title Page", dedication: "Dedication",
          preface: "Preface", foreword: "Preface", prologue: "Prologue", epilogue: "Epilogue", afterword: "Afterword"
        }

        for (const [key, value] of Object.entries(titleMap)) {
          if (lowerFilename.includes(key)) {
            chapterTitle = value
            break
          }
        }

        if (!chapterTitle) {
          if (lowerFilename.match(/^(ch|chap|chapter)[\s_-]*\d+/)) {
            const numMatch = filename.match(/\d+/)
            chapterTitle = numMatch ? `Chapter ${numMatch[0]}` : filename.replace(/[\s_-]+/g, " ").replace(/\b\w/g, l => l.toUpperCase())
          } else if (lowerFilename.match(/^(insert|illustration)[\s_-]*/)) {
            const numMatch = filename.match(/\d+/)
            chapterTitle = numMatch ? `Insert ${numMatch[0]}` : "Insert"
          } else {
            chapterTitle = filename.replace(/[\s_-]+/g, " ").replace(/\b\w/g, l => l.toUpperCase())
          }
        }
      }

      chapters.push({
        id: `${bookId}-chapter-${i}`,
        bookId,
        index: i,
        title: chapterTitle || `Chapter ${i + 1}`,
        content: sanitized,
        href: normalizePath(href),
      })
    } catch (error) {
      console.error("Error processing chapter", i, ":", error)
    }
  }

  const hrefToIndexMap = new Map<string, number>()
  chapters.forEach((chapter, index) => {
    const baseHref = normalizePath(chapter.href.split("#")[0])
    hrefToIndexMap.set(baseHref, index)
    try {
      hrefToIndexMap.set(normalizePath(resolvePath(basePath, baseHref)), index)
    } catch {}
    hrefToIndexMap.set(chapter.href, index)
  })

  const tocChapters: import("@/lib/types").TOCChapter[] = []
  tocItems.forEach((tocItem, i) => {
    const baseHref = normalizePath(tocItem.href.split("#")[0])
    const startIndex = hrefToIndexMap.get(baseHref)

    if (startIndex === undefined) return

    let endIndex = chapters.length - 1
    if (i < tocItems.length - 1) {
      const nextHref = normalizePath(tocItems[i + 1].href.split("#")[0])
      const nextStartIndex = hrefToIndexMap.get(nextHref)
      if (nextStartIndex !== undefined && nextStartIndex > startIndex) endIndex = nextStartIndex - 1
    }

    const tocChapterId = `toc-chapter-${i}`
    tocChapters.push({ id: tocChapterId, title: tocItem.label, startIndex, endIndex, href: tocItem.href })

    for (let idx = startIndex; idx <= endIndex; idx++) {
      if (chapters[idx]) chapters[idx].tocChapterId = tocChapterId
    }
  })

  for (const chapter of chapters) {
    chapter.content = rewriteInternalLinks(chapter.content, hrefToIndexMap, bookId, chapter.href)
  }

  const isChapterLike = (title: string) => 
    title.toLowerCase().includes("chapter") || 
    title.match(/^(ch|chap)\s*\d+/i) ||
    title.match(/^\d+[.:]/i)

  const actualChapterCount = (tocChapters.length > 0 
    ? tocChapters.filter(toc => isChapterLike(toc.title)).length
    : chapters.filter(ch => isChapterLike(ch.title)).length
  ) || (tocChapters.length > 0 ? tocChapters.length : chapters.length)

  const book: Book = {
    id: bookId,
    title,
    author,
    cover,
    totalChapters: actualChapterCount,
    currentChapter: 0,
    progress: 0,
    addedAt: Date.now(),
    folderId: folderId || undefined,
  }

  return { book, chapters, tocChapters }
}
