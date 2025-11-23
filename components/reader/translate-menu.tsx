"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages, Loader2, Check, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface TranslateMenuProps {
  apiKey?: string
  isTranslating: boolean
  currentLanguage: string
  onTranslate: (lang: string, force?: boolean) => void
  onOpenSettings: () => void
}

const LANGUAGES = [
  { code: "id", name: "Indonesian" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Simplified)" },
]

export function TranslateMenu({
  apiKey,
  isTranslating,
  currentLanguage,
  onTranslate,
  onOpenSettings,
}: TranslateMenuProps) {
  const handleTranslate = (langName: string, force: boolean = false) => {
    if (langName === "original") {
      onTranslate(langName)
      return
    }

    if (!apiKey) {
      toast.error("API Key Missing", {
        description: "Please add your Google Gemini API Key in settings to use translation.",
        action: {
          label: "Settings",
          onClick: onOpenSettings,
        },
      })
      return
    }
    onTranslate(langName, force)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isTranslating}>
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Translate to...</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleTranslate("original")}
          className="flex items-center justify-between cursor-pointer font-medium"
        >
          Original
          {!currentLanguage && <Check className="h-3 w-3" />}
        </DropdownMenuItem>
        
        {currentLanguage && (
          <DropdownMenuItem
            onClick={() => handleTranslate(currentLanguage, true)}
            className="flex items-center justify-between cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-2" />
              Re-translate {currentLanguage}
            </span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {!apiKey && (
          <DropdownMenuItem onClick={onOpenSettings} className="text-yellow-600 cursor-pointer">
            Set API Key First
          </DropdownMenuItem>
        )}

        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleTranslate(lang.name)}
            className="flex items-center justify-between cursor-pointer"
          >
            {lang.name}
            {currentLanguage === lang.name && <Check className="h-3 w-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

