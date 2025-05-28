import Order, { IOrder } from "../models/orders";
import Product from "../models/products";
import Cart from "../models/carts";
import mailController from "../../config/mail/mailController";
import NotFoundError from "../errors/general/NotFoundError";
import { OrderItem } from "../types/OrderTypes";
import { OrderStatuses } from "../models/enums/orderStatusesEnum";
import { ensureItemExists, getItemByField } from "./genericCrudService";
import BadRequestError from "../errors/general/BadRequestError";
import AuthorizationError from "../errors/auth/AuthorizationError";
import { jwtService } from "./auxiliary/jwtService";
import { convertToOrderDTO, OrderDTO } from "../dto/OrderDTO";
import { stripeService } from "../../config/stripe/stripeService";
import User, { IUser } from "../models/users";
import { getUserByEmail, isUserExistsByEmail } from "./userService";
import ApiError from "../errors/ApiError";
import { convertToOrderStatDTO, SalesScheduleInfo, OrderStatDTO } from "../dto/OrderStatDTO";

export const orderService = {
    createOrder: async (body: { products: OrderItem[] } & any, bearerToken: string | undefined): Promise<OrderDTO> => {
        let user, products;

        if (bearerToken) {
            user = await jwtService.getUserFromBearerToken(bearerToken);

            if (await Cart.exists({ userId: user.id })) {
                products = (await Cart.findOne({ userId: user.id }))?.products;
            }
        }

        if (!products) {
            products = body.products;
        }

        const {
            delivery,
            firstName,
            lastName,
            phoneNumber,
            email,
            paymentMethod,
            isCallRestricted,
            notes
        } = body;

        if (!user && !email) {
            throw new AuthorizationError("Email is required for non-registered users.");
        }

        let totalAmount = 0;
        for (const item of products) {
            const product = await Product.findById(item.productId);

            if (!product) throw new NotFoundError(`Product with ID ${item.productId} not found`);
            if (item.quantity <= 0) throw new BadRequestError('Quantity of product cannot be 0 or less');
            if (product.stock - item.quantity < 0) throw new BadRequestError(`We don't have the '${product.title}' product in stock in ${item.quantity} quantity`)

            totalAmount += product.price * item.quantity;
        }

        const created = new Date();
        const code = await generateOrderCode();
        let orderData: Partial<IOrder> = {
            created,
            firstName,
            lastName,
            phoneNumber,
            email: email ? email : user?.email,
            products,
            amountOrder: totalAmount,
            paymentMethod,
            delivery,
            isCallRestricted,
            notes
        };

        const order = new Order(orderData);

        if (user) {
            await Cart.findOneAndUpdate({ userId: user._id }, { products: [], totalPrice: 0 });
            order.userId = user.id;

        } else if (await isUserExistsByEmail(email)) {
            order.userId = (await getUserByEmail(email)).id;
        }

        const savedOrder = await order.save();

        // Оновлення запасів товарів
        for (const item of products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // Відправка email з деталями замовлення
        const orderDetails = {
            firstName,
            lastName,
            phoneNumber,
            email,
            products,
            amountOrder: totalAmount
        };

        mailController.sendOrderConfirmation(orderData.email as string, orderDetails);
        return convertToOrderDTO(savedOrder);
    },

    getAllStatuses: (): Array<OrderStatuses> => {
        return Object.values(OrderStatuses);
    },

    changeStatus: async (orderId: string, newStatus: string): Promise<OrderDTO> => {
        const currentStatus = (await getItemByField(Order, '_id', orderId)).status;
        let allowStatusChange = false;

        if (!Object.values(OrderStatuses).includes(newStatus as OrderStatuses)) {
            throw new BadRequestError("This status doesn't exist")
        }

        if (newStatus === OrderStatuses.CANCELED && (currentStatus !== OrderStatuses.RECEIVED && currentStatus !== OrderStatuses.RETURN)) {
            return convertToOrderDTO(await setStatus(orderId, newStatus));
        }

        switch (currentStatus as OrderStatuses) {
            case OrderStatuses.PROCESSING:
                if (newStatus === OrderStatuses.ACCEPTED) {
                    allowStatusChange = true;
                }

                break;

            case OrderStatuses.ACCEPTED:
                if (newStatus === OrderStatuses.ON_THE_WAY) {
                    allowStatusChange = true;
                }

                break;

            case OrderStatuses.ON_THE_WAY:
                if (newStatus === OrderStatuses.DELIVERED) {
                    allowStatusChange = true;
                }

                break;

            case OrderStatuses.DELIVERED:
                if (newStatus === OrderStatuses.RECEIVED || newStatus == OrderStatuses.RETURN) {
                    allowStatusChange = true;
                }

                break;

            default:
                throw new BadRequestError("Sorry, the status of this order has already been completed");
        }

        if (allowStatusChange) {
            const updatedOrder = await setStatus(orderId, newStatus as OrderStatuses);
            return convertToOrderDTO(updatedOrder);
        }

        throw new BadRequestError("Logic mismatch: sorry, you cannot set this status");
    },

    successfulPayment: async (sessionId: string): Promise<OrderDTO> => {
        const session = await stripeService.retrieveStripeSessionById(sessionId);
        const orderId = session.metadata?.orderId;
        await ensureItemExists(Order, '_id', orderId);
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { returnDocument: 'after' }) as IOrder;
        return convertToOrderDTO(updatedOrder);
    },

    unsuccessfulPayment: async (sessionId: string): Promise<OrderDTO> => {
        const session = await stripeService.retrieveStripeSessionById(sessionId);
        const orderId = session.metadata?.orderId;
        const order = await getItemByField(Order, '_id', orderId);
        return convertToOrderDTO(order);
    },

    getStatistics: async (startDateStr?: string, endDateStr?: string): Promise<OrderStatDTO> => {
        const orders = await getSortedOrderListByDate(startDateStr, endDateStr);

        const totalOrdersNum = getOrdersInfo(orders);
        const completedOrdersNum = getOrdersInfo(orders, OrderStatuses.RECEIVED);
        const returnedOrdersNum = getOrdersInfo(orders, OrderStatuses.RETURN);

        const mostPurchasedProducts = getMostPurchasedProducts(orders);
        const salesScheduleInfo = getSalesScheduleInfo(orders, endDateStr);

        return convertToOrderStatDTO(totalOrdersNum, completedOrdersNum, returnedOrdersNum, mostPurchasedProducts, salesScheduleInfo);
    }
}

