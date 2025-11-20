# Development Notes

## AI Translation Feature Implementation

This document tracks the implementation of the AI-powered translation feature using Google Gemini.

### Implementation Status: ✅ COMPLETED

**Date:** November 2025
**Status:** Feature-complete and tested

---

## Features Implemented

### ✅ Core Translation
- **Google Gemini Integration**: Uses `gemini-flash-lite-latest` for fast, cost-effective translation.
- **BYOK (Bring Your Own Key)**: Users input their own API Key in Settings; stored locally in localStorage.
- **Context-Aware**: Sends Book Title and Chapter Title to AI to improve genre detection and tone.
- **HTML Preservation**: Strict prompt engineering to preserve paragraph structure, formatting, and classes.

### ✅ Smart Caching & Performance
- **In-Memory Caching**: Caches translated chapters during the session. Navigating back/forward is instant and costs zero tokens.
- **Image Protection**: 
  - Strips `<img>` tags before sending text to AI (saves token cost & prevents base64 corruption).
  - Replaces them with placeholders (`__IMG_PLACEHOLDER_X__`).
  - Restores original image tags after translation.

### ✅ User Experience
- **Visual Indicators**: 
  - "Translating..." pulsing badge in header.
  - "Indonesian" (Language Name) green badge when viewing translated content.
- **Seamless Integration**: "Translate" button in Reader Header with language dropdown.
- **Auto-Reset**: Translation automatically resets to original when navigating to a new chapter (unless cached).

### ✅ Prompt Engineering
- **Role**: Professional Literary Translator.
- **Guidelines**:
  - **Transcreation**: Focus on natural flow and "translating the experience".
  - **Cultural Adaptation**: Keep Honorifics (San, Kun, Hyung, Oppa) and Cultivation Terms (Qi, Dao) in Romaji based on context.
  - **Voice Consistency**: Maintain character personality (rude, polite, archaic).

---

## Technical Challenges & Solutions

### 🐛 Base64 Image Corruption
**Symptom:** Images disappeared or turned into broken text after translation.
**Cause:** LLM tried to "translate" or shorten the massive Base64 strings in `src="..."`.
**Solution:** 
1. Regex replace `<img ...>` with `__IMG_PLACEHOLDER_X__` before sending to API.
2. Instruct AI to **never** touch placeholders.
3. Regex restore the images into the translated text.

### 🧠 Context-Blind Translation
**Symptom:** AI translated generic dialogue without knowing if it was a Fantasy or Modern setting.
**Solution:** Added `bookTitle` and `chapterTitle` to the API payload and System Prompt. AI now infers genre from these titles.

---

## File Structure
```
app/api/translate/
└── route.ts             # Next.js API Route for Gemini (Server-side)

components/reader/
├── translate-menu.tsx   # Dropdown UI for language selection
├── reader-header.tsx    # Updated with Translate button & Status Badges
└── settings-dialog.tsx  # Updated with API Key input field

app/reader/[bookId]/[chapterId]/
└── page.tsx             # Main logic: State, Caching, Image Protection, API Call
```

---

## Library Folder System Implementation (Previous Feature)

This document tracks the implementation progress of the folder system for organizing uploaded EPUBs in the library.

### Overview
The folder system allows users to organize their uploaded novels into folders, similar to a file manager. This is particularly useful for multi-volume series where each volume can be grouped together.

### Implementation Status: ✅ COMPLETED

**Branch:** `dev`  
**Status:** Feature-complete and tested

---

## Features Implemented

### ✅ Core Functionality
- **Folder CRUD**: Create, rename, delete folders
- **Book Movement**: Move books between folders or to root
- **Sorting**: Sort by name, date added, last read, progress
- **URL Routing**: Folder-aware URLs using `?folder=slug` parameter
- **Mobile Support**: Burger menu for mobile navigation

### ✅ UI Components
- `FolderCard`: Grid display with book count and cover previews
- `CreateFolderDialog`: Create/rename folder dialog
- `MoveBookDialog`: Move book between folders
- `LibraryHeader`: Breadcrumb navigation and sorting controls
- `MobileMenu`: Mobile-friendly navigation menu

### ✅ Database Schema
- Added `Folder` interface with `id`, `name`, `createdAt`, `sortOrder`, `slug`
- Updated `Book` interface with `folderId` field
- IndexedDB migration from version 1 to 3
- Added indexes for `folderId`, `slug` for efficient queries

---

## Technical Challenges & Solutions

### 🐛 UI Freeze Bug (RESOLVED)

**Symptom:** UI became unresponsive after folder operations (move, rename) requiring hard refresh.

**Root Causes:**
1. **Focus/ARIA Conflict**: Radix popovers retained focus while ancestor became `aria-hidden`
2. **Race Conditions**: IndexedDB operations triggered UI updates during animations
3. **DOM Manipulation**: Direct portal removal interfered with React reconciliation

**Solutions Applied:**
1. **Deferred Actions**: Added 50-80ms delays for menu actions to allow popover close
2. **Focus Management**: Explicit `active.blur()` before opening dialogs
3. **Optimistic Updates**: Immediate UI updates with background data reload
4. **Portal Management**: Let Radix handle portal lifecycle
5. **Accessibility Fix**: Added `aria-describedby` to dialog components

**Detailed Debugging Process:**

This was one of the most challenging bugs to debug. Here's the step-by-step process:

