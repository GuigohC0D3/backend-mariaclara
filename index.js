// Carrega variáveis de ambiente
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// CORS: Libera só o domínio do Vercel
app.use(
  cors({
    origin: process.env.ALLOWED_HOSTS,
  })
);

app.use(express.json());

// Conexão com PostgreSQL usando variáveis do Render
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

// GET - lista avaliações paginadas
app.get("/avaliacoes", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const offset = (page - 1) * limit;

  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT id, nome, mensagem, data FROM avaliacoes ORDER BY data DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar avaliações:", err);
    res.status(500).send("Erro ao buscar avaliações.");
  } finally {
    client.release();
  }
});

// POST - salva nova avaliação
app.post("/avaliacoes", async (req, res) => {
  const { nome, mensagem } = req.body;

  if (!nome || !mensagem) {
    return res.status(400).send("Campos obrigatórios.");
  }

  const client = await pool.connect();

  try {
    await client.query(
      "INSERT INTO avaliacoes (nome, mensagem) VALUES ($1, $2)",
      [nome, mensagem]
    );
    res.status(201).send("Avaliação salva com sucesso!");
  } catch (err) {
    console.error("Erro ao salvar avaliação:", err);
    res.status(500).send("Erro ao salvar avaliação.");
  } finally {
    client.release();
  }
});

// Inicia o servidor (para Render funcionar, usa 0.0.0.0)
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
});
