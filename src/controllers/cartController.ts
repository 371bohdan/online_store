import { Request, Response } from "express";
import Cart from "../models/carts"; // Впевніться, що шляхи правильні
import { Types } from 'mongoose';

const cartController = {
  addProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, productId, quantity } = req.body;

      if (!userId || !productId || !quantity) {
        res.status(400).json({ message: "UserId, productId, and quantity are required" });
        return;
      }

      // Знайти кошик користувача
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        // Якщо кошик не існує, створити новий
        cart = new Cart({ userId, products: [{ productId, quantity }] });
      } else {
        // Перевірити, чи товар вже є в кошику
        const productIndex = cart.products.findIndex(
          (product) => product.productId.toString() === productId
        );

        if (productIndex > -1) {
          // Оновити кількість товару
          cart.products[productIndex].quantity += quantity;
        } else {
          // Додати новий товар
          cart.products.push({ productId, quantity });
        }
      }

      // Зберегти кошик
      await cart.save();
      res.status(200).json({ message: "Product added to cart successfully", cart });
    } catch (error) {
      console.error("Error adding product to cart", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
  removeProduct: async (req: Request, res: Response): Promise<void> =>{
        try{
            const {userId, productId, quantity} = req.body;

        if (!userId || !productId) {
            res.status(400).json({ message: "UserId and productId are required" });
            return;
        }

        // Встановити значення за замовчуванням для quantity, якщо воно не вказане
        const removeQuantity = quantity || 1;

        
        let cart = await Cart.findOne({ userId });

        if(!cart){
            res.status(400).json({message: "The cart is empty!"});
            return;
        }

        const productIndex = cart.products.findIndex(
            (product) => product.productId.toString() === productId
        );

        if (productIndex > -1) {
            // Зменшити кількість товару
            cart.products[productIndex].quantity -= removeQuantity;
            if (cart.products[productIndex].quantity <= 0) {
                cart.products.splice(productIndex, 1);
              }
        }else{
            res.status(404).json({ message: "Product not found in the cart" });
            return;
        }

        // Зберегти кошик
        await cart.save();
        res.status(200).json({ message: "Product removed from cart successfully", cart });
    }catch(error){
        console.error("Error remove product from cart", error);
        res.status(500).json({message: "Internal server error", error});
    }
  }
};

export default cartController;
