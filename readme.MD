# App Tasks - Frontend e Backend Separados

Este projeto foi refatorado para usar uma arquitetura de microserviços com frontend e backend em containers separados.

## Estrutura do Projeto

```
app-tasks/
├── frontend/           # Container do Frontend (Nginx)
│   ├── Dockerfile
│   └── public/
│       ├── index.html
│       └── styles.css
├── backend/            # Container do Backend (Node.js)
│   ├── Dockerfile
│   ├── app.js
│   └── package.json
├── docker-compose.yml
└── readme.MD
```

## Serviços

### Frontend (Porta 3000)
- **Tecnologia**: Nginx servindo arquivos estáticos
- **Porta**: 3000 (mapeada para 80 do container)
- **Arquivos**: HTML, CSS e JavaScript

### Backend (Porta 3001)
- **Tecnologia**: Node.js + Express
- **Porta**: 3001
- **Funcionalidades**: API REST para gerenciar tarefas
- **Endpoints**:
  - `GET /tasks` - Listar todas as tarefas
  - `POST /tasks` - Criar nova tarefa
  - `POST /tasks/:id/status` - Atualizar status da tarefa
  - `DELETE /tasks/:id` - Excluir tarefa

### MongoDB (Porta 27017)
- **Tecnologia**: MongoDB
- **Porta**: 27017
- **Persistência**: Volume Docker para dados

## Como Executar

1. **Subir todos os serviços**:
   ```bash
   docker-compose up --build
   ```

2. **Acessar a aplicação**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MongoDB: localhost:27017

3. **Parar os serviços**:
   ```bash
   docker-compose down
   ```

## Vantagens da Separação

- **Escalabilidade**: Cada serviço pode ser escalado independentemente
- **Manutenção**: Mudanças no frontend não afetam o backend e vice-versa
- **Tecnologias**: Cada serviço pode usar a tecnologia mais adequada
- **Deploy**: Possibilidade de fazer deploy separado de cada serviço
- **Desenvolvimento**: Equipes podem trabalhar independentemente

## Comunicação

O frontend se comunica com o backend através de requisições HTTP para `http://localhost:3001`. O CORS está configurado no backend para permitir requisições do frontend.

## Requisitos

Certifique-se de ter o Docker e Docker Compose instalados em sua máquina antes de prosseguir.

## Como Usar

1. Após iniciar o aplicativo com Docker Compose, abra o navegador e acesse http://localhost:3000 para usar o aplicativo de lista de tarefas.

2. Você verá a lista de tarefas disponíveis. Use os botões para atualizar o status de uma tarefa, excluí-la ou adicionar uma nova tarefa.

3. Aproveite o aplicativo para gerenciar suas tarefas!