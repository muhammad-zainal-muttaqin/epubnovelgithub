"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Upload, Settings, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">EPUB Novel Reader</h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <Button onClick={() => router.push("/library")}>
              Go to Library
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your Personal{" "}
            <span className="text-primary">EPUB Library</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            A beautiful and comfortable EPUB reader built with modern web technologies. 
            Upload your favorite novels and enjoy reading with customizable settings.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/library")}>
              <Upload className="mr-2 h-5 w-5" />
              Start Reading
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/library")}>
              <BookOpen className="mr-2 h-5 w-5" />
              View Library
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-6 rounded-lg border">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Easy Reading</h3>
              <p className="text-muted-foreground">
                Clean, distraction-free interface optimized for comfortable reading experience.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border">
              <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Customizable</h3>
              <p className="text-muted-foreground">
                Adjust font size, family, line height, and text alignment to your preference.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border">
              <Moon className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Dark Mode</h3>
              <p className="text-muted-foreground">
                Switch between light and dark themes for comfortable reading in any environment.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Reading?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your first EPUB file and begin your reading journey.
          </p>
          <Button size="lg" onClick={() => router.push("/library")}>
            <Upload className="mr-2 h-5 w-5" />
            Upload Your First Book
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 EPUB Novel Reader. Built with Next.js and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
