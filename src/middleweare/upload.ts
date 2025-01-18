import multer from 'multer';

// Використовуємо пам'ять для тимчасового зберігання файлів
const storage = multer.memoryStorage();

// Обмеження на розмір файлу та формат
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Максимальний розмір файлу: 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Приймаємо тільки зображення
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

export default upload;