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
  
  if (!navFile) {
    return []
  }

  const navContent = await navFile.async("text")
  const parser = new DOMParser()
  const navDoc = parser.parseFromString(navContent, "text/html")
  
  const tocNav = navDoc.querySelector('nav[*|type="toc"], nav#toc')
  if (!tocNav) {
    return []
  }

  const items: TOCItem[] = []
  const navItems = tocNav.querySelectorAll("ol > li, ul > li")
  
  navItems.forEach((li) => {
    const link = li.querySelector("a")
    if (link) {
      const href = link.getAttribute("href") || ""
      const label = link.textContent?.trim() || ""
      
      if (href && label) {
        items.push({
          label,
          href: normalizePath(resolvePath(navPath, href)),
        })
      }
    }
  })

  return items
}

async function parseTocNcx(zip: JSZip, ncxHref: string, basePath: string): Promise<TOCItem[]> {
  const ncxPath = resolvePath(basePath, ncxHref)
  const ncxFile = zip.file(ncxPath)
  
  if (!ncxFile) {
    return []
  }

  const ncxContent = await ncxFile.async("text")
  const parser = new DOMParser()
  const ncxDoc = parser.parseFromString(ncxContent, "text/xml")
  
  const items: TOCItem[] = []
  const navPoints = ncxDoc.querySelectorAll("navPoint")
  
  navPoints.forEach((navPoint) => {
    const navLabel = navPoint.querySelector("navLabel text")
    const content = navPoint.querySelector("content")
    
    if (navLabel && content) {
      const label = navLabel.textContent?.trim() || ""
      const href = content.getAttribute("src") || ""
      
      if (href && label) {
        items.push({
          label,
          href: normalizePath(resolvePath(ncxPath, href)),
        })
      }
    }
  })

  return items
}

async function parseTOC(zip: JSZip, opfDoc: Document, basePath: string): Promise<TOCItem[]> {
  const navItem = opfDoc.querySelector('item[properties*="nav"]')
  if (navItem) {
    const navHref = navItem.getAttribute("href")
    if (navHref) {
      const items = await parseNavXhtml(zip, navHref, basePath)
      if (items.length > 0) {
        return items
      }
    }
  }
  
  const tocItem = opfDoc.querySelector('item[media-type="application/x-dtbncx+xml"]')
  if (tocItem) {
    const tocHref = tocItem.getAttribute("href")
    if (tocHref) {
      const items = await parseTocNcx(zip, tocHref, basePath)
      if (items.length > 0) {
        return items
      }
    }
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
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
      return match
    }

    if (href.includes(":") && !href.startsWith("#")) {
      return match
    }

    if (href.startsWith("#")) {
      return match
    }

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
    const fullPath = resolvePath(basePath, href)
    const normalizedPath = normalizePath(fullPath)

    try {
      const imageFile = zip.file(normalizedPath)
      if (!imageFile) {
        continue
      }

      const imageData = await imageFile.async("arraybuffer")
      const base64 = arrayBufferToBase64(imageData)

      const ext = normalizedPath.split(".").pop()?.toLowerCase()
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
            ? "image/png"
            : ext === "gif"
              ? "image/gif"
              : ext === "svg"
                ? "image/svg+xml"
                : "image/jpeg"

      const dataUrl = `data:${mimeType};base64,${base64}`
      const storeKey = normalizePath(href)
      imageMap.set(storeKey, dataUrl)
    } catch (error) {
      console.error("Error extracting image:", normalizedPath, error)
    }
  }

  return imageMap
}

