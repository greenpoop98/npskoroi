import axios from 'axios';
import { User, UserCreate } from '../types/user';

// Используем относительный путь, так как Vite проксирует /api на backend
const API_URL = '/api';

export const api = {
  // Создать волонтера
  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  },

  // Поиск волонтеров в радиусе
  searchUsers: async (
    latitude: number,
    longitude: number,
    radius: number,
    address?: string
  ): Promise<{ users: User[]; searchCenter: { latitude: number; longitude: number } }> => {
    const params: any = { latitude, longitude, radius };
    if (address) {
      params.address = address;
    }
    const response = await axios.get(`${API_URL}/users/search`, { params });
    return response.data;
  },

  // Получить всех волонтеров
  getAllUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },
};

