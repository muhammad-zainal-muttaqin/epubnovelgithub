"use client"

import { useEffect } from "react"
import { loadDemoEPUBIfNeeded } from "@/lib/demo-loader"

export function DemoLoaderClient() {
  useEffect(() => {
    loadDemoEPUBIfNeeded().catch((error) => {
      console.error("Error in demo loader:", error)
    })
  }, [])

  return null
}

