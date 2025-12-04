# EPUB Novel Reader

A modern, privacy-first web application for reading EPUB novels with AI translation support. Everything runs locally in your browser, no account needed.

## ✨ Features

- **📚 EPUB Reading**: Upload and read EPUB files with full chapter navigation
- **🎨 Customization**: 8 fonts, adjustable font size (14-32px), line height, text alignment, dark/light theme
- **📖 Smart TOC**: Automatic table of contents parsing and chapter grouping
- **📍 Progress Tracking**: Auto-save reading position and progress
- **🤖 AI Translation**: Real-time translation using Google Gemini AI (BYOK - Bring Your Own Key)
- **🔒 100% Private**: All data stored locally in browser IndexedDB, no servers involved
- **📱 Mobile Optimized**: Responsive design works on all devices
- **♿ Accessibility**: OpenDyslexic font option for dyslexia-friendly reading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser (Chrome, Firefox, Safari)

### Installation & Run

```bash
# Clone repository
git clone <repository-url>
cd epubnovelreader

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Upload EPUB**: Click "Add EPUB" button or drag & drop files
2. **Browse Library**: View all books with progress indicators
3. **Read**: Click "Read" to open book and customize settings
4. **Translate** (Optional):
   - Get free API key from [https://ai.google.dev/](https://ai.google.dev/)
   - Paste in Reader Settings
   - Click translate button to translate chapters

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **UI**: Radix UI components, Lucide icons
- **Storage**: IndexedDB (browser-based)
- **AI**: Google Generative AI (Gemini) SDK - client-side only
- **Package Manager**: Bun (recommended)

## 🏗️ Architecture

```
Browser
├─ EPUB Parser (local)
├─ IndexedDB (local storage)
├─ Reader UI (React)
└─ Google Gemini API (optional, client-side translation)
```

**Key Points**:
- ✅ No backend server required
- ✅ All file processing in browser
- ✅ Works offline (except translation)
- ✅ API keys never sent to our servers

## 🚀 Deployment

### GitHub Pages (Recommended)
```bash
# Build static export
bun run build

# Deploy ./out/ folder to GitHub Pages
```

Auto-deploy is configured via GitHub Actions (`.github/workflows/deploy.yml`)

### Other Platforms
- **Netlify/Vercel**: Deploy `./out/` folder
- **Self-hosted**: Serve `./out/` with any static server

## 🌐 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile: ✅ iOS Safari, Chrome Mobile

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Enjoy your private reading experience!** 📚✨
