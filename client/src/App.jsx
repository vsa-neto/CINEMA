import React, { useState, useEffect } from 'react';
// 1. ИСПРАВЛЕНО: Добавлен Link в импорт
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import UserBooking from './pages/UserBooking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import HallPage from './pages/HallPage';
import PaymentPage from './pages/PaymentPage';
import TicketPage from './pages/TicketPage';

// Импортируем наш новый объединенный компонент
import LayoutHeader from './components/LayoutHeader';

// import './assets/main.css';
import './assets/css/normalize.css';
import './assets/css/styles.css';
import './assets/css/styles_client.css';


function App() {
    return (
        <Router>
            <LayoutHeader />
            <Routes>
                {/* Публичный роут для пользователей */}
                <Route path="/" element={<UserBooking />} />
                <Route path="/hall" element={<HallPage />} />
                <Route path="/payment" element={<PaymentPage />} />

                {/* Авторизация админа */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Защищенный роут админки */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/ticket-code" element={<TicketPage />} />
            </Routes>
        </Router>
    );
}

export default App;