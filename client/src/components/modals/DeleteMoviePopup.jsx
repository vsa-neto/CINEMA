import React from 'react';
import closeIcon from '../../assets/img/close.png';

export default function DeleteMoviePopup({ isOpen, onClose, onDelete, movieTitle }) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onDelete();
    };

    return (
        <div className="popup active">
            <div className="popup__container">
                <div className="popup__content">
                    <div className="popup__header">
                        <h2 className="popup__title">
                            Удаление фильма
                            <a className="popup__dismiss" href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>
                                <img src={closeIcon} alt="Закрыть" />
                            </a>
                        </h2>
                    </div>
                    <div className="popup__wrapper">
                        <form onSubmit={handleSubmit} acceptCharset="utf-8">
                            <p className="conf-step__paragraph">
                                Вы действительно хотите удалить фильм <span>"{movieTitle}"</span> и <strong>все связанные с ним сеансы</strong>?
                            </p>
                            <div className="conf-step__buttons text-center">
                                <input type="submit" value="Удалить" className="conf-step__button conf-step__button-accent" />
                                <button className="conf-step__button conf-step__button-regular" type="button" onClick={onClose}>Отменить</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}