/**
 * Returns updated order
 * @param orderId The id of an order, in which a status changes
 * @param status The new status
 * @throws NotFoundError exception if order doesn't exist in database (from ensureItemExists() method)
 */
async function setStatus(orderId: string, status: OrderStatuses): Promise<IOrder> {
    await ensureItemExists(Order, '_id', orderId);
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' }) as IOrder;

    mailController.sendOrderStatusChangedLetter(updatedOrder.email, status);
    return updatedOrder;
}

/**
 * Attaches user to his orders (point: if user ordered as a guest (without authentication), but later he created an account 
 * and this method will attach his order to his account)
 * @param user The user
 */
export async function attachUserToHisOrders(user: IUser): Promise<void> {
    await ensureItemExists(User, '_id', user._id);
    const orders = await Order.find({ email: user.email, userId: undefined });

    if (orders.length > 0) {
        orders.map(async order => await Order.findByIdAndUpdate(order._id, { userId: user._id }))
    }
}

async function generateOrderCode(): Promise<string> {
    for (let i = 0; i < 20; i++) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (!await Order.exists({ code: generatedCode })) {
            return generatedCode;
        }
    }

    throw new ApiError(500, 'Cannot generate a code for a new order. All codes already used')
}

/**
 * Returns the order array sorted by date according to the provided parameters. If no parameters are specified, it returns the standard array containing all orders.
 * @param startDateStr The start of the date, from which orders will be returned. Must be a string, in the following format: dd.mm.yyyy
 * @param endDateStr The end of the date, after which orders will not be returned. Must be a string, in the following format: dd.mm.yyyy
 * @returns The sorted array of orders.
 */
async function getSortedOrderListByDate(startDateStr?: string, endDateStr?: string) {
    if (startDateStr && endDateStr) {
        const startDate = convertDateStrToDate(startDateStr);
        const endDate = convertDateStrToDate(endDateStr);

        return await Order
            .find({
                created: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
            .sort({ created: 1 });

    } else if (startDateStr) {
        const startDate = convertDateStrToDate(startDateStr);
        return await Order
            .find({
                created: {
                    $gte: startDate
                }
            })
            .sort({ created: 1 });

    } else if (endDateStr) {
        const endDate = convertDateStrToDate(endDateStr);
        return await Order
            .find({
                created: {
                    $lte: endDate
                }
            })
            .sort({ created: 1 });

    } else {
        return await Order
            .find({})
            .sort({ created: 1 });
    }
}

/**
 * Returns information about quantity and the amount of all provided orders. Can be filtered by status (optional).
 * @param orders The array of orders to analyze.
 * @param status The status to filter orders by (optional).
 * @returns An object containing the quantity and total amount of completed orders.
 */
function getOrdersInfo(orders: IOrder[], status?: OrderStatuses) {
    let filteredOrder;
    if (status) {
        filteredOrder = orders.filter((order) => order.status === status);

    } else {
        filteredOrder = orders;
    }

    const complOrdersNumQuant = filteredOrder.length;
    const complOrdersNumAmount = filteredOrder.reduce((sum, order) => sum + order.amountOrder, 0);

    return ({ quantity: complOrdersNumQuant, amount: complOrdersNumAmount })
}

/**
 * Converts a date string in the format dd.mm.yyyy to a Date object.
 * @param dateStr The date string in the format dd.mm.yyyy
 * @returns The corresponding Date object.
 */
function convertDateStrToDate(dateStr: string): Date {
    const splitedDateStr = dateStr.split('.', 3);
    return new Date(splitedDateStr[2] + ' ' + splitedDateStr[1] + ' ' + splitedDateStr[0]);
}

/**
 * Converts a local date to a UTC date.
 * @param localDate The local date to convert to UTC date
 * @returns The corresponding UTC date.
 */
function getUTCDate(localDate: Date) {
    return Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate()
    )
}

/**
 * Converts a local date to a UTC month.
 * @param localDate The local date to convert to UTC month
 * @returns The corresponding UTC month.
 */
function getUTCMonth(localDate: Date) {
    return Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth()
    )
}

