import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Food {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  dateAdded: string;
}

const FoodRatingApp = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [newFood, setNewFood] = useState({ name: "", cuisine: "", rating: 5 });
  const [filter, setFilter] = useState("");
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bakery-foods");
    if (stored) {
      setFoods(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever foods change
  useEffect(() => {
    localStorage.setItem("bakery-foods", JSON.stringify(foods));
  }, [foods]);

  const addFood = () => {
    if (!newFood.name.trim() || !newFood.cuisine.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both food name and cuisine!",
        variant: "destructive"
      });
      return;
    }

    const food: Food = {
      id: Date.now().toString(),
      name: newFood.name.trim(),
      cuisine: newFood.cuisine.trim(),
      rating: newFood.rating,
      dateAdded: new Date().toLocaleDateString()
    };

    setFoods(prev => [food, ...prev]);
    setNewFood({ name: "", cuisine: "", rating: 5 });
    
    toast({
      title: "Food Added! 🧁",
      description: `${food.name} has been added to your collection!`
    });
  };

  const updateRating = (id: string, newRating: number) => {
    setFoods(prev => prev.map(food => 
      food.id === id ? { ...food, rating: newRating } : food
    ));
    
    toast({
      title: "Rating Updated! ⭐",
      description: "Your rating has been saved!"
    });
  };

  const deleteFood = (id: string) => {
    setFoods(prev => prev.filter(food => food.id !== id));
    toast({
      title: "Food Removed",
      description: "The item has been removed from your collection."
    });
  };

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(filter.toLowerCase()) ||
    food.cuisine.toLowerCase().includes(filter.toLowerCase())
  );

  const bestRated = foods.length > 0 ? foods.reduce((best, current) => 
    current.rating > best.rating ? current : best
  ) : null;

  const getStarRating = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      {/* Add New Food */}
      <Card className="p-6 bg-bakery-cream border-bakery-brown border-2">
        <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
          🧁 Add New Food
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="food-name">Food Name</Label>
            <Input
              id="food-name"
              value={newFood.name}
              onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Pizza, Sushi, etc."
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="cuisine">Cuisine</Label>
            <Input
              id="cuisine" 
              value={newFood.cuisine}
              onChange={(e) => setNewFood(prev => ({ ...prev, cuisine: e.target.value }))}
              placeholder="Italian, Japanese, etc."
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              value={newFood.rating}
              onChange={(e) => setNewFood(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
              className="bg-background"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addFood}
              className="w-full bg-bakery-pink hover:bg-bakery-peach border-2 border-bakery-brown"
            >
              Add Food 🍽️
            </Button>
          </div>
        </div>
      </Card>

      {/* Best Rated Highlight */}
      {bestRated && (
        <Card className="p-4 bg-bakery-mint border-bakery-brown border-2">
          <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            🏆 Top Rated Food
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{bestRated.name}</span>
              <span className="text-muted-foreground ml-2">({bestRated.cuisine})</span>
            </div>
            <div className="text-xl">{getStarRating(bestRated.rating)}</div>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div>
        <Label htmlFor="filter">Search Foods or Cuisine</Label>
        <Input
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name or cuisine..."
          className="bg-background"
        />
      </div>

      {/* Foods List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
          🍽️ Your Food Collection ({filteredFoods.length})
        </h2>
        
        {filteredFoods.length === 0 ? (
          <Card className="p-8 text-center bg-bakery-cream border-bakery-brown border-2">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No foods found
            </h3>
            <p className="text-muted-foreground">
              {foods.length === 0 ? "Add your first food to get started!" : "Try a different search term."}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <Card 
                key={food.id} 
                className="p-4 bg-bakery-cream border-bakery-brown border-2 hover:bg-bakery-pink transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-primary">{food.name}</h3>
                    <p className="text-sm text-muted-foreground">{food.cuisine}</p>
                    <p className="text-xs text-muted-foreground">Added: {food.dateAdded}</p>
                  </div>
                  <Button
                    onClick={() => deleteFood(food.id)}
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    🗑️
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rating:</span>
                    <span className="text-lg">{getStarRating(food.rating)}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateRating(food.id, star)}
                        className="text-xl hover:scale-125 transition-transform"
                      >
                        {star <= food.rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRatingApp;