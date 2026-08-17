import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


export default function AdminLogin() {
    // Состояния для хранения данных формы и ошибок
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Отправка POST-запроса на бэкенд Laravel (REST API)
            const response = await api.post('/login', { email, password });

            if (response.data.token) {
                // Сохран. Bearer-токен в localStorage
                localStorage.setItem('admin_token', response.data.token);
                // Редирект на защищенную панель администратора
                navigate('/admin/dashboard');
            }
        } catch (err) {
            // Обрабатываем ошибку авторизации от API
            const errorMessage = err.response?.data?.message || 'Неверный логин или пароль.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Основной контент формы авторизации */}
            <main>
                <section className="login">
                    <header className="login__header">
                        <h2 className="login__title">Авторизация</h2>
                    </header>
                    <div className="login__wrapper">
                        <form className="login__form" onSubmit={handleLogin}>

                            {/* Вывод ошибки, если она вернулась от API */}
                            {error && (
                                <div style={{ color: '#ff4d4d', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>
                                    {error}
                                </div>
                            )}

                            <label className="login__label" htmlFor="email">
                                E-mail
                                <input
                                    className="login__input"
                                    type="email"
                                    placeholder="example@domain.xyz"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </label>

                            <label className="login__label" htmlFor="password">
                                Пароль
                                <input
                                    className="login__input"
                                    type="password"
                                    placeholder=""
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </label>

                            <div className="text-center">
                                <input
                                    value={isLoading ? "Вход..." : "Авторизоваться"}
                                    type="submit"
                                    className="login__button"
                                    disabled={isLoading}
                                />
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}