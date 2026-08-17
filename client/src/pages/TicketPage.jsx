import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Ссылка на контейнер с QR-кодом для захвата SVG из DOM
    const qrContainerRef = useRef(null);

    // Получение переданных данных бронирования
    const { seance, date, chairsText, totalCost } = location.state || {};

    if (!seance) {
        return (
            <div className="info">
                <p>Билет не найден или уже устарел.</p>
                <button onClick={() => navigate('/')} className="conf-step__button conf-step__button-accent">На главную</button>
            </div>
        );
    }

    const { movie, hall } = seance;

    // Данные для зашивки внутрь QR-кода
    const qrDataString = JSON.stringify({
        film: movie.title,
        hall: hall.name,
        date: date,
        time: seance.start_time.substring(0, 5),
        seats: chairsText,
        cost: totalCost
    });

    // Функция скачивания QR-КОДА / PNG
    const handleDownloadQR = () => {
        if (!qrContainerRef.current) return;

        // Поиск SVG-элемент внутри нашего контейнера
        const svgElement = qrContainerRef.current.querySelector('svg');
        if (!svgElement) return;

        // Сериализаци SVG в текстовую XML-строку
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        // Создание временного объекта изображения в памяти
        const image = new Image();
        image.onload = () => {
            // Отрисовывка картинки на скрытый Canvas (холст) для конвертации в PNG
            const canvas = document.createElement('canvas');
            canvas.width = svgElement.clientWidth || 200;
            canvas.height = svgElement.clientHeight || 200;
            const context = canvas.getContext('2d');

            // Заливка фона белым цветом (чтобы QR-код не был прозрачным)
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Сам код
            context.drawImage(image, 0, 0);

            // 5Генерирация PNG-ссылки
            const pngURL = canvas.toDataURL('image/png');

            // Создание виртуального клика для вызова системного окна скачивания
            const downloadLink = document.createElement('a');
            downloadLink.href = pngURL;
            // Формирование имени файла для пользователя
            downloadLink.download = `Билет_${movie.title.replace(/[:\/\\*\?\"<>\|]/g, '')}_${date}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click(); // Эмулируем нажатие

            // Очистка мусора из памяти
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobURL);
        };

        image.src = blobURL;
    };

    return (
        <main>
            <section className="ticket">
                <header className="tichet__check">
                    <h2 className="ticket__check-title">Электронный билет</h2>
                </header>

                <div className="ticket__info-wrapper">
                    <p className="ticket__info">На фильм: <span className="ticket__details ticket__title">{movie.title}</span></p>
                    <p className="ticket__info">Места: <span className="ticket__details ticket__chairs">{chairsText}</span></p>
                    <p className="ticket__info">В зале: <span className="ticket__details ticket__hall">{hall.name}</span></p>
                    <p className="ticket__info">Начало сеанса: <span className="ticket__details ticket__start">{seance.start_time.substring(0, 5)}</span></p>

                    <div
                        ref={qrContainerRef}
                        onClick={handleDownloadQR}
                        title="Нажмите на QR-код, чтобы скачать его"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            margin: '25px 0',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <QRCodeSVG
                            value={qrDataString}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"M"}
                            className="qr"
                        />
                    </div>
                    <div className="qr_info">
                        <p className="ticket__hint">
                            💡 Нажмите на QR-код, чтобы сохранить картинку билета на устройство.
                        </p>
                        <p className="ticket__hint">Покажите QR-код нашему контроллеру для подтверждения бронирования.</p>
                        <p className="ticket__hint">Приятного просмотра!</p>

                        <div >
                            <button
                                onClick={() => navigate('/')}
                                className="conf-step__button conf-step__button-regular"
                                style={{ padding: '10px 20px', cursor: 'pointer' }}
                            >
                                Вернуться на главную
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}