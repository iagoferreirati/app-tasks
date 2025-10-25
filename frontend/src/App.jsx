import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './App.css'

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:3001'

const STATUSES = {
  todo: 'Todo',
  doing: 'Doing', 
  done: 'Done'
}

function TaskCard({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      <span className="task-text">{task.task}</span>
      <button 
        className="delete-btn"
        onClick={(e) => {
          console.log('Botão delete clicado para tarefa:', task._id)
          e.stopPropagation()
          e.preventDefault()
          onDelete(task._id)
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onMouseUp={(e) => {
          e.stopPropagation()
        }}
      >
        🗑️
      </button>
    </div>
  )
}

function DroppableColumn({ status, tasks, onDelete }) {
  const { setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div ref={setNodeRef} className="kanban-column">
      <h3 className="column-title">{STATUSES[status]}</h3>
      <div className="column-content">
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Buscar tarefas do backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`)
      const tasksData = await response.json()
      setTasks(tasksData)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    }
  }

  // Adicionar nova tarefa
  const addTask = async (taskText) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task: taskText, status: 'todo' })
      })

      if (response.ok) {
        console.log('Tarefa adicionada com sucesso.')
        fetchTasks()
      } else {
        console.error('Erro ao adicionar tarefa.')
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  // Excluir tarefa
  const deleteTask = async (taskId) => {
    console.log('Tentando deletar tarefa:', taskId)
    console.log('API URL:', `${API_BASE_URL}/tasks/${taskId}`)
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE'
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        console.log('Tarefa excluída com sucesso.')
        fetchTasks()
      } else {
        console.error('Erro ao excluir tarefa. Status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  // Atualizar status da tarefa
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t._id === taskId)
      if (!task) return

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          task: task.task, 
          status: newStatus 
        })
      })

      if (response.ok) {
        console.log('Status da tarefa atualizado com sucesso.')
        fetchTasks()
      } else {
        console.error('Erro ao atualizar status da tarefa.')
      }
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error)
    }
  }

  // Manipular envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    const taskText = newTask.trim()

    if (taskText !== '') {
      await addTask(taskText)
      setNewTask('')
    }
  }

  // Manipular drag and drop
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    console.log('Drag end:', { active: active.id, over: over?.id })

    if (!over) {
      console.log('No drop target')
      return
    }

    const activeTask = tasks.find(task => task._id === active.id)
    if (!activeTask) {
      console.log('Active task not found')
      return
    }

    console.log('Active task:', activeTask)

    // Determinar o novo status baseado na coluna de destino
    let newStatus = activeTask.status
    
    // Se o over é uma tarefa, usar o status dessa tarefa
    const overTask = tasks.find(task => task._id === over.id)
    if (overTask) {
      newStatus = overTask.status
      console.log('Dropped on task:', overTask)
    } else if (over.id === 'todo' || over.id === 'doing' || over.id === 'done') {
      // Se o over é uma coluna diretamente
      newStatus = over.id
      console.log('Dropped on column:', over.id)
    } else {
      console.log('Unknown drop target:', over.id)
    }

    console.log(`Status change: ${activeTask.status} -> ${newStatus}`)

    if (newStatus !== activeTask.status) {
      console.log(`Moving task from ${activeTask.status} to ${newStatus}`)
      updateTaskStatus(active.id, newStatus)
    } else {
      console.log('No status change needed')
    }
  }

  // Carregar tarefas ao montar o componente
  useEffect(() => {
    fetchTasks()
  }, [])

  // Organizar tarefas por status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    doing: tasks.filter(task => task.status === 'doing'),
    done: tasks.filter(task => task.status === 'done')
  }

  return (
    <div className="app">
      <h1 className="app-title">Kanban Task Board</h1>
      
      <div className="add-task-section">
        <form onSubmit={handleSubmit} className="add-task-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="task-input"
          />
          <button type="submit" className="add-btn">
            + Add
          </button>
        </form>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <DroppableColumn
              key={status}
              status={status}
              tasks={statusTasks}
              onDelete={deleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="task-card dragging">
              <span className="task-text">
                {tasks.find(task => task._id === activeId)?.task}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default App