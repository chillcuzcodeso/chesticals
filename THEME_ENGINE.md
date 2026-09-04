# Dynamic Theme Engine

## Overview

The Dynamic Theme Engine transforms the entire chess application based on user-defined themes. Search for any concept (e.g., "Cyberpunk", "Zelda", "Ocean") and watch the app adapt with matching visuals, colors, and ambient music.

## Features

### 🎨 Visual Theming
- **Background Image**: High-quality wallpaper from Unsplash
- **Color Extraction**: AI-powered palette generation using node-vibrant
- **Chess Board Colors**: Dynamic square colors matching the theme
- **Smooth Transitions**: 1-second fade transitions

### 🎵 Ambient Music
- **Auto-play**: Themed ambient music starts automatically
- **Volume Control**: Mute/unmute button
- **YouTube Integration**: Uses YouTube's search API

### 🔍 Smart Search
- **Instant Search**: Type and search for any theme
- **Popular Suggestions**: 10 pre-defined theme ideas
- **Error Handling**: Graceful fallbacks and error messages
- **Current Theme Badge**: Shows active theme

## Architecture

### 1. `ThemeSearch.tsx` Component (143 lines)

**Features:**
- Search input with icon
- Loading spinner
- Popular theme suggestions dropdown
- Current theme badge
- Reset button
- Error messages

**Suggestions:**
```typescript
'🌃 Cyberpunk'
'🏰 Medieval Castle'
'🌲 Forest'
'🌊 Ocean'
'🔥 Fire'
'❄️ Ice'
'🌌 Space'
'🎮 Zelda'
'🌸 Cherry Blossom'
'🎨 Abstract Art'
```

**Interactions:**
- Click suggestion → Auto-search
- Type custom query → Press Enter or click Search
- Reset button → Clear theme

### 2. `useTheme.ts` Hook (70 lines)

**State Management:**
```typescript
interface ThemeData {
  imageUrl: string;
  colors: {
    darkSquare: string;     // Chess dark squares
    lightSquare: string;    // Chess light squares
    background: string;     // App background gradient
    accent: string;         // UI accent color
    vibrant: string;        // Bright highlights
    muted: string;          // Subtle elements
  };
  query: string;
  musicUrl?: string;
}
```

**Functions:**
- `applyTheme(query)` → Fetches and applies theme
- `resetTheme()` → Restores default theme
- Loading and error states

### 3. API Route: `/api/theme/route.ts` (102 lines)

**Flow:**
1. Receives search query from frontend
2. Fetches image from Unsplash API
3. Extracts color palette using node-vibrant
4. Maps colors to chess board and UI
5. Returns theme data + music URL

**Unsplash Integration:**
```typescript
GET https://api.unsplash.com/search/photos
  ?query=cyberpunk
  &orientation=landscape
  &per_page=1
  &order_by=popular
```

**Color Extraction:**
```typescript
const palette = await Vibrant.from(imageUrl).getPalette();

colors = {
  darkSquare: palette.DarkMuted.hex,
  lightSquare: palette.LightMuted.hex,
  background: gradient(DarkVibrant, DarkMuted),
  accent: palette.Vibrant.hex,
  vibrant: palette.LightVibrant.hex,
  muted: palette.Muted.hex,
}
```

**Color Mapping Logic:**
- `DarkMuted` → Dark chess squares
- `LightMuted` → Light chess squares
- `DarkVibrant` + `DarkMuted` → Background gradient
- `Vibrant` → UI accent color
- `LightVibrant` → Bright highlights
- `Muted` → Subtle UI elements

### 4. `MusicPlayer.tsx` Component (87 lines)

**Features:**
- Shows current track name
- Mute/unmute control
- Fixed position (bottom-right)
- Hidden YouTube iframe for audio

**YouTube Integration:**
```typescript
iframe src="https://www.youtube.com/embed
  ?listType=search
  &list={query} ambient music
  &autoplay=1
  &mute=0
  &volume=20"
```

**Volume:** Set to 20% for ambient background

### 5. `ChessBoard.tsx` Updates

**New Props:**
```typescript
darkSquareColor?: string;
lightSquareColor?: string;
```

**Smooth Transitions:**
```typescript
customDarkSquareStyle={{
  backgroundColor: darkSquareColor,
  transition: 'background-color 1s ease',
}}
```

## User Flow

### Searching for a Theme

1. **User types "Cyberpunk"** in search bar
2. **ThemeSearch** shows loading spinner
3. **Frontend** calls `/api/theme` with query
4. **API Route:**
   - Fetches Cyberpunk wallpaper from Unsplash
   - Extracts colors: dark purples, neon blues, blacks
   - Returns theme data
5. **useTheme** receives data and updates state
6. **Page.tsx:**
   - Background fades to Cyberpunk wallpaper
   - Chess board squares transition to extracted colors
   - Music player loads "Cyberpunk ambient music"
