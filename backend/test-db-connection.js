// Простой скрипт для проверки подключения к БД
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Определяем пути к возможным .env файлам
const envPath = path.resolve(__dirname, '.env');
const exemplEnvPath = path.resolve(__dirname, 'exempl.env');

// Пробуем загрузить .env или exempl.env
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Загружен файл .env');
} else if (fs.existsSync(exemplEnvPath)) {
  require('dotenv').config({ path: exemplEnvPath });
  console.log('✅ Загружен файл exempl.env');
} else {
  require('dotenv').config();
  console.warn('⚠️  Используется стандартный поиск .env файла');
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'user_map_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function testConnection() {
  try {
    console.log('🔍 Проверка подключения к базе данных...');
    console.log('Параметры:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'user_map_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD ? '***установлен***' : '❌ НЕ УКАЗАН!',
    });
    
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.trim() === '') {
      console.error('\n❌ ОШИБКА: Пароль не указан в .env файле!');
      console.error('💡 Откройте файл .env в папке backend и укажите пароль:');
      console.error('   DB_PASSWORD=ваш_пароль_postgres');
      process.exit(1);
    }

    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Подключение успешно!');
    console.log('Текущее время БД:', result.rows[0].current_time);
    
    // Проверка PostGIS
    try {
      const postgisResult = await pool.query('SELECT PostGIS_version() as postgis_version');
      console.log('✅ PostGIS установлен! Версия:', postgisResult.rows[0].postgis_version);
    } catch (err) {
      console.log('❌ PostGIS не найден:', err.message);
    }

    // Проверка таблицы users
    try {
      const tableResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as table_exists
      `);
      
      if (tableResult.rows[0].table_exists) {
        console.log('✅ Таблица users существует!');
        
        const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log('📊 Количество пользователей в БД:', countResult.rows[0].count);
      } else {
        console.log('⚠️  Таблица users не найдена. Нужно выполнить init.sql');
      }
    } catch (err) {
      console.log('❌ Ошибка проверки таблицы:', err.message);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.error('\n💡 Проверьте:');
    console.error('1. PostgreSQL запущен');
    console.error('2. База данных user_map_db создана');
    console.error('3. Пароль в .env файле правильный');
    console.error('4. .env файл существует в папке backend');
    process.exit(1);
  }
}

testConnection();

