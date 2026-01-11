import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import userRoutes from './routes/user.routes';

// Определяем пути к возможным .env файлам
const envPath = path.resolve(process.cwd(), '.env');
const exemplEnvPath = path.resolve(process.cwd(), 'exempl.env');

// Пробуем загрузить .env или exempl.env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(exemplEnvPath)) {
  dotenv.config({ path: exemplEnvPath });
} else {
  // Пробуем загрузить без явного пути
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

