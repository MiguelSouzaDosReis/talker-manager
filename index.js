const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

function erroHandle(err, _req, res, _next) {
  if (err.code && err.status) {
    return res.status(err.status).json({ message: err.message, code: err.code });
  }

  return res.status(500).json({ message: err.message });
}

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// no requisito 1, utilizei o repositorio do ANTONIO CAMPOS como base para o meu app.get('/talker')
// https://github.com/tryber/sd-015-b-project-talker-manager/pull/115/commits/a02dbab4f11f432056647186534645948e5fc87e
app.get('/talker', (_req, res) => {
  fs.readFile('talker.json').then((data) => {
    if (data.length > 0) { return res.status(200).json(JSON.parse(data)); }
    return res.status(200).json([]);
  });
});

app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  fs.readFile('talker.json').then((data) => {
    const talker = JSON.parse(data);
    const FindId = talker.find((element) => element.id === parseFloat(id));
    if (!FindId) { return res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); }
  res.status(200).json(FindId);
  });
});

function verifiedEmail(req, res, next) {
  const { email } = req.body;
  if (!email) { return res.status(400).json({ message: 'O campo "email" é obrigatório' }); }
  const validEmail = email.match(/\S+@\S+\.\S+/);
  if (!validEmail) { 
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  next();
}

function verifiedPassword(req, res, next) {
  const { password } = req.body;
  if (!password) { return res.status(400).json({ message: 'O campo "password" é obrigatório' }); }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' }); 
  }
  next();
}

app.post('/login', verifiedEmail, verifiedPassword, (_req, res) => {
  let token = Array.from({ length: 16 });
  token = token.map((_e) => String.fromCharCode(64 + Math.random() * 23));
  res.status(200).json({ token: token.join('') });
});

app.use(erroHandle);
function verifiedToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Token não encontrado' });
  if (token.length < 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
}

function verifiedName(req, res, next) {
  const { name } = req.body;
  if (!name) { return res.status(400).json({ message: 'O campo "name" é obrigatório' }); }
   if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
}

function verifiedAge(req, res, next) {
  const { age } = req.body;
  if (!age) { return res.status(400).json({ message: 'O campo "age" é obrigatório' }); }
  if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
}

function verifiedTalk(req, res, next) {
  const { talk } = req.body;
  if (!talk) { 
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' }); 
    }
    const { watchedAt, rate } = talk;
  if (!watchedAt || rate === undefined) { 
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' }); 
    }
   const validData = watchedAt.match(/^\d{2}\/\d{2}\/\d{4}$/);
   if (!validData) { 
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
   }
  next();
}

function Rate(req, res, next) {
  const { rate } = req.body.talk;
  if (rate < 1 || rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
}

// no requisito 4, utilizei o repositorio do Andre Luiz como base para o meu app.post('/talker')
// https://github.com/tryber/sd-015-b-project-talker-manager/pull/102/commits/8aecd3e6e26d0a93f5d13a326607818125bfa88a

app.post('/talker', 
verifiedToken, verifiedName, verifiedAge, verifiedTalk, Rate, async (req, res) => {
  const { name, age, talk } = req.body;
  const file = await fs.readFile('talker.json');
  const JsonParse = JSON.parse(file);
  const lastId = JsonParse.sort((a, b) => b.id - a.id)[0].id;
  const obj = {
    name,
    age,
    id: (lastId + 1),
    talk,
  };
  
  JsonParse.push(obj);
  fs.writeFile('talker.json', JSON.stringify(JsonParse));
  res.status(201).json(obj);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
