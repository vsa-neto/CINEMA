import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';




export default function UserBooking() {
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(true);

    function AboutPage() {
        useEffect(() => {
            document.body.classList.add('UserBooking');

            // Удаление класас при уходе со страницы
            return () => { document.body.classList.remove('UserBooking'); };
        }, []);
    }

    // Список дней недели для отображения
    const [daysList, setDaysList] = useState([]);

    // Выбранная дата (объект дня из массива)
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => { document.title = "идем в кино"; }, []);

    // Генерация дней недели (текущий + 6 дней вперед)
    useEffect(() => {
        const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const list = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const dayNum = date.getDate();
            const dayWeek = daysOfWeek[date.getDay()];

            // Формат. даты в строку YYYY-MM-DD для передачи через роутер в БД
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const formattedDate = `${year}-${month}-${dayStr}`;

            list.push({
                index: i,
                dayWeek,
                dayNum,
                dateString: formattedDate,
                isToday: i === 0,
                isWeekend: date.getDay() === 0 || date.getDay() === 6
            });
        }

        setDaysList(list);
        setSelectedDate(list[0]); // По умолчанию выбираем "Сегодня"
    }, []);

    // 2. Загрузка данных расписания с бэкенда Laravel
    useEffect(() => {
        const fetchShowtimes = async () => {
            try {
                // Вызов публичного эндпоинта, который был создан в routes/api.php
                const response = await axios.get('http://localhost:8000/api/client/showtimes');
                setHalls(response.data.halls);
                setSeances(response.data.seances);

                // Выбор уникальных фильмы из полученных сеансов
                const uniqueMovies = [];
                response.data.seances.forEach(seance => {
                    if (seance.movie && !uniqueMovies.some(m => m.id === seance.movie.id)) {
                        uniqueMovies.push(seance.movie);
                    }
                });
                setMovies(uniqueMovies);
            } catch (err) {
                console.error('Ошибка при загрузке расписания:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, []);

    // Переход на страницу бронирования при клике на время
    const handleSeanceClick = (e, seanceId) => {
        e.preventDefault();
        if (!selectedDate) return;

        // Перенаправление пользователя на будущую страницу схемы зала
        // Передача id сеанса и выбран. дата в query-параметрах
        navigate(`/hall?seance_id=${seanceId}&date=${selectedDate.dateString}`);
    };

    if (loading) {
        return <div className="info">Загрузка расписания сеансов...</div>;
    }

    return (
        <>
            {/* Меню навигации по дням */}
            <nav className="page-nav">
                {daysList.map((day) => {
                    // Динамическая сборка классов верстки
                    let classNames = 'page-nav__day';
                    if (day.isToday) classNames += ' page-nav__day_today';
                    if (day.isWeekend) classNames += ' page-nav__day_weekend';
                    if (selectedDate?.index === day.index) classNames += ' page-nav__day_chosen';

                    return (
                        <a
                            key={day.index}
                            className={classNames}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setSelectedDate(day); }}
                        >
                            <span className="page-nav__day-week">{day.dayWeek}</span>
                            <span className="page-nav__day-number">{day.dayNum}</span>
                        </a>
                    );
                })}

                <a className="page-nav__day page-nav__day_next" href="#" onClick={(e) => e.preventDefault()}></a>
            </nav>

            {/* Основной блок с фильмами и расписанием */}
            <main>
                {movies.length === 0 ? (
                    <p className="info">Сейчас нет активных сеансов в залах.</p>
                ) : (
                    movies.map(movie => (
                        <section key={movie.id} className="movie">
                            <div className="movie__info">
                                <div className="movie__poster">
                                    <img className="movie__poster-image" alt={`${movie.title} постер`} src={movie.poster} />
                                </div>
                                <div className="movie__description">
                                    <h2 className="movie__title">{movie.title}</h2>
                                    <p className="movie__synopsis">{movie.description}</p>
                                    <p className="movie__data">
                                        <span className="movie__data-duration">{movie.duration} минут</span>
                                        <span className="movie__data-origin" style={{ marginLeft: '10px' }}>{movie.country}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Вывод сеансов, сгруппированных по залам, только для этого фильма */}
                            {halls.map(hall => {
                                // Фильтр сеансов для текущего зала и текущего фильма
                                const hallSeances = seances.filter(s => s.hall_id === hall.id && s.movie_id === movie.id);

                                if (hallSeances.length === 0) return null;

                                return (
                                    <div key={hall.id} className="movie-seances__hall">
                                        <h3 className="movie-seances__hall-title">{hall.name}</h3>
                                        <ul className="movie-seances__list">
                                            {hallSeances.map(seance => (
                                                <li key={seance.id} className="movie-seances__time-block">
                                                    <a
                                                        className="movie-seances__time"
                                                        href="#"
                                                        onClick={(e) => handleSeanceClick(e, seance.id)}
                                                    >
                                                        {seance.start_time.substring(0, 5)}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </section>
                    ))
                )}
            </main>
        </>
    );
}