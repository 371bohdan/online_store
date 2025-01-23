import mongoose, { Schema, Document, Types } from 'mongoose';
import mongooseToSwagger from 'mongoose-to-swagger'

enum CollectionsEnum {
    Summer = 'summer',
    Spring = 'spring',
    Autumn = 'autumn',
    Winter = 'winter',
}

interface Describe {
    aroma: string;
    burning_time: string;
    short_describe: string;
}

export interface IProduct extends Document {
    title: string;
    price: number;
    image: string[];  // Масив посилань на зображення
    describe: Describe;
    comments: Types.ObjectId[];
    collections?: CollectionsEnum | null;
    stock: number;
    rate_avg_product: number;
}

const DescribeSchema = new Schema<Describe>({
    aroma: { type: String, required: true },
    burning_time: { type: String, required: true },
    short_describe: { type: String, required: true },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { 
        type: [String],
        default: [],
        validate: {
            validator: (images: string[]) => images.every(url => /^https?:\/\/.+\.(jpg|jpeg|png)$/.test(url)),
            message: 'Кожен елемент масиву image повинен бути валідним URL посиланням на зображення.'
        }
    },
    describe: { type: DescribeSchema, required: true },
    comments: { 
        type: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        default: []
    },
    collections: {
        type: String,
        enum: Object.values(CollectionsEnum),
        default: null,
    },
    stock: { type: Number, required: true, min: 0 },
    rate_avg_product: { type: Number, default: 0 },
});

const Product: mongoose.Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
export const productSwaggerSchema = mongooseToSwagger(Product);