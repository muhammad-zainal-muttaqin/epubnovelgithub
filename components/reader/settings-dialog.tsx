"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { ReaderSettings } from "@/lib/types"
import { ExternalLink } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ReaderSettings
  onSettingsChange: (settings: Partial<ReaderSettings>) => void
}

export function SettingsDialog({ open, onOpenChange, settings, onSettingsChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reader Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">Google Gemini API Key</Label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API Key"
              value={settings.apiKey || ""}
              onChange={(e) => onSettingsChange({ apiKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Required for translation. Stored locally on your device.
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Font Size */}
          <div className="space-y-2">
            <Label>Font Size: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => onSettingsChange({ fontSize: value })}
              min={14}
              max={24}
              step={1}
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={settings.fontFamily} onValueChange={(value: any) => onSettingsChange({ fontFamily: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">Geist Sans</SelectItem>
                <SelectItem value="open-sans">Open Sans</SelectItem>
                <SelectItem value="serif">Geist Serif</SelectItem>
                <SelectItem value="merriweather">Merriweather</SelectItem>
                <SelectItem value="literata">Literata</SelectItem>
                <SelectItem value="garamond">Garamond</SelectItem>
                <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>Line Height: {settings.lineHeight.toFixed(1)}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => onSettingsChange({ lineHeight: value })}
              min={1.4}
              max={2.0}
              step={0.1}
            />
          </div>

          {/* Max Width */}
          <div className="space-y-2">
            <Label>Content Width: {settings.maxWidth}px</Label>
            <Slider
              value={[settings.maxWidth]}
              onValueChange={([value]) => onSettingsChange({ maxWidth: value })}
              min={600}
              max={900}
              step={50}
            />
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <Select value={settings.textAlign} onValueChange={(value: any) => onSettingsChange({ textAlign: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justify">Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
