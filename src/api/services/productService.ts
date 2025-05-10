import { HydratedDocument } from 'mongoose';
import Product, { IProduct } from "../models/products";
import { imageService } from './auxiliary/imageService';
import { SortOrder } from 'mongoose';
import BadRequestError from "../errors/general/BadRequestError";
import NotFoundError from "../errors/general/NotFoundError";
import { ensureItemExists } from "./genericCrudService";


const allowedSortValues: SortOrder[] = ['asc', 'desc', 1, -1];


export const productService = {
    async productFilterSort(title = "", sortPrice?: SortOrder, sortDate?: SortOrder): Promise<IProduct[]> {
        // Перевірка допустимих значень

        if (sortPrice && !allowedSortValues.includes(sortPrice)) {
            throw new BadRequestError("Invalid sortPrice value. Allowed: 'asc', 'desc', 1, -1.");
        }

        if (sortDate && !allowedSortValues.includes(sortDate)) {
            throw new BadRequestError('Invalid sortDate value. Allowed: "asc", "desc", 1, -1.');
        }

        let query = Product.find();

        // Фільтрація за title
        if (title.trim().length >= 3) {
            const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query = query.where('title').regex(new RegExp(escapedTitle, 'i'));
        }else if (title.trim().length > 0 && title.trim().length < 3) {
            // Додати умову, яка завідомо нічого не знайде
            // Наприклад, пошук по title, який не існує
            query = query.where('title').equals('__no_match__');
        }


        const sortConditions: Record<string, SortOrder> = {};
        if(sortPrice) sortConditions.price = sortPrice;
        if(sortDate) sortConditions.createdAt = sortDate;
        return Object.keys(sortConditions).length > 0 ? query.sort(sortConditions).exec() : query.exec();
    },


    async createProduct(data: Omit<IProduct, "image">, files: Express.Multer.File[]): Promise<HydratedDocument<IProduct>> {
        // const imageUrls = await imageService.uploadFile(file);
        const imageUrls = await Promise.all(files.map(file => imageService.uploadFile(file)));
        return await Product.create({...data, image: imageUrls});
    },


    async getProductById(productId: string): Promise<IProduct | null>{
        await ensureItemExists(Product, "_id", productId);
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError(`Product with ID ${productId} not found`);
        return product;
    },

    async updateProduct(productId: string, updateData: Partial<IProduct>, files?: Express.Multer.File[]): Promise<IProduct> {
        await ensureItemExists(Product, "_id", productId);

        const updateFields: any = {};
    
        if (files && files.length > 0) {
            const newImageUrls = await Promise.all(files.map(file => imageService.uploadFile(file)));
            updateData.image = newImageUrls;
        }
    
        // Перевіряємо кожне поле в updateData і видаляємо некоректні значення
        for (const key in updateData) {
            const value = updateData[key as keyof Partial<IProduct>];
            if (
                value === undefined ||
                value === null ||
                value === -1 ||
                value === '-1' ||
                value === 'undefined' ||
                value === 'undefiend' ||
                value === 'null'
            ) {
                delete updateData[key as keyof Partial<IProduct>];
            }
        }
    
        // Оновлюємо characteristics окремо
        if (updateData.characteristics) {
            for (const [key, value] of Object.entries(updateData.characteristics)) {
                if (value !== undefined && value !== null) {
                    updateFields[`characteristics.${key}`] = value;
                }
            }
            delete updateData.characteristics; // щоб не перезаписати повністю весь characteristics
        }
    
        // Додаємо всі інші звичайні поля
        Object.assign(updateFields, updateData);
    
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateFields },
            { new: true }
        );
    
        if (!updatedProduct) throw new NotFoundError(`Product with ID ${productId} not found`);
    
        return updatedProduct;
    },

    async deleteProduct(productId: string): Promise<void> {
        await ensureItemExists(Product, "_id", productId);
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) throw new NotFoundError(`Product with ID ${productId} not found`);
    }
}