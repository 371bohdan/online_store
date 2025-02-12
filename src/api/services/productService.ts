import { HydratedDocument } from 'mongoose';
import Product, { IProduct } from "../models/products";
import { imageService } from './auxiliary/imageService';
import { CollectionsEnum } from '../models/enums/collectionsEnum';

export const productService = {
    searchForName: async (title: string, sort: string): Promise<Array<HydratedDocument<IProduct>>> => {
        let query = Product.find({
            title: new RegExp(`^${title}`, "i"), // ^ - початок рядка
        });

        if (sort) {
            query = query.sort({
                price: sort === "asc" ? 1 : -1,
            });
        }

        return await query;
    },

    sortForPrice: async (sort: string): Promise<Array<HydratedDocument<IProduct>>> => {
        return await Product.find().sort({
            price: sort === "asc" ? 1 : -1, // 1 - за зростанням, -1 - за спаданням
        });
    },

    createProduct: async (title: string, price: number, describe: string, collections: CollectionsEnum,
        stock: number, file: Express.Multer.File): Promise<HydratedDocument<IProduct>> => {
        const imageUrl = await imageService.uploadFile(file);

        let parsedDescribe = describe;
        parsedDescribe = JSON.parse(describe);

        const data = new Product({
            title,
            price,
            describe: parsedDescribe,
            collections,
            stock,
            image: imageUrl
        });
        return await Product.create(data);
    }
}