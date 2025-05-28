import { OrderItem } from "../types/OrderTypes"

export interface OrdersStatInfo {
    quantity: number,
    amount: number
}

export interface SalesScheduleInfo {
    date: Date,
    totalCreatedOrders: number,
    totalAmount: number
}

export interface OrderStatDTO {
    totalOrdersNum: OrdersStatInfo,
    completedOrdersNum: OrdersStatInfo,
    returnedOrdersNum: OrdersStatInfo,
    mostPurchasedProducts: OrderItem[],
    salesScheduleInfo: SalesScheduleInfo[]
}

export const convertToOrderStatDTO = (totalOrdersNum: OrdersStatInfo, completedOrdersNum: OrdersStatInfo, returnedOrdersNum: OrdersStatInfo,
    mostPurchasedProducts: OrderItem[], salesScheduleInfo: SalesScheduleInfo[]): OrderStatDTO => ({

        totalOrdersNum,
        completedOrdersNum,
        returnedOrdersNum,
        mostPurchasedProducts,
        salesScheduleInfo
    })