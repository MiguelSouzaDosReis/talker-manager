const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

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

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
