import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Определяем пути к возможным .env файлам
const envPath = path.resolve(process.cwd(), '.env');
const exemplEnvPath = path.resolve(process.cwd(), 'exempl.env');

// Пробуем загрузить .env или exempl.env
let result;
if (fs.existsSync(envPath)) {
  result = dotenv.config({ path: envPath });
  console.log('✅ Загружен файл .env');
} else if (fs.existsSync(exemplEnvPath)) {
  result = dotenv.config({ path: exemplEnvPath });
  console.log('✅ Загружен файл exempl.env');
} else {
  // Пробуем загрузить без явного пути (из текущей директории)
  result = dotenv.config();
  console.warn('⚠️  Используется стандартный поиск .env файла');
}

if (result.error) {
  console.warn('⚠️  Не удалось загрузить .env файл:', result.error.message);
}

// Проверка загрузки переменных окружения
const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword || dbPassword.trim() === '') {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: DB_PASSWORD не найден или пустой!');
  console.error('Проверьте файл .env в папке backend');
  console.error('Текущий рабочий каталог:', process.cwd());
  console.error('Ожидаемый путь к .env:', envPath);
  console.error('Переменные окружения:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: dbPassword ? '***установлен***' : 'НЕ НАЙДЕН',
  });
}

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'user_map_db',
  user: process.env.DB_USER || 'postgres',
  password: dbPassword || '',
});

// Проверка подключения
pool.on('connect', () => {
  console.log('✅ Подключение к базе данных установлено');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка подключения к базе данных:', err);
});

