import React, { useState } from 'react';
import { UserCreate } from '../types/user';
import { api } from '../services/api';

interface UserFormProps {
  onUserCreated: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.createUser(formData);
      setSuccess(true);
      setFormData({ name: '', phone: '', address: '' });
      onUserCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании волонтера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form">
      <h2>Добавить волонтера</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Имя:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Телефон:</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Адрес (с номером дома):</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Например: Москва, Красная площадь, 1"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать волонтера'}
        </button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">Волонтер успешно создан!</div>}
      </form>
    </div>
  );
};

