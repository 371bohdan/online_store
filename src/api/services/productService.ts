import { HydratedDocument } from 'mongoose';
import Product, { IProduct } from "../models/products";
import { imageService } from './auxiliary/imageService';
import { SortOrder } from 'mongoose';

export const productService = {
    productFilterSort: async (
        title: string = '',
        sortPrice?: SortOrder,
        sortDate?: SortOrder
    ): Promise<Array<HydratedDocument<IProduct>>> => {

        // Перевірка допустимих значень
        const allowedSortValues: SortOrder[] = ['asc', 'desc', 1, -1];

        if (sortPrice && !allowedSortValues.includes(sortPrice)) {
            throw new Error('Invalid sortPrice value. Allowed: "asc", "desc", 1, -1.');
        }

        if (sortDate && !allowedSortValues.includes(sortDate)) {
            throw new Error('Invalid sortDate value. Allowed: "asc", "desc", 1, -1.');
        }

        let query = Product.find();

        // Фільтрація за title
        if (title) {
            query = query.where('title').regex(new RegExp(title, 'i'));
        }

        // Обнуляємо один із параметрів, якщо інший вибрано
        if (sortPrice) {
            sortDate = undefined;
        } else if (sortDate) {
            sortPrice = undefined;
        }

        // Логіка сортування
        let sortConditions: Record<string, SortOrder> = {};

        if (sortPrice) {
            sortConditions.price = sortPrice;
        }

        if (sortDate) {
            sortConditions.createdAt = sortDate;
        }

        if (Object.keys(sortConditions).length > 0) {
            query = query.sort(sortConditions);
        }

        return await query;
    },


    createProduct: async (title: string, price: number, type_candle: string, size: number,
        aroma: string, appointment: string, burning_time: string, short_describe: string, 
        color: string, material: string, shape: string, features: string, gift_packaging: boolean, season_collection: boolean,
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
            season_collection,
            stock,
            image: imageUrl
        });
        return await Product.create(data);
    }
}