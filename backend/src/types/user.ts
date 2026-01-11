export interface User {
  id?: number;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: Date;
}

export interface UserCreate {
  name: string;
  phone: string;
  address: string;
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number; // в метрах
  address?: string;
}

