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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { genres, tropes, userId, maxBooks = 5 } = await req.json();

    console.log('Received request:', { genres, tropes, userId, maxBooks });

    // Get existing books from database for context
    const { data: existingBooks, error: booksError } = await supabase
      .from('books')
      .select('title, author, genre, tropes, description')
      .limit(20);

    if (booksError) {
      console.error('Error fetching books:', booksError);
      return new Response(JSON.stringify({ error: 'Failed to fetch books from database' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create AI prompt for book suggestions
    const prompt = `You are a book recommendation expert. Based on the requested genres and tropes, suggest ${maxBooks} books that match these criteria.

Requested genres: ${genres?.join(', ') || 'any'}
Requested tropes: ${tropes?.join(', ') || 'any'}

Here are some books in our database for reference:
${existingBooks?.map(book => `- "${book.title}" by ${book.author} (${book.genre}) - ${book.tropes?.join(', ')}`).join('\n')}

Please provide ${maxBooks} book recommendations in the following JSON format:
{
  "suggestions": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "genre": "Primary Genre",
      "tropes": ["trope1", "trope2"],
      "description": "Brief compelling description",
      "reasoning": "Why this book matches the requested criteria"
    }
  ],
  "overall_reasoning": "Overall explanation of why these books were chosen"
}

Focus on well-known books that readers would enjoy. Include a mix of classics and contemporary works if appropriate.`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a knowledgeable book recommendation specialist who provides thoughtful, diverse book suggestions based on user preferences. Always respond with valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('OpenAI error details:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await response.json();
    console.log('OpenAI response received');

    let suggestions;
    try {
      suggestions = JSON.parse(aiData.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiData.choices[0].message.content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store the suggestion in the database
    const { error: insertError } = await supabase
      .from('book_suggestions')
      .insert({
        user_id: userId || null,
        query_genres: genres || [],
        query_tropes: tropes || [],
        suggested_books: suggestions,
        ai_reasoning: suggestions.overall_reasoning
      });

    if (insertError) {
      console.error('Error storing suggestion:', insertError);
      // Don't fail the request if storage fails
    }

    console.log('Book suggestions generated successfully');

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in book-suggestions function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});