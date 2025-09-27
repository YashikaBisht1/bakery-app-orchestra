import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaylistApp from "@/components/PlaylistApp";
import BookSuggestionApp from "@/components/BookSuggestionApp";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              BookVerse AI
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Discover your next favorite book with AI-powered recommendations and create music playlists inspired by literature
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="book-suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 border-purple-200">
            <TabsTrigger 
              value="book-suggestions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              AI Book Suggestions
            </TabsTrigger>
            <TabsTrigger 
              value="music-playlists"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              Music Playlists
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="book-suggestions">
            <BookSuggestionApp />
          </TabsContent>
          
          <TabsContent value="music-playlists">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-purple-700">
                    Book-Inspired Music Playlists
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Create and manage playlists inspired by your favorite books
                  </CardDescription>
                </CardHeader>
              </Card>
              <PlaylistApp />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;