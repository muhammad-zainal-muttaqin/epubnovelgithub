"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { ReaderSettings } from "@/lib/types"
import { ExternalLink, AlignLeft, AlignJustify } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ReaderSettings
  onSettingsChange: (settings: Partial<ReaderSettings>) => void
}

export function SettingsDialog({ open, onOpenChange, settings, onSettingsChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:bg-[#0a0f18]/95 p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-white/5">
          <DialogTitle className="text-xl font-semibold tracking-tight">Reader Settings</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          <div className="space-y-3 rounded-2xl bg-slate-50/80 p-4 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gemini API Key</Label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Get Key <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <Input id="apiKey" type="password" placeholder="Paste your API key here..." value={settings.apiKey || ""} onChange={(e) => onSettingsChange({ apiKey: e.target.value })} className="h-9 border-slate-200 bg-white/50 text-xs dark:border-white/10 dark:bg-black/20" />
            <p className="text-[10px] text-muted-foreground/80">Stored locally. Required for AI translation.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Font Size</Label>
                <span className="text-xs text-muted-foreground w-8 text-right">{settings.fontSize}px</span>
              </div>
              <Slider value={[settings.fontSize]} onValueChange={([value]) => onSettingsChange({ fontSize: value })} min={14} max={32} step={1} className="py-1" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Line Height</Label>
                <span className="text-xs text-muted-foreground w-8 text-right">{settings.lineHeight.toFixed(1)}</span>
              </div>
              <Slider value={[settings.lineHeight]} onValueChange={([value]) => onSettingsChange({ lineHeight: value })} min={1.4} max={2.4} step={0.1} className="py-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={(value: any) => onSettingsChange({ fontFamily: value })}>
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans">Geist Sans</SelectItem>
                    <SelectItem value="serif">Geist Serif</SelectItem>
                    <SelectItem value="merriweather">Merriweather</SelectItem>
                    <SelectItem value="literata">Literata</SelectItem>
                    <SelectItem value="garamond">Garamond</SelectItem>
                    <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Alignment</Label>
                <div className="flex items-center rounded-md border border-slate-200 bg-slate-50/50 p-1 dark:border-white/10 dark:bg-white/5 h-9">
                  <button onClick={() => onSettingsChange({ textAlign: 'left' })} className={`flex-1 flex items-center justify-center rounded-sm p-1 transition-all ${settings.textAlign === 'left' ? 'bg-white shadow-sm dark:bg-[#0a0f18]' : 'text-muted-foreground hover:text-foreground'}`}>
                    <AlignLeft className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onSettingsChange({ textAlign: 'justify' })} className={`flex-1 flex items-center justify-center rounded-sm p-1 transition-all ${settings.textAlign === 'justify' ? 'bg-white shadow-sm dark:bg-[#0a0f18]' : 'text-muted-foreground hover:text-foreground'}`}>
                    <AlignJustify className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Max Width</Label>
                <span className="text-xs text-muted-foreground w-8 text-right">{settings.maxWidth}px</span>
              </div>
              <Slider value={[settings.maxWidth]} onValueChange={([value]) => onSettingsChange({ maxWidth: value })} min={500} max={1200} step={50} className="py-1" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
