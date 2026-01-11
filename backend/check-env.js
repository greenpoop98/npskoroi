// Скрипт для проверки загрузки .env
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

console.log('🔍 Проверка переменных окружения:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? `"${process.env.DB_PASSWORD}" (тип: ${typeof process.env.DB_PASSWORD})` : '❌ НЕ НАЙДЕН!');
console.log('GEOCODER_PROVIDER:', process.env.GEOCODER_PROVIDER);

if (!process.env.DB_PASSWORD) {
  console.error('\n❌ ПРОБЛЕМА: DB_PASSWORD не загружен!');
  console.error('Проверьте файл .env в папке backend');
} else if (process.env.DB_PASSWORD.trim() === '') {
  console.error('\n❌ ПРОБЛЕМА: DB_PASSWORD пустой!');
  console.error('Укажите пароль в файле .env');
} else {
  console.log('\n✅ Пароль загружен успешно!');
}

