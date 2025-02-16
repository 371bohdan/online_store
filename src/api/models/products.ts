import mongoose, { Schema, Document, Types } from 'mongoose';
import mongooseToSwagger from 'mongoose-to-swagger';
import { CollectionsEnum } from './enums/collectionsEnum';

export interface IProduct extends Document {
    _id: Types.ObjectId;
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
    gift_packaging: boolean;
    comments: Types.ObjectId[];
    stock: number;
    rate_avg_product: number;
    createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: [String], default: [] },
    type_candle: { type: String, required: true, enum: [
        'Декоративні', 'Набори свічок', 'Плаваючі', 'Розсипні', 'Фігурні', 'Свічки в баночках', 
        'Класичні', 'Ручна робота', 'Бездимні', 'Ароматичні свічки'
    ]},
    size: { type: Number, required: true },
    aroma: { type: String, required: true, enum: [
        'Ранкова кава', 'Вечірня хатка', 'Після дощу в лісі', 'Теплий хліб',
        "З дерев'яними гнотами", 'Медова теплість', 'Свічки без аромату', 'Тепле молоко', 'Золота осінь', 'Свіжість садка', "Літній вечір "
    ]},
    appointment: { type: String, required: true, enum: ["Для декору", "Для релаксу", "Для масажу"] },
    burning_time: { type: String, required: true },
    short_describe: { type: String, required: true },
    color: { type: String, required: true, enum: ['Зелений', 'Червоний', 'Чорний', 'Кремовий', 'Білий', 'Золотий', 'Пастельні тони'] },
    material: { type: String, required: true, enum: ['Кокосовий віск', 'Бджолиний віск', 'Парафін', 'Соєвий віск'] },
    shape: { type: String, required: true, enum: ['Спіральна', 'Квадратна'] },
    features: { type: String, required: true, enum: ['Натуральні інгредієнти', 'Еко-дружні', 'Антиалергічні', 'Для подарунка', 'Для особливих моментів'] },
    gift_packaging: { type: Boolean, required: true },
    comments: { type: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], default: [] },
    stock: { type: Number, required: true, min: 0 },
    rate_avg_product: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const Product: mongoose.Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
export const productSwaggerSchema = mongooseToSwagger(Product);
