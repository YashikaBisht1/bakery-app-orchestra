import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CakeLayer {
  id: string;
  name: string;
  color: string;
  pattern: string;
  price: number;
}

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
  layers: CakeLayer[];
  frosting: CakeComponent | null;
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
    layers: [],
    frosting: null,
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

  const cakeLayers = [
    { id: "vanilla", name: "Vanilla", color: "#FFF8DC", pattern: "solid", price: 8 },
    { id: "chocolate", name: "Chocolate", color: "#8B4513", pattern: "solid", price: 8 },
    { id: "strawberry", name: "Strawberry", color: "#FFB6C1", pattern: "solid", price: 9 },
    { id: "red-velvet", name: "Red Velvet", color: "#DC143C", pattern: "solid", price: 10 },
    { id: "lemon", name: "Lemon", color: "#FFFF99", pattern: "solid", price: 9 },
    { id: "funfetti", name: "Funfetti", color: "#F0E68C", pattern: "sprinkle", price: 11 }
  ];

  const frostings = [
    { id: "buttercream", name: "Buttercream", color: "#FFE4E1", texture: "swirl", price: 6 },
    { id: "chocolate", name: "Chocolate", color: "#D2691E", texture: "smooth", price: 7 },
    { id: "cream-cheese", name: "Cream Cheese", color: "#F5F5DC", texture: "smooth", price: 8 },
    { id: "whipped", name: "Whipped", color: "#FFFFFF", texture: "fluffy", price: 5 },
    { id: "caramel", name: "Caramel", color: "#CD853F", texture: "drip", price: 9 }
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
    total += currentCake.layers.reduce((sum, layer) => sum + layer.price, 0);
    if (currentCake.frosting) total += currentCake.frosting.price;
    total += currentCake.toppings.reduce((sum, topping) => sum + topping.price, 0);
    return total;
  };

  const selectMood = (moodId: string) => {
    setSelectedMood(moodId);
    setCurrentCake(prev => ({ ...prev, mood: moodId }));
  };

  const addLayer = (layer: CakeLayer) => {
    if (currentCake.layers.length >= 4) return; // Max 4 layers
    setCurrentCake(prev => ({ 
      ...prev, 
      layers: [...prev.layers, { ...layer, id: `${layer.id}-${Date.now()}` }]
    }));
  };

  const removeLayer = (layerIndex: number) => {
    setCurrentCake(prev => ({
      ...prev,
      layers: prev.layers.filter((_, index) => index !== layerIndex)
    }));
  };

  const selectFrosting = (frosting: CakeComponent) => {
    setCurrentCake(prev => ({ ...prev, frosting }));
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
    if (!cakeName.trim() || currentCake.layers.length === 0 || !selectedMood) return;
    
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
      layers: [],
      frosting: null,
      toppings: [],
      totalPrice: 0,
      createdAt: ""
    });
    setCakeName("");
    setSelectedMood("");
  };

  const renderCakePreview = () => {
    if (currentCake.layers.length === 0 && !selectedMood) return null;

    return (
      <div className="cake-preview relative w-56 h-64 mx-auto mb-6">
        {/* Cake Layers (stacked bottom to top) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          {currentCake.layers.map((layer, index) => {
            const layerHeight = 32;
            const layerWidth = 140 - (index * 8); // Each layer gets slightly smaller
            return (
              <div
                key={index}
                className="relative border-2 border-amber-900 rounded-lg shadow-md"
                style={{
                  backgroundColor: layer.color,
                  width: `${layerWidth}px`,
                  height: `${layerHeight}px`,
                  marginBottom: index === currentCake.layers.length - 1 ? '0' : '-4px',
                  marginLeft: `${(140 - layerWidth) / 2}px`,
                  zIndex: currentCake.layers.length - index
                }}
              >
                {layer.pattern === "sprinkle" && (
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="w-1 h-1 bg-red-400 rounded-full absolute top-2 left-4"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full absolute top-4 left-8"></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full absolute top-3 right-6"></div>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full absolute top-5 right-10"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Frosting */}
        {currentCake.frosting && currentCake.layers.length > 0 && (
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-t-lg border-2 border-pink-300"
            style={{ 
              backgroundColor: currentCake.frosting.color,
              width: '148px',
              height: '12px',
              marginTop: `-${currentCake.layers.length * 28 + 8}px`,
              zIndex: currentCake.layers.length + 1
            }}
          >
            {currentCake.frosting.texture === "swirl" && (
              <div className="absolute inset-0 overflow-hidden rounded-t-lg">
                <div className="w-2 h-2 bg-white rounded-full absolute -top-1 left-4 opacity-60"></div>
                <div className="w-2 h-2 bg-white rounded-full absolute -top-1 right-6 opacity-60"></div>
              </div>
            )}
          </div>
        )}

        {/* Toppings */}
        {currentCake.toppings.length > 0 && currentCake.layers.length > 0 && (
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 flex justify-center gap-1"
            style={{ 
              bottom: `${4 + currentCake.layers.length * 28 + 16}px`,
              zIndex: currentCake.layers.length + 2
            }}
          >
            {currentCake.toppings.slice(0, 5).map((topping, index) => (
              <div 
                key={`${topping.id}-${index}`}
                className="w-2 h-2 rounded-full border border-gray-400"
                style={{ backgroundColor: topping.color }}
              ></div>
            ))}
          </div>
        )}

        {/* Mood Glow Effect */}
        {selectedMood && (
          <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getMoodColors(selectedMood)} opacity-15 animate-pulse`}></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-100 to-blue-200">
      {/* Cake Gallery Showcase */}
      <div className="bg-gradient-to-r from-pink-300 to-pink-400 p-4 border-b-4 border-pink-500">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-4">
            🎂 MoodCake Decorator Bakery 🎂
          </h1>
          
          {/* Saved Cakes Gallery */}
          <div className="bg-pink-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-pink-800 mb-3">🏆 Your Cake Creations</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {savedCakes.length === 0 ? (
                <div className="text-pink-600 text-sm italic">Start creating cakes to see them here!</div>
              ) : (
                savedCakes.map(cake => (
                  <div key={cake.id} className="flex-shrink-0 bg-white rounded-lg p-2 border-2 border-pink-300 shadow-md">
                    <div className="w-20 h-16 bg-gradient-to-b from-yellow-200 to-orange-200 rounded border-2 border-amber-600 mb-1"></div>
                    <div className="text-xs font-medium text-center text-gray-700 truncate w-20">{cake.name}</div>
                    <div className="text-xs text-center text-pink-600">${cake.totalPrice}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Mood Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-purple-800 mb-3">🌈 Step 1: Choose Your Mood</h3>
          <div className="flex gap-3 justify-center">
            {moods.map(mood => (
              <button
                key={mood.id}
                onClick={() => selectMood(mood.id)}
                className={`w-16 h-16 rounded-full border-4 transition-all transform hover:scale-110 ${
                  selectedMood === mood.id 
                    ? 'border-yellow-400 bg-gradient-to-r ' + mood.color + ' shadow-lg scale-110' 
                    : 'border-gray-400 bg-gradient-to-r ' + mood.color + ' opacity-70'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Cake Building Station */}
          <div className="lg:col-span-2">
            
            {/* Current Cake Preview */}
            <div className="bg-gradient-to-b from-blue-100 to-purple-100 rounded-lg p-6 mb-6 border-4 border-blue-300">
              <h3 className="text-xl font-bold text-blue-800 text-center mb-4">🎂 Your Cake</h3>
              {renderCakePreview()}
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800 mb-2">
                  ${calculatePrice()}
                </div>
                <input
                  type="text"
                  placeholder="Name your masterpiece..."
                  value={cakeName}
                  onChange={(e) => setCakeName(e.target.value)}
                  className="w-full p-3 rounded-full border-2 border-purple-300 bg-white text-center font-medium"
                />
              </div>
            </div>

            {/* Ingredient Panels */}
            <div className="space-y-4">
              
              {/* Cake Layers */}
              <div className="bg-yellow-100 rounded-lg p-4 border-3 border-yellow-400">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-yellow-800">🍰 Cake Layers ({currentCake.layers.length}/4)</h4>
                  {currentCake.layers.length > 0 && (
                    <button
                      onClick={() => removeLayer(currentCake.layers.length - 1)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Remove Top ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {cakeLayers.map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => addLayer(layer)}
                      disabled={currentCake.layers.length >= 4}
                      className={`h-12 rounded border-2 border-amber-600 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                      style={{ backgroundColor: layer.color }}
                    >
                      <div className="text-xs font-bold text-gray-800">{layer.name}</div>
                      <div className="text-xs text-gray-600">${layer.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frosting */}
              <div className="bg-pink-100 rounded-lg p-4 border-3 border-pink-400">
                <h4 className="font-bold text-pink-800 mb-3">🧁 Frosting</h4>
                <div className="grid grid-cols-5 gap-2">
                  {frostings.map(frosting => (
                    <button
                      key={frosting.id}
                      onClick={() => selectFrosting(frosting)}
                      className={`h-12 rounded border-2 transition-transform hover:scale-105 ${
                        currentCake.frosting?.id === frosting.id 
                          ? 'border-pink-600 ring-2 ring-pink-400' 
                          : 'border-pink-300'
                      }`}
                      style={{ backgroundColor: frosting.color }}
                    >
                      <div className="text-xs font-bold text-gray-800">{frosting.name}</div>
                      <div className="text-xs text-gray-600">${frosting.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toppings */}
              <div className="bg-green-100 rounded-lg p-4 border-3 border-green-400">
                <h4 className="font-bold text-green-800 mb-3">🍓 Toppings</h4>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {toppings.map(topping => (
                    <button
                      key={topping.id}
                      onClick={() => addTopping(topping)}
                      className="h-12 rounded border-2 border-green-600 transition-transform hover:scale-105"
                      style={{ backgroundColor: topping.color }}
                    >
                      <div className="text-xs font-bold text-white">{topping.name}</div>
                      <div className="text-xs text-white">${topping.price}</div>
                    </button>
                  ))}
                </div>
                
                {currentCake.toppings.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentCake.toppings.map((topping, index) => (
                      <span 
                        key={`${topping.id}-${index}`}
                        onClick={() => removeTopping(topping.id)}
                        className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded cursor-pointer hover:bg-red-200 hover:text-red-800"
                      >
                        {topping.name} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            
            {/* Save Button */}
            <button 
              onClick={saveCake}
              disabled={!cakeName.trim() || currentCake.layers.length === 0 || !selectedMood}
              className="w-full py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg rounded-lg border-4 border-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
            >
              🎉 Save Your Cake! 🎉
            </button>

            {/* Instructions */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
              <h4 className="font-bold text-gray-800 mb-2">🎮 How to Play</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Pick your mood 😊</li>
                <li>2. Stack up to 4 layers 🍰</li>
                <li>3. Add frosting 🧁</li>
                <li>4. Sprinkle toppings 🍓</li>
                <li>5. Name & save your creation! 🎉</li>
              </ol>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCakeDecorator;