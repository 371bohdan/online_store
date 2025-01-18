"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseService_1 = __importDefault(require("../supabase/supabaseService"));
const multer_1 = __importDefault(require("multer"));
// Налаштування multer для збереження файлів у пам'яті
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const genericCrudController = (Model) => ({
    getAll: async (req, res) => {
        const items = await Model.find();
        res.json(items);
    },
    getById: async (req, res) => {
        const { id } = req.params;
        const item = await Model.findById(id);
        res.json(item);
    },
    create: async (req, res) => {
        try {
            let imageUrl = '';
            // Якщо файл є, завантажуємо його до Supabase
            if (req.file) {
                const { originalname, buffer, mimetype } = req.file;
                const { data: uploadData, error: uploadError } = await supabaseService_1.default.storage
                    .from('product-images') // Назва бакета
                    .upload(`images/${Date.now()}_${originalname}`, buffer, {
                    contentType: mimetype,
                });
                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    res.status(500).json({ message: 'Failed to upload file', error: uploadError });
                    return;
                }
                const { data: publicUrlData } = supabaseService_1.default.storage
                    .from('product-images')
                    .getPublicUrl(uploadData.path);
                imageUrl = publicUrlData?.publicUrl || '';
            }
            // Створення продукту з URL зображення (якщо файл був завантажений)
            const productData = {
                ...req.body,
                image: imageUrl, // Якщо файлу не було, image залишиться порожнім
            };
            const product = new Model(productData);
            const savedProduct = await Model.create(product);
            res.status(201).json(savedProduct);
        }
        catch (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ message: 'Internal server error', error: err });
        }
    },
    update: async (req, res) => {
        const { id } = req.params;
        const { body, file } = req;
        let imageUrl = '';
        try {
            // Якщо файл надійшов, завантажуємо його до Supabase
            if (file) {
                const { originalname, buffer, mimetype } = file;
                const { data: uploadData, error: uploadError } = await supabaseService_1.default.storage
                    .from('product-images')
                    .upload(`products/${Date.now()}_${originalname}`, buffer, {
                    contentType: mimetype,
                });
                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    res.status(500).json({ message: 'Failed to upload file', error: uploadError });
                    return;
                }
                const { data: publicUrlData } = supabaseService_1.default.storage
                    .from('product-images')
                    .getPublicUrl(uploadData.path);
                imageUrl = publicUrlData?.publicUrl || '';
            }
            // Оновлення запису з URL зображення (якщо файл був завантажений)
            const updatedRecord = await Model.findByIdAndUpdate(id, {
                ...body,
                image: imageUrl, // Якщо є файл, додаємо URL малюнка
            }, { new: true });
            if (!updatedRecord) {
                res.status(404).json({ message: 'Record not found' });
                return;
            }
            res.status(200).json(updatedRecord);
        }
        catch (error) {
            console.error('Error updating record:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    },
    removeById: async (req, res) => {
        const { id } = req.params;
        await Model.findByIdAndDelete(id);
        res.send(`${Model.modelName} with id '${id}' was successfully removed.`);
    },
    removeAll: async (req, res) => {
        await Model.deleteMany({});
        res.send('success');
    }
});
exports.default = genericCrudController;
