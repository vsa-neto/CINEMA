import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PriceConfig({ halls, onPricesUpdated }) {
    const [selectedHallId, setSelectedHallId] = useState('');
    const [priceStandard, setPriceStandard] = useState(0);
    const [priceVip, setPriceVip] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Автомат. выбор первого зала при загрузке списка
    useEffect(() => {
        if (halls.length > 0 && !selectedHallId) {
            handleHallChange(halls[0].id);
        }
    }, [halls]);

    // Переключение залов + заполнение полей текущими ценами
    const handleHallChange = (hallId) => {
        setSelectedHallId(hallId);
        const hall = halls.find(h => h.id === Number(hallId));

        if (hall) {
            setPriceStandard(hall.price_standard || 0);
            setPriceVip(hall.price_vip || 0);
        }
    };

    // Сброс к сохраненным в БД значениям
    const handleCancel = () => {
        handleHallChange(selectedHallId);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedHallId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // объявленные переменные priceStandard и priceVip
            await api.put(`/halls/${selectedHallId}/prices`, {
                price_standard: Number(priceStandard),
                price_vip: Number(priceVip)
            });

            alert('Конфигурация цен успешно сохранена!');

            if (onPricesUpdated) { onPricesUpdated(); }

        } catch (err) {
            console.error('Ошибка при сохранении цен:', err);
            alert('Не удалось сохранить цены. Проверьте корректность данных.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (halls.length === 0) {
        return (
            <div className="conf-step__wrapper">
                <p className="conf-step__paragraph">Сначала создайте хотя бы один зал в секции «Управление залами».</p>
            </div>
        );
    }

    return (
        <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>
            <ul className="conf-step__selectors-box">
                {halls.map(hall => (
                    <li key={hall.id}>
                        <input
                            type="radio"
                            className="conf-step__radio"
                            name="prices-hall"
                            value={hall.id}
                            checked={Number(selectedHallId) === hall.id}
                            onChange={() => handleHallChange(hall.id)}
                        />
                        <span className="conf-step__selector" onClick={() => handleHallChange(hall.id)}>
                            {hall.name}
                        </span>
                    </li>
                ))}
            </ul>

            <p className="conf-step__paragraph">Установите цены для типов кресел:</p>

            <div className="conf-step__legend">
                <label className="conf-step__label">
                    Цена, рублей
                    <input
                        type="number"
                        className="conf-step__input"
                        placeholder="0"
                        value={priceStandard || ''}
                        onChange={(e) => setPriceStandard(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                    />
                </label>
                за <span className="conf-step__chair conf-step__chair_standart"></span> обычные кресла
            </div>

            <div className="conf-step__legend">
                <label className="conf-step__label">
                    Цена, рублей
                    <input
                        type="number"
                        className="conf-step__input"
                        placeholder="0"
                        value={priceVip || ''}
                        onChange={(e) => setPriceVip(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                    />
                </label>
                за <span className="conf-step__chair conf-step__chair_vip"></span> VIP кресла
            </div>

            <fieldset className="conf-step__buttons text-center" style={{ border: 'none', marginTop: '20px' }}>
                <button
                    className="conf-step__button conf-step__button-regular"
                    type="button"
                    onClick={handleCancel}
                >
                    Отмена
                </button>
                <input
                    type="submit"
                    value="Сохранить"
                    className="conf-step__button conf-step__button-accent"
                    onClick={handleSave}
                />
            </fieldset>
        </div>
    );
}