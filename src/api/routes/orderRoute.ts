import express from "express";
import orderController from "../controllers/orderController";
import errorHandler from "../middleware/errors/errorHandler";
import genericCrudRoute from "./genericCrudRoute";
import Order, { IOrder } from "../models/orders";
import { Model } from "mongoose";
import requireAuth from "../middleware/auth/requireAuth";
import requireAdminOrOwnerRole from "../middleware/auth/requireAdminOrOwnerRole";

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
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Product ID
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product
 *             required:
 *               - deliveryCompanyId
 *               - firstName
 *               - lastName
 *               - telephone
 *               - email
 *               - products
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

/**
 * @swagger
 * /api/orders/statuses:
 *  get:
 *      tags:
 *          - orders API
 *      summary: Get all available order statuses
 *      security:
 *       - bearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *          500:
 *              description: Internal server error
 */
router.get('/statuses', requireAuth, orderController.getAllStatuses);

/**
 * @swagger
 * /api/orders/{id}/status:
 *  patch:
 *      tags:
 *          - orders API
 *      summary: Change the status of order
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: Enter an order ID, whose status you want to change
 *      requestBody:
 *          required: true
 *          description: | 
 *              <strong>Status:</strong> 'processing', 'accepted', 'sent', 'received', 'canceled' <br>
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          status:
 *                              type: string
 *                              example: processing
 *                  required:
 *                      - status
 *      responses:
 *          200:
 *              description: Success
 *          400:
 *              description: The body doesn't match the required properties
 *          500:
 *              description: Internal server error
 */
router.patch('/:id/status', requireAuth, requireAdminOrOwnerRole, orderController.changeStatus);

/**
 * @swagger
 * /api/orders/statuses:
 *  get:
 *      tags:
 *          - orders API
 *      summary: Get all available order statuses
 *      security:
 *       - bearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *          500:
 *              description: Internal server error
 */
router.get('/statuses', requireAuth, orderController.getAllStatuses);

/**
 * @swagger
 * /api/orders/{id}/status:
 *  patch:
 *      tags:
 *          - orders API
 *      summary: Change the status of order
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: Enter an order ID, whose status you want to change
 *      requestBody:
 *          required: true
 *          description: | 
 *              <strong>Status:</strong> 'processing', 'accepted', 'sent', 'received', 'canceled' <br>
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          status:
 *                              type: string
 *                              example: processing
 *                  required:
 *                      - status
 *      responses:
 *          200:
 *              description: Success
 *          400:
 *              description: The body doesn't match the required properties
 *          500:
 *              description: Internal server error
 */
router.patch('/:id/status', requireAuth, requireAdminOrOwnerRole, orderController.changeStatus);

router.use(genericCrudRoute(Order as Model<IOrder>, "orders", ['put', 'delete']));
router.use(errorHandler);

export default router;