const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userExists = users.find(user => user.username === username);
  if(userExists) {
    request.headers.username = username;
    next();
  } else {
    return response.status(404).json({error: "This user doesnt exists!"});
  }
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userAlreadyExists = users.find(user => user.username === username);
  if(userAlreadyExists) {
    return response.status(400).json({error: "This user already exists!"});
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({error: "This user doesnt exists!"});
  }

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {title, deadline} = request.body;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({error: "This user doesnt exists!"});
  }

  if(title && deadline) {
    const newToDo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }
    user.todos.push(newToDo);

    return response.status(201).json(newToDo);
  } else {
    return response.status(400).json({error: "Title and deadline are required!"});
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {title, deadline} = request.body;
  const {id} = request.params;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({error: "This user doesnt exists!"});
  }
  const userToDo = user.todos.find(todo => todo.id === id);
  if(!userToDo) {
    return response.status(404).json({error: "This todo doesnt exists!"});
  } 
  if(title) {
    userToDo.title = title;
  }
  if(deadline) {
    userToDo.deadline = new Date(deadline);
  }

  return response.status(200).json(userToDo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({error: "This user doesnt exists!"});
  }
  const userToDo = user.todos.find(todo => todo.id === id);
  if(!userToDo) {
    return response.status(404).json({error: "This todo doesnt exists!"});
  }
  userToDo.done = true;

  return response.status(200).json(userToDo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({error: "This user doesnt exists!"});
  }
  const userToDo = user.todos.find(todo => todo.id === id);
  if(!userToDo) {
    return response.status(404).json({error: "This todo doesnt exists!"});
  }
  user.todos.splice(userToDo, 1);

  return response.status(204).send();
});

module.exports = app;