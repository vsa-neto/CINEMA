import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HallPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Извлечение параметров из URL строки (?seance_id=X&date=YYYY-MM-DD)
    const seanceId = searchParams.get('seance_id');
    const seanceDate = searchParams.get('date');

    const [seance, setSeance] = useState(null);
    const [takenSeats, setTakenSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Массив для хранения координат выбранных пользователем мест: [{row, seat}]
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        if (!seanceId || !seanceDate) return;

        const fetchSeanceDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/client/seances/${seanceId}/details`, {
                    params: { date: seanceDate }
                });
                setSeance(response.data.seance);
                setTakenSeats(response.data.taken_seats);
            } catch (err) {
                console.error('Ошибка при загрузке зала:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeanceDetails();
    }, [seanceId, seanceDate]);

    // Проверка, занято ли место кем-то другим в БД на эту дату
    const isSeatTaken = (rowIndex, seatIndex) => {
        return takenSeats.some(ticket => ticket.row_index === rowIndex && ticket.seat_index === seatIndex);
    };

    // Проверка, выделено ли место текущим пользователем прямо сейчас
    const isSeatSelected = (rowIndex, seatIndex) => {
        return selectedSeats.some(s => s.row === rowIndex && s.seat === seatIndex);
    };

    // Логика клика по креслу
    const handleChairClick = (rowIndex, seatIndex, chairType) => {
        // Если это проход (disabled) или место уже кем-то куплено (taken), клик игнорируется
        if (chairType === 'disabled' || isSeatTaken(rowIndex, seatIndex)) return;

        if (isSeatSelected(rowIndex, seatIndex)) {
            // Если место уже выбрано — убирать его из списка выбранных
            setSelectedSeats(selectedSeats.filter(s => !(s.row === rowIndex && s.seat === seatIndex)));
        } else {
            // Если свободно — добавить в массив выбранных
            setSelectedSeats([...selectedSeats, { row: rowIndex, seat: seatIndex, type: chairType }]);
        }
    };

    // Бронирование / оплата
    const handleBooking = () => {
        if (selectedSeats.length === 0) {
            alert('Пожалуйста, выберите хотя бы одно место для бронирования.');
            return;
        }

        // Передача параметров через state роутера
        navigate('/payment', {
            state: {
                seance,
                date: seanceDate,
                selectedSeats
            }
        });
    };

    if (loading) return <div className="info">Загрузка схемы зала...</div>;
    if (!seance) return <div className="info">Сеанс не найден.</div>;

    const { movie, hall } = seance;
    // Декодирование сетки зала из базы данных
    const layout = hall.layout || [];

    return (
        <main>
            <section className="buying">
                <div className="buying__info">
                    <div className="buying__info-description">
                        <h2 className="buying__info-title">{movie.title}</h2>
                        <p className="buying__info-start">Начало сеанса: {seance.start_time.substring(0, 5)}</p>
                        <p className="buying__info-hall">{hall.name}</p>
                    </div>
                    {/* <div className="buying__info-hint">
                        <p>Тапните дважды,<br />чтобы увеличить</p>
                    </div> */}
                </div>

                {/* Интерактивная схема зала */}
                <div className="buying-scheme">
                    <div className="buying-scheme__wrapper">
                        {layout.map((row, rowIndex) => (
                            <div className="buying-scheme__row" key={rowIndex}>
                                {row.map((chairType, seatIndex) => {
                                    // Рассчит. итоговый CSS класс для каждого кресла
                                    let modifierClass = chairType; 

                                    if (chairType !== 'disabled') {
                                        if (isSeatTaken(rowIndex, seatIndex)) {
                                            modifierClass = 'taken';
                                        } else if (isSeatSelected(rowIndex, seatIndex)) {
                                            modifierClass = 'selected';
                                        }
                                    }

                                    return (
                                        <span
                                            key={seatIndex}
                                            className={`buying-scheme__chair buying-scheme__chair_${modifierClass}`}
                                            onClick={() => handleChairClick(rowIndex, seatIndex, chairType)}
                                            style={{ cursor: chairType !== 'disabled' && !isSeatTaken(rowIndex, seatIndex) ? 'pointer' : 'default' }}
                                        ></span>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="buying-scheme__legend">
                        <div className="col">
                            <p className="buying-scheme__legend-price">
                                <span className="buying-scheme__chair buying-scheme__chair_standart"></span>
                                Свободно (<span className="buying-scheme__legend-value">{hall.price_standard}</span>руб)
                            </p>

                            <p className="buying-scheme__legend-price">
                                <span className="buying-scheme__chair buying-scheme__chair_vip"></span>
                                Свободно VIP (<span className="buying-scheme__legend-value">{hall.price_vip}</span>руб)
                            </p>
                        </div>
                        <div className="col">
                            <p className="buying-scheme__legend-price">
                                <span className="buying-scheme__chair buying-scheme__chair_taken"></span> Занято
                            </p>
                            <p className="buying-scheme__legend-price">
                                <span className="buying-scheme__chair buying-scheme__chair_selected"></span> Выбрано
                            </p>
                        </div>
                    </div>
                </div>

                <button className="acceptin-button" onClick={handleBooking}>
                    Забронировать
                </button>
            </section>
        </main>
    );
}