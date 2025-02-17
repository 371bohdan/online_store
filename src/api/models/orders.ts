import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";
import { OrderStatuses } from "./enums/orderStatusesEnum";

export interface IOrder extends Document {
    userId?: Types.ObjectId; // Can be null for unregistered users
    cartId: Types.ObjectId; // Reference to a cart
    deliveryCompanyId: Types.ObjectId; // Reference to Delivery
    firstName: string;
    lastName: string;
    telephone: string;
    email: string;
    amountOrder: number; // Calculated: Delivery.price + Cart.totalPrice
    status: string
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        cartId: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
        deliveryCompanyId: { type: Schema.Types.ObjectId, ref: "Delivery", required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        telephone: { type: String, required: true },
        email: { type: String, required: true },
        amountOrder: {
            type: Number,
            default: 0,
            validate: {
                validator: (value: number) => value >= 0,
                message: "Amount must be greater than or equal to 0",
            },
        },
        status: {
            type: String,
            enum: OrderStatuses,
            default: OrderStatuses.PROCESSING
        }
    }
);

// Middleware для автоматичного обчислення `amountOrder`
OrderSchema.pre<IOrder>("save", async function (next) {
    try {
        const delivery = await mongoose.model("Delivery").findById(this.deliveryCompanyId);
        const cart = await mongoose.model("Cart").findById(this.cartId);

        if (!delivery || !cart) {
            throw new Error("Invalid deliveryCompanyId or cartId");
        }

        this.amountOrder = delivery.price + cart.totalPrice;
        next();
    } catch (error) {
        next(error as mongoose.CallbackError);
    }
});

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;


export const orderSwaggerSchema = mongooseToSwagger(Order);