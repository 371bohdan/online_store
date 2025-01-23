import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";

// Інтерфейс для моделі Cart
export interface ICart extends Document {
    userId: Types.ObjectId; 
    totalPrice: number; 
    products: { productId: Types.ObjectId; count: number }[];
}

// Схема для моделі Cart
const CartSchema = new Schema<ICart>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        totalPrice: {
            type: Number,
            default: 0,
            validate: {
                validator: (value: number) => value >= 0,
                message: "Total price must be greater than or equal to 0",
            },
        },
        products: {
            type: [
                {
                    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                    count: {
                        type: Number,
                        required: true,
                        default: 1,
                        validate: {
                            validator: (value: number) => value > 0,
                            message: "Count must be greater than 0",
                        },
                    },
                },
            ],
            required: false,
            default: [],

        },
    });


// Створення моделі Cart
const Cart = mongoose.model<ICart>("Cart", CartSchema);
export default Cart;

// Swagger-схема для документації
export const cartSwaggerSchema = mongooseToSwagger(Cart);
