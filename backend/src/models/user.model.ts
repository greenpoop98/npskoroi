import { pool } from '../config/database';
import { User, UserCreate } from '../types/user';
import { geocodeAddress } from '../services/geocoder';

export class UserModel {
  // Создание пользователя
  static async create(userData: UserCreate): Promise<User> {
    try {
      // Геокодируем адрес
      console.log('🗺️  Начинаю геокодинг адреса:', userData.address);
      const coordinates = await geocodeAddress(userData.address);
      
      if (!coordinates) {
        throw new Error('Не удалось определить координаты для адреса. Проверьте правильность адреса.');
      }

      console.log('💾 Вставляю пользователя в БД с координатами:', coordinates);
      const query = `
        INSERT INTO users (name, phone, address, location)
        VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
        RETURNING id, name, phone, address, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude, created_at
      `;

      const result = await pool.query(query, [
        userData.name,
        userData.phone,
        userData.address,
        coordinates.lon,
        coordinates.lat,
      ]);

      console.log('✅ Пользователь успешно создан в БД');
      return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        phone: result.rows[0].phone,
        address: result.rows[0].address,
        latitude: parseFloat(result.rows[0].latitude),
        longitude: parseFloat(result.rows[0].longitude),
        created_at: result.rows[0].created_at,
      };
    } catch (error: any) {
      console.error('❌ Ошибка в UserModel.create:');
      console.error('Сообщение:', error.message);
      console.error('Стек:', error.stack);
      throw error;
    }
  }

  // Поиск пользователей в радиусе
  static async searchInRadius(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<User[]> {
    const query = `
      SELECT 
        id,
        name,
        phone,
        address,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        created_at,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance
      FROM users
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
      ORDER BY distance
    `;

    const result = await pool.query(query, [longitude, latitude, radius]);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      address: row.address,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      created_at: row.created_at,
      distance: parseFloat(row.distance),
    }));
  }

  // Получить всех пользователей
  static async getAll(): Promise<User[]> {
    const query = `
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
    `;

    const result = await pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      address: row.address,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      created_at: row.created_at,
    }));
  }
}

