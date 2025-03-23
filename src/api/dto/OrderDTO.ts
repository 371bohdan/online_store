import { PaymentMethods } from "../models/enums/paymentMethods";
import { IOrder } from "../models/orders";

export interface OrderDTO {
    products: Object[],
    firstName: string,
    lastName: string,
    telephone: string,
    email: string,
    amountOrder: number,
    status: string,
    paymentMethod: PaymentMethods,
    isPaid: boolean
}

export const convertToOrderDTO = (order: IOrder): OrderDTO => ({
    products: order.products,
    firstName: order.firstName,
    lastName: order.lastName,
    telephone: order.telephone,
    email: order.email,
    amountOrder: order.amountOrder,
    status: order.status,
    paymentMethod: order.paymentMethod,
    isPaid: order.isPaid
})