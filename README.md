# EPUB Novel Reader - GitHub Pages Edition

A modern, privacy-first web application for reading EPUB novels with a clean interface and comprehensive customization features. Now powered with **AI Translation** and **100% Static** - hosted on GitHub Pages!

🌐 **Live Demo**: [https://muhammad-zainal-muttaqin.github.io/epubnovelgithub](https://muhammad-zainal-muttaqin.github.io/epubnovelgithub)

## ✨ Features

### 🤖 AI Translation (New!)
- **Context-Aware Translation**: Translates novels to your preferred language using Google Gemini AI.
- **Genre-Smart**: Automatically detects genre (Light Novel, Wuxia, Western) to adapt tone and terminology.
- **BYOK (Bring Your Own Key)**: Securely use your own Google Gemini API Key.
- **Instant Caching**: Fast navigation for previously translated chapters without re-fetching.
- **Image Protection**: Ensures illustrations remain intact during translation.

### 📚 Core Reading
- **EPUB Support**: Upload and read EPUB files with full chapter navigation
- **Smart TOC**: Table of Contents-based chapter grouping and navigation
- **Internal Links**: Working links within chapters (e.g., from Contents page)
- **Reading Progress**: Automatic progress tracking with visual indicators
- **Resume Reading**: Continue exactly where you left off

### 🎨 Customization
- **8 Font Options**: Serif, Sans, Mono, Merriweather, Open Sans, Literata, Garamond, OpenDyslexic
- **Dyslexia-Friendly**: OpenDyslexic font for better readability
- **Typography Control**: Font size (14-24px), line height (1.4-2.0), text alignment (left, center, right, justify)
- **Theme Support**: Dark mode (default) and light mode
- **Content Width**: Adjustable max-width (600-900px)
- **Breathing Space**: Novel-like paragraph spacing for comfortable reading

### 🔒 Privacy & Security
- **100% Local**: All data stored in browser IndexedDB
- **Zero Tracking**: No analytics, cookies, or external servers
- **No Upload**: Files never leave your device (except partial text sent to Google AI only when using Translate feature)
- **Open Source**: Fully transparent and verifiable code

### 📱 User Experience
- **Mobile-Optimized**: Touch-friendly with proper safe areas
- **Clean UI**: Hidden scrollbars and minimal distractions
- **Responsive Design**: Consistent experience across all devices
- **Floating Actions**: Easy access to upload without clutter

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd epubnovelreader
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started
1. **Upload Books**: Click the upload button to add EPUB files to your library
2. **Browse Library**: View all your uploaded books with progress indicators
3. **Start Reading**: Click "Read" or "Continue" to open a book
4. **Customize Settings**: Adjust fonts, themes, and layout preferences

### AI Translation Guide (Client-Side)
1. Get a **free Google Gemini API Key**:
   - Visit: [https://ai.google.dev/](https://ai.google.dev/)
   - Click "Get API Key"
   - Create a new API key (free tier available)

2. In the Reader:
   - Click **Settings (Gear Icon)**
   - Paste your **Google Gemini API Key**
   - Click **Translate Icon** in the header
   - Select your target language
   - Translation happens **directly in your browser** - no server involved!

3. **Translation is cached** in IndexedDB for instant re-reading

**Important**: 
- Your API Key is stored **only in your browser** (IndexedDB)
- Never shared with our servers
- Text is only sent to Google Gemini API for translation
- **100% private and secure**

### Reading Controls
- **Navigation**: Use Previous/Next buttons or chapter list
- **Settings**: Access font size, theme, and alignment options
- **Progress**: Track reading progress with visual indicators
- **Bookmarks**: Automatic progress saving for seamless continuation

### Mobile Experience
- **Touch Navigation**: Swipe-friendly controls and gestures
- **Responsive Layout**: Optimized for all screen sizes
- **Floating Action Button**: Easy access to upload functionality
- **Safe Areas**: Proper spacing on devices with notches/home indicators

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router + Static Export
- **Styling**: Tailwind CSS with custom design system
- **Package Manager**: Bun (recommended) or npm
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React icon library
- **Storage**: IndexedDB for local data persistence
- **AI Translation**: Google Generative AI (Gemini) SDK - **Client-side only**
- **Theme**: next-themes for dark/light mode support
- **Hosting**: GitHub Pages (Static HTML/CSS/JS)
- **CI/CD**: GitHub Actions for automatic deployment

## 🎯 Recent Updates (GitHub Pages Edition)

- **✨ GitHub Pages Deployment**: 100% static hosting with automatic CI/CD
- **🔒 Client-Side Translation**: All translation happens in browser via Google Gemini SDK
- **⚡ Zero Server Dependencies**: No backend API needed - pure static files
- **🚀 Auto-Deploy**: GitHub Actions workflow builds and deploys on every push
- **🌐 Subpath Routing**: Correctly handles deployment at repository subpath
- **AI Translation**: Integrated Google Gemini for high-quality, context-aware novel translation
- **Translation Caching**: Instant loading for previously translated chapters
- **Smart TOC Navigation**: Chapters grouped by Table of Contents structure
- **OpenDyslexic Font**: Dyslexia-friendly font option
- **Persistent Settings**: Reader preferences saved locally in IndexedDB
- **Mobile-First UI**: Optimized for all screen sizes

## 🏗️ Architecture

### Static-First Design
```
GitHub Pages (Static Hosting)
    ↓
Static HTML/CSS/JS (Generated by Next.js export)
    ↓
Browser (Client-Side App)
    ├─ IndexedDB (Local Storage)
    ├─ EPUB Parser (Local)
    ├─ Reader UI (React)
    └─ Google Gemini SDK (Optional - for Translation)
        ↓
    Google AI API (Only for Translation)
```

### No Backend Server
- ✅ All file processing happens in browser
- ✅ No API routes or server endpoints
- ✅ No database
- ✅ No authentication needed
- ✅ Can work offline (except translation)

### Translation Flow
1. User enters API Key (stored locally in IndexedDB)
2. Chapter text is sent **directly** to Google Gemini API from browser
3. Translation returned and cached locally
4. No intermediate server processing

## 📱 Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support with iOS/macOS compatibility
- **Mobile Browsers**: Optimized for iOS Safari and Chrome Mobile

## 🚀 Deployment

### GitHub Pages (Recommended - Already Set Up!)
This project is configured for automatic deployment to GitHub Pages via GitHub Actions:

1. **Automatic Workflow**: Every push to `main` branch triggers a build and deployment
2. **Static Export**: Next.js builds to static HTML/CSS/JS files
3. **Zero Server Needed**: Pure client-side application
4. **CI/CD Pipeline**: `.github/workflows/deploy.yml` handles everything

**Environment Variables**:
- `NEXT_PUBLIC_BASE_PATH=/epubnovelgithub` (automatically set in workflow)

### Local Build
```bash
bun run build
# Output in: ./out/
```

### Manual Deployment Steps
1. Fork/clone this repository
2. Go to Settings → Pages
3. Set Source to "GitHub Actions"
4. Push to `main` branch
5. Wait for workflow to complete
6. Access your site at: `https://<username>.github.io/<repo-name>`

### Other Platforms
- **Netlify**: Use `bun run build` and deploy `./out/` folder
- **Vercel**: Supports static export deployment
- **Self-Hosted**: Run `bun run build` and serve `./out/` with any static server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by clean, distraction-free reading experiences
- Designed with privacy and user control as core principles

---

**Enjoy your private reading experience!** 📚✨
