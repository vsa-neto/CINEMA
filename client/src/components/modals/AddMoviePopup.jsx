import React, { useState, useRef } from 'react';
import closeIcon from '../../assets/img/close.png';

export default function AddMoviePopup({ isOpen, onClose, onAdd }) {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [country, setCountry] = useState('');
    const [posterFile, setPosterFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPosterFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !duration) return;

        // 1. Генерация случайных цветов. Один раз перед созданием объекта
        const movieColors = [
            'rgba(220, 220, 106, 1)',
            'rgba(128, 102, 156, 1)',
            'rgba(255, 255, 255, 1)',
            'rgba(122, 199, 209, 1)',
            'rgba(123, 196, 248, 1)'
        ];
        const chosenColor = movieColors[Math.floor(Math.random() * movieColors.length)];

        // 2. Передача объекта в черновик. Цвет 'color' зафиксирован
        onAdd({
            id: 'temp-movie-' + Date.now(),
            title,
            duration: Number(duration),
            description,
            country,
            poster_file: posterFile,
            previewUrl: previewUrl || 'src/assets/i/poster.png',
            color: chosenColor
        });

        setTitle(''); setDuration(''); setDescription(''); setCountry(''); setPosterFile(null); setPreviewUrl(null);
    };

    return (
        <div className="popup active">
            <div className="popup__container">
                <div className="popup__content">
                    <div className="popup__header">
                        <h2 className="popup__title">
                            Добавление фильма
                            <a className="popup__dismiss" href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>
                                <img src={closeIcon} alt="Закрыть" />
                            </a>
                        </h2>
                    </div>
                    <div className="popup__wrapper">
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                            <div className="popup__container" style={{ display: 'flex', gap: '20px', border: 'none', padding: 0 }}>
                                <div className="popup__poster" style={{ width: '120px', height: '170px', backgroundColor: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                                    {previewUrl && <img src={previewUrl} alt="Превью" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div className="popup__form" style={{ flex: 1 }}>
                                    <label className="conf-step__label conf-step__label-fullsize">
                                        Название фильма
                                        <input className="conf-step__input" type="text" placeholder="Например, &laquo;Гражданин Кейн&raquo;" value={title} onChange={e => setTitle(e.target.value)} required />
                                    </label>
                                    <label className="conf-step__label conf-step__label-fullsize">
                                        Продолжительность фильма (мин.)
                                        <input className="conf-step__input" type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
                                    </label>
                                    <label className="conf-step__label conf-step__label-fullsize">
                                        Описание фильма
                                        <textarea className="conf-step__input" value={description} onChange={e => setDescription(e.target.value)} required style={{ height: '60px' }}></textarea>
                                    </label>
                                    <label className="conf-step__label conf-step__label-fullsize">
                                        Страна
                                        <input className="conf-step__input" type="text" value={country} onChange={e => setCountry(e.target.value)} required />
                                    </label>
                                </div>
                            </div>
                            <div className="conf-step__buttons text-center" style={{ marginTop: '20px' }}>
                                <input type="submit" value="Добавить фильм" className="conf-step__button conf-step__button-accent" />
                                <input type="button" value="Загрузить постер" className="conf-step__button conf-step__button-accent" onClick={() => fileInputRef.current.click()} />
                                <button className="conf-step__button conf-step__button-regular" type="button" onClick={onClose}>Отменить</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}