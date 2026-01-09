'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ListTodo, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Project } from '@/interfaces/project.interface'
import { Task } from '@/interfaces/task.interface'

export default function Dashboard() {
  const [localTasks, setLocalTasks] = useState<Task[]>([])

  // Fetch projects and tasks (GET only)
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then(res => res.json()),
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json()),
  })

  const isLoading = projectsLoading || tasksLoading

  // Sync local tasks with fetched tasks
  useEffect(() => {
    if (tasks.length > 0) {
      setLocalTasks(tasks)
    }
  }, [tasks])

  if (isLoading) return <div className="p-6">Loading...</div>

  const completedTasks = localTasks.filter(t => t.status === 'done')
  const inProgressTasks = localTasks.filter(t => t.status === 'in-progress')
  
  // Overdue tasks: due date is in the past and status is not 'done'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const overdueTasks = localTasks.filter(t => {
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today && t.status !== 'done'
  })

  const toggleTaskStatus = (taskId: string) => {
    setLocalTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
          : task
      )
    )
  }

  // Sort by due date (earliest/closest first) and take first 4
  const recentTasks = [...localTasks]
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
    )
    .slice(0, 4)

  // Format date to match the image
  const formatDueDate = (date: Date): string => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    } else {
      // Format as "Mon Day" like "Jan 10"
      return taskDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  // Get status badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'done': return 'default'
      case 'in-progress': return 'secondary'
      case 'todo': return 'outline'
      default: return 'outline'
    }
  }

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'done': return 'Done'
      case 'in-progress': return 'In Progress'
      case 'todo': return 'To Do'
      default: return status
    }
  }

  // Calculate total tasks
  const totalTasks = localTasks.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">John</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          trend="+12% from last week"
          trendType="positive"
          icon={<ListTodo className="h-5 w-5" />}
          bg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Completed"
          value={completedTasks.length}
          trend="+8% from last week"
          trendType="positive"
          icon={<CheckCircle className="h-5 w-5" />}
          bg="bg-green-50"
          iconColor="text-green-600"
        />

        <StatCard
          title="In Progress"
          value={inProgressTasks.length}
          trend="+5% from last week"
          trendType="positive"
          icon={<Clock className="h-5 w-5" />}
          bg="bg-yellow-50"
          iconColor="text-yellow-600"
        />

        <StatCard
          title="Overdue"
          value={overdueTasks.length}
          trend="-2% from last week"
          trendType="negative"
          icon={<AlertCircle className="h-5 w-5" />}
          bg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Tasks</CardTitle>
          <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            View all →
          </span>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {recentTasks.length > 0 ? (
            recentTasks.map(task => {
              const project = projects.find((p: Project) => p.id === task.projectId)
              
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={task.status === 'done'}
                      onCheckedChange={() => toggleTaskStatus(task.id)}
                      className="h-5 w-5"
                    />

                    <div className="space-y-1 flex-1">
                      <p className="font-medium line-clamp-1">
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getStatusVariant(task.status)}
                      className="capitalize"
                    >
                      {getStatusText(task.status)}
                    </Badge>

                    <span className="text-sm text-muted-foreground min-w-[70px] text-right">
                      {formatDueDate(new Date(task.dueDate))}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-center text-muted-foreground py-6">No tasks to display</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------- */
/* Reusable Stat Card  */
/* -------------------- */
function StatCard({
  title,
  value,
  trend,
  trendType = 'positive',
  icon,
  bg,
  iconColor,
}: {
  title: string
  value: number
  trend: string
  trendType?: 'positive' | 'negative'
  icon: React.ReactNode
  bg: string
  iconColor: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold">
              {value}
            </p>
            <p className={`text-sm ${trendType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          </div>

          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}
          >
            <span className={iconColor}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}