// Translation repository

import { STORES } from "../keys"
import { getFromStore, putInStore } from "./idb"

export interface Translation {
  id: string // Format: "chapterId-langCode"
  chapterId: string
  language: string
  content: string
  translatedAt: number
}

export async function getTranslation(chapterId: string, language: string): Promise<Translation | undefined> {
  const id = `${chapterId}-${language}`
  return getFromStore<Translation>(STORES.TRANSLATIONS, id)
}

export async function saveTranslation(translation: Translation): Promise<void> {
  await putInStore(STORES.TRANSLATIONS, translation)
}

