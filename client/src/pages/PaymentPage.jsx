import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Переданные данные со страницы схемы зала
    const { seance, date, selectedSeats } = location.state || {};

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Если пользователь перешел на страницу напрямую без выбора мест — возврат на главную
    if (!seance || !selectedSeats || selectedSeats.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Данные бронирования отсутствуют.</p>
                <button onClick={() => navigate('/')} className="conf-step__button conf-step__button-accent">На главную</button>
            </div>
        );
    }

    const { movie, hall } = seance;

    // Расчет итоговой стоимости на основе типа выбранных кресел
    const totalCost = selectedSeats.reduce((sum, chair) => {
        const price = chair.type === 'vip' ? hall.price_vip : hall.price_standard;
        return sum + price;
    }, 0);

    // Форматирование вывода мест (превращаем в читаемый вид "Ряд X Место Y, ...")
    const formattedChairs = selectedSeats
        .map(s => `Ряд ${s.row + 1} (Место ${s.seat + 1})`)
        .join(', ');

    // Отправка транзакции покупки билетов на бэкенд Laravel
    const handlePaymentSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:8000/api/client/booking', {
                seance_id: seance.id,
                date: date,
                seats: selectedSeats.map(s => ({ row: s.row, seat: s.seat }))
            });

            // После успешной записи в MySQL, переход на страницу электронного билета / передача данных бронирования дальше
            navigate('/ticket-code', {
                state: {
                    seance,
                    date,
                    chairsText: formattedChairs,
                    totalCost
                }
            });
        } catch (err) {
            console.error('Ошибка бронирования:', err);
            alert(err.response?.data?.message || 'Произошла ошибка при бронировании билетов. Попробуйте снова.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main>
            <section className="ticket">
                <header className="tichet__check">
                    <h2 className="ticket__check-title">Вы выбрали билеты:</h2>
                </header>

                <div className="ticket__info-wrapper">
                    <p className="ticket__info">На фильм: <span className="ticket__details ticket__title">{movie.title}</span></p>
                    <p className="ticket__info">Места: <span className="ticket__details ticket__chairs">{formattedChairs}</span></p>
                    <p className="ticket__info">В зале: <span className="ticket__details ticket__hall">{hall.name}</span></p>
                    <p className="ticket__info">Начало сеанса: <span className="ticket__details ticket__start">{seance.start_time.substring(0, 5)}</span></p>
                    <p className="ticket__info">Стоимость: <span className="ticket__details ticket__cost">{totalCost}</span> рублей</p>

                    <button
                        className="acceptin-button"
                        onClick={handlePaymentSubmit}
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        {isSubmitting ? 'Оформление...' : 'Получить код бронирования'}
                    </button>

                    <p className="ticket__hint">После оплаты билет будет доступен в этом окне, а также придёт вам на почту. Покажите QR-код нашему контроллёру у входа в зал.</p>
                    <p className="ticket__hint">Приятного просмотра!</p>
                </div>
            </section>
        </main>
    );
}