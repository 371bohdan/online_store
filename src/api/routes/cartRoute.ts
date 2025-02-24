import express from "express";
import cartController from "../controllers/cartController";
import genericCrudRoute from "./genericCrudRoute";
import Cart, { ICart } from "../models/carts";
import { Model } from "mongoose";
import errorHandler from "../middleware/errors/errorHandler";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/carts/add:
 *   post:
 *     tags:
 *       - carts API
 *     summary: Add a product to the cart
 *     description: Adds a product to the user's cart. The cart is identified either by `userId` (for authenticated users) or `sessionId` (for guest users).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: (Optional) The user ID associated with the cart (for authenticated users)
 *               productId:
 *                 type: string
 *                 description: The ID of the product to add
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product to add
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 cart:
 *                   type: object
 *                   description: The updated cart object
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *         content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *       404:
 *         description: Cart not found
 *         content:
 *              application/json:
 *                  schema:
 *                      allOf:
 *                          - $ref: '#/components/schemas/ErrorResponse/NotFound'
 *                          - type: object
 *                            properties:
 *                              message:
 *                                  example: "Cart not found"
 *       500:
 *         description: Internal server error
 *         content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/add', cartController.addProduct);


/**
 * @swagger
 * /api/carts/remove:
 *   post:
 *     tags:
 *       - carts API
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
 *                 description: (Optional) The user ID associated with the cart (for authenticated users)
 *               productId:
 *                 type: string
 *                 description: The ID of the product to remove
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product to remove. Defaults to 1 if not provided.
 *             required:
 *               - productId
 *               - userId
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
 *                     sessionId:
 *                       type: string
 *                       description: The session ID
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
 *         description: Bad request, missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ProductId is required
 *       404:
 *         description: Product not found in the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found in the cart
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: object
 */
router.post("/remove", cartController.removeProduct);

router.use(genericCrudRoute(Cart as Model<ICart>, "carts", ['get', 'post', 'put', 'delete']));
router.use(errorHandler);

export default router;