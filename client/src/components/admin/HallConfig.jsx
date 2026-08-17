import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function HallConfig({ halls, onHallConfigUpdated }) {
    const [selectedHallId, setSelectedHallId] = useState(null);
    const [rows, setRows] = useState(0);
    const [seats, setSeats] = useState(0);
    const [layout, setLayout] = useState([]);

    // Автоматически выбир. первый зал из списка при его загрузке
    useEffect(() => {
        if (halls.length > 0 && !selectedHallId) {
            handleHallChange(halls[0].id);
        }
    }, [halls, selectedHallId]);

    // Переключение залов
    const handleHallChange = (hallId) => {
        if (!hallId) return;

        const numericId = Number(hallId);
        setSelectedHallId(numericId);

        const hall = halls.find((h) => h.id === numericId);
        if (hall) {
            setRows(hall.rows_count || 0);
            setSeats(hall.seats_count || 0);
            setLayout(hall.layout || []);
        }
    };

    // Изменение размера сетки (Ряды)
    const handleRowsChange = (e) => {
        const newRowsCount = Math.max(0, parseInt(e.target.value, 10) || 0);
        setRows(newRowsCount);
        updateLayoutMatrix(newRowsCount, seats);
    };

    // Изменение размера сетки (Места)
    const handleSeatsChange = (e) => {
        const newSeatsCount = Math.max(0, parseInt(e.target.value, 10) || 0);
        setSeats(newSeatsCount);
        updateLayoutMatrix(rows, newSeatsCount);
    };

    // Матрица мест с сохранением старых кресел
    const updateLayoutMatrix = (targetRows, targetSeats) => {
        setLayout((currentLayout) => {
            let newLayout = [];
            for (let r = 0; r < targetRows; r++) {
                let row = [];
                for (let s = 0; s < targetSeats; s++) {
                    // Безопасно берем старое кресло из актуального стейта currentLayout
                    if (currentLayout[r] && currentLayout[r][s]) {
                        row.push(currentLayout[r][s]);
                    } else {
                        row.push('standart'); // По умолчанию обычное кресло
                    }
                }
                newLayout.push(row);
            }
            return newLayout;
        });
    };

    // Переключение типов кресла при клике
    const handleChairClick = (rowIndex, seatIndex) => {
        const types = ['standart', 'vip', 'disabled'];

        setLayout((currentLayout) =>
            currentLayout.map((row, rIdx) =>
                row.map((seat, sIdx) => {
                    if (rIdx === rowIndex && sIdx === seatIndex) {
                        const currentIndex = types.indexOf(seat);
                        // Переключаем на следующий тип по кругу
                        const nextIndex = (currentIndex + 1) % types.length;
                        return types[nextIndex >= 0 ? nextIndex : 0];
                    }
                    return seat;
                })
            )
        );
    };

    // Сброс формы к исходным данным из базы
    const handleCancel = () => {
        handleHallChange(selectedHallId);
    };

    // Сохранение конфиг. в бэкенд Laravel
    const handleSave = async () => {
        if (!selectedHallId) return;

        try {
            await api.put(`/halls/${selectedHallId}/config`, {
                rows_count: rows,
                seats_count: seats,
                layout: layout,
            });
            alert('Конфигурация зала успешно сохранена!');
            if (onHallConfigUpdated) onHallConfigUpdated();
        } catch (err) {
            console.error('Ошибка сохранения конфигурации:', err);
            alert('Не удалось сохранить конфигурацию.');
        }
    };

    if (halls.length === 0) {
        return (
            <div className="conf-step__wrapper">
                <p className="conf-step__paragraph">Сначала создайте хотя бы один зал в секции выше.</p>
            </div>
        );
    }

    return (
        <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>
            <ul className="conf-step__selectors-box" style={{ listStyle: 'none', padding: 0 }}>
                {halls.map((hall) => (
                    <li key={hall.id}>
                        <input
                            type="radio"
                            className="conf-step__radio"
                            name="chairs-hall"
                            id={`hall-radio-${hall.id}`} // Связываем input и label через id
                            value={hall.id}
                            checked={selectedHallId === hall.id}
                            onChange={() => handleHallChange(hall.id)}
                        />
                        <label
                            className="conf-step__selector"
                            htmlFor={`hall-radio-${hall.id}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {hall.name}
                        </label>
                    </li>
                ))}
            </ul>

            <p className="conf-step__paragraph">Укажите количество рядов и максимальное количество кресел в ряду:</p>
            <div className="conf-step__legend">
                <label className="conf-step__label">
                    Рядов, шт
                    <input type="number"
                        className="conf-step__input"
                        placeholder="10"
                        value={rows || ''}
                        onChange={handleRowsChange}
                        min="0"
                    />
                </label>
                <span className="multiplier">x</span>
                <label className="conf-step__label">
                    Мест, шт
                    <input type="number"
                        className="conf-step__input"
                        placeholder="8"
                        value={seats || ''}
                        onChange={handleSeatsChange}
                        min="0"
                    />
                </label>
            </div>

            <p className="conf-step__paragraph">Теперь вы можете указать типы кресел на схеме зала:</p>
            <div className="conf-step__legend">
                <span className="conf-step__chair conf-step__chair_standart"></span> — обычные кресла
                <span className="conf-step__chair conf-step__chair_vip"></span> — VIP кресла
                <span className="conf-step__chair conf-step__chair_disabled"></span> — заблокированные (нет кресла)
                <p className="conf-step__hint">Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши</p>
            </div>

            {/* Отрендеренная схема зала */}
            {rows > 0 && seats > 0 && (
                <div className="conf-step__hall">
                    <div className="conf-step__hall-wrapper">
                        {layout.map((row, rowIndex) => (
                            <div className="conf-step__row" key={`${selectedHallId}-row-${rowIndex}`}>
                                {row.map((chairType, seatIndex) => (
                                    <span
                                        key={`${selectedHallId}-seat-${rowIndex}-${seatIndex}`}
                                        className={`conf-step__chair conf-step__chair_${chairType}`}
                                        onClick={() => handleChairClick(rowIndex, seatIndex)}
                                        style={{ cursor: 'pointer' }}
                                    ></span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <fieldset className="conf-step__buttons text-center" style={{ border: 'none', marginTop: '20px' }}>
                <button type="button" className="conf-step__button conf-step__button-regular" onClick={handleCancel}>
                    Отмена
                </button>
                <button type="button" className="conf-step__button conf-step__button-accent" onClick={handleSave}>
                    Сохранить
                </button>
            </fieldset>
        </div>
    );
}