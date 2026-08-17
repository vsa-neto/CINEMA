import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Импорт секций административной панели
import HallManage from '../components/admin/HallManage';
import HallConfig from '../components/admin/HallConfig';
import PriceConfig from '../components/admin/PriceConfig';
import SessionGrid from '../components/admin/SessionGrid';
import OpenSales from '../components/admin/OpenSales';

// Импорт модальных окон из папки modals
import AddHallPopup from '../components/modals/AddHallPopup';
import DeleteHallPopup from '../components/modals/DeleteHallPopup';
import AddMoviePopup from '../components/modals/AddMoviePopup';
import AddSeancePopup from '../components/modals/AddSeancePopup';
import DeleteMoviePopup from '../components/modals/DeleteMoviePopup';
import DeleteSeancePopup from '../components/modals/DeleteSeancePopup';

// Универсальный компонент секции аккордеона
const ConfigSection = ({ id, title, isOpen, onToggle, children }) => {
    return (
        <section id={id} className="conf-step">
            <header
                className={`conf-step__header ${isOpen ? 'conf-step__header_opened' : 'conf-step__header_closed'}`}
                onClick={onToggle}
                style={{ cursor: 'pointer' }}
            >
                <h2 className="conf-step__title">{title}</h2>
            </header>
            {isOpen && children}
        </section>
    );
};

