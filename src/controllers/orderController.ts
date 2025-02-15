import { Request, Response } from "express";
import Order from '../models/orders';
import Cart from '../models/carts';

const orderController = {




    
    createOrder: async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                products, // Масив товарів [{ productId, quantity }]
                deliveryId,
                firstName,
                lastName,
                telephone,
                email,
                comment,
            } = req.body;

            let cartProducts = [];
            let totalPrice = 0;

            if (//token) {
                const cart = await Cart.findOne({ userId });
                if (!cart) {
                    res.status(404).json({ message: 'Cart for this userId not found' });
                    return;
                }
                cartProducts = cart.products;
            } else{
                if (!products || !Array.isArray(products)) {
                    res.status(400).json({ message: "Invalid products data" });
                    return;
                }

                cartProducts = await Promise.all(
                    products.map(async (item) => {
                        const product = await Product.findById(item.productId);
                        if (!product) return null;
                        return {
                            productId: product._id,
                            quantity: item.quantity,
                            price: product.price,
                        };
                    })
                ).then((result) => result.filter((item): item is { productId: mongoose.Types.ObjectId; quantity: number; price: number } => !!item));
            } else {
                res.status(400).json({ message: 'Either userId or guestId is required' });
                return;
            }

            const productIds = cartProducts.map((item) => item.productId);
            const productsData = await Product.find({ _id: { $in: productIds } });

            totalPrice = cartProducts.reduce((total, item) => {
                const product = productsData.find((p) => p._id.equals(item.productId));
                return total + (product ? product.price * item.quantity : 0);
            }, 0);

            const deliveryData = mongoose.Types.ObjectId.isValid(deliveryId) 
                ? await Delivery.findById(deliveryId) 
                : undefined;

            if (!deliveryData) {
                res.status(400).json({ message: "Invalid delivery data" });
                return;
            }

            const deliveryPrice = deliveryData.price;

            // Зменшення `stock` для кожного товару
            for (const item of cartProducts) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    res.status(404).json({ message: `Product with ID ${item.productId} not found` });
                    return;
                }

                if (product.stock < item.quantity) {
                    res.status(400).json({ message: `Not enough stock for product ${product.title}` });
                    return;
                }

                product.stock -= item.quantity;
                await product.save();
            }

            const order = new Order({
                userId,
                guestId,
                deliveryId,
                firstName,
                lastName,
                telephone,
                email,
                amountOrder: totalPrice + deliveryPrice,
                comment,
                products: cartProducts,
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