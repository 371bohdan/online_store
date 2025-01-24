import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";
import Product, { IProduct } from "./products";


interface CartProduct {
    productId: mongoose.Types.ObjectId;
    quantity: number; // Виправлено на `quantity` для узгодження
}

// Інтерфейс для моделі Cart
export interface ICart extends Document {
    userId: Types.ObjectId;
    totalPrice: number;
    products: CartProduct[];
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
                    productId: { type: mongoose.Types.ObjectId, required: true, ref: "Product" },
                    quantity: { // Виправлено на `quantity`
                        type: Number,
                        required: true,
                        default: 1,
                        validate: {
                            validator: (value: number) => value > 0,
                            message: "Quantity must be greater than 0",
                        },
                    },
                },
            ],
            required: false,
            default: [],
        },
    },
    { timestamps: true }
);


// Спрацьвує у разі активізації Model.save() методу

CartSchema.pre<ICart>("save", async function (next) {
    try {
        // Отримуємо всі `productId` з корзини
        const productIds = this.products.map((p) => p.productId);

        // Завантажуємо продукти з бази даних
        const products = await Product.find({ _id: { $in: productIds } }) as IProduct[];

        // Обчислюємо загальну ціну
        this.totalPrice = this.products.reduce((total, item) => {
            const product = products.find((p: IProduct) => p._id.equals(item.productId));
            return total + (product ? (product as IProduct).price * item.quantity : 0);
        }, 0);

        next();
    } catch (error) {
        next(error as mongoose.CallbackError);
    }
});


// Створення моделі Cart
const Cart = mongoose.model<ICart>("Cart", CartSchema);
export default Cart;

// Swagger-схема для документації
export const cartSwaggerSchema = mongooseToSwagger(Cart);
