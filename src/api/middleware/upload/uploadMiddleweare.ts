import multer from 'multer';

const storage = multer.memoryStorage(); // Зберігаємо файл у пам'яті
const upload = multer({ storage });

export default upload;