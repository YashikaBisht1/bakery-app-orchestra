import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: number;
    mood: string;
  }[];
}

interface MoodResult {
  primaryMood: string;
  score: number;
  insights: string[];
  recommendations: string[];
  color: string;
  emoji: string;
}

const MoodQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [quizResult, setQuizResult] = useState<MoodResult | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: "How do you feel when you wake up in the morning?",
      options: [
        { text: "Energized and ready to tackle the day", value: 4, mood: "energetic" },
        { text: "Content and peaceful", value: 3, mood: "calm" },
        { text: "Neutral, just another day", value: 2, mood: "neutral" },
        { text: "Tired or reluctant to start", value: 1, mood: "low" }
      ]
    },
    {
      id: 2,
      question: "When facing challenges, how do you typically respond?",
      options: [
        { text: "I get excited and see it as an opportunity", value: 4, mood: "optimistic" },
        { text: "I approach it calmly and methodically", value: 3, mood: "balanced" },
        { text: "I feel overwhelmed but push through", value: 2, mood: "stressed" },
        { text: "I feel anxious and want to avoid it", value: 1, mood: "anxious" }
      ]
    },
    {
      id: 3,
      question: "How do you prefer to spend your free time?",
      options: [
        { text: "Being social and active with others", value: 4, mood: "social" },
        { text: "Pursuing hobbies I'm passionate about", value: 3, mood: "fulfilled" },
        { text: "Relaxing quietly at home", value: 2, mood: "introverted" },
        { text: "I don't have much free time or energy", value: 1, mood: "drained" }
      ]
    },
    {
      id: 4,
      question: "How do you react to unexpected changes?",
      options: [
        { text: "I adapt quickly and find it exciting", value: 4, mood: "adaptable" },
        { text: "I take time to adjust but handle it well", value: 3, mood: "resilient" },
        { text: "I feel unsettled but manage to cope", value: 2, mood: "cautious" },
        { text: "I feel stressed and prefer routine", value: 1, mood: "rigid" }
      ]
    },
    {
      id: 5,
      question: "What best describes your current energy level?",
      options: [
        { text: "High energy, feeling vibrant", value: 4, mood: "vibrant" },
        { text: "Steady energy throughout the day", value: 3, mood: "stable" },
        { text: "Energy comes and goes", value: 2, mood: "variable" },
        { text: "Consistently low energy", value: 1, mood: "fatigued" }
      ]
    }
  ];

  const analyzeMood = (): MoodResult => {
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const averageScore = totalScore / answers.length;

    if (averageScore >= 3.5) {
      return {
        primaryMood: "Thriving",
        score: averageScore,
        insights: [
          "You're in a great mental space right now!",
          "Your positive outlook is helping you navigate life effectively",
          "You have good energy levels and emotional resilience"
        ],
        recommendations: [
          "🌟 Share your positive energy with others",
          "🎯 Set new challenging goals to maintain momentum", 
          "🧘 Practice gratitude to sustain this positive state",
          "💪 Try new activities while your energy is high"
        ],
        color: "text-green-600",
        emoji: "🌟"
      };
    } else if (averageScore >= 2.5) {
      return {
        primaryMood: "Balanced",
        score: averageScore,
        insights: [
          "You're maintaining a steady, balanced emotional state",
          "You handle challenges with reasonable composure",
          "There's room for growth in certain areas"
        ],
        recommendations: [
          "🎨 Explore new hobbies to add excitement",
          "🤝 Connect with supportive friends and family",
          "📚 Learn something new to stimulate your mind",
          "🏃 Add gentle physical activity to boost energy"
        ],
        color: "text-blue-600",
        emoji: "⚖️"
      };
    } else {
      return {
        primaryMood: "Needs Support",
        score: averageScore,
        insights: [
          "You might be going through a challenging period",
          "Your energy and mood could benefit from extra care",
          "It's important to be gentle with yourself right now"
        ],
        recommendations: [
          "💙 Reach out to trusted friends or professionals",
          "🛀 Prioritize self-care and rest",
          "🌱 Start with small, achievable daily goals",
          "☀️ Spend time in nature or sunlight when possible"
        ],
        color: "text-purple-600",
        emoji: "🤗"
      };
    }
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = analyzeMood();
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const points = Math.floor(totalScore * 10);
      setTotalPoints(points);
      setQuizResult(result);
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setTotalPoints(0);
    setQuizResult(null);
  };

  if (showResults && quizResult) {
    
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{quizResult.emoji}</div>
            <h2 className="text-3xl font-bold text-primary mb-2">Your Mood Analysis</h2>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {quizResult.primaryMood} • {totalPoints} Points Earned!
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-3">📊 Insights</h3>
              <div className="space-y-2">
                {quizResult.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-primary">•</span>
                    <p className="text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary mb-3">💡 Personalized Recommendations</h3>
              <div className="grid gap-3">
                {quizResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <span className="text-2xl">{rec.split(' ')[0]}</span>
                    <p className="text-muted-foreground">{rec.split(' ').slice(1).join(' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={resetQuiz} size="lg" className="bg-primary hover:bg-primary/90">
              Take Quiz Again ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">🧠 Mood Understanding Quiz</h2>
            <Badge variant="outline" className="text-sm">
              {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-primary mb-6">
            {questions[currentQuestion].question}
          </h3>
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left justify-start p-4 h-auto border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => handleAnswer(option.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary font-semibold">{String.fromCharCode(65 + index)}</span>
                  <span className="text-muted-foreground">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Answer honestly for the most accurate mood analysis and personalized recommendations
        </div>
      </Card>
    </div>
  );
};

export default MoodQuiz;