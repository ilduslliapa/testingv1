const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка Multer для обработки файлов
const upload = multer({ dest: 'uploads/' });

// Настройка Nodemailer для GMX
const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 587,
    secure: false, // true для SSL (порт 465)
    auth: {
        user: 'petrk5y3j@gmx.com', // Отправитель
        pass: 'f3c4qIdco9', // Пароль отправителя
    },
});

// Функция для отправки писем
async function sendEmailWithAttachment(recipient, subject, text, attachmentPath, attachmentName) {
    const mailOptions = {
        from: 'petrk5y3j@gmx.com',
        to: recipient, // Получатель
        subject: subject,
        text: text,
        attachments: [
            {
                filename: attachmentName,
                path: attachmentPath,
            },
        ],
    };

    await transporter.sendMail(mailOptions);
}

// Маршрут для загрузки и отправки файла
app.post('/send-email', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('Файл не был загружен.');
    }

    try {
        await sendEmailWithAttachment(
            'vosipovogz@gmx.com', // Получатель
            'Ваш файл', // Тема
            'Здравствуйте! Вот ваш файл.', // Сообщение
            file.path,
            file.originalname
        );

        // Удаляем временный файл
        fs.unlinkSync(file.path);

        res.json({ message: 'Файл успешно отправлен!' });
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        res.status(500).send('Ошибка при отправке письма.');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
