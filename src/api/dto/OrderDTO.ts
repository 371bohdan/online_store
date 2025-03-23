import { ObjectId } from "mongoose";
import { PaymentMethods } from "../models/enums/paymentMethods";
import { IOrder } from "../models/orders";

export interface OrderDTO {
    id: ObjectId,
    products: Object[],
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    amountOrder: number,
    status: string,
    paymentMethod: PaymentMethods,
    isPaid: boolean
}

export const convertToOrderDTO = (order: IOrder): OrderDTO => ({
    id: order.id,
    products: order.products,
    firstName: order.firstName,
    lastName: order.lastName,
    phoneNumber: order.phoneNumber,
    email: order.email,
    amountOrder: order.amountOrder,
    status: order.status,
    paymentMethod: order.paymentMethod,
    isPaid: order.isPaid
})