import express from "express";
import orderController from "../controllers/orderController";

const router = express.Router();

/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     tags:
 *       - orders API
 *     summary: Create an order based on the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *                 description: ID of your cart
 *               deliveryCompanyId:
 *                 type: string
 *                 description: Delivery company including price and delivery method
 *               firstName:
 *                 type: string
 *                 description: First name of the client
 *               lastName:
 *                 type: string
 *                 description: Last name of the client
 *               telephone:
 *                 type: string
 *                 description: Client's phone number
 *               email:
 *                 type: string
 *                 description: Client's email address
 *             required:
 *               - cartId
 *               - deliveryCompanyId
 *               - firstName
 *               - lastName
 *               - telephone
 *               - email
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 order:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: User ID associated with the order
 *                     cartId:
 *                       type: string
 *                       description: ID of the cart used to create the order
 *                     deliveryCompanyId:
 *                       type: string
 *                       description: Selected delivery company ID
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     amountOrder:
 *                       type: number
 *                       description: Total price of the order
 *       400:
 *         description: Bad request, missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid parameters
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart not found
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


router.post("/create", orderController.createOrder);

export default router;