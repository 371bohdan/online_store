import { IOrder } from "../models/orders";

export interface OrderDTO {
    products: Object[],
    firstName: string,
    lastName: string,
    telephone: string,
    email: string,
    amountOrder: number,
    status: string
}

export const convertToOrderDTO = (order: IOrder): OrderDTO => ({
    products: order.products,
    firstName: order.firstName,
    lastName: order.lastName,
    telephone: order.telephone,
    email: order.email,
    amountOrder: order.amountOrder,
    status: order.status
})