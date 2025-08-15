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

export interface StaticOrderInterface {
    countOrders: number,
    countRecieved: number,
    countReturned: number,
    rawSalesData: SalesInfo[],
    start_date: Date,
    end_date: Date
}

export interface soldProductData{
    id: string,
    title: string,
    price: number,
    image: string | null,
    soldCount: number,
    soldAmount: number,
    stock: number
}

export interface SalesInfo{
    date: Date,
    amountOrder: number
}

export interface OrderStatDTO {
    totalOrdersNum: OrdersStatInfo,
    completedOrdersNum: OrdersStatInfo,
    returnedOrdersNum: OrdersStatInfo,
    mostPurchasedProducts: OrderItem[],
    salesScheduleInfo: SalesScheduleInfo[]
}


export interface SalesOverwiev{
    charData: SalesScheduleInfo[];
    totalOrdersCount: number;
    totalOrdersAmount: number;
    deliveredOrdersCount: number;
    deliveredOrdersAmount: number;
    returnOrdersCount: number;
    returnOrdersAmount: number;
    startDate: Date;
    endDate: Date;
}

export const convertToOrderStatDTO = (totalOrdersNum: OrdersStatInfo, completedOrdersNum: OrdersStatInfo, returnedOrdersNum: OrdersStatInfo,
    mostPurchasedProducts: OrderItem[], salesScheduleInfo: SalesScheduleInfo[]): OrderStatDTO => ({

        totalOrdersNum,
        completedOrdersNum,
        returnedOrdersNum,
        mostPurchasedProducts,
        salesScheduleInfo
    })