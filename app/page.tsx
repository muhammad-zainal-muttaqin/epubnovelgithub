"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { BookOpen, Moon, Sun, Upload, ArrowRight } from "lucide-react"

import { UploadButton } from "@/components/library/upload-button"
import { Button } from "@/components/ui/button"
import { toggleThemeWithTransition } from "@/lib/theme-transition"

const logos = ["Kadokawa", "Yen Press", "J-Novel Club", "Seven Seas", "Shueisha"]

export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-[#070b12] dark:via-[#0a0f18] dark:to-[#0d111b] dark:text-[#e8ecf5]">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/15" />
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-white/5 dark:bg-[#0a0f18]/90">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-primary shadow-sm dark:border-white/10 dark:bg-white/5">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">Vision</p>
              <h1 className="text-lg font-semibold leading-tight sm:text-xl">Agentive EPUB Reading</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/library")}>
              Library
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/privacy")}>
              Privacy
            </Button>
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
                aria-label="Toggle theme"
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 pb-10 pt-6 sm:pb-12 sm:pt-8">
        <section className="relative grid gap-8 rounded-3xl border border-black/5 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5 sm:gap-10 sm:p-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-5 sm:space-y-6">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-blue-400">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Private EPUB workspace
            </p>
            <h2 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-[#e8ecf5] sm:text-5xl">
              Built for light novels.
              <br />
              Local, agent-native translations.
            </h2>
            <p className="max-w-2xl text-base text-slate-800 dark:text-slate-200 sm:text-lg">
              Upload light novels or any EPUB, organize by series, and stream translations as you read. Everything stays on your device—no accounts, no uploads.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => router.push("/library")} className="h-11 px-5 text-sm font-semibold">
                <BookOpen className="mr-2 h-5 w-5" />
                Open Library
              </Button>
              <UploadButton
                onUploadComplete={() => router.push("/library")}
                className="h-11 px-5 text-sm font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload EPUB
                </div>
              </UploadButton>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-sm shadow-inner dark:border-white/10 dark:bg-[#0c111b]">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-blue-700/80 dark:text-blue-300/80">
                <span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">Web</span>
                <span className="rounded border border-black/10 bg-black/5 px-2 py-0.5 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-slate-200">No install</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800 dark:border-white/10 dark:bg-[#0b0f17] dark:text-foreground">
                <span className="text-primary">{">"}</span>
                <span className="truncate">Upload an EPUB to start reading</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2 text-xs uppercase tracking-[0.2em] text-blue-700/80 dark:text-blue-300/90">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Built for novel readers and publishers
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground">
                {logos.map((logo) => (
                  <span key={logo} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>

            <div className="grid gap-3 rounded-3xl border border-black/10 bg-white/85 p-4 shadow-lg dark:border-white/10 dark:bg-[#0b111a]">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-blue-300/90">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Live translating
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Streaming chunks</p>
              <div className="space-y-2 py-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-3 rounded bg-slate-300/50 animate-pulse dark:bg-white/10"
                    style={{ width: `${70 + (idx % 3) * 10}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chunks arrive and replace skeletons in-place.</p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">On-device cache</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Translations, covers, and progress are stored locally. Images stay untouched.</p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Resume instantly</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Reopen a book and jump to your exact scroll position.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/90 text-slate-700 backdrop-blur dark:border-white/5 dark:bg-[#0a0f18]/90 dark:text-muted-foreground">
        <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm font-medium">&copy; 2026 EPUB Novel Reader</p>
            <div className="flex items-center gap-4">
              <Button variant="link" onClick={() => router.push("/privacy")} className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
                Privacy
              </Button>
              <Button variant="link" onClick={() => router.push("/library")} className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
                Library
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
