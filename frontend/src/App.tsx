import React, { useState, useEffect } from 'react';
import { UserForm } from './components/UserForm';
import { SearchForm } from './components/SearchForm';
import { MapComponent } from './components/Map';
import { api } from './services/api';
import { User } from './types/user';
import './App.css';

function App() {
  const [allUsers, setAllUsers] = useState<User[]>([]); // Все волонтеры
  const [foundUsers, setFoundUsers] = useState<Set<number>>(new Set()); // ID найденных волонтеров
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>();
  const [searchRadius, setSearchRadius] = useState<number | undefined>();

  const loadAllUsers = async () => {
    try {
      const users = await api.getAllUsers();
      setAllUsers(users);
      setFoundUsers(new Set()); // Сбрасываем найденных при загрузке всех
      setSearchCenter(undefined);
      setSearchRadius(undefined);
    } catch (error) {
      console.error('Ошибка загрузки волонтеров:', error);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const handleUserCreated = () => {
    loadAllUsers();
  };

  const handleSearchResults = (searchUsers: User[]) => {
    // Сохраняем ID найденных волонтеров
    const foundIds = new Set(searchUsers.map(u => u.id).filter((id): id is number => id !== undefined));
    setFoundUsers(foundIds);
  };

  const handleSearchParamsChange = (center?: [number, number], radius?: number) => {
    setSearchCenter(center);
    setSearchRadius(radius);
  };

  const handleClearSearch = () => {
    setFoundUsers(new Set());
    setSearchCenter(undefined);
    setSearchRadius(undefined);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗺️ Поиск волонтеров на карте</h1>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <UserForm onUserCreated={handleUserCreated} />
          <SearchForm 
            onSearchResults={handleSearchResults}
            onSearchParamsChange={handleSearchParamsChange}
            onClearSearch={handleClearSearch}
            hasActiveSearch={foundUsers.size > 0}
          />
        </div>
        
        <div className="map-wrapper">
          <MapComponent 
            users={allUsers} 
            foundUserIds={foundUsers}
            center={searchCenter} 
            radius={searchRadius} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;

