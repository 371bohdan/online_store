import express from "express";
import cartController from "../controllers/cartController";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     tags:
 *       - Cart API
 *     summary: Add a product to the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       400:
 *         description: Bad request (missing parameters)
 *       500:
 *         description: Internal server error
 */
router.post('/add', cartController.addProduct);


/**
 * @swagger
 * /api/cart/remove:
 *   post:
 *     tags:
 *       - Cart API
 *     summary: Remove a product from the cart or update its quantity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               productId:
 *                 type: string
 *                 description: The ID of the product to be removed
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product to remove. If not specified, it will remove one item.
 *     responses:
 *       200:
 *         description: Successfully removed product from the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product removed from cart successfully
 *                 cart:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: The ID of the user
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             description: The product ID
 *                           quantity:
 *                             type: integer
 *                             description: The quantity of the product in the cart
 *       400:
 *         description: Bad request, missing parameters
 *       404:
 *         description: Product not found in the cart
 *       500:
 *         description: Internal server error
 */
router.post("/remove", cartController.removeProduct);

export default router;