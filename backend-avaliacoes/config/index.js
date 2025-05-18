const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Permitir acesso do frontend pelo navegador
app.use(
  cors({
    origin: "*", // ⚠️ para testes. Em produção, use o IP específico ou domínio.
  })
);
app.use(express.json());

// Conexão com o banco PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1", // como o Node está no mesmo PC do banco, localhost está OK
  database: "postgres", // seu banco está com esse nome
  password: "admin", // sua senha
  port: 5432,
});

// Rota GET - listar avaliações
app.get("/avaliacoes", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      "SELECT * FROM avaliacoes ORDER BY data DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar avaliações:", err);
    res.status(500).send("Erro ao buscar avaliações.");
  }
});

// Rota POST - receber nova avaliação
app.post("/avaliacoes", async (req, res) => {
  const { nome, mensagem } = req.body;

  if (!nome || !mensagem) {
    return res.status(400).send("Campos obrigatórios.");
  }

  try {
    await pool.query(
      "INSERT INTO avaliacoes (nome, mensagem) VALUES ($1, $2)",
      [nome, mensagem]
    );
    res.status(201).send("Avaliação salva com sucesso!");
  } catch (err) {
    console.error("Erro ao salvar avaliação:", err); // 👈 exibe erro real no terminal
    res.status(500).send("Erro ao salvar avaliação.");
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servidor acessível em: http://192.168.1.140:${port}`);
});
