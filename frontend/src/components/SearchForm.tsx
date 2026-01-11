import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types/user';

interface SearchFormProps {
  onSearchResults: (users: User[]) => void;
  onSearchParamsChange: (center?: [number, number], radius?: number) => void;
  onClearSearch: () => void;
  hasActiveSearch: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearchResults, onSearchParamsChange, onClearSearch, hasActiveSearch }) => {
  const [searchType, setSearchType] = useState<'coordinates' | 'address'>('address');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('🔍 Начало поиска:', { searchType, address, latitude, longitude, radius });

    try {
      if (searchType === 'address') {
        if (!address || address.trim() === '') {
          setError('Введите адрес');
          setLoading(false);
          return;
        }
        console.log('🔍 Поиск по адресу:', address);
        // При поиске по адресу передаем только address, координаты будут 0,0 (не используются)
        const result = await api.searchUsers(0, 0, parseFloat(radius), address);
        console.log('✅ Найдено волонтеров:', result.users.length);
        console.log('📍 Результаты:', result.users);
        console.log('📍 Центр поиска:', result.searchCenter);
        onSearchResults(result.users);
        // Используем координаты центра поиска (адреса), а не первого найденного волонтера
        onSearchParamsChange([result.searchCenter.latitude, result.searchCenter.longitude], parseFloat(radius));
      } else {
        if (!latitude || !longitude) {
          setError('Введите координаты');
          setLoading(false);
          return;
        }
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        console.log('🔍 Поиск по координатам:', { lat, lon, radius });
        const result = await api.searchUsers(lat, lon, parseFloat(radius));
        console.log('✅ Найдено волонтеров:', result.users.length);
        console.log('📍 Результаты:', result.users);
        onSearchResults(result.users);
        // Используем координаты центра поиска
        onSearchParamsChange([result.searchCenter.latitude, result.searchCenter.longitude], parseFloat(radius));
      }
    } catch (err: any) {
      console.error('❌ Ошибка поиска:', err);
      console.error('Детали ошибки:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-form">
      <h2>Поиск волонтеров</h2>
      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label>Тип поиска:</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'coordinates' | 'address')}
          >
            <option value="address">По адресу</option>
            <option value="coordinates">По координатам</option>
          </select>
        </div>

        {searchType === 'address' ? (
          <div className="form-group">
            <label>Адрес:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Например: Москва, Красная площадь, 1"
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Широта (latitude):</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="55.7558"
              />
            </div>
            <div className="form-group">
              <label>Долгота (longitude):</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="37.6173"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Радиус поиска (метры):</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            min="100"
            step="100"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Поиск...' : 'Найти волонтеров'}
          </button>
          {hasActiveSearch && (
            <button 
              type="button" 
              onClick={onClearSearch}
              style={{ 
                background: '#95a5a6',
                padding: '0.875rem 1rem',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Сбросить
            </button>
          )}
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

