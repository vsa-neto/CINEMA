# 🎬 Cinema - Сервис онлайн-бронирования билетов в кино

Веб-приложение для управления кинотеатром и онлайн-покупки билетов. Проект разделен на две независимые части: защищенную административную панель (SPA на React) и производительный REST API бэкенд на Laravel.

---

## 🛠 Технические особенности проекта

### Бэкенд (Backend)
*   **PHP**: `8.5.3`
*   **Фреймворк**: Laravel `13` / API Resource
*   **База данных**: MySQL `8.0`
*   **Авторизация**: Laravel Sanctum (Token-based Bearer)

### Фронтенд (Frontend)
*   **Cборка**: Vite / Node.js
*   **Библиотека**: React `^19.2.8` / React Router DOM `^19.2.8`
*   **HTTP-клиент**: Axios
*   **БД**: MySQL

---

## 🪁 Как запустить проект

### 1. Клонирование репозитория
Клонируйте проект с GitHub и перейдите в его корневую директорию:
```bash
git clone https://github.com
cd имя репозитория
```

### 2. Настройка Бэкенда (Laravel)
1. Перейти в директорию административной части бэкенда:
   ```bash
   cd cinema/admin
   ```
2. Установить зависимости PHP через Composer:
   ```bash
   composer install
   ```
3. Создать локальный файл конфигурации окружения из шаблона:
   ```bash
   .env из .env.example
   ```
4. В файле `.env` указать доступы к БД MySQL:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=имя_своей_базы_данных
   DB_USERNAME=ваш_логин_mysql
   DB_PASSWORD=ваш_пароль_mysql
   ```
5. Генерация уникального ключа для Laravel:
   ```bash
   php artisan key:generate
   ```
6. **Миграции и сидер**: Выполнить накат таблиц и одновременно созданть учетную запись администратора кинотеатра с помощью сидера:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Данные администратора при запуске сидера:*
   * **Email:** `admin_cinema@gmail.com`
   * **Пароль:** `cinema@2026`
   * 
7. Создать символическую ссылку для отображения постеров (admin/storage/app/public/posters):
   ```bash
   php artisan storage:link
   ```
8. Запустить локальный сервер Laravel:
   ```bash
   php artisan serve
   ```
   *Сервер бэкенда на порту `http://127.0.0.1:8000`.*

### 3. Настройка Фронтенда (React / Vite)
1. В новом окне терминала, перейти из корня проекта в директорию клиента:
   ```bash
   cd cinema/client
   ```
2. Установить все пакеты Node.js:
   ```bash
   npm install
   ```
3. Запустите сервер для разработки фронтенда:
   ```bash
   npm run dev
   ```
   *Интерфейс приложения будет доступен в браузере по адресу `http://localhost:5173`.*


## 🛠 Команды для сброса 

```bash
# Команды в cinema/admin
php artisan config:clear
php artisan cache:clear
php artisan migrate:fresh --seed

Remove-Item -Recurse  -Force public\storage
php artisan storage:link
```