function replaceImagePaths(html: string, imageMap: Map<string, string>, chapterHref: string): string {
  const chapterDir = chapterHref.split("/").slice(0, -1).join("/")

  return html.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, (match, src) => {
    let resolvedPath = src

    if (src.startsWith("../") || src.startsWith("./") || !src.startsWith("http")) {
      resolvedPath = resolvePath(chapterDir + "/", src)
      resolvedPath = normalizePath(resolvedPath)
    }

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

    if (dataUrl) {
      return match.replace(src, dataUrl)
    }

    return match
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
  if (coverMeta) {
    const coverId = coverMeta.getAttribute("content")
    if (coverId) {
      const coverItem = opfDoc.querySelector(`item[id="${coverId}"]`)
      if (coverItem) {
        const coverHref = coverItem.getAttribute("href")
        if (coverHref) {
          const coverPath = normalizePath(resolvePath(basePath, coverHref))
          cover = imageMap.get(normalizePath(coverHref)) || imageMap.get(coverPath)
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

  if (!cover && imageMap.size > 0) {
    cover = Array.from(imageMap.values())[0]
  }

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

    const fullPath = resolvePath(basePath, href)

    try {
      const chapterFile = zip.file(fullPath)
      if (!chapterFile) {
        continue
      }

      let chapterContent = await chapterFile.async("text")
      chapterContent = replaceImagePaths(chapterContent, imageMap, href)
      const sanitized = sanitizeHtml(chapterContent)

      const chapterDoc = parser.parseFromString(chapterContent, "text/html")
      let chapterTitle = ""
      
      const heading = chapterDoc.querySelector("h1, h2, h3")
      if (heading?.textContent && heading.textContent.trim()) {
        chapterTitle = heading.textContent.trim()
      }
      
      if (!chapterTitle || chapterTitle === title || chapterTitle.length > 100) {
        const filename = href.split("/").pop()?.replace(/\.(xhtml|html|xml)$/i, "") || ""
        
        if (filename) {
          const lowerFilename = filename.toLowerCase()
          
          if (lowerFilename.includes("cover")) {
            chapterTitle = "Cover"
          } else if (lowerFilename.includes("copyright")) {
            chapterTitle = "Copyright"
          } else if (lowerFilename.includes("toc") || lowerFilename === "contents") {
            chapterTitle = "Contents"
          } else if (lowerFilename.includes("titlepage") || lowerFilename === "title") {
            chapterTitle = "Title Page"
          } else if (lowerFilename.includes("dedication")) {
            chapterTitle = "Dedication"
          } else if (lowerFilename.includes("preface") || lowerFilename.includes("foreword")) {
            chapterTitle = "Preface"
          } else if (lowerFilename.includes("prologue")) {
            chapterTitle = "Prologue"
          } else if (lowerFilename.includes("epilogue")) {
            chapterTitle = "Epilogue"
          } else if (lowerFilename.includes("afterword")) {
            chapterTitle = "Afterword"
          } else if (lowerFilename.includes("insert") || lowerFilename.includes("illustration")) {
            const insertMatch = filename.match(/(\d+)/)
            if (insertMatch) {
              chapterTitle = `Insert ${insertMatch[1]}`
            } else {
              chapterTitle = "Insert"
            }
          } else if (lowerFilename.match(/^(ch|chap|chapter)[\s_-]*\d+/)) {
            const numMatch = filename.match(/\d+/)
            if (numMatch) {
              const chapterNum = parseInt(numMatch[0], 10)
              chapterTitle = `Chapter ${chapterNum}`
            } else {
              chapterTitle = filename.replace(/[\s_-]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
            }
          } else if (lowerFilename.match(/^apter[\s_-]*\d+/)) {
            const numMatch = filename.match(/\d+/)
            if (numMatch) {
              const chapterNum = parseInt(numMatch[0], 10)
              chapterTitle = `Chapter ${chapterNum}`
            }
          } else {
            chapterTitle = filename.replace(/[\s_-]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          }
        }
      }
      
      if (!chapterTitle) {
        chapterTitle = `Chapter ${i + 1}`
      }

      chapters.push({
        id: `${bookId}-chapter-${i}`,
        bookId,
        index: i,
        title: chapterTitle.trim(),
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
      const absoluteHref = normalizePath(resolvePath(basePath, baseHref))
      hrefToIndexMap.set(absoluteHref, index)
    } catch {}

    hrefToIndexMap.set(chapter.href, index)
  })

  const tocChapters: import("@/lib/types").TOCChapter[] = []
  if (tocItems.length > 0) {
    tocItems.forEach((tocItem, i) => {
      const baseHref = normalizePath(tocItem.href.split("#")[0])
      const startIndex = hrefToIndexMap.get(baseHref)
      
      if (startIndex !== undefined) {
        let endIndex = chapters.length - 1
        if (i < tocItems.length - 1) {
          const nextHref = normalizePath(tocItems[i + 1].href.split("#")[0])
          const nextStartIndex = hrefToIndexMap.get(nextHref)
          if (nextStartIndex !== undefined && nextStartIndex > startIndex) {
            endIndex = nextStartIndex - 1
          }
        }
        
        const tocChapterId = `toc-chapter-${i}`
        tocChapters.push({
          id: tocChapterId,
          title: tocItem.label,
          startIndex,
          endIndex,
          href: tocItem.href
        })
        
        for (let idx = startIndex; idx <= endIndex; idx++) {
          if (chapters[idx]) {
            chapters[idx].tocChapterId = tocChapterId
          }
        }
      }
    })
  }

  for (const chapter of chapters) {
    chapter.content = rewriteInternalLinks(chapter.content, hrefToIndexMap, bookId, chapter.href)
  }

  const actualChapterCount = tocChapters.length > 0
    ? tocChapters.filter(toc => 
        toc.title.toLowerCase().includes("chapter") || 
        toc.title.match(/^(ch|chap)\s*\d+/i) ||
        toc.title.match(/^\d+[.:]/i)
      ).length
    : chapters.filter(ch => 
        ch.title.toLowerCase().includes("chapter") ||
        ch.title.match(/^(ch|chap)\s*\d+/i) ||
        ch.title.match(/^\d+[.:]/i)
      ).length

  const book: Book = {
    id: bookId,
    title,
    author,
    cover,
    totalChapters: actualChapterCount > 0 ? actualChapterCount : (tocChapters.length > 0 ? tocChapters.length : chapters.length),
    currentChapter: 0,
    progress: 0,
    addedAt: Date.now(),
    folderId: folderId || undefined,
  }

  return { book, chapters, tocChapters }
}
