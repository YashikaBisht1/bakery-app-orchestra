import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FoodRatingApp from "@/components/FoodRatingApp";
import TaskManagerApp from "@/components/TaskManagerApp";
import PlaylistApp from "@/components/PlaylistApp";
import FeedTheCatGame from "@/components/FeedTheCatGame";
import MoodCakeDecorator from "@/components/MoodCakeDecorator";
import MoodQuiz from "@/components/MoodQuiz";

const Index = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    {
      id: "food-rating",
      name: "Food Rating",
      icon: "🧁",
      description: "Rate and discover delicious foods",
      component: <FoodRatingApp />
    },
    {
      id: "task-manager", 
      name: "Task Manager",
      icon: "🍪",
      description: "Organize your tasks efficiently",
      component: <TaskManagerApp />
    },
    {
      id: "playlist",
      name: "Book Playlist",
      icon: "🍩", 
      description: "Curate songs inspired by books",
      component: <PlaylistApp />
    },
    {
      id: "feed-cat",
      name: "Feed the Cat",
      icon: "🎂",
      description: "Solve puzzles to feed the hungry cat",
      component: <FeedTheCatGame />
    },
    {
      id: "mood-decorator",
      name: "MoodCake Decorator",
      icon: "🍰",
      description: "Design cakes based on your mood",
      component: <MoodCakeDecorator />
    },
    {
      id: "mood-quiz",
      name: "Mood Quiz",
      icon: "🧠",
      description: "Understand and improve your mood",
      component: <MoodQuiz />
    }
  ];

  if (activeApp) {
    const app = apps.find(a => a.id === activeApp);
    return (
      <div className="min-h-screen bakery-storefront p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              {app?.icon} {app?.name}
            </h1>
            <Button 
              onClick={() => setActiveApp(null)}
              variant="secondary"
              className="bg-bakery-cream hover:bg-bakery-pink border-2 border-bakery-brown"
            >
              🏠 Back to Bakery
            </Button>
          </div>
          <div className="app-window p-6 fade-in">
            {app?.component}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bakery-storefront p-6">
      <div className="max-w-6xl mx-auto">
        {/* Bakery Sign */}
        <div className="text-center mb-12">
          <div className="bakery-sign inline-block px-8 py-4 mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">
              🍰 Welcome to Your App Bakery 🍰
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Freshly baked applications, served with love!
            </p>
          </div>
        </div>

        {/* Bakery Shelf */}
        <div className="bakery-shelf p-8 mb-8">
          <h2 className="text-2xl font-semibold text-bakery-cream text-center mb-8">
            🌟 Today's Fresh Apps 🌟
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {apps.map((app, index) => (
              <Card 
                key={app.id}
                className="pastry-item p-6 text-center border-0 wiggle cursor-pointer fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
                onClick={() => setActiveApp(app.id)}
              >
                <div className="pastry-icon bounce-gentle mb-4">
                  {app.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {app.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {app.description}
                </p>
                <Button 
                  variant="secondary"
                  className="bg-bakery-mint hover:bg-bakery-lavender border-bakery-brown border-2 w-full"
                >
                  Open App ✨
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            🍃 Made with love in the App Bakery 🍃
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;