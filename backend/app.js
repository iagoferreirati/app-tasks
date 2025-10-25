const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const port = 3001;

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
  status: { 
    type: String, 
    enum: ['todo', 'doing', 'done'], 
    default: 'todo' 
  }
});

const Task = mongoose.model('Task', taskSchema);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefas' });
  }
});


app.post('/tasks', async (req, res) => {
  const task = new Task({ 
    task: req.body.task,
    status: req.body.status || 'todo'
  });
  try {
    await task.save();
    res.status(201).json({ message: 'Tarefa adicionada com sucesso', task });
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    res.status(500).json({ message: 'Erro ao adicionar tarefa' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  const { task, status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId, 
      { task, status }, 
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    res.json({ message: 'Tarefa atualizada com sucesso', task: updatedTask });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
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
