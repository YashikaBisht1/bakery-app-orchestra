-- Create books table with enhanced metadata
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  publication_year INTEGER,
  genre TEXT NOT NULL,
  tropes TEXT[],
  description TEXT,
  cover_image_url TEXT,
  goodreads_rating DECIMAL(3,2),
  page_count INTEGER,
  language TEXT DEFAULT 'en',
  publisher TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user book preferences table
CREATE TABLE public.user_book_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_genres TEXT[],
  preferred_tropes TEXT[],
  disliked_genres TEXT[],
  disliked_tropes TEXT[],
  reading_level TEXT CHECK (reading_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_page_count_min INTEGER,
  preferred_page_count_max INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book suggestions table to track AI suggestions
CREATE TABLE public.book_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query_genres TEXT[],
  query_tropes TEXT[],
  suggested_books JSONB,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_book_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_suggestions ENABLE ROW LEVEL SECURITY;

-- Books policies (public read access for now)
CREATE POLICY "Books are viewable by everyone" 
ON public.books 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert books" 
ON public.books 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_book_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_book_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_book_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Book suggestions policies
CREATE POLICY "Users can view their own suggestions" 
ON public.book_suggestions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert suggestions" 
ON public.book_suggestions 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_book_preferences_updated_at
BEFORE UPDATE ON public.user_book_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample books
INSERT INTO public.books (title, author, genre, tropes, description, publication_year, page_count) VALUES
('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Contemporary Fiction', ARRAY['celebrity romance', 'LGBTQ+', 'old hollywood'], 'A reclusive Hollywood icon finally tells her story to a young journalist.', 2017, 400),
('The House in the Cerulean Sea', 'TJ Klune', 'Fantasy Romance', ARRAY['found family', 'magical creatures', 'cozy fantasy'], 'A caseworker discovers a magical orphanage on a mysterious island.', 2020, 394),
('Red, White & Royal Blue', 'Casey McQuiston', 'Romance', ARRAY['enemies to lovers', 'political romance', 'LGBTQ+'], 'The First Son falls for the Prince of Wales.', 2019, 421),
('The Silent Patient', 'Alex Michaelides', 'Thriller', ARRAY['unreliable narrator', 'psychological thriller', 'twist ending'], 'A psychotherapist treats a woman who refuses to speak after allegedly murdering her husband.', 2019, 336),
('Circe', 'Madeline Miller', 'Fantasy', ARRAY['mythology retelling', 'Greek gods', 'strong female protagonist'], 'The story of Circe, the witch from Greek mythology.', 2018, 393);