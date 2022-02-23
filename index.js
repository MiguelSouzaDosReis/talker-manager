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

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
