const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Разрешаем доступ клиенту
app.use(cors());

// Настройка хранилища для загружаемых файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Настройка Multer для обработки одного файла
const upload = multer({ storage });

// Эндпоинт для загрузки одного файла
app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.json({
            message: 'Файл успешно загружен!',
            filename: req.file.filename,
            path: req.file.path,
        });
    } else {
        res.status(400).json({ message: 'Файл не был загружен.' });
    }
});

// Эндпоинт для загрузки архива
const archiveUpload = multer({ dest: './uploads/' }).single('archive');
app.post('/upload-archive', archiveUpload, (req, res) => {
    if (req.file) {
        res.json({
            message: 'Архив успешно загружен!',
            filename: req.file.filename,
            path: req.file.path,
        });
    } else {
        res.status(400).json({ message: 'Архив не был загружен.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
