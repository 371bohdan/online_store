import { Request, Response } from "express";
import Order from '../models/orders';
import Cart from '../models/carts';

const orderController = {
    createOrder: async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                cartId,
                deliveryCompanyId,
                firstName,
                lastName,
                telephone,
                email
            } = req.body;


            const cart = await Cart.findById(cartId);

            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }

            const userId = cart.userId || null;


            const order = new Order({
                userId,
                cartId: cart._id,
                deliveryCompanyId,
                firstName,
                lastName,
                telephone,
                email,
                amountOrder: cart.totalPrice,
            });

            // Зберегти замовлення в базу даних
            await order.save();

            res.status(201).json({ message: 'Order created successfully', order });
        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    }
}

export default orderController;