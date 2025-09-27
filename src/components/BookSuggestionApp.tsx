import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Sparkles, Heart, Users } from 'lucide-react';

interface Book {
  id?: string;
  title: string;
  author: string;
  genre: string;
  tropes: string[];
  description: string;
  reasoning?: string;
  cover_image_url?: string;
}

interface BookSuggestion {
  suggestions: Book[];
  overall_reasoning: string;
}

const BookSuggestionApp = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [tropes, setTropes] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [tropeInput, setTropeInput] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [overallReasoning, setOverallReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCovers, setLoadingCovers] = useState<{ [key: string]: boolean }>({});
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Popular genres and tropes for quick selection
  const popularGenres = [
    'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Science Fiction', 
    'Contemporary Fiction', 'Historical Fiction', 'Young Adult', 'Literary Fiction'
  ];

  const popularTropes = [
    'enemies to lovers', 'found family', 'chosen one', 'love triangle', 
    'second chance romance', 'fake dating', 'friends to lovers', 'vampire romance',
    'dystopian society', 'magic school', 'time travel', 'unreliable narrator'
  ];

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      setGenres([...genres, genre]);
      setGenreInput('');
    }
  };

  const addTrope = (trope: string) => {
    if (trope && !tropes.includes(trope)) {
      setTropes([...tropes, trope]);
      setTropeInput('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter(g => g !== genreToRemove));
  };

  const removeTrope = (tropeToRemove: string) => {
    setTropes(tropes.filter(t => t !== tropeToRemove));
  };

  const fetchBookCover = async (book: Book) => {
    const bookKey = `${book.title}-${book.author}`;
    setLoadingCovers(prev => ({ ...prev, [bookKey]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('fetch-book-cover', {
        body: {
          title: book.title,
          author: book.author,
          isbn: null
        }
      });

      if (error) throw error;

      if (data.coverUrl) {
        // Update the book in our state
        setSuggestions(prev => 
          prev.map(b => 
            b.title === book.title && b.author === book.author 
              ? { ...b, cover_image_url: data.coverUrl }
              : b
          )
        );
        toast({
          title: "Cover found!",
          description: `Found cover for "${book.title}"`,
        });
      } else {
        toast({
          title: "No cover found",
          description: `Could not find cover for "${book.title}"`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching cover:', error);
      toast({
        title: "Error",
        description: "Failed to fetch book cover",
        variant: "destructive"
      });
    } finally {
      setLoadingCovers(prev => ({ ...prev, [bookKey]: false }));
    }
  };

  const generateSuggestions = async () => {
    if (genres.length === 0 && tropes.length === 0) {
      toast({
        title: "Please add preferences",
        description: "Add at least one genre or trope to get suggestions",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('book-suggestions', {
        body: {
          genres,
          tropes,
          maxBooks: 5
        }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      setOverallReasoning(data.overall_reasoning || '');
      
      toast({
        title: "Suggestions generated!",
        description: `Found ${data.suggestions?.length || 0} book recommendations`,
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate book suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              AI Book Suggestion System
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Discover your next favorite book based on genres and tropes you love
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="h-5 w-5" />
                Your Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Genres */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Preferred Genres</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a genre..."
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGenre(genreInput)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => addGenre(genreInput)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Popular genres */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Popular genres:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularGenres.map((genre) => (
                      <Button
                        key={genre}
                        variant="outline"
                        size="sm"
                        onClick={() => addGenre(genre)}
                        disabled={genres.includes(genre)}
                        className="text-xs h-7"
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>

                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                        onClick={() => removeGenre(genre)}
                      >
                        {genre} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Tropes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Favorite Tropes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a trope..."
                    value={tropeInput}
                    onChange={(e) => setTropeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTrope(tropeInput)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => addTrope(tropeInput)}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Add
                  </Button>
                </div>

                {/* Popular tropes */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Popular tropes:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTropes.map((trope) => (
                      <Button
                        key={trope}
                        variant="outline"
                        size="sm"
                        onClick={() => addTrope(trope)}
                        disabled={tropes.includes(trope)}
                        className="text-xs h-7"
                      >
                        {trope}
                      </Button>
                    ))}
                  </div>
                </div>

                {tropes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tropes.map((trope) => (
                      <Badge
                        key={trope}
                        variant="secondary"
                        className="bg-pink-100 text-pink-800 hover:bg-pink-200 cursor-pointer"
                        onClick={() => removeTrope(trope)}
                      >
                        {trope} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={generateSuggestions}
                disabled={loading || (genres.length === 0 && tropes.length === 0)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get AI Suggestions
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-4">
            {overallReasoning && (
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-700">Why These Books?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{overallReasoning}</p>
                </CardContent>
              </Card>
            )}

            {suggestions.length > 0 && (
              <div className="grid gap-4">
                {suggestions.map((book, index) => {
                  const bookKey = `${book.title}-${book.author}`;
                  return (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Book Cover */}
                          <div className="flex-shrink-0">
                            {book.cover_image_url ? (
                              <img
                                src={book.cover_image_url}
                                alt={`${book.title} cover`}
                                className="w-20 h-28 object-cover rounded-md shadow-md"
                                onError={() => {
                                  setSuggestions(prev => 
                                    prev.map(b => 
                                      b.title === book.title && b.author === book.author 
                                        ? { ...b, cover_image_url: undefined }
                                        : b
                                    )
                                  );
                                }}
                              />
                            ) : (
                              <div className="w-20 h-28 bg-gradient-to-br from-purple-200 to-pink-200 rounded-md flex items-center justify-center shadow-md">
                                <BookOpen className="h-8 w-8 text-purple-600" />
                              </div>
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{book.title}</h3>
                              <p className="text-gray-600 font-medium">by {book.author}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {book.genre}
                              </Badge>
                              {book.tropes?.map((trope, i) => (
                                <Badge key={i} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                  {trope}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed">{book.description}</p>

                            {book.reasoning && (
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-purple-800 text-sm font-medium">Why it matches:</p>
                                <p className="text-purple-700 text-sm">{book.reasoning}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={() => fetchBookCover(book)}
                                disabled={loadingCovers[bookKey] || !!book.cover_image_url}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                {loadingCovers[bookKey] ? (
                                  <div className="flex items-center gap-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-600 border-t-transparent" />
                                    Finding Cover...
                                  </div>
                                ) : book.cover_image_url ? (
                                  'Cover Found'
                                ) : (
                                  'Find Cover'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {suggestions.length === 0 && !loading && (
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No suggestions yet</h3>
                  <p className="text-gray-500">Add some genres or tropes and get AI-powered book recommendations!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Database Books Section */}
        {allBooks.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Users className="h-5 w-5" />
                Books in Our Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBooks.slice(0, 6).map((book) => (
                  <div key={book.id} className="p-4 border border-purple-100 rounded-lg bg-white/50">
                    <h4 className="font-medium text-gray-900">{book.title}</h4>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                    <p className="text-xs text-purple-600 mt-1">{book.genre}</p>
                    {book.tropes && book.tropes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.tropes.slice(0, 2).map((trope, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {trope}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookSuggestionApp;