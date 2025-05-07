import { ObjectId } from "mongoose";
import { PaymentMethods } from "../models/enums/paymentMethods";
import { IOrder, IOrderDelivery } from "../models/orders";

export interface OrderDTO {
    _id: ObjectId,
    created: Date,
    code: String,
    products: Object[],
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    amountOrder: number,
    status: string,
    paymentMethod: PaymentMethods,
    isPaid: boolean,
    delivery: IOrderDelivery,
    isCallRestricted?: boolean,
    notes?: string
}

export const convertToOrderDTO = (order: IOrder): OrderDTO => ({
    _id: order.id,
    created: order.created,
    code: order.code,
    products: order.products,
    firstName: order.firstName,
    lastName: order.lastName,
    phoneNumber: order.phoneNumber,
    email: order.email,
    amountOrder: order.amountOrder,
    status: order.status,
    paymentMethod: order.paymentMethod,
    isPaid: order.isPaid,
    delivery: order.delivery,
    isCallRestricted: order.isCallRestricted,
    notes: order.notes
})
