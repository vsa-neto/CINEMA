import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../../api/axios';

const SessionGrid = forwardRef(({ halls, onOpenAddMovie, onDropSeance }, ref) => {
    // списки черновика для отображения на странице
    const [movies, setMovies] = useState([]);
    const [seances, setSeances] = useState([]);

    // Бэкап данных с сервера (для кнопки "Отмена")
    const [serverMovies, setServerMovies] = useState([]);
    const [serverSeances, setServerSeances] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    // Первичная загрузка данных с сервера
    const fetchData = async () => {
        try {
            const [moviesRes, seancesRes] = await Promise.all([
                api.get('/movies'),
                api.get('/seances')
            ]);
            setMovies(moviesRes.data);
            setServerMovies(moviesRes.data);
            setSeances(seancesRes.data);
            setServerSeances(seancesRes.data);
        } catch (err) {
            console.error('Ошибка при загрузке расписания:', err);
        }
    };

    // Экспорт. методы наружу для AdminDashboard.jsx
    useImperativeHandle(ref, () => ({
        getDraftData() {
            return { movies, seances, serverMovies, serverSeances };
        },
        addMovieLocal(newMovieObj) {
            setMovies(prev => [...prev, newMovieObj]);
        },
        addSeanceLocal(newSeanceObj) {
            setSeances(prev => [...prev, newSeanceObj]);
        },
        deleteSeanceLocal(seanceId) {
            setSeances(prev => prev.filter(s => s.id !== seanceId));
        },
        deleteMovieLocal(movieId) {
            setMovies(prev => prev.filter(m => m.id !== movieId));
            setSeances(prev => prev.filter(s => s.movie_id !== movieId));
        }
    }));

    // Кнопка "Отмена" — возврат текущих данных, хранящиеся на сервере
    const handleCancel = (e) => {
        e.preventDefault();
        setMovies(serverMovies);
        setSeances(serverSeances);
        alert('Все несохраненные изменения отменены.');
    };

    // Кнопка "Сохранить" — отправляет сигнал в AdminDashboard для отправки на сервер
    const handleSaveClick = (e) => {
        e.preventDefault();
        if (ref.current && ref.current.onSaveSubmit) {
            ref.current.onSaveSubmit();
        }
    };

    const handleDragStart = (e, movie) => {
        e.dataTransfer.setData('application/json', JSON.stringify(movie));
    };

    const calculateStyle = (startTime, duration) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        return {
            left: `${(startMinutes / 1440) * 100}%`,
            width: `${(duration / 1440) * 100}%`,
            position: 'absolute',
            height: '100%'
        };
    };

    return (
        <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">
                <button className="conf-step__button conf-step__button-accent" onClick={onOpenAddMovie}>Добавить фильм</button>
            </p>

            {/* Список фильмов */}
            <div className="conf-step__movies">
                {movies.map(movie => (
                    <div
                        key={movie.id}
                        className="conf-step__movie"
                        draggable
                        onDragStart={(e) => handleDragStart(e, movie)}
                        onDoubleClick={() => ref.current?.onOpenDeleteMovieTrigger?.(movie)}
                        style={{ cursor: 'grab', backgroundColor: movie.color }}
                        title="Двойной клик для удаления фильма из черновика"
                    >
                        <img className="conf-step__movie-poster" alt="poster" src={movie.previewUrl || movie.poster} />
                        <h3 className="conf-step__movie-title">{movie.title}</h3>
                        <p className="conf-step__movie-duration">{movie.duration} минут</p>
                    </div>
                ))}
            </div>

            {/* Сетка залов и таймлайнов */}
            <div className="conf-step__seances">
                {halls.map(hall => (
                    <div key={hall.id} className="conf-step__seances-hall">
                        <h3 className="conf-step__seances-title">{hall.name}</h3>
                        <div
                            className="conf-step__seances-timeline"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                const movie = JSON.parse(e.dataTransfer.getData('application/json'));
                                onDropSeance(movie, hall);
                            }}
                            style={{ position: 'relative', background: '#e4e4e4', height: '40px', marginBottom: '20px' }}
                        >
                            {seances.filter(s => s.hall_id === hall.id).map(seance => {

                                const associatedMovie = movies.find(m => m.id === seance.movie_id);
                                const currentColor = associatedMovie?.color || seance.movie?.color || 'rgba(220, 220, 106, 1)';
                                const currentDuration = associatedMovie ? associatedMovie.duration : (seance.movie?.duration || 90);
                                const currentTitle = associatedMovie ? associatedMovie.title : (seance.movie?.title || 'Фильм');
                                return (
                                    <div
                                        key={seance.id}
                                        className="conf-step__seances-movie"
                                        onDoubleClick={() => ref.current?.onOpenDeleteSeanceTrigger?.(seance)}
                                        style={{
                                            backgroundColor: currentColor,
                                            cursor: 'pointer',
                                            ...calculateStyle(seance.start_time, associatedMovie?.duration || 90)
                                        }}
                                        title="Двойной клик для удаления сеанса из черновика"
                                    >
                                        <p className="conf-step__seances-movie-title" style={{ fontSize: '10px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {associatedMovie?.title || seance.movie?.title}
                                        </p>
                                        <p className="conf-step__seances-movie-start" style={{ fontSize: '9px' }}>
                                            {seance.start_time.substring(0, 5)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <fieldset className="conf-step__buttons text-center">
                <button className="conf-step__button conf-step__button-regular" onClick={handleCancel}>Отмена</button>
                <input type="submit" value="Сохранить" className="conf-step__button conf-step__button-accent" onClick={handleSaveClick} />
            </fieldset>
        </div>
    );
});

export default SessionGrid;