7. **Visual transformation complete** (1 second transition)

### Example Themes

#### 🌃 Cyberpunk
- **Background**: Neon city skyline at night
- **Dark Squares**: Deep purple `#4a148c`
- **Light Squares**: Neon blue `#00e5ff`
- **Accent**: Hot pink `#ff006e`
- **Music**: Synthwave ambient

#### 🏰 Medieval Castle
- **Background**: Stone castle fortress
- **Dark Squares**: Dark stone `#3e2723`
- **Light Squares**: Light stone `#bcaaa4`
- **Accent**: Royal gold `#ffd700`
- **Music**: Medieval ambient

#### 🌊 Ocean
- **Background**: Deep ocean underwater
- **Dark Squares**: Deep blue `#006064`
- **Light Squares**: Aqua cyan `#80deea`
- **Accent**: Bright teal `#00bcd4`
- **Music**: Ocean waves ambient

#### 🔥 Fire
- **Background**: Flames and embers
- **Dark Squares**: Dark red `#b71c1c`
- **Light Squares**: Orange `#ff9800`
- **Accent**: Bright yellow `#ffeb3b`
- **Music**: Crackling fire ambient

## Technical Details

### node-vibrant Color Extraction

**Palette Types:**
- `Vibrant` - Bright, saturated colors
- `LightVibrant` - Bright, light colors
- `DarkVibrant` - Bright, dark colors
- `Muted` - Soft, muted colors
- `LightMuted` - Light, muted colors
- `DarkMuted` - Dark, muted colors

Each returns:
```typescript
{
  hex: '#3b82f6',
  rgb: [59, 130, 246],
  population: 1234
}
```

### Unsplash API

**Required:** API Access Key from unsplash.com/oauth/applications

**Response Format:**
```json
{
  "results": [
    {
      "urls": {
        "regular": "https://images.unsplash.com/...",
        "full": "...",
        "small": "..."
      },
      "user": {
        "name": "John Doe",
        "links": {
          "html": "https://unsplash.com/@johndoe"
        }
      }
    }
  ]
}
```

### Transition Timing

- **Background**: 1000ms ease
- **Board Colors**: 1000ms ease
- **UI Elements**: 300ms ease
- **Music**: Instant (autoplay)

## Setup Instructions

### 1. Get Unsplash API Key

```bash
1. Go to https://unsplash.com/oauth/applications
2. Create a new application
3. Copy the Access Key
```

### 2. Configure Environment

Edit `.env.local`:
```env
UNSPLASH_ACCESS_KEY=your_actual_key_here
```

### 3. Install Dependencies

```bash
npm install
```

Dependencies added:
- `node-vibrant` - Color extraction
- `@types/node-vibrant` - TypeScript types

### 4. Run Application

```bash
npm run dev:all
```

## UI Components

### Search Bar
```
┌──────────────────────────────────────┐
│ 🎨  Search for a theme...       🔍  │
└──────────────────────────────────────┘
         ▼ (on focus)
┌──────────────────────────────────────┐
│ Popular themes                        │
├──────────────────────────────────────┤
│ 🌃 Cyberpunk    │ 🏰 Medieval Castle │
│ 🌲 Forest       │ 🌊 Ocean           │
│ 🔥 Fire         │ ❄️ Ice             │
│ 🌌 Space        │ 🎮 Zelda           │
│ 🌸 Cherry       │ 🎨 Abstract Art    │
└──────────────────────────────────────┘
```

### Current Theme Badge
```
┌─────────────────┐
│ ● Theme: Ocean  │
└─────────────────┘
```

### Music Player (Bottom Right)
```
┌──────────────────────────┐
│ 🎵 Ocean Ambient         │
│    Playing...         🔊 │
└──────────────────────────┘
```

## Performance

### Optimizations
- Image caching via Unsplash CDN
- Color extraction runs server-side
- Smooth CSS transitions (GPU-accelerated)
- Lazy-loaded music player
- Debounced search input

### Load Times
- API call: ~500-1000ms
- Color extraction: ~200-500ms
- Total theme switch: ~1-2 seconds

## Error Handling

### No Results
```
No images found for this theme
→ Suggests trying different keywords
```

### API Error
```
Failed to generate theme
→ Falls back to default theme
→ Shows error message
```

### Missing API Key
```
Theme service not configured
→ Check .env.local file
```

## Future Enhancements

- [ ] Theme favorites/bookmarks
- [ ] Custom color picker override
- [ ] Theme sharing via URL
- [ ] Local theme cache
- [ ] Multiple music sources
- [ ] Volume slider
- [ ] Theme presets gallery
- [ ] Color palette preview
- [ ] Animated background effects
- [ ] Seasonal themes (auto-switch)
