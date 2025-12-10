import { GoogleGenerativeAI } from "@google/generative-ai"

export async function translateTextClient(
  text: string,
  targetLang: string,
  apiKey: string,
  bookTitle: string = "",
  chapterTitle: string = "",
  signal?: AbortSignal,
): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key is required")
  }

  if (signal?.aborted) {
    throw new Error("Aborted")
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 3000,
    },
  })

    const prompt = `
    You are a professional literary translator specializing in fiction novels (Light Novels, Web Novels, Fantasy, Romance, etc.).

    CONTEXT INFORMATION:
    Book Title: "${bookTitle || "Unknown"}"
    Chapter Title: "${chapterTitle || "Unknown"}"
    (Use this context to infer the genre, setting, and character relationships.)

    CORE TASK:
    Translate the following HTML content to ${targetLang}.

    PRIMARY INSTRUCTION:
    Translate the text completely, naturally, and accurately. Maintain the original formatting, tone, and context. For technical terms, provide appropriate translations while keeping important keywords recognizable. Please keep the kinship terms and honorifics in the translation, and write them in romaji (or the source language's romanization) if they add to the cultural flavor.

    TRANSLATION GUIDELINES (Professional Standards):

    1. LINGUISTIC NATURALNESS (Transcreation)
       - Avoid robotic/literal translation. Focus on natural flow and narrative rhythm.
       - Use native ${targetLang} sentence structures and idioms.
       - If the text is dialogue, make it sound like real people talking in ${targetLang}.

    2. CULTURAL & CONTEXT ADAPTATION (Crucial)
       - Detect the source culture (Japanese, Chinese, Korean, or Western) from the text context.
       - **Japanese Source:** Keep honorifics (e.g., -san, -kun, -sama, Sensei) and kinship terms (e.g., Onii-chan, Nee-san) in Romaji.
       - **Chinese (Wuxia/Xianxia) Source:** Keep cultivation terms/ranks standardized (e.g., Qi, Dao, Young Master, Shizun).
       - **Korean Source:** Keep specific cultural/kinship terms (e.g., Hyung, Oppa, Sunbae, Noona) in Romaji.
       - **Western Source:** Adapt to natural ${targetLang} equivalents.
       - Do not over-localize to the point of erasing the story's original identity.

    3. CHARACTER VOICE & TONE
       - **Consistency:** Give each character a distinct "voice" (rude, polite, archaic, childish, etc.) consistent with their role.
       - **Emotion:** Prioritize conveying the emotional impact of the scene over 100% technical accuracy.
       - **Registry:** Use appropriate formal/informal registers in ${targetLang} based on character relationships.

    4. GENRE-SPECIFIC HANDLING
       - **Fantasy/Isekai:** Treat skill names and magic spells as unique proper nouns (capitalize or keep consistent).
       - **Romance:** Focus on emotional subtlety and tension.
       - **Comedy:** Adapt jokes to be funny in ${targetLang}, explaining context only if absolutely necessary for understanding.

    5. TECHNICAL & FORMATTING (Strict Rules)
       - CRITICAL: Preserve ALL HTML tags, attributes, structure, and placeholders (like __IMG_PLACEHOLDER_0__) EXACTLY. DO NOT TRANSLATE OR REMOVE THEM.
       - Only translate the human-readable text content INSIDE the tags.
       - Keep class names, ids, and data attributes EXACTLY unchanged.
       - Do not add conversational filler ("Here is the translation...", "Sure!", etc.). Just return the HTML.
       - If the content is already in ${targetLang}, return it as is.
       - **IMPORTANT:** Ensure ALL text is translated. Do not leave any sentences in the original language.

    OUTPUT:
    Return ONLY the final translated HTML string.

    HTML Content to translate:
    ${text}
  `

  let attempt = 0;
  const maxRetries = 3;
  let lastError;

  while (attempt < maxRetries) {
    try {
      if (signal?.aborted) {
        throw new Error("Aborted")
      }

      const result = await model.generateContent(prompt)
      const response = await result.response
      let translatedText = response.text()

      if (!translatedText) {
         throw new Error("Empty response from translation model");
      }

      translatedText = translatedText
        .replace(/^```html\n/, "")
        .replace(/\n```$/, "")
      translatedText = translatedText.replace(/^```\n/, "").replace(/\n```$/, "")

      return translatedText
    } catch (error: any) {
      console.error(`Translation attempt ${attempt + 1} failed:`, error)
      lastError = error;
      attempt++;
      
      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Translation failed after multiple attempts");
}

