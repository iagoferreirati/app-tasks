# Lista de Tarefas Web App

Este é um aplicativo web de lista de tarefas que permite aos usuários adicionar, atualizar e excluir tarefas. O aplicativo foi desenvolvido usando Node.js, Express e MongoDB.

# Endpoints da API
A API do aplicativo oferece os seguintes endpoints:

- **GET /tasks**: Retorna a lista de tarefas existentes.
- **POST /tasks**: Adiciona uma nova tarefa à lista.
- **POST /tasks/:id/status**: Atualiza o status de uma tarefa.
- **DELETE /tasks/:id**: Exclui uma tarefa da lista.


## Requisitos

Certifique-se de ter o Docker instalado em sua máquina antes de prosseguir.


## Executando o Aplicativo com Docker

1. Clone este repositório:

```bash
# Clone o repositório
git clone https://github.com/iagoferreirati/app-tasks.git

# Navegue até o diretório do projeto
cd lista-de-tarefas

# Crie um arquivo .env e defina as variáveis de ambiente
echo "MONGODB_HOST=mongodb" > .env

# Construa a imagem Docker para o aplicativo
docker build -t lista-de-tarefas-app .

# Inicie o aplicativo e o banco de dados MongoDB com Docker Compose
docker-compose up

## Como Usar

1. Após iniciar o aplicativo com Docker Compose, abra o navegador e acesse http://localhost:3000 para usar o aplicativo de lista de tarefas.

2. Você verá a lista de tarefas disponíveis. Use os botões para atualizar o status de uma tarefa, excluí-la ou adicionar uma nova tarefa.

3. Aproveite o aplicativo para gerenciar suas tarefas!
