"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft, Shield, Database, Eye, Lock, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { toggleThemeWithTransition } from "@/lib/theme-transition"
import { useEffect, useState } from "react"

export default function PrivacyPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-[#070b12] dark:via-[#0a0f18] dark:to-[#0d111b] dark:text-[#e8ecf5]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/20" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-[100px] dark:bg-emerald-500/10" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-[#0a0f18]/80">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-white/5">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">EPUB Reader</span>
          </div>
          
          <nav className="flex items-center gap-1">
             {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
                className="h-8 w-8 text-muted-foreground"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto w-fit rounded-full border border-emerald-200/50 bg-emerald-50/50 px-3 py-1 text-xs font-medium text-emerald-600 backdrop-blur dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-300">
            <Shield className="inline-block mr-1.5 h-3 w-3" />
            Your Privacy First
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We believe your reading habits are personal. That's why we built an app that doesn't spy on you.
          </p>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <PrivacySection 
            icon={<Database className="h-5 w-5 text-blue-500" />}
            title="Data Storage"
          >
            <p>
              <strong className="text-slate-900 dark:text-slate-200">Local Storage Only:</strong> All your EPUB files, reading progress, and settings are stored locally in your browser using IndexedDB. Nothing is uploaded to external servers.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-200">Browser-Based:</strong> Your data remains on your device and is only accessible to you. We cannot access your files or reading history.
            </p>
          </PrivacySection>

          <PrivacySection 
            icon={<Eye className="h-5 w-5 text-emerald-500" />}
            title="Data Collection"
          >
            <p>
              <strong className="text-slate-900 dark:text-slate-200">Zero Data Collection:</strong> We do not collect, store, or transmit any personal information or reading data. No tracking pixels, no analytics, no cookies.
            </p>
          </PrivacySection>

          <PrivacySection 
            icon={<Lock className="h-5 w-5 text-amber-500" />}
            title="Security"
          >
             <p>
                <strong className="text-slate-900 dark:text-slate-200">Client-Side Processing:</strong> All EPUB parsing and processing happens in your browser.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-slate-200">No External API Calls:</strong> The app doesn't make any hidden external API calls.
              </p>
          </PrivacySection>

          <PrivacySection 
            icon={<Globe className="h-5 w-5 text-purple-500" />}
            title="Transparency"
          >
            <p>
              The entire codebase is open source. You can verify our privacy claims by inspecting the code yourself.
            </p>
            <div className="pt-2">
               <Button variant="outline" size="sm" onClick={() => window.open("https://github.com/muhammad-zainal-muttaqin/epubnovelgithub", "_blank")}>
                View Source Code
              </Button>
            </div>
          </PrivacySection>
        </div>

        <div className="mt-12 text-center animate-in fade-in duration-1000 delay-300">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-slate-200/50 dark:border-white/5 bg-white/50 backdrop-blur dark:bg-[#0a0f18]/50">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} EPUB Novel Reader. Built for speed and privacy.</p>
        </div>
      </footer>
    </div>
  )
}

function PrivacySection({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
