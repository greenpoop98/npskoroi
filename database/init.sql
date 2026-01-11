-- Создание базы данных (выполнить вручную, если еще не создана)
-- CREATE DATABASE user_map_db;

-- Подключение к базе данных
-- \c user_map_db;

-- Включение расширения PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по геолокации
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);

-- Создание индекса для поиска по адресу
CREATE INDEX IF NOT EXISTS idx_users_address ON users (address);

-- Пример данных (опционально, можно раскомментировать для тестирования)
-- ВАЖНО: ST_MakePoint принимает координаты в порядке (долгота, широта), т.е. (lon, lat)
-- INSERT INTO users (name, phone, address, location)
-- VALUES 
--     ('Иван Иванов', '+7 999 123-45-67', 'Москва, Красная площадь, 1', ST_SetSRID(ST_MakePoint(37.6173, 55.7558), 4326)::geography),
--     ('Мария Петрова', '+7 999 234-56-78', 'Санкт-Петербург, Невский проспект, 28', ST_SetSRID(ST_MakePoint(30.3159, 59.9343), 4326)::geography),
--     ('Петр Сидоров', '+7 999 345-67-89', 'Казань, Кремлевская улица, 2', ST_SetSRID(ST_MakePoint(49.1056, 55.7986), 4326)::geography);

