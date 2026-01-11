import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

const envPath = path.resolve(__dirname, '..', '.env');
const exemplEnvPath = path.resolve(__dirname, '..', 'exempl.env');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Загружен .env');
} else if (fs.existsSync(exemplEnvPath)) {
  require('dotenv').config({ path: exemplEnvPath });
  console.log('✅ Загружен exempl.env');
} else {
  require('dotenv').config();
  console.log('⚠️ Используется поиск .env по умолчанию');
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'user_map_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function run() {
  try {
    console.log('⏳ Выполняю SELECT * FROM users...');
    const result = await pool.query(`
      SELECT 
        id,
        name,
        phone,
        address,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    console.log('✅ Успешно! Количество записей:', result.rowCount);
    console.log(result.rows);
  } catch (error) {
    console.error('❌ Ошибка выполнения запроса:');
    console.error(error);
  } finally {
    await pool.end();
  }
}

run();

