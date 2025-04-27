import {IProduct} from '../models/products';
import mongoose, { Types } from 'mongoose';

export interface ProductDTO{
        title: string;
        price: number;
        image: string[];
        type_candle: string;
        size: number;
        aroma: string;
        appointment: string;
        burning_time: string;
        short_describe: string;
        color: string;
        material: string;
        shape: string;
        features: string;
        composition: string;
        care: string
        gift_packaging: boolean;
        season_collection: boolean;
        comments: Types.ObjectId[];
        stock: number;
        rate_avg_product: number;
        createdAt: Date;
}

export const convertToProductDTO = (product: ProductDTO): ProductDTO => ({
    title: product.title,
    price: product.price,
    image: product.image,
    type_candle: product.type_candle,
    size: product.size,
    aroma: product.aroma,
    appointment: product.appointment,
    burning_time: product.burning_time,
    short_describe: product.short_describe,
    color: product.color,
    material: product.material,
    shape: product.shape,
    features: product.features,
    composition: product.composition,
    care: product.care,
    gift_packaging: product.gift_packaging,
    season_collection: product.season_collection,
    comments: product.comments,
    stock: product.stock,
    rate_avg_product: product.rate_avg_product,
    createdAt: product.createdAt
})