/** @format */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "items.json");
const AUTH_TOKEN = "meu-token-super-seguro";

app.use(express.json());

function readData() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== AUTH_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
});

app.post("/auth", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    return res.json({ token: AUTH_TOKEN });
  }

  return res.status(400).json({ error: "Usuário ou senha não informados" });
});

app.get("/items", (req, res) => {
  const items = readData();
  res.json(items);
});

app.post("/items", (req, res) => {
  const items = readData();
  const newItem = { id: Date.now(), ...req.body };
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

app.put("/items/:id", (req, res) => {
  const items = readData();
  const id = parseInt(req.params.id);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Item não encontrado" });
  }

  items[index] = { id, ...req.body };
  writeData(items);
  res.json(items[index]);
});

app.delete("/items/:id", (req, res) => {
  const items = readData();
  const id = parseInt(req.params.id);
  const newItems = items.filter((item) => item.id !== id);

  if (newItems.length === items.length) {
    return res.status(404).json({ error: "Item não encontrado" });
  }

  writeData(newItems);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
