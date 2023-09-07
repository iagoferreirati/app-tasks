const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const port = 3000;

const app = express();

// Conectar ao MongoDB
const mongodbHost = process.env.MONGODB_HOST || 'localhost';
const mongodbPort = process.env.MONGODB_PORT || 27017;
const mongodbDatabase = process.env.MONGODB_DATABASE || 'taskApp';

const apm = require('elastic-apm-node').start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'app-task',

  // Use if APM Server requires a token
  secretToken: '',

  // Use if APM Server uses API keys for authentication
  apiKey: '',

  // Set custom APM Server URL (default: http://127.0.0.1:8200)
  serverUrl: 'apm-apm-http.elasticsearch.svc.cluster.local',
})

mongoose.connect(`mongodb://${mongodbHost}:${mongodbPort}/${mongodbDatabase}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erro na conexão com o MongoDB:'));
db.once('open', () => {
  console.log('Conectado ao MongoDB');
});

// Definir o esquema da tarefa
const taskSchema = new mongoose.Schema({
  task: String,
  status: Boolean, // Coluna "status"
});

const Task = mongoose.model('Task', taskSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


async function toggleTaskStatus(taskId, currentStatus) {
  const newStatus = !currentStatus; // Inverte o status
  const response = await fetch(`/tasks/${taskId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });

  if (response.ok) {
    console.log('Status da tarefa atualizado com sucesso.');
    fetchTasks();
  } else {
    console.error('Erro ao atualizar status da tarefa.');
  }
}


app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefas' });
  }
});

app.get('/tasks/:id/status', async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    res.json({ completed: task.completed }); // Retorna apenas o status
  } catch (error) {
    console.error('Erro ao consultar status da tarefa:', error);
    res.status(500).json({ message: 'Erro ao consultar status da tarefa' });
  }
});

app.post('/tasks', async (req, res) => {
  const task = new Task({ task: req.body.task });
  try {
    await task.save();
    res.status(201).json({ message: 'Tarefa adicionada com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    res.status(500).json({ message: 'Erro ao adicionar tarefa' });
  }
});

app.post('/tasks/:id/status', async (req, res) => {
  const taskId = req.params.id;
  const newStatus = req.body.status;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    task.status = newStatus; // Atualiza o status da tarefa
    await task.save();

    res.json({ message: 'Status da tarefa atualizado com sucesso', task });
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar status da tarefa' });
  }
});



// Rota para atualizar o status de uma tarefa
app.put('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    const completed = req.body.completed;
  
    try {
      const task = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });
      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
      res.json({ message: 'Status da tarefa atualizado com sucesso', task });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      res.status(500).json({ message: 'Erro ao atualizar status da tarefa' });
    }
  });

  app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
  
    try {
      const task = await Task.findByIdAndDelete(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
      res.json({ message: 'Tarefa excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      res.status(500).json({ message: 'Erro ao excluir tarefa' });
    }
  });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
