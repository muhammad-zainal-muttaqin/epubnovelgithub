"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { BookOpen, Moon, Sun, Upload, Shield, Zap, Globe } from "lucide-react"

import { UploadButton } from "@/components/library/upload-button"
import { Button } from "@/components/ui/button"
import { toggleThemeWithTransition } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-[#070b12] dark:via-[#0a0f18] dark:to-[#0d111b] dark:text-[#e8ecf5] selection:bg-primary/20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/20" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-[100px] dark:bg-emerald-500/10" />
      </div>

      <header 
        className={cn(
          "fixed top-0 z-40 w-full flex justify-center transition-all duration-300 ease-in-out",
          isScrolled ? "pt-6" : "pt-0"
        )}
      >
        <div 
          className={cn(
            "flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
            isScrolled 
              ? "w-[92%] max-w-2xl h-12 rounded-full border border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-2 dark:border-white/10 dark:bg-[#0a0f18]/95 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
              : "w-full h-16 border-b border-slate-200/50 bg-white/95 backdrop-blur-md px-4 dark:border-white/5 dark:bg-[#0a0f18]/95 rounded-none"
          )}
        >
          <div className={cn("flex w-full items-center justify-between", !isScrolled && "mx-auto max-w-5xl")}>
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "flex shrink-0 items-center justify-center bg-primary/10 text-primary dark:bg-white/5 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
                isScrolled ? "h-8 w-8 rounded-full" : "h-9 w-9 rounded-xl"
              )}>
                <BookOpen className={cn("transition-all duration-300", isScrolled ? "h-4 w-4" : "h-5 w-5")} />
              </div>
              <span className={cn(
                "font-bold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]", 
                isScrolled ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              )}>
                EPUB Reader
              </span>
            </div>
            
            <nav className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => router.push("/library")} className={cn("text-muted-foreground hover:text-foreground transition-all duration-300", isScrolled ? "text-xs px-3 h-8 rounded-full" : "")}>
                Library
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/privacy")} className={cn("text-muted-foreground hover:text-foreground transition-all duration-300", isScrolled ? "text-xs px-3 h-8 rounded-full" : "")}>
                Privacy
              </Button>
               {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
                  className={cn("ml-1 text-muted-foreground transition-all duration-300 rounded-full", isScrolled ? "h-8 w-8" : "h-8 w-8")}
                >
                  <Sun className={cn("rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0", isScrolled ? "h-4 w-4" : "h-4 w-4")} />
                  <Moon className={cn("absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100", isScrolled ? "h-4 w-4" : "h-4 w-4")} />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20 pt-24">
        <div className="container max-w-4xl space-y-12 text-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mx-auto w-fit rounded-full border border-blue-200/50 bg-blue-50/50 px-3 py-1 text-xs font-medium text-blue-600 backdrop-blur dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300">
            Agentive Reading Experience
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-slate-900 dark:text-white leading-[1.1]">Read Light Novels.</span>
              <span className="block bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent leading-[1.1]">
                Translate Instantly.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-xl">
              A private, distraction-free EPUB reader that translates as you read. 
              Everything happens on your device.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => router.push("/library")} 
                className="h-12 w-full sm:w-auto min-w-[200px] rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-transform hover:scale-105"
              >
                Open Library
              </Button>
              <UploadButton
                onUploadComplete={() => router.push("/library")}
                variant="outline"
                className="h-12 w-full sm:w-auto min-w-[200px] rounded-full border-slate-200 px-8 text-base hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <span className="flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload EPUB
                </span>
              </UploadButton>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <FeatureCard 
              icon={<Globe className="h-5 w-5 text-blue-500" />}
              title="Live Translation"
              description="Translate light novels in real-time with AI while maintaining original formatting."
            />
            <FeatureCard 
              icon={<Shield className="h-5 w-5 text-emerald-500" />}
              title="100% Private"
              description="No servers, no accounts. Your books and reading data never leave your browser."
            />
            <FeatureCard 
              icon={<Zap className="h-5 w-5 text-amber-500" />}
              title="Instant Resume"
              description="Jump right back into your story with automatic progress syncing and local caching."
            />
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl">
          <p>© {new Date().getFullYear()} EPUB Novel Reader. Built for speed and privacy.</p>
          <div className="flex items-center gap-4">
            <Button variant="link" size="sm" onClick={() => router.push("/privacy")} className="text-muted-foreground h-auto p-0">
              Privacy Policy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200/50 bg-white/50 p-6 text-left shadow-sm backdrop-blur-sm transition-all hover:border-slate-300/50 hover:bg-white/95 hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10">
      <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2 dark:bg-white/5">
        {icon}
      </div>
      <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
