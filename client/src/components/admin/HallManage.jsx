import React from 'react';

export default function HallManage({ halls, isLoading, onOpenAdd, onOpenDelete }) {
    return (
        <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">Доступные залы:</p>

            {isLoading ? (
                <p className="conf-step__paragraph" style={{ opacity: 0.6 }}>Загрузка залов...</p>
            ) : halls.length === 0 ? (
                <p className="conf-step__paragraph" style={{ italic: 'true', color: '#888' }}>
                    Список залов пуст. Создайте свой первый зал.
                </p>
            ) : (
                <ul className="conf-step__list">
                    {halls.map(hall => (
                        <li key={hall.id}>
                            {hall.name}{' '}
                            <button
                                className="conf-step__button conf-step__button-trash"
                                onClick={() => onOpenDelete(hall)}
                                type="button"
                                title={`Удалить зал ${hall.name}`}
                            ></button>
                        </li>
                    ))}
                </ul>
            )}

            <button
                className="conf-step__button conf-step__button-accent"
                onClick={onOpenAdd}
                type="button"
                style={{ marginTop: '15px' }}
            >
                Создать зал
            </button>
        </div>
    );
}