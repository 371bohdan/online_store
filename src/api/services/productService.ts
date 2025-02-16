import { HydratedDocument } from 'mongoose';
import Product, { IProduct } from "../models/products";
import { imageService } from './auxiliary/imageService';
import { CollectionsEnum } from '../models/enums/collectionsEnum';

export const productService = {
    productFilterSort: async (title: string = '', sortBy: string = '', sort: string = 'desc'): Promise<Array<HydratedDocument<IProduct>>> => {
        let query = Product.find();
    
        // Фільтрація за назвою, якщо передано title
        if (title) {
            query = query.where('title').regex(new RegExp(`^${title}`, "i"));
        }
    
        // Об'єкт для умов сортування
        const sortConditions: { [key: string]: 1 | -1 } = {};
    
        // Якщо параметри порожні, використовуємо дефолтне сортування за датою (новіші першими)
        if (!sortBy) {
            sortConditions.createdAt = -1;
        } else {
            const sortFields = sortBy.split(',');
    
            // Пріоритетність сортування: спочатку price, потім createdAt
            if (sortFields.includes('price')) {
                sortConditions.price = sort === "asc" ? 1 : -1;
            }
    
            if (sortFields.includes('createdAt')) {
                sortConditions.createdAt = sort === "asc" ? 1 : -1;
            }
        }
    
        // Додаємо сортування до запиту
        query = query.sort(sortConditions);
    
        return await query;
    },

    createProduct: async (title: string, price: number, type_candle: string, size: number,
        aroma: string, appointment: string, burning_time: string, short_describe: string, 
        color: string, material: string, shape: string, features: string, gift_packaging: boolean,
        stock: number, file: Express.Multer.File): Promise<HydratedDocument<IProduct>> => {
        const imageUrl = await imageService.uploadFile(file);

        const data = new Product({
            title,
            price,
            type_candle,
            size,
            aroma,
            appointment,
            burning_time,
            short_describe,
            color,
            material,
            shape,
            features,
            gift_packaging,
            stock,
            image: imageUrl
        });
        return await Product.create(data);
    }
}