import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";
import { OrderStatuses } from "./enums/orderStatusesEnum";

export interface IOrder extends Document {
    userId?: Types.ObjectId;
    deliveryCompanyId: Types.ObjectId;
    firstName: string;
    lastName: string;
    telephone: string;
    email: string;
    amountOrder: number;
    products: {
        productId: Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    status: string
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        deliveryCompanyId: { type: Schema.Types.ObjectId, ref: "Delivery", required: true },

        firstName: {
            type: String,
            required: true,
            minlength: [3, 'must be at least 3 characters long'],
            maxlength: [15, 'cannot exceed 15 characters'],
        },

        lastName: {
            type: String,
            required: true,
            minlength: [5, 'must be at least 5 characters long'],
            maxlength: [20, 'cannot exceed 20 characters'],
        },

        telephone: {
            type: String,
            required: true,
            match: [/^\+?380\d{9}$/, 'Invalid format']
        },

        email: {
            type: String,
            required: [true, 'is required'],
            minlength: [10, 'must be at least 10 characters long'],
            maxlength: [40, 'cannot exceed 40 characters'],
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid format']
        },

        amountOrder: { type: Number, required: true },
        products: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true }
            }
        ],
        status: {
            type: String,
            enum: OrderStatuses,
            default: OrderStatuses.PROCESSING
        }
    }
)

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;


export const orderSwaggerSchema = mongooseToSwagger(Order);