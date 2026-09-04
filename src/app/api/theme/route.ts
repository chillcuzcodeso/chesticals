import { NextRequest, NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY not configured');
      return NextResponse.json(
        { error: 'Theme service not configured' },
        { status: 500 }
      );
    }

    // Fetch image from Unsplash
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&order_by=popular`;
    
    const unsplashResponse = await fetch(unsplashUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!unsplashResponse.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }

    const unsplashData = await unsplashResponse.json();
    
    if (!unsplashData.results || unsplashData.results.length === 0) {
      return NextResponse.json(
        { error: 'No images found for this theme' },
        { status: 404 }
      );
    }

    const image = unsplashData.results[0];
    const imageUrl = image.urls.regular;

    // Extract color palette using node-vibrant
    const palette = await Vibrant.from(imageUrl).getPalette();

    // Map colors to theme
    const colors = {
      darkSquare: palette.DarkMuted?.hex || '#5a4a3a',
      lightSquare: palette.LightMuted?.hex || '#e8d5b7',
      background: `linear-gradient(to bottom right, ${palette.DarkVibrant?.hex || '#1a1a2e'}, ${palette.DarkMuted?.hex || '#16213e'}, ${palette.DarkVibrant?.hex || '#0f0e17'})`,
      accent: palette.Vibrant?.hex || '#3b82f6',
      vibrant: palette.LightVibrant?.hex || '#60a5fa',
      muted: palette.Muted?.hex || '#94a3b8',
    };

    // Fetch ambient music from YouTube (using search query)
    // For now, we'll construct a YouTube search URL
    const musicSearchQuery = `${query} ambient music`;
    const musicUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(musicSearchQuery)}`;

    const themeData = {
      imageUrl,
      colors,
      query,
      musicUrl,
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
    };

    return NextResponse.json(themeData);
  } catch (error) {
    console.error('Theme API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate theme' },
      { status: 500 }
    );
  }
}
