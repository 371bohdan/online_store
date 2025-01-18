import mongoose, { Schema, Document, Types }from "mongoose";
import mongooseToSwagger from 'mongoose-to-swagger';

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
    image: string;
    describe: Describe;
    comments: Types.ObjectId[]; // Масив _id коментарів
    collections?: CollectionsEnum | null; // Одне значення або null
    stock: number;
    rate_avg_product: number; // Середній рейтинг
}

const DescribeSchema = new Schema<Describe>({
    aroma: { type: String, required: true },
    burning_time: { type: String, required: true },
    short_describe: { type: String, required: true },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0}, // Приймає string або number
    image: { type: String, required: true },
    describe: { type: DescribeSchema, required: true },
    comments: { 
      type: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
      default: [] // Це зробить масив порожнім за замовчуванням
  }, // Посилання на таблицю Comments
    collections: {
      type: String,
      enum: Object.values(CollectionsEnum),
      default: null, 
    },
    stock: { type: Number, required: true, min: 0 }, 
    rate_avg_product: { type: Number, default: 0 },
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
export const productSwaggerSchema = mongooseToSwagger(Product);