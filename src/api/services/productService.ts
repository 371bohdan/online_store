import { HydratedDocument } from 'mongoose';
import Product, { IProduct } from "../models/products";
import { imageService } from './auxiliary/imageService';
import { CollectionsEnum } from '../models/enums/collectionsEnum';

export const productService = {
    searchForName: async (title: string = '', sort: string = 'asc'): Promise<Array<HydratedDocument<IProduct>>> => {
        let query = Product.find();
    
        if (title) {
            query = query.where('title').regex(new RegExp(`^${title}`, "i")); // ^ - початок рядка
        }
    
        query = query.sort({
            price: sort === "asc" ? 1 : -1,
        });
    
        return await query;
    },

    sortForPrice: async (sort: string): Promise<Array<HydratedDocument<IProduct>>> => {
        return await Product.find().sort({
            price: sort === "asc" ? 1 : -1, // 1 - за зростанням, -1 - за спаданням
        });
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