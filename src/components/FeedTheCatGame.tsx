import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Position = { x: number; y: number };
type CellType = 'empty' | 'wall' | 'cat' | 'food' | 'key' | 'door' | 'mouse';

interface GameState {
  grid: CellType[][];
  catPos: Position;
  foodPos: Position[];
  keyPos: Position[];
  doorPos: Position[];
  mousePos: Position[];
  hasKey: boolean;
  moves: number;
  maxMoves: number;
  level: number;
  isWon: boolean;
  isLost: boolean;
}

const LEVELS = [
  { name: "Tutorial", size: 4, obstacles: 0, foods: 1, keys: 0, doors: 0, mice: 0, maxMoves: 5 },
  { name: "Easy", size: 5, obstacles: 3, foods: 1, keys: 0, doors: 0, mice: 0, maxMoves: 8 },
  { name: "Medium", size: 6, obstacles: 5, foods: 2, keys: 1, doors: 1, mice: 0, maxMoves: 12 },
  { name: "Hard", size: 7, obstacles: 8, foods: 2, keys: 1, doors: 2, mice: 1, maxMoves: 15 },
  { name: "Expert", size: 8, obstacles: 12, foods: 3, keys: 2, doors: 3, mice: 2, maxMoves: 20 }
];

const FeedTheCatGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    catPos: { x: 0, y: 0 },
    foodPos: [],
    keyPos: [],
    doorPos: [],
    mousePos: [],
    hasKey: false,
    moves: 0,
    maxMoves: 5,
    level: 1,
    isWon: false,
    isLost: false
  });

  // BFS pathfinding to check if puzzle is solvable
  const findPath = useCallback((grid: CellType[][], start: Position, goals: Position[], hasKey: boolean = false): boolean => {
    const size = grid.length;
    const visited = new Set<string>();
    const queue: { pos: Position; key: boolean }[] = [{ pos: start, key: hasKey }];
    
    while (queue.length > 0) {
      const { pos, key } = queue.shift()!;
      const stateKey = `${pos.x},${pos.y},${key}`;
      
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);
      
      // Check if we reached any goal
      if (goals.some(goal => goal.x === pos.x && goal.y === pos.y)) {
        return true;
      }
      
      // Explore neighbors
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dx, dy] of directions) {
        const newX = pos.x + dx;
        const newY = pos.y + dy;
        
        if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
          const cell = grid[newY][newX];
          let canMove = false;
          let newKey = key;
          
          if (cell === 'empty' || cell === 'food') {
            canMove = true;
          } else if (cell === 'key') {
            canMove = true;
            newKey = true;
          } else if (cell === 'door' && key) {
            canMove = true;
          }
          
          if (canMove) {
            queue.push({ pos: { x: newX, y: newY }, key: newKey });
          }
        }
      }
    }
    
    return false;
  }, []);

  // Generate a solvable puzzle
  const generateLevel = useCallback((levelIndex: number) => {
    const level = LEVELS[levelIndex - 1];
    const size = level.size;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      attempts++;
      
      // Initialize empty grid
      const grid: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('empty'));
      
      // Place cat at random position
      const catPos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
      grid[catPos.y][catPos.x] = 'cat';
      
      // Place foods
      const foodPos: Position[] = [];
      for (let i = 0; i < level.foods; i++) {
        let pos;
        do {
          pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (grid[pos.y][pos.x] !== 'empty');
        grid[pos.y][pos.x] = 'food';
        foodPos.push(pos);
      }
      
      // Place keys
      const keyPos: Position[] = [];
      for (let i = 0; i < level.keys; i++) {
        let pos;
        do {
          pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (grid[pos.y][pos.x] !== 'empty');
        grid[pos.y][pos.x] = 'key';
        keyPos.push(pos);
      }
      
      // Place doors
      const doorPos: Position[] = [];
      for (let i = 0; i < level.doors; i++) {
        let pos;
        do {
          pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (grid[pos.y][pos.x] !== 'empty');
        grid[pos.y][pos.x] = 'door';
        doorPos.push(pos);
      }
      
      // Place obstacles
      for (let i = 0; i < level.obstacles; i++) {
        let pos;
        do {
          pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (grid[pos.y][pos.x] !== 'empty');
        grid[pos.y][pos.x] = 'wall';
      }
      
      // Place mice (moving obstacles)
      const mousePos: Position[] = [];
      for (let i = 0; i < level.mice; i++) {
        let pos;
        do {
          pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (grid[pos.y][pos.x] !== 'empty');
        grid[pos.y][pos.x] = 'mouse';
        mousePos.push(pos);
      }
      
      // Check if puzzle is solvable
      const tempGrid = grid.map(row => [...row]);
      tempGrid[catPos.y][catPos.x] = 'empty'; // Remove cat for pathfinding
      
      if (findPath(tempGrid, catPos, foodPos, false)) {
        return {
          grid,
          catPos,
          foodPos,
          keyPos,
          doorPos,
          mousePos,
          hasKey: false,
          moves: 0,
          maxMoves: level.maxMoves,
          level: levelIndex,
          isWon: false,
          isLost: false
        };
      }
    }
    
    // Fallback: create simple solvable level
    const grid: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('empty'));
    const catPos = { x: 0, y: 0 };
    const foodPos = [{ x: size - 1, y: size - 1 }];
    grid[catPos.y][catPos.x] = 'cat';
    grid[foodPos[0].y][foodPos[0].x] = 'food';
    
    return {
      grid,
      catPos,
      foodPos,
      keyPos: [],
      doorPos: [],
      mousePos: [],
      hasKey: false,
      moves: 0,
      maxMoves: level.maxMoves,
      level: levelIndex,
      isWon: false,
      isLost: false
    };
  }, [findPath]);

  // Initialize game
  useEffect(() => {
    setGameState(generateLevel(1));
  }, [generateLevel]);

  // Move mice randomly every 3 seconds on hard+ levels
  useEffect(() => {
    if (gameState.level < 4 || gameState.mousePos.length === 0 || gameState.isWon || gameState.isLost) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newGrid = prev.grid.map(row => [...row]);
        const newMousePos = [...prev.mousePos];
        
        // Clear current mouse positions
        prev.mousePos.forEach(pos => {
          if (newGrid[pos.y][pos.x] === 'mouse') {
            newGrid[pos.y][pos.x] = 'empty';
          }
        });
        
        // Move each mouse randomly
        newMousePos.forEach((pos, index) => {
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          const validMoves = directions.filter(([dx, dy]) => {
            const newX = pos.x + dx;
            const newY = pos.y + dy;
            return newX >= 0 && newX < newGrid.length && newY >= 0 && newY < newGrid.length && 
                   newGrid[newY][newX] === 'empty';
          });
          
          if (validMoves.length > 0) {
            const [dx, dy] = validMoves[Math.floor(Math.random() * validMoves.length)];
            newMousePos[index] = { x: pos.x + dx, y: pos.y + dy };
          }
        });
        
        // Place mice in new positions
        newMousePos.forEach(pos => {
          if (newGrid[pos.y][pos.x] === 'empty') {
            newGrid[pos.y][pos.x] = 'mouse';
          }
        });
        
        return { ...prev, grid: newGrid, mousePos: newMousePos };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [gameState.level, gameState.mousePos.length, gameState.isWon, gameState.isLost]);

  // Handle cat movement
  const moveCat = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isWon || gameState.isLost) return;

    setGameState(prev => {
      const { catPos, grid, hasKey, moves, maxMoves, foodPos, keyPos, doorPos } = prev;
      let newX = catPos.x;
      let newY = catPos.y;

      switch (direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
      }

      // Check bounds
      if (newX < 0 || newX >= grid.length || newY < 0 || newY >= grid.length) {
        return prev;
      }

      const targetCell = grid[newY][newX];
      
      // Check if move is valid
      if (targetCell === 'wall' || targetCell === 'mouse') {
        return prev; // Can't move through walls or mice
      }
      
      if (targetCell === 'door' && !hasKey) {
        return prev; // Can't open door without key
      }

      // Make the move
      const newGrid = grid.map(row => [...row]);
      const newCatPos = { x: newX, y: newY };
      let newHasKey = hasKey;
      let newFoodPos = [...foodPos];
      
      // Update old position
      newGrid[catPos.y][catPos.x] = 'empty';
      
      // Handle special cells
      if (targetCell === 'key') {
        newHasKey = true;
      } else if (targetCell === 'food') {
        newFoodPos = newFoodPos.filter(pos => !(pos.x === newX && pos.y === newY));
      }
      
      // Update new position
      newGrid[newY][newX] = 'cat';
      
      const newMoves = moves + 1;
      const isWon = newFoodPos.length === 0;
      const isLost = newMoves >= maxMoves && !isWon;

      return {
        ...prev,
        grid: newGrid,
        catPos: newCatPos,
        hasKey: newHasKey,
        foodPos: newFoodPos,
        moves: newMoves,
        isWon,
        isLost
      };
    });
  }, [gameState.isWon, gameState.isLost]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveCat('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveCat('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveCat('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveCat('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveCat]);

  const nextLevel = () => {
    if (gameState.level < LEVELS.length) {
      setGameState(generateLevel(gameState.level + 1));
    }
  };

  const restartLevel = () => {
    setGameState(generateLevel(gameState.level));
  };

  const getCellEmoji = (cell: CellType) => {
    switch (cell) {
      case 'cat': return '🐱';
      case 'food': return '🐟';
      case 'wall': return '🧱';
      case 'key': return '🗝️';
      case 'door': return '🚪';
      case 'mouse': return '🐭';
      default: return '';
    }
  };

  const getCellClass = (cell: CellType) => {
    switch (cell) {
      case 'cat': return 'bg-primary/20 border-primary';
      case 'food': return 'bg-green-500/20 border-green-500';
      case 'wall': return 'bg-stone-500/50 border-stone-500';
      case 'key': return 'bg-yellow-500/20 border-yellow-500';
      case 'door': return 'bg-brown-500/20 border-brown-500';
      case 'mouse': return 'bg-red-500/20 border-red-500';
      default: return 'bg-background border-border hover:bg-muted/50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">🐱 Feed the Cat 🐟</h2>
        <p className="text-muted-foreground">Guide the cat to all the fish to complete each level!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-4 mb-6">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Level: {LEVELS[gameState.level - 1]?.name} ({gameState.level})
        </Badge>
        <Badge variant={gameState.moves >= gameState.maxMoves * 0.8 ? "destructive" : "secondary"} 
               className="text-lg px-4 py-2">
          Moves: {gameState.moves}/{gameState.maxMoves}
        </Badge>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Fish Left: {gameState.foodPos.length}
        </Badge>
        {gameState.hasKey && (
          <Badge variant="default" className="text-lg px-4 py-2">
            🗝️ Has Key
          </Badge>
        )}
      </div>

      {/* Game Board */}
      <Card className="p-6 mb-6">
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gameState.grid.length}, 1fr)`,
            maxWidth: '400px'
          }}
        >
          {gameState.grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`aspect-square border-2 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${getCellClass(cell)}`}
              >
                {getCellEmoji(cell)}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-4">
          Use arrow keys or WASD to move • Get keys to open doors • Avoid mice!
        </p>
        
        <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto mb-4">
          <div></div>
          <Button variant="outline" size="sm" onClick={() => moveCat('up')}>↑</Button>
          <div></div>
          <Button variant="outline" size="sm" onClick={() => moveCat('left')}>←</Button>
          <div></div>
          <Button variant="outline" size="sm" onClick={() => moveCat('right')}>→</Button>
          <div></div>
          <Button variant="outline" size="sm" onClick={() => moveCat('down')}>↓</Button>
          <div></div>
        </div>
      </div>

      {/* Game Over States */}
      {gameState.isWon && (
        <Card className="p-6 text-center bg-green-500/10 border-green-500">
          <h3 className="text-2xl font-bold text-green-600 mb-2">🎉 Level Complete!</h3>
          <p className="text-muted-foreground mb-4">
            The cat is well fed! Completed in {gameState.moves} moves.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={restartLevel} variant="outline">
              🔄 Replay Level
            </Button>
            {gameState.level < LEVELS.length && (
              <Button onClick={nextLevel}>
                ➡️ Next Level
              </Button>
            )}
          </div>
        </Card>
      )}

      {gameState.isLost && (
        <Card className="p-6 text-center bg-red-500/10 border-red-500">
          <h3 className="text-2xl font-bold text-red-600 mb-2">😿 Out of Moves!</h3>
          <p className="text-muted-foreground mb-4">
            The cat is still hungry. Try a different path!
          </p>
          <Button onClick={restartLevel}>
            🔄 Try Again
          </Button>
        </Card>
      )}

      {/* Legend */}
      <Card className="p-4 mt-6">
        <h4 className="font-semibold mb-2">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">🐱 Cat (you)</div>
          <div className="flex items-center gap-2">🐟 Fish (goal)</div>
          <div className="flex items-center gap-2">🧱 Wall (obstacle)</div>
          <div className="flex items-center gap-2">🗝️ Key (collect)</div>
          <div className="flex items-center gap-2">🚪 Door (needs key)</div>
          <div className="flex items-center gap-2">🐭 Mouse (avoid)</div>
        </div>
      </Card>
    </div>
  );
};

export default FeedTheCatGame;