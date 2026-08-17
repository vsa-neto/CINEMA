import React from 'react';
import api from '../../api/axios';

export default function OpenSales({ halls, onStatusUpdated }) {

    // Функция переключения продаж
    const handleToggleSales = async (hall) => {
        try {
            // смена статуса на противоположный
            await api.put(`/halls/${hall.id}/toggle-status`, {
                is_active: !hall.is_active
            });

            alert(`Статус продаж для зала "${hall.name}" успешно изменен!`);
            if (onStatusUpdated) onStatusUpdated();
        } catch (err) {
            console.error('Ошибка при изменении статуса продаж:', err);
            alert('Не удалось изменить статус продаж.');
        }
    };

    if (halls.length === 0) {
        return (
            <div className="conf-step__wrapper text-center">
                <p className="conf-step__paragraph">Сначала создайте хотя бы один зал в секции «Управление залами».</p>
            </div>
        );
    }

    return (
        <div className="conf-step__wrapper text-center">
            <p className="conf-step__paragraph">Всё готово, теперь можно управлять продажами:</p>

            {/* Стилизованный список залов с кнопками переключения */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '20px auto' }}>
                {halls.map(hall => (
                    <div
                        key={hall.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 15px',
                            background: '#f9f9f9',
                            border: '1px solid #e4e4e4',
                            borderRadius: '4px'
                        }}
                    >
                        <span style={{ fontWeight: 'bold' }}>
                            {hall.name}
                            <span style={{ color: hall.is_active ? 'green' : 'gray', fontSize: '12px', marginLeft: '10px' }}>
                                ({hall.is_active ? 'Продажи открыты' : 'Закрыт'})
                            </span>
                        </span>

                        <button
                            onClick={() => handleToggleSales(hall)}
                            className="conf-step__button conf-step__button-accent"
                        >
                            {hall.is_active ? 'Приостановить продажу билетов' : 'Открыть продажу билетов'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}