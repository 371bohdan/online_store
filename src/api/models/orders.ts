import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";
import { OrderStatuses } from "./enums/orderStatusesEnum";
import { PaymentMethods } from "./enums/paymentMethods";
import { DeliveryMethods } from "./enums/deliveryMethods";

export interface IOrder extends Document {
    userId?: Types.ObjectId;
    created: Date,
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    amountOrder: number;

    products: {
        productId: Types.ObjectId;
        quantity: number;
        price: number;
    }[];

    status: string,
    paymentMethod: PaymentMethods,
    isPaid: boolean,

    datePayment?: Date;

    delivery: IOrderDelivery,
    isCallRestricted?: boolean,
    notes?: string
}

export interface IOrderDelivery {
    method: DeliveryMethods,
    address: {
        city: string,
        department: string
    }
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", required: false
        },

        created: {
            type: Date,
            required: true
        },

        firstName: {
            type: String,
            required: true,
            minlength: [3, 'must be at least 3 characters long'],
            maxlength: [15, 'cannot exceed 15 characters'],
        },

        lastName: {
            type: String,
            required: true,
            minlength: [3, 'must be at least 5 characters long'],
            maxlength: [20, 'cannot exceed 20 characters'],
        },

        phoneNumber: {
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
        },

        paymentMethod: {
            type: String,
            enum: PaymentMethods,
            default: PaymentMethods.CASH
        },

        isPaid: {
            type: Boolean,
            default: false
        },

        datePayment: {
            type: Date,
            required: false,
        },

        delivery: {
            method: {
                type: String,
                enum: DeliveryMethods,
                required: true
            },

            address: {
                city: {
                    type: String,
                    required: true
                },

                department: {
                    type: String,
                    required: true
                }
            }
        },

        isCallRestricted: {
            type: Boolean,
            default: false
        },

        notes: {
            type: String,
            maxlength: [500, 'cannot exceed 500 characters'],
            required: false
        }
    }
)


OrderSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate() as any;

    if (update?.isPaid === true && !update?.datePayment) {
        update.datePayment = new Date();
        this.setUpdate(update);
    }

    next();
});

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;


export const orderSwaggerSchema = mongooseToSwagger(Order);