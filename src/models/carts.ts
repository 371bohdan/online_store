import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";

// Інтерфейс для моделі Cart
export interface ICart extends Document {
    userId: Types.ObjectId; // Посилання на User
    quantity: number; // Загальна кількість товарів у кошику
    totalPrice: number; // Загальна сума кошика
    createdAt: Date; // Дата створення кошика
    items: Types.ObjectId[]; // Посилання на елементи у CartItems
}

// Схема для моделі Cart
const CartSchema = new Schema<ICart>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: (value: number) => value >= 0,
                message: "Quantity must be greater than or equal to 0",
            },
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: (value: number) => value >= 0,
                message: "Total price must be greater than or equal to 0",
            },
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        items: [
            {
                type: Schema.Types.ObjectId,
                ref: "CartItem",
                required: true,
            },
        ],
    },
    {
        timestamps: true, // Додає createdAt та updatedAt автоматично
    }
);

// Створення моделі Cart
const Cart = mongoose.model<ICart>("Cart", CartSchema);
export default Cart;

// Swagger-схема для документації
export const cartSwaggerSchema = mongooseToSwagger(Cart);
