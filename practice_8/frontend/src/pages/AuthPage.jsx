import React, { useState } from 'react';
import { api } from '../api/index.js';
import './AuthPage.scss';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        await api.register(formData);
        setMode('login');
      } else {
        const data = await api.login({ email: formData.email, password: formData.password });
        onLogin(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Что-то пошло не так');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-card__title">
          {mode === 'login' ? 'Войти' : 'Регистрация'}
        </h2>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label className="auth-card__label">Имя</label>
              <input
                className="auth-card__input"
                name="first_name"
                type="text"
                placeholder="Имя"
                value={formData.first_name}
                onChange={handleChange}
              />
              <label className="auth-card__label">Фамилия</label>
              <input
                className="auth-card__input"
                name="last_name"
                type="text"
                placeholder="Фамилия"
                value={formData.last_name}
                onChange={handleChange}
              />
            </>
          )}

          <label className="auth-card__label">Email</label>
          <input
            className="auth-card__input"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <label className="auth-card__label">Пароль</label>
          <input
            className="auth-card__input"
            name="password"
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="auth-card__error">{error}</p>}

          <button className="auth-card__submit" type="submit">
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button
          className="auth-card__toggle"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}