/**
 * Converts a local date to a UTC date and time.
 * @param localDate The local date to convert to UTC date and time
 * @returns The corresponding UTC date and time.
 */
function getUTCDateTime(localDate: Date) {
    return Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getDate(),
        localDate.getUTCHours(),
        localDate.getUTCMinutes(),
        localDate.getUTCSeconds()
    )
}

/**
 * Returns the number of days between the first and last order.
 * @param orders The array of orders to analyze.
 * If the array is empty or contains less than 2 orders, it returns 0.
 * @returns The number of days between the first and last order.
 */
function getDaysDifference(orders: IOrder[]): number {
    if (!orders || orders.length < 2) {
        return 0;
    }

    const dateOfFirst = orders[0].created;
    const dateOfLast = orders[orders.length - 1].created;

    const dateDiffInMs = dateOfLast.getTime() - dateOfFirst.getTime();

    return dateDiffInMs / (1000 * 60 * 60 * 24);
}

/**
 * Returns the most purchased products from the provided orders.
 * @param orders The array of orders to analyze.
 * @returns An array of the most purchased products (The first item is the most purchased).
 */
function getMostPurchasedProducts(orders: IOrder[]) {
    const productsStatInfo: OrderItem[] = [];

    for (const order of orders) {
        if (order.status === OrderStatuses.CANCELED || order.status === OrderStatuses.RETURN) {
            continue;
        }

        if (order.products) {
            for (const product of order.products) {
                const productStatIndex = productsStatInfo.findIndex((item) => item.productId === product.productId.toString());

                if (productStatIndex === -1) {
                    productsStatInfo.push({ productId: product.productId.toString(), quantity: product.quantity });
                    continue;
                }

                const existProd = productsStatInfo[productStatIndex];
                existProd.quantity += product.quantity;
                productsStatInfo[productStatIndex] = existProd;
            }
        }
    }

    let mostPurchasedProducts = [];

    if (productsStatInfo.length > 4) {
        const tempList = productsStatInfo.sort((product, nextProduct) => nextProduct.quantity - product.quantity);
        mostPurchasedProducts = tempList.slice(0, 4);

    } else {
        mostPurchasedProducts = productsStatInfo.sort((product, nextProduct) => nextProduct.quantity - product.quantity)
    }

    return mostPurchasedProducts;
}

/**
 * Returns the sales schedule information based on the provided orders.
 * @param orders The array of orders to analyze.
 * This function calculates the sales schedule information based on the provided orders.
 * @returns The sales schedule information.
 */
function getSalesScheduleInfo(orders: IOrder[], endDateStr?: string): SalesScheduleInfo[] {
    const salesScheduleInfo: SalesScheduleInfo[] = [];
    const daysDiff = getDaysDifference(orders);
    const endDate = endDateStr ? (convertDateStrToDate(endDateStr)) : new Date();

    for (const order of orders) {
        if (order.status === OrderStatuses.CANCELED || order.status === OrderStatuses.RETURN) {
            continue;
        }

        let utcDate: Date;
        if (daysDiff < 30) {
            utcDate = new Date(getUTCDate(order.created))

        } else {
            const utcMonth = new Date(getUTCMonth(order.created));
            let nextMonth = new Date(utcMonth.setUTCMonth(utcMonth.getUTCMonth() + 1));

            if (nextMonth.getTime() > endDate.getTime()) {
                nextMonth = endDateStr ? endDate : new Date(getUTCDateTime(endDate));
                utcDate = new Date(nextMonth.setMinutes(nextMonth.getMinutes() - nextMonth.getTimezoneOffset()))

            } else {
                utcDate = new Date(nextMonth.setMinutes(nextMonth.getMinutes() - 1));
            }
        }

        const saleIndex = salesScheduleInfo.findIndex((sale) => sale.date.getTime() === utcDate.getTime());

        if (saleIndex === -1) {
            salesScheduleInfo.push({
                date: utcDate,
                totalCreatedOrders: 1,
                totalAmount: order.amountOrder
            });

        } else {
            const existSale = salesScheduleInfo[saleIndex];
            existSale.totalCreatedOrders += 1;

            existSale.totalAmount += order.amountOrder;
            salesScheduleInfo[saleIndex] = existSale;
        }
    }

    return salesScheduleInfo;
}