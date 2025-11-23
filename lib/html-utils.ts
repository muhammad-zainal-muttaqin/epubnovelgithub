
export function splitHtmlIntoChunks(html: string, maxChunkSize: number = 2000): string[] {
  // Regex to find closing tags of block elements.
  // We split *after* these tags to ensure we don't break the HTML structure.
  // Included tags: p, div, blockquote, h1-h6, li, ul, ol, table, article, section
  const splitRegex = /(<\/(?:p|div|blockquote|h[1-6]|li|ul|ol|table|article|section)>)/i
  
  // Split content, but keep the delimiters (the closing tags)
  const parts = html.split(splitRegex)
  
  const chunks: string[] = []
  let currentChunk = ""
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    // If adding this part keeps us under the limit, add it
    if ((currentChunk.length + part.length) <= maxChunkSize) {
      currentChunk += part
    } else {
      // If the current chunk is not empty, push it to chunks
      if (currentChunk.length > 0) {
        chunks.push(currentChunk)
        currentChunk = part
      } else {
        // If the single part is bigger than maxChunkSize (rare for a paragraph),
        // we have to push it anyway or force split it (but force splitting breaks tags).
        // Ideally, we just accept it's a big chunk.
        currentChunk = part
      }
    }
  }
  
  // Push the remaining text
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }
  
  return chunks
}

