import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { title, author, isbn } = await req.json();

    console.log('Fetching cover for:', { title, author, isbn });

    let coverUrl = null;

    // Try multiple sources for book covers
    const sources = [
      // Google Books API (free, no API key needed)
      async () => {
        try {
          let query = '';
          if (isbn) {
            query = `isbn:${isbn}`;
          } else {
            query = `intitle:${encodeURIComponent(title)}`;
            if (author) {
              query += `+inauthor:${encodeURIComponent(author)}`;
            }
          }

          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items[0]?.volumeInfo?.imageLinks) {
              const imageLinks = data.items[0].volumeInfo.imageLinks;
              // Prefer larger images
              return imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.thumbnail;
            }
          }
        } catch (error) {
          console.error('Google Books API error:', error);
        }
        return null;
      },

      // Open Library API (free alternative)
      async () => {
        try {
          if (isbn) {
            // Try ISBN lookup first
            const response = await fetch(
              `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
            );
            if (response.ok && response.headers.get('content-type')?.includes('image')) {
              return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            }
          }

          // Try title/author search
          const searchQuery = encodeURIComponent(`${title} ${author || ''}`.trim());
          const searchResponse = await fetch(
            `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author || '')}&limit=1`
          );
          
          if (searchResponse.ok) {
            const data = await searchResponse.json();
            if (data.docs && data.docs[0]?.cover_i) {
              return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
            }
          }
        } catch (error) {
          console.error('Open Library API error:', error);
        }
        return null;
      }
    ];

    // Try each source until we find a cover
    for (const source of sources) {
      coverUrl = await source();
      if (coverUrl) {
        console.log('Found cover URL:', coverUrl);
        break;
      }
    }

    // If we found a cover, verify it's accessible
    if (coverUrl) {
      try {
        const verifyResponse = await fetch(coverUrl, { method: 'HEAD' });
        if (!verifyResponse.ok) {
          console.log('Cover URL not accessible, setting to null');
          coverUrl = null;
        }
      } catch (error) {
        console.log('Error verifying cover URL:', error);
        coverUrl = null;
      }
    }

    // Update the book in database if we found a cover
    if (coverUrl && (title && author)) {
      try {
        const { error: updateError } = await supabase
          .from('books')
          .update({ cover_image_url: coverUrl })
          .eq('title', title)
          .eq('author', author);

        if (updateError) {
          console.error('Error updating book cover in database:', updateError);
        } else {
          console.log('Successfully updated book cover in database');
        }
      } catch (error) {
        console.error('Error updating database:', error);
      }
    }

    return new Response(JSON.stringify({ 
      coverUrl,
      found: !!coverUrl,
      title,
      author
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-book-cover function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});