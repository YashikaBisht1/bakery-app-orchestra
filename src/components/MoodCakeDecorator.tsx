import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CakeComponent {
  id: string;
  name: string;
  color: string;
  texture: string;
  price: number;
}

interface Cake {
  id: string;
  name: string;
  mood: string;
  base: CakeComponent | null;
  piping: CakeComponent | null;
  toppings: CakeComponent[];
  totalPrice: number;
  createdAt: string;
}

const MoodCakeDecorator = () => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [currentCake, setCurrentCake] = useState<Cake>({
    id: "",
    name: "",
    mood: "",
    base: null,
    piping: null,
    toppings: [],
    totalPrice: 0,
    createdAt: ""
  });
  const [savedCakes, setSavedCakes] = useState<Cake[]>([]);
  const [cakeName, setCakeName] = useState("");

  const moods = [
    { id: "happy", name: "Happy", color: "from-yellow-300 to-orange-400", emoji: "😊" },
    { id: "romantic", name: "Romantic", color: "from-pink-300 to-red-400", emoji: "💕" },
    { id: "energetic", name: "Energetic", color: "from-blue-300 to-green-400", emoji: "⚡" },
    { id: "calm", name: "Calm", color: "from-purple-300 to-blue-300", emoji: "😌" },
    { id: "festive", name: "Festive", color: "from-rainbow-300 to-pink-400", emoji: "🎉" }
  ];

  const bases = [
    { id: "sponge", name: "Sponge", color: "#F4E4A1", texture: "dotted", price: 8 },
    { id: "chiffon", name: "Chiffon", color: "#F8F3E8", texture: "fluffy", price: 10 },
    { id: "pound", name: "Pound Cake", color: "#E6C964", texture: "smooth", price: 12 },
    { id: "angel", name: "Angel Food", color: "#FFFFFF", texture: "airy", price: 14 },
    { id: "butter", name: "Butter Cake", color: "#D4AC0D", texture: "dense", price: 15 }
  ];

  const pipings = [
    { id: "buttercream", name: "Buttercream", color: "#FFB6C1", texture: "swirl", price: 6 },
    { id: "ganache", name: "Chocolate Ganache", color: "#3C2414", texture: "drip", price: 8 },
    { id: "cream-cheese", name: "Cream Cheese", color: "#FFF8DC", texture: "smooth", price: 7 },
    { id: "whipped", name: "Whipped Cream", color: "#FFFFFF", texture: "fluffy", price: 5 },
    { id: "royal", name: "Royal Icing", color: "#E8E8E8", texture: "glossy", price: 9 }
  ];

  const toppings = [
    { id: "berries", name: "Fresh Berries", color: "#DC143C", texture: "glossy", price: 4 },
    { id: "chocolate-chips", name: "Chocolate Chips", color: "#2F1B14", texture: "chunky", price: 3 },
    { id: "flowers", name: "Edible Flowers", color: "#DDA0DD", texture: "delicate", price: 6 },
    { id: "sprinkles", name: "Rainbow Sprinkles", color: "#FF69B4", texture: "sparkly", price: 2 },
    { id: "nuts", name: "Nuts & Seeds", color: "#D2691E", texture: "crunchy", price: 3 }
  ];

  const getMoodColors = (mood: string) => {
    const moodObj = moods.find(m => m.id === mood);
    return moodObj?.color || "from-gray-200 to-gray-300";
  };

  const calculatePrice = () => {
    let total = 0;
    if (currentCake.base) total += currentCake.base.price;
    if (currentCake.piping) total += currentCake.piping.price;
    total += currentCake.toppings.reduce((sum, topping) => sum + topping.price, 0);
    return total;
  };

  const selectMood = (moodId: string) => {
    setSelectedMood(moodId);
    setCurrentCake(prev => ({ ...prev, mood: moodId }));
  };

  const selectBase = (base: CakeComponent) => {
    setCurrentCake(prev => ({ ...prev, base }));
  };

  const selectPiping = (piping: CakeComponent) => {
    setCurrentCake(prev => ({ ...prev, piping }));
  };

  const addTopping = (topping: CakeComponent) => {
    if (currentCake.toppings.find(t => t.id === topping.id)) return;
    setCurrentCake(prev => ({
      ...prev,
      toppings: [...prev.toppings, topping]
    }));
  };

  const removeTopping = (toppingId: string) => {
    setCurrentCake(prev => ({
      ...prev,
      toppings: prev.toppings.filter(t => t.id !== toppingId)
    }));
  };

  const saveCake = () => {
    if (!cakeName.trim() || !currentCake.base || !selectedMood) return;
    
    const newCake: Cake = {
      ...currentCake,
      id: Date.now().toString(),
      name: cakeName,
      totalPrice: calculatePrice(),
      createdAt: new Date().toLocaleString()
    };
    
    setSavedCakes(prev => [...prev, newCake]);
    
    // Reset current cake
    setCurrentCake({
      id: "",
      name: "",
      mood: "",
      base: null,
      piping: null,
      toppings: [],
      totalPrice: 0,
      createdAt: ""
    });
    setCakeName("");
    setSelectedMood("");
  };

  const renderCakePreview = () => {
    if (!currentCake.base && !selectedMood) return null;

    return (
      <div className="cake-preview relative w-48 h-48 mx-auto mb-6">
        {/* Cake Base */}
        <div 
          className={`absolute bottom-0 w-full h-24 rounded-lg bg-gradient-to-t ${getMoodColors(selectedMood)} opacity-80 border-4 border-bakery-brown`}
          style={{ backgroundColor: currentCake.base?.color }}
        >
          {currentCake.base?.texture === "dotted" && (
            <div className="absolute inset-0 opacity-30">
              <div className="w-2 h-2 bg-yellow-600 rounded-full absolute top-2 left-4"></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full absolute top-6 left-8"></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full absolute top-4 right-6"></div>
            </div>
          )}
        </div>

        {/* Piping */}
        {currentCake.piping && (
          <div 
            className="absolute top-16 w-full h-8 rounded-t-lg border-2 border-bakery-brown opacity-90"
            style={{ backgroundColor: currentCake.piping.color }}
          >
            {currentCake.piping.texture === "swirl" && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-6 opacity-50"></div>
                <div className="w-3 h-3 bg-white rounded-full absolute top-2 right-8 opacity-50"></div>
              </div>
            )}
            {currentCake.piping.texture === "drip" && (
              <div className="absolute -bottom-2 left-4 w-2 h-6 bg-current rounded-b-full opacity-70"></div>
            )}
          </div>
        )}

        {/* Toppings */}
        <div className="absolute top-12 w-full flex justify-center gap-2">
          {currentCake.toppings.map((topping, index) => (
            <div 
              key={topping.id}
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: topping.color, left: `${20 + index * 15}%` }}
            ></div>
          ))}
        </div>

        {/* Mood Glow Effect */}
        {selectedMood && (
          <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getMoodColors(selectedMood)} opacity-20 animate-pulse`}></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-bakery-cream to-bakery-pink">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            🎨 MoodCake Decorator 🎂
          </h1>
          <p className="text-lg text-muted-foreground">
            Design your perfect cake based on your mood!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Design Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mood Selection */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">1. Choose Your Mood</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {moods.map(mood => (
                  <Button
                    key={mood.id}
                    onClick={() => selectMood(mood.id)}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    className={`h-20 flex flex-col gap-2 bg-gradient-to-r ${mood.color} ${
                      selectedMood === mood.id ? 'ring-4 ring-primary ring-offset-2' : ''
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.name}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Base Selection */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">2. Select Cake Base</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {bases.map(base => (
                  <Button
                    key={base.id}
                    onClick={() => selectBase(base)}
                    variant={currentCake.base?.id === base.id ? "default" : "outline"}
                    className={`h-16 flex flex-col gap-1 ${
                      currentCake.base?.id === base.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: currentCake.base?.id === base.id ? base.color : undefined }}
                  >
                    <span className="text-xs font-medium">{base.name}</span>
                    <span className="text-xs text-muted-foreground">${base.price}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Piping Selection */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">3. Choose Piping Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {pipings.map(piping => (
                  <Button
                    key={piping.id}
                    onClick={() => selectPiping(piping)}
                    variant={currentCake.piping?.id === piping.id ? "default" : "outline"}
                    className={`h-16 flex flex-col gap-1 ${
                      currentCake.piping?.id === piping.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: currentCake.piping?.id === piping.id ? piping.color : undefined }}
                  >
                    <span className="text-xs font-medium">{piping.name}</span>
                    <span className="text-xs text-muted-foreground">${piping.price}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Toppings Selection */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">4. Add Toppings</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {toppings.map(topping => (
                  <Button
                    key={topping.id}
                    onClick={() => addTopping(topping)}
                    variant="outline"
                    className="h-16 flex flex-col gap-1"
                    style={{ backgroundColor: topping.color, opacity: 0.8 }}
                  >
                    <span className="text-xs font-medium text-white">{topping.name}</span>
                    <span className="text-xs text-white">${topping.price}</span>
                  </Button>
                ))}
              </div>
              
              {currentCake.toppings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentCake.toppings.map(topping => (
                    <Badge 
                      key={topping.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTopping(topping.id)}
                    >
                      {topping.name} ×
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

          </div>

          {/* Preview & Save Panel */}
          <div className="space-y-6">
            
            {/* Cake Preview */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary text-center">Your Cake</h3>
              {renderCakePreview()}
              
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-primary">
                  Total: ${calculatePrice()}
                </div>
                
                <input
                  type="text"
                  placeholder="Name your cake..."
                  value={cakeName}
                  onChange={(e) => setCakeName(e.target.value)}
                  className="w-full p-2 rounded border border-input bg-background text-center"
                />
                
                <Button 
                  onClick={saveCake}
                  disabled={!cakeName.trim() || !currentCake.base || !selectedMood}
                  className="w-full bg-bakery-mint hover:bg-bakery-lavender"
                >
                  Save Cake Creation ✨
                </Button>
              </div>
            </Card>

            {/* Saved Cakes */}
            {savedCakes.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Your Creations</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {savedCakes.map(cake => (
                    <div key={cake.id} className="p-3 bg-background rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-primary">{cake.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {moods.find(m => m.id === cake.mood)?.emoji} {cake.mood}
                          </div>
                          <div className="text-sm font-semibold">${cake.totalPrice}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cake.createdAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCakeDecorator;