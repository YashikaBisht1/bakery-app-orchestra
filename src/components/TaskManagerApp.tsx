import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  completedAt?: string;
}

const TaskManagerApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as const });
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bakery-tasks");
    const storedLog = localStorage.getItem("bakery-execution-log");
    if (stored) {
      setTasks(JSON.parse(stored));
    }
    if (storedLog) {
      setExecutionLog(JSON.parse(storedLog));
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("bakery-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("bakery-execution-log", JSON.stringify(executionLog));
  }, [executionLog]);

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a task title!",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: newTask.priority,
      status: "pending",
      createdAt: new Date().toLocaleString()
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({ title: "", description: "", priority: "medium" });
    
    const logEntry = `📝 Added task: ${task.title} (Priority: ${task.priority}) at ${task.createdAt}`;
    setExecutionLog(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 entries
    
    toast({
      title: "Task Added! 🍪",
      description: `${task.title} has been added to your tasks!`
    });
  };

  const updateTaskStatus = (id: string, status: Task["status"]) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { 
          ...task, 
          status,
          completedAt: status === "completed" ? new Date().toLocaleString() : undefined
        };
        
        const logEntry = `🔄 Updated "${task.title}" status to: ${status} at ${new Date().toLocaleString()}`;
        setExecutionLog(prevLog => [logEntry, ...prevLog.slice(0, 19)]);
        
        return updatedTask;
      }
      return task;
    }));
    
    toast({
      title: "Task Updated! ⚡",
      description: `Status changed to ${status}`
    });
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(task => task.id !== id));
    
    if (task) {
      const logEntry = `🗑️ Deleted task: ${task.title} at ${new Date().toLocaleString()}`;
      setExecutionLog(prev => [logEntry, ...prev.slice(0, 19)]);
    }
    
    toast({
      title: "Task Removed",
      description: "The task has been deleted."
    });
  };

  const executeTopPriorityTask = () => {
    const pendingTasks = tasks.filter(t => t.status === "pending");
    if (pendingTasks.length === 0) {
      toast({
        title: "No Pending Tasks",
        description: "All tasks are completed or in progress!",
        variant: "destructive"
      });
      return;
    }

    // Priority queue logic: high > medium > low, then by creation time
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const topTask = pendingTasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })[0];

    updateTaskStatus(topTask.id, "in-progress");
    
    const logEntry = `🚀 Executed top priority task: ${topTask.title} (${topTask.priority} priority) at ${new Date().toLocaleString()}`;
    setExecutionLog(prev => [logEntry, ...prev.slice(0, 19)]);
    
    toast({
      title: "Task Started! 🚀",
      description: `Now working on: ${topTask.title}`
    });
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter(task => task.status === filter);

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case "high": return "🔥";
      case "medium": return "⚡";
      case "low": return "🌱";
      default: return "📝";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "pending": return "⏳";
      case "in-progress": return "🔄";
      case "completed": return "✅";
      default: return "📝";
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length
  };

  return (
    <div className="space-y-6">
      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-bakery-cream border-bakery-brown border-2">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 text-center bg-bakery-mint border-bakery-brown border-2">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-2xl font-bold text-primary">{taskStats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4 text-center bg-bakery-peach border-bakery-brown border-2">
          <div className="text-2xl mb-1">🔄</div>
          <div className="text-2xl font-bold text-primary">{taskStats.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 text-center bg-bakery-lavender border-bakery-brown border-2">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-primary">{taskStats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
      </div>

      {/* Add New Task */}
      <Card className="p-6 bg-bakery-cream border-bakery-brown border-2">
        <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
          🍪 Add New Task
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="bg-background"
            />
          </div>
          <div>
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔥 High</SelectItem>
                <SelectItem value="medium">⚡ Medium</SelectItem>
                <SelectItem value="low">🌱 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label htmlFor="task-description">Description (Optional)</Label>
          <Input
            id="task-description"
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Task details..."
            className="bg-background"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={addTask}
            className="bg-bakery-pink hover:bg-bakery-peach border-2 border-bakery-brown"
          >
            Add Task 📝
          </Button>
          <Button 
            onClick={executeTopPriorityTask}
            variant="secondary"
            className="bg-bakery-mint hover:bg-bakery-lavender border-2 border-bakery-brown"
          >
            Execute Top Priority 🚀
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "in-progress", "completed"].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status as any)}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            className={filter === status ? "bg-primary" : "bg-bakery-cream hover:bg-bakery-pink border-bakery-brown"}
          >
            {status === "all" ? "📋 All" : `${getStatusEmoji(status)} ${status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}`}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            📋 Tasks ({filteredTasks.length})
          </h2>
          
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center bg-bakery-cream border-bakery-brown border-2">
              <div className="text-6xl mb-4">🍪</div>
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No tasks found
              </h3>
              <p className="text-muted-foreground">
                {tasks.length === 0 ? "Add your first task to get started!" : `No ${filter} tasks at the moment.`}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="p-4 bg-bakery-cream border-bakery-brown border-2 hover:bg-bakery-pink transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getPriorityEmoji(task.priority)}</span>
                      <span>{getStatusEmoji(task.status)}</span>
                      <h3 className="font-semibold text-primary">{task.title}</h3>
                    </div>
                    <Button
                      onClick={() => deleteTask(task.id)}
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      🗑️
                    </Button>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    Created: {task.createdAt}
                    {task.completedAt && <><br />Completed: {task.completedAt}</>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateTaskStatus(task.id, "pending")}
                      size="sm"
                      variant={task.status === "pending" ? "default" : "outline"}
                      className="text-xs"
                    >
                      ⏳ Pending
                    </Button>
                    <Button
                      onClick={() => updateTaskStatus(task.id, "in-progress")}
                      size="sm"
                      variant={task.status === "in-progress" ? "default" : "outline"}
                      className="text-xs"
                    >
                      🔄 In Progress
                    </Button>
                    <Button
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      size="sm"
                      variant={task.status === "completed" ? "default" : "outline"}
                      className="text-xs"
                    >
                      ✅ Completed
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Execution Log */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            📜 Execution Log
          </h2>
          <Card className="p-4 bg-bakery-cream border-bakery-brown border-2 max-h-96 overflow-y-auto">
            {executionLog.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-2">📜</div>
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executionLog.map((entry, index) => (
                  <div key={index} className="text-sm p-2 bg-background rounded border">
                    {entry}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskManagerApp;