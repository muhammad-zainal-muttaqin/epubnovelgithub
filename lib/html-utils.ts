export function splitHtmlIntoChunks(html: string, maxChunkSize: number = 5000): string[] {
  const splitRegex = /(<\/(?:p|div|blockquote|h[1-6]|li|ul|ol|table|article|section)>)/i
  const parts = html.split(splitRegex)
  const chunks: string[] = []
  let currentChunk = ""

  for (const part of parts) {
    if (currentChunk.length + part.length <= maxChunkSize) {
      currentChunk += part
    } else {
      if (currentChunk.length > 0) chunks.push(currentChunk)
      currentChunk = part
    }
  }

  if (currentChunk.length > 0) chunks.push(currentChunk)
  return chunks
}

