import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: "*", // endereço padrão do Vite
  }),
);
app.use(express.json());

// Rotas
app.use("/api/tasks", taskRoutes);

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API Mini Kanban rodando!" });
});

// Inicia servidor após conectar ao banco
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});
