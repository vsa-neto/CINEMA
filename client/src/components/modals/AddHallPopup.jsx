import React, { useState } from 'react';

import closeIcon from '../../assets/img/close.png'; 

// Добавлен пропс errorMessage, который передается из родителя
export default function AddHallPopup({ isOpen, onClose, onAdd, errorMessage }) {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        onAdd(name);
        setName(''); // Очистка поля при отправке
    };

    // Функция закрытия, чтобы стирать введенный текст, если нажали "Отмена"
    const handleClose = () => {
        setName('');
        onClose();
    };

    return (
        <div className="popup active">
            <div className="popup__container">
                <div className="popup__content">
                    <div className="popup__header">
                        <h2 className="popup__title">
                            Добавление зала
                            <button 
                                className="popup__dismiss" 
                                type="button"
                                onClick={handleClose}
                                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                <img src={closeIcon} alt="Закрыть" />
                            </button>
                        </h2>
                    </div>
                    <div className="popup__wrapper">
                        <form onSubmit={handleSubmit} acceptCharset="utf-8">
                            
                            {/* Блок вывода ошибки валидации бэкенда */}
                            {errorMessage && (
                                <div className="conf-step__error-message" style={{ color: '#cc0000', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>
                                    {errorMessage}
                                </div>
                            )}

                            <label className="conf-step__label conf-step__label-fullsize" htmlFor="name">
                                Название зала
                                <input 
                                    className="conf-step__input" 
                                    type="text" 
                                    placeholder="Например, &laquo;Зал 1&raquo;" 
                                    name="name" 
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                    autoFocus 
                                />
                            </label>
                            
                            <div className="conf-step__buttons text-center">
                                <button 
                                    type="submit" 
                                    className="conf-step__button conf-step__button-accent"
                                >
                                    Добавить зал
                                </button>
                                <button 
                                    className="conf-step__button conf-step__button-regular" 
                                    type="button"
                                    onClick={handleClose}
                                >
                                    Отменить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}