1. **Initial Symptoms**: UI would freeze after moving books or renaming folders, requiring F5 refresh
2. **First Attempt**: Added `router.refresh()` - made things worse, caused data loss
3. **Console Investigation**: Found `removeChild` errors and `aria-hidden` warnings
4. **DOM Manipulation Attempt**: Tried removing Radix portals manually - failed
5. **Focus Management**: Discovered focus/aria-hidden conflicts blocking interactions
6. **Deferred Actions**: Added `setTimeout` delays to allow popover animations to complete
7. **Blur Strategy**: Explicitly blur active elements before opening dialogs
8. **Optimistic Updates**: Update UI immediately, reload data in background

**Key Learning**: Radix UI components manage their own DOM lifecycle. Interfering with this causes conflicts. The solution is to work WITH the framework, not against it.

**Code Pattern for Fixing Similar Issues:**
```typescript
// ❌ Wrong - causes freeze
const handleAction = () => {
  onAction() // Immediate call
}

// ✅ Correct - prevents freeze
const handleAction = () => {
  setTimeout(() => {
    onAction()
  }, 50) // Allow UI to settle
}

// ✅ Also correct - blur focus
const handleAction = () => {
  if (typeof window !== "undefined") {
    const active = document.activeElement as HTMLElement | null
    if (active && typeof active.blur === "function") {
      active.blur()
    }
  }
  setTimeout(() => {
    onAction()
  }, 50)
}
```

### 🔄 State Synchronization (RESOLVED)

**Symptom:** Books disappeared from folders after returning from reader.

**Root Cause:** Race condition between URL sync and data loading in `useEffect`.

**Solution:** Separated URL synchronization from data loading, added proper dependency management.

**Debugging Process:**
1. **Initial Issue**: Books would disappear after returning from reader
2. **First Fix**: Added `router.refresh()` - caused more problems
3. **Investigation**: Found that `loadData()` was called before `currentFolderId` was set
4. **Solution**: Separated URL sync from data loading, added `currentFolderId` to dependencies

**Key Learning**: State updates are asynchronous. Ensure data loading happens AFTER state is properly set.

---

## File Structure

```
lib/
├── types.ts              # Folder interface, Book.folderId
├── keys.ts               # DB_VERSION=3, FOLDERS store
├── db/
│   ├── idb.ts           # IndexedDB setup with folder store
│   ├── folders.ts       # Folder CRUD operations
│   └── books.ts         # Updated with folder filtering

components/library/
├── folder-card.tsx       # Folder display component
├── create-folder-dialog.tsx
├── move-book-dialog.tsx
├── library-header.tsx    # Breadcrumb + sorting
├── mobile-menu.tsx       # Mobile navigation
└── book-card.tsx         # Updated with move option

app/library/
└── page.tsx             # Main library logic with folder support
```

---

## Testing Checklist

### ✅ Basic Functionality
- [x] Create folder
- [x] Rename folder
- [x] Delete folder
- [x] Move book to folder
- [x] Move book between folders
- [x] Move book to root
- [x] Sort by name, date, last read, progress

### ✅ Navigation
- [x] URL routing with folder slugs
- [x] Back/forward browser navigation
- [x] Reader back button returns to correct folder
- [x] Mobile burger menu functionality

### ✅ Edge Cases
- [x] Duplicate folder names (prevented)
- [x] Empty folder handling
- [x] Invalid folder URLs (redirect to root)
- [x] State synchronization after reading

---

## Performance Considerations

- **IndexedDB Indexes**: Added `folderId` and `slug` indexes for efficient queries
- **Optimistic Updates**: UI updates immediately, data reloads in background
- **Lazy Loading**: Folder slugs loaded only when needed for navigation
- **Memory Management**: Proper cleanup of event listeners and state

## Debugging Tips & Common Issues

### UI Freeze Prevention
When working with Radix UI components (dialogs, dropdowns, popovers):

1. **Always defer actions** that trigger dialogs or state changes
2. **Blur active elements** before opening dialogs to prevent focus conflicts
3. **Let Radix manage DOM** - don't manually manipulate portals
4. **Use optimistic updates** for better perceived performance

### State Synchronization
When dealing with URL parameters and state:

1. **Separate concerns**: URL sync vs data loading
2. **Proper dependencies**: Include all relevant state in useEffect dependencies
3. **Avoid race conditions**: Ensure state is set before dependent operations

### Console Warnings to Watch For
- `aria-hidden` warnings: Usually indicate focus management issues
- `removeChild` errors: Often caused by manual DOM manipulation
- `router.refresh()` issues: Can cause data loss in complex state scenarios

---

## Future Enhancements

### Potential Improvements
- **Nested Folders**: Support for multi-level folder hierarchy
- **Folder Icons**: Custom icons for different folder types
- **Bulk Operations**: Move multiple books at once
- **Folder Templates**: Pre-configured folder structures
- **Export/Import**: Backup and restore folder structures

### Technical Debt
- **Testing**: Add E2E tests for folder operations
- **Performance**: Implement virtual scrolling for large libraries
- **Accessibility**: Improve screen reader support
- **Error Handling**: Better error messages and recovery

---

## Migration Notes

### Database Migration (v1 → v3)
1. **v1 → v2**: Added folders store and folderId index
2. **v2 → v3**: Added slug index for URL routing

### Breaking Changes
- None - all changes are additive
- Existing books remain in root (folderId = null)

---

## Commit History

Key commits in `dev` branch:
- `feat: implement folder system with CRUD operations`
- `feat: add mobile burger menu for library header`
- `fix: move theme toggle into LibraryHeader for proper alignment`
- `fix: implement proper sorting for folders and books`
- `fix: preserve folder context in reader back navigation`
- `fix: improve folder data synchronization and remove router.refresh()`

---

*Last Updated: November 2025*  
*Status: Production Ready*
