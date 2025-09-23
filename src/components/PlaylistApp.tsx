import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist: string;
  bookInspiration: string;
  genre: string;
  addedAt: string;
}

interface Playlist {
  id: string;
  name: string;
  bookTheme: string;
  songs: Song[];
  createdAt: string;
  currentSongIndex: number;
}

const PlaylistApp = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", bookTheme: "" });
  const [newSong, setNewSong] = useState({ title: "", artist: "", bookInspiration: "", genre: "" });
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bakery-playlists");
    if (stored) {
      setPlaylists(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever playlists change
  useEffect(() => {
    localStorage.setItem("bakery-playlists", JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = () => {
    if (!newPlaylist.name.trim() || !newPlaylist.bookTheme.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both playlist name and book theme!",
        variant: "destructive"
      });
      return;
    }

    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylist.name.trim(),
      bookTheme: newPlaylist.bookTheme.trim(),
      songs: [],
      createdAt: new Date().toLocaleString(),
      currentSongIndex: 0
    };

    setPlaylists(prev => [playlist, ...prev]);
    setNewPlaylist({ name: "", bookTheme: "" });
    setActivePlaylist(playlist.id);
    
    toast({
      title: "Playlist Created! 🍩",
      description: `${playlist.name} playlist is ready for songs!`
    });
  };

  const addSong = () => {
    if (!activePlaylist || !newSong.title.trim() || !newSong.artist.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a playlist and fill in song details!",
        variant: "destructive"
      });
      return;
    }

    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title.trim(),
      artist: newSong.artist.trim(),
      bookInspiration: newSong.bookInspiration.trim(),
      genre: newSong.genre.trim(),
      addedAt: new Date().toLocaleString()
    };

    setPlaylists(prev => prev.map(playlist => 
      playlist.id === activePlaylist 
        ? { ...playlist, songs: [...playlist.songs, song] }
        : playlist
    ));
    
    setNewSong({ title: "", artist: "", bookInspiration: "", genre: "" });
    
    toast({
      title: "Song Added! 🎵",
      description: `${song.title} by ${song.artist} has been added!`
    });
  };

  const deleteSong = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { ...playlist, songs: playlist.songs.filter(song => song.id !== songId) }
        : playlist
    ));
    
    toast({
      title: "Song Removed",
      description: "The song has been removed from the playlist."
    });
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    if (activePlaylist === playlistId) {
      setActivePlaylist(null);
    }
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been removed."
    });
  };

  const playNext = (playlistId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId && playlist.songs.length > 0) {
        const nextIndex = (playlist.currentSongIndex + 1) % playlist.songs.length;
        const nextSong = playlist.songs[nextIndex];
        
        toast({
          title: "Now Playing 🎵",
          description: `${nextSong.title} by ${nextSong.artist}`
        });
        
        return { ...playlist, currentSongIndex: nextIndex };
      }
      return playlist;
    }));
  };

  const shufflePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId && playlist.songs.length > 0) {
        const randomIndex = Math.floor(Math.random() * playlist.songs.length);
        const randomSong = playlist.songs[randomIndex];
        
        toast({
          title: "Shuffle Play 🔀",
          description: `${randomSong.title} by ${randomSong.artist}`
        });
        
        return { ...playlist, currentSongIndex: randomIndex };
      }
      return playlist;
    }));
  };

  const currentPlaylist = playlists.find(p => p.id === activePlaylist);
  const currentSong = currentPlaylist?.songs[currentPlaylist.currentSongIndex];

  return (
    <div className="space-y-6">
      {/* Create Playlist */}
      <Card className="p-6 bg-bakery-cream border-bakery-brown border-2">
        <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
          🍩 Create Book-Inspired Playlist
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="playlist-name">Playlist Name</Label>
            <Input
              id="playlist-name"
              value={newPlaylist.name}
              onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Fantasy Adventures..."
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="book-theme">Book Theme/Genre</Label>
            <Input
              id="book-theme"
              value={newPlaylist.bookTheme}
              onChange={(e) => setNewPlaylist(prev => ({ ...prev, bookTheme: e.target.value }))}
              placeholder="Fantasy, Romance, Mystery..."
              className="bg-background"
            />
          </div>
        </div>
        <Button 
          onClick={createPlaylist}
          className="bg-bakery-pink hover:bg-bakery-peach border-2 border-bakery-brown"
        >
          Create Playlist 📚
        </Button>
      </Card>

      {/* Playlist Selection */}
      {playlists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">📚 Your Playlists</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((playlist) => (
              <Card 
                key={playlist.id}
                className={`p-4 cursor-pointer border-2 transition-colors ${
                  activePlaylist === playlist.id 
                    ? "bg-bakery-mint border-primary" 
                    : "bg-bakery-cream border-bakery-brown hover:bg-bakery-pink"
                }`}
                onClick={() => setActivePlaylist(playlist.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-primary">{playlist.name}</h4>
                    <p className="text-sm text-muted-foreground">{playlist.bookTheme}</p>
                    <p className="text-xs text-muted-foreground">{playlist.songs.length} songs</p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    🗑️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Song (only if playlist selected) */}
      {activePlaylist && (
        <Card className="p-6 bg-bakery-mint border-bakery-brown border-2">
          <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
            🎵 Add Song to "{currentPlaylist?.name}"
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="song-title">Song Title</Label>
              <Input
                id="song-title"
                value={newSong.title}
                onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Song title..."
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={newSong.artist}
                onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Artist name..."
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="book-inspiration">Book Inspiration</Label>
              <Input
                id="book-inspiration"
                value={newSong.bookInspiration}
                onChange={(e) => setNewSong(prev => ({ ...prev, bookInspiration: e.target.value }))}
                placeholder="Which book inspired this song?"
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={newSong.genre}
                onChange={(e) => setNewSong(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="Folk, Pop, Classical..."
                className="bg-background"
              />
            </div>
          </div>
          <Button 
            onClick={addSong}
            className="bg-bakery-peach hover:bg-bakery-lavender border-2 border-bakery-brown"
          >
            Add Song 🎵
          </Button>
        </Card>
      )}

      {/* Current Playing */}
      {currentSong && currentPlaylist && (
        <Card className="p-6 bg-bakery-lavender border-bakery-brown border-2">
          <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
            🎧 Now Playing
          </h3>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <h4 className="text-lg font-semibold text-primary">{currentSong.title}</h4>
              <p className="text-muted-foreground">by {currentSong.artist}</p>
              {currentSong.bookInspiration && (
                <p className="text-sm text-muted-foreground">📖 Inspired by: {currentSong.bookInspiration}</p>
              )}
              {currentSong.genre && (
                <p className="text-sm text-muted-foreground">🎼 Genre: {currentSong.genre}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => playNext(currentPlaylist.id)}
                className="bg-bakery-mint hover:bg-bakery-cream border-2 border-bakery-brown"
              >
                ⏭️ Next
              </Button>
              <Button
                onClick={() => shufflePlaylist(currentPlaylist.id)}
                variant="secondary"
                className="bg-bakery-peach hover:bg-bakery-pink border-2 border-bakery-brown"
              >
                🔀 Shuffle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Songs List */}
      {currentPlaylist && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
            🎵 Songs in "{currentPlaylist.name}" ({currentPlaylist.songs.length})
          </h3>
          
          {currentPlaylist.songs.length === 0 ? (
            <Card className="p-8 text-center bg-bakery-cream border-bakery-brown border-2">
              <div className="text-6xl mb-4">🍩</div>
              <h4 className="text-xl font-semibold text-muted-foreground mb-2">
                No songs yet
              </h4>
              <p className="text-muted-foreground">
                Add your first book-inspired song to get started!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {currentPlaylist.songs.map((song, index) => (
                <Card 
                  key={song.id} 
                  className={`p-4 border-2 transition-colors ${
                    index === currentPlaylist.currentSongIndex
                      ? "bg-bakery-lavender border-primary ring-2 ring-primary/20"
                      : "bg-bakery-cream border-bakery-brown hover:bg-bakery-pink"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {index === currentPlaylist.currentSongIndex && <span className="text-primary">🎵</span>}
                        <h4 className="font-semibold text-primary">{song.title}</h4>
                      </div>
                      <p className="text-muted-foreground mb-1">by {song.artist}</p>
                      {song.bookInspiration && (
                        <p className="text-sm text-muted-foreground">📖 {song.bookInspiration}</p>
                      )}
                      {song.genre && (
                        <p className="text-sm text-muted-foreground">🎼 {song.genre}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Added: {song.addedAt}</p>
                    </div>
                    <Button
                      onClick={() => deleteSong(activePlaylist, song.id)}
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      🗑️
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistApp;