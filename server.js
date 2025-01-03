const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS
app.use(cors({
    origin: 'https://ilduslliapa.github.io', // Ваш фронтенд-домен
    methods: ['GET', 'POST'], // Разрешённые методы
}));

// Настройка Multer для обработки файлов в памяти
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com', // SMTP сервер GMX
    port: 587,
    secure: false, // true для порта 465 (SSL)
    auth: {
        user: 'petrk5y3j@gmx.com', // Логин
        pass: 'f3c4qIdco9', // Пароль
    },
});

// Маршрут для загрузки архива и отправки письма
app.post('/upload-archive', upload.single('archive'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'Файл не был загружен.' });
    }

    try {
        // Отправка письма с архивом
        const mailOptions = {
            from: 'petrk5y3j@gmx.com', // Отправитель
            to: 'vosipovogz@gmx.com', // Получатель
            subject: 'Архив от пользователя',
            text: 'Здравствуйте! Вот архив с файлами.',
            attachments: [
                {
                    filename: file.originalname, // Имя архива
                    content: file.buffer, // Содержимое архива
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Архив успешно отправлен на почту!' });
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        res.status(500).json({ message: 'Ошибка при отправке письма.', error: error.message });
    }
});

// Проверка доступности сервера
app.get('/health-check', (req, res) => {
    res.json({ message: 'Сервер работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
