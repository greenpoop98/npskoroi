import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { geocodeAddress } from '../services/geocoder';
import { SearchParams } from '../types/user';

export class UserController {
  // Создать пользователя
  static async create(req: Request, res: Response) {
    try {
      const { name, phone, address } = req.body;

      console.log('📝 Создание пользователя:', { name, phone, address });

      if (!name || !phone || !address) {
        return res.status(400).json({ error: 'Все поля обязательны' });
      }

      const user = await UserModel.create({ name, phone, address });
      console.log('✅ Пользователь создан:', user.id);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('❌ Ошибка создания пользователя:');
      console.error('Сообщение:', error.message);
      console.error('Стек:', error.stack);
      console.error('Полная ошибка:', error);
      res.status(500).json({ 
        error: error.message || 'Ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Поиск в радиусе
  static async search(req: Request, res: Response) {
    try {
      let { latitude, longitude, radius, address } = req.query;

      console.log('🔍 Запрос поиска:', { latitude, longitude, radius, address });

      // Если передан адрес, геокодируем его
      if (address && (!latitude || latitude === '0' || !longitude || longitude === '0')) {
        console.log('🗺️  Геокодинг адреса для поиска:', address);
        const coordinates = await geocodeAddress(address as string);
        if (!coordinates) {
          console.error('❌ Не удалось геокодировать адрес:', address);
          return res.status(400).json({ error: 'Не удалось найти адрес. Проверьте правильность адреса.' });
        }
        latitude = coordinates.lat.toString();
        longitude = coordinates.lon.toString();
        console.log('✅ Адрес геокодирован:', { lat: latitude, lon: longitude });
      }

      if (!latitude || !longitude || !radius) {
        console.error('❌ Недостаточно параметров для поиска');
        return res.status(400).json({ 
          error: 'Необходимо указать latitude, longitude и radius (или address)' 
        });
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      console.log('🔍 Поиск пользователей в радиусе:', { lat, lon, radius: rad });

      const users = await UserModel.searchInRadius(lat, lon, rad);

      console.log('✅ Найдено пользователей:', users.length);
      // Возвращаем результаты поиска вместе с координатами центра поиска
      res.json({
        users,
        searchCenter: {
          latitude: lat,
          longitude: lon
        }
      });
    } catch (error: any) {
      console.error('❌ Ошибка поиска:');
      console.error('Сообщение:', error.message);
      console.error('Стек:', error.stack);
      res.status(500).json({ error: error.message || 'Ошибка сервера' });
    }
  }

  // Получить всех пользователей
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (error: any) {
      console.error('Ошибка получения пользователей:', error);
      res.status(500).json({ error: error.message || 'Ошибка сервера' });
    }
  }
}

