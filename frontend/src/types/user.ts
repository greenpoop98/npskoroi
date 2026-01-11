export interface User {
  id?: number;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  distance?: number;
}

export interface UserCreate {
  name: string;
  phone: string;
  address: string;
}