export default function AdminDashboard() {
    useEffect(() => { document.title = "админ"; }, []);

    const navigate = useNavigate();
    const hallManageRef = useRef();
    const sessionGridRef = useRef();

    // Состояние списка залов для синхронизации между секциями
    const [sharedHalls, setSharedHalls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Состояние открытых секций аккордеона
    const [openSections, setOpenSections] = useState({
        hall_manage: true,
        hall_config: true,
        price_config: true,
        session_grid: true,
        open_sales: true,
    });

    // Состояния модальных окон управления кинозалами
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState(null);
    const [validationError, setValidationError] = useState('');

    // Состояния модальных окон четвертой секции (Сетка сеансов)
    const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
    const [isAddSeanceOpen, setIsAddSeanceOpen] = useState(false);
    const [isDeleteMovieOpen, setIsDeleteMovieOpen] = useState(false);
    const [isDeleteSeanceOpen, setIsDeleteSeanceOpen] = useState(false);

    // Drag & Drop для удаления фильмов/сеансов
    const [draggedMovie, setDraggedMovie] = useState(null);
    const [targetHall, setTargetHall] = useState(null);
    const [movieToDelete, setMovieToDelete] = useState(null);
    const [selectedSeance, setSelectedSeance] = useState(null); // Тот самый ваш стабильный рабочий стейт

    // Первичный запрос на загрузку залов из базы данных MySQL
    const fetchHalls = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/halls');
            setSharedHalls(response.data || []);
        } catch (err) {
            console.error('Ошибка при загрузке залов:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    // Динамический мост: связывает клики из черновика SessionGrid с модальными окнами дашборда
    useEffect(() => {
        if (sessionGridRef.current) {
            sessionGridRef.current.onSaveSubmit = handleBatchSave;
            sessionGridRef.current.onOpenDeleteMovieTrigger = (movie) => {
                setMovieToDelete(movie);
                setIsDeleteMovieOpen(true);
            };
            sessionGridRef.current.onOpenDeleteSeanceTrigger = (seance) => {
                setSelectedSeance(seance);
                setIsDeleteSeanceOpen(true);
            };
        }
    });

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleOpenDelete = (hall) => {
        setSelectedHall(hall);
        setIsDeleteOpen(true);
    };

    // Экшены для первой секции (Залы)
    const handleAddHallAction = async (name) => {
        setValidationError('');
        try {
            await api.post('/halls', { name });
            setIsAddOpen(false);
            fetchHalls();
        } catch (err) {
            setValidationError('Зал с таким названием уже существует.');
        }
    };

    const handleDeleteHallAction = async () => {
        if (!selectedHall) return;
        try {
            await api.delete(`/halls/${selectedHall.id}`);
            setSelectedHall(null);
            setIsDeleteOpen(false);
            fetchHalls();
        } catch (err) {
            alert('Не удалось удалить зал.');
        }
    };

    // действия с черновиком расписания (Без отправки сетевых запросов)
    const handleAddMovieLocal = (rawMovie) => {
        sessionGridRef.current?.addMovieLocal(rawMovie);
        setIsAddMovieOpen(false);
    };

    const handleDropSeanceTrigger = (movie, hall) => {
        setDraggedMovie(movie);
        setTargetHall(hall);
        setIsAddSeanceOpen(true);
    };

    const handleAddSeanceLocal = (seanceData) => {
        const currentMovieTitle = draggedMovie?.title || 'Фильм';

        // Формир. структуру сеанса так, чтобы она содержала имя фильма внутри объекта movie
        const tempSeance = {
            id: 'temp-seance-' + Date.now(),
            hall_id: seanceData.hall_id,
            movie_id: seanceData.movie_id,
            start_time: seanceData.start_time,
            movie: {
                title: currentMovieTitle
            }
        };

        sessionGridRef.current?.addSeanceLocal(tempSeance);
        setIsAddSeanceOpen(false);
        setDraggedMovie(null);
        setTargetHall(null);
    };

    const handleDeleteMovieAction = async () => {
        if (!movieToDelete) return;
        sessionGridRef.current?.deleteMovieLocal(movieToDelete.id);

        if (!String(movieToDelete.id).startsWith('temp-')) {
            try { await api.delete(`/movies/${movieToDelete.id}`); } catch (e) { }
        }
        setIsDeleteMovieOpen(false);
        setMovieToDelete(null);
    };

    const handleDeleteSeanceAction = async () => {
        if (!selectedSeance) return;
        sessionGridRef.current?.deleteSeanceLocal(selectedSeance.id);

        if (!String(selectedSeance.id).startsWith('temp-')) {
            try { await api.delete(`/seances/${selectedSeance.id}`); } catch (e) { }
        }
        setIsDeleteSeanceOpen(false);
        setSelectedSeance(null);
    };

    // Отправки Фильмов и рассписания сеансов на сервер (Вызывается кнопкой "Сохранить")
    const handleBatchSave = async () => {
        if (!sessionGridRef.current) return;
        const { movies, seances, serverMovies, serverSeances } = sessionGridRef.current.getDraftData();

        const newMovies = movies.filter(m => !serverMovies.some(sm => sm.id === m.id));
        const newSeances = seances.filter(s => !serverSeances.some(ss => ss.id === s.id));

        if (newMovies.length === 0 && newSeances.length === 0) {
            alert('Нет новых изменений для сохранения.');
            return;
        }

        try {
            const movieIdMap = {};

            // Новые созданные фильмы через FormData
            for (const movie of newMovies) {
                const formData = new FormData();
                formData.append('title', movie.title);
                formData.append('duration', movie.duration);
                formData.append('description', movie.description);
                formData.append('country', movie.country);
                if (movie.poster_file) {
                    formData.append('poster_file', movie.poster_file);
                }

                const response = await api.post('/movies', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                movieIdMap[movie.id] = response.data.id; // Привязываем новый автоинкрементный ID базы данных
            }

            // Сохран. сеансов, привязанных к таймлайну
            for (const seance of newSeances) {
                const realMovieId = movieIdMap[seance.movie_id] || seance.movie_id;
                await api.post('/seances', {
                    hall_id: seance.hall_id,
                    movie_id: realMovieId,
                    start_time: seance.start_time
                });
            }

            alert('Все изменения сетки сеансов успешно сохранены в базу данных!');
            window.location.reload(); 
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.errors?.start_time || 'Ошибка сохранения расписания. Залы на выбранное время заняты.');
        }
    };

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (err) { }
        finally {
            localStorage.removeItem('admin_token');
            navigate('/admin');
        }
    };

    return (
        <>
            {/* Окна управления кинозалами (Секция 1) */}
            <AddHallPopup isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddHallAction} errorMessage={validationError} />
            <DeleteHallPopup isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelectedHall(null); }} onDelete={handleDeleteHallAction} hallName={selectedHall ? selectedHall.name : ''} />

            {/* Окна управления расписанием и фильмами (Секция 4) */}
            <AddMoviePopup isOpen={isAddMovieOpen} onClose={() => setIsAddMovieOpen(false)} onAdd={handleAddMovieLocal} />
            <AddSeancePopup isOpen={isAddSeanceOpen} onClose={() => setIsAddSeanceOpen(false)} onAdd={handleAddSeanceLocal} selectedMovie={draggedMovie} selectedHall={targetHall} />

            <DeleteMoviePopup isOpen={isDeleteMovieOpen} onClose={() => { setIsDeleteMovieOpen(false); setMovieToDelete(null); }} onDelete={handleDeleteMovieAction} movieTitle={movieToDelete?.title || ''} />


            <DeleteSeancePopup
                isOpen={isDeleteSeanceOpen}
                onClose={() => { setIsDeleteSeanceOpen(false); setSelectedSeance(null); }}
                onDelete={handleDeleteSeanceAction}
                movieTitle={selectedSeance?.movie?.title || ''}
            />

            <div className="admin-dashboard-container" style={{ padding: '20px' }}>
                <main className="conf-steps">
                    {/* 1. Управление залами */}
                    <ConfigSection id="hall_manage" title="Управление залами" isOpen={openSections.hall_manage} onToggle={() => toggleSection('hall_manage')}>
                        <HallManage ref={hallManageRef} halls={sharedHalls} onOpenAdd={() => { setValidationError(''); setIsAddOpen(true); }} onOpenDelete={handleOpenDelete} />
                    </ConfigSection>

                    {/* 2. Конфигурация залов */}
                    <ConfigSection id="hall_config" title="Конфигурация залов" isOpen={openSections.hall_config} onToggle={() => toggleSection('hall_config')}>
                        <HallConfig halls={sharedHalls} onHallConfigUpdated={() => window.location.reload()} />
                    </ConfigSection>

                    {/* 3. Конфигурация цен */}
                    <ConfigSection id="price_config" title="Конфигурация цен" isOpen={openSections.price_config} onToggle={() => toggleSection('price_config')}>
                        <PriceConfig halls={sharedHalls} onPricesUpdated={() => window.location.reload()} />
                    </ConfigSection>

                    {/* 4. Сетка сеансов */}
                    <ConfigSection id="session_grid" title="Сетка сеансов" isOpen={openSections.session_grid} onToggle={() => toggleSection('session_grid')}>
                        <SessionGrid ref={sessionGridRef} halls={sharedHalls} onOpenAddMovie={() => setIsAddMovieOpen(true)} onDropSeance={handleDropSeanceTrigger} />
                    </ConfigSection>

                    {/* 5. Открыть продажи */}
                    <ConfigSection id="open_sales" title="Открыть продажи" isOpen={openSections.open_sales} onToggle={() => toggleSection('open_sales')}>
                        <OpenSales halls={sharedHalls} onStatusUpdated={() => window.location.reload()} />
                    </ConfigSection>
                </main>
            </div>
        </>
    );
}