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
 * /api/orders:
 *   post:
 *     tags:
 *       - orders API
 *     summary: Create an order based on the cart
 *     description: Need to provide a product array if the user is not authorised or doesn't have a cart of products. Otherwise, the user's cart will be used.
 *          Payment method = cash or online payment. The "isCallRestricted" and "notes" fields are optional. Default value for the 'isCallRestricted' field is 
 *          'false' (Boolean).
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the client
 *               lastName:
 *                 type: string
 *                 description: Last name of the client
 *               phoneNumber:
 *                 type: string
 *                 description: Client's phone number
 *                 example: 380123456789
 *               email:
 *                 type: string
 *                 description: Client's email address
 *                 example: example@gmail.com
 *               paymentMethod: 
 *                 type: string
 *                 example: cash
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
 *               delivery:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                     example: self_pickup
 *                   address:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                         example: Kyiv
 *                       department:
 *                         type: string
 *                         example: 4
 *               isCallRestricted:
 *                 type: boolean
 *                 example: true
 *               notes:
 *                 type: string
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - email
 *               - products
 *               - paymentMethod
 *               - delivery
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Dto/OrderDto'
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
router.post("/", orderController.createOrder);

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
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Enum'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
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
 *              <strong>Status:</strong> 'processing', 'accepted', 'on the way', 'delivered', 'received', 'return', 'canceled' <br>
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
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/OrderDto'
 *          400:
 *              description: The body doesn't match the required properties
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "Incorrect status"
 *          404:
 *              description: The order not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/NotFound'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "The order not found."
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.patch('/:id/status', requireAuth, requireAdminOrOwnerRole, orderController.changeStatus);

/**
 * @swagger
 * /api/orders/successfulPayment:
 *  get:
 *      tags:
 *          - orders API
 *      summary: if payment success
 *      parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: session id
 *      responses:
 *          200:
 *              description: Payment was successful
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/OrderDto'
 *          404:
 *              description: The session not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/NotFound'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.get('/successfulPayment', orderController.successfulPayment);

/**
 * @swagger
 * /api/orders/unsuccessfulPayment:
 *  get:
 *      tags:
 *          - orders API
 *      summary: if payment unsuccess
 *      parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: session id
 *      responses:
 *          200:
 *              description: Payment cancelled
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/OrderDto'
 *          404:
 *              description: The session not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/NotFound'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'      
 */
router.get('/unsuccessfulPayment', orderController.unsuccessfulPayment);

/**
 * @swagger
 * /api/orders/statistics:
 *  get:
 *      tags:
 *          - orders API
 *      summary: returns order statistics for the entered start and end dates.
 *      description: date format - dd.mm.yyyy. Orders with the status 'cancelled' or 'return' aren't included in the 'mostPurchasedProducts' and 'salesScheduleInfo' info.
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: end date
 *      responses:
 *          200:
 *              description: Payment cancelled
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/OrderStatDto'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'  
 */
router.get('/statistics', requireAuth, requireAdminOrOwnerRole, orderController.statistics);

router.use(genericCrudRoute(Order as Model<IOrder>, "orders", ['put', 'delete']));
router.use(errorHandler);

export default router;