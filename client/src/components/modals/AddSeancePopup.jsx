import React, { useState } from 'react';
import closeIcon from '../../assets/img/close.png';

export default function AddSeancePopup({ isOpen, onClose, onAdd, selectedMovie, selectedHall, errorMessage }) {
    const [startTime, setStartTime] = useState('00:00');

    if (!isOpen || !selectedMovie || !selectedHall) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ hall_id: selectedHall.id, movie_id: selectedMovie.id, start_time: startTime });
    };

    return (
        <div className="popup active">
            <div className="popup__container">
                <div className="popup__content">
                    <div className="popup__header">
                        <h2 className="popup__title">
                            Добавление сеанса
                            <a className="popup__dismiss" href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>
                                <img src={closeIcon} alt="Закрыть" />
                            </a>
                        </h2>
                    </div>
                    <div className="popup__wrapper">
                        <form onSubmit={handleSubmit}>
                            {errorMessage && <p style={{ color: 'red', marginBottom: '15px' }}>{errorMessage}</p>}
                            <label className="conf-step__label conf-step__label-fullsize">
                                Название зала
                                <select className="conf-step__input" value={selectedHall.id} disabled required>
                                    <option value={selectedHall.id}>{selectedHall.name}</option>
                                </select>
                            </label>
                            <label className="conf-step__label conf-step__label-fullsize">
                                Название фильма
                                <select className="conf-step__input" value={selectedMovie.id} disabled required>
                                    <option value={selectedMovie.id}>{selectedMovie.title}</option>
                                </select>
                            </label>
                            <label className="conf-step__label conf-step__label-fullsize">
                                Время начала
                                <input className="conf-step__input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                            </label>
                            <div className="conf-step__buttons text-center">
                                <input type="submit" value="Добавить" className="conf-step__button conf-step__button-accent" />
                                <button className="conf-step__button conf-step__button-regular" type="button" onClick={onClose}>Отменить</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}