import express from 'express';
import requireAuth from '../middleware/auth/requireAuth';
import { userSelfAccessController } from '../controllers/userSelfAccessController';

const router = express.Router();

/**
 * @swagger
 * /api/user-self-access/profile:
 *  get:
 *      tags:
 *          - user self access API
 *      summary: get own profile
 *      security:
 *       - bearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/UserDto'
 *          404:
 *              description: User not found
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/NotFound'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.get('/profile', requireAuth, userSelfAccessController.getProfile);

/**
 * @swagger
 * /api/user-self-access/profile:
 *  patch:
 *      tags:
 *          - user self access API
 *      summary: update own profile. 
 *      description: The firstName and lastName fields must always  be filled with the user's most recent data (if exist).
 *          The password field only needs to be filled in if the user enters a new password (otherwise, don't include it in the request body).
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          password:
 *                              type: string
 *                              example: String123
 *                          firstName:
 *                              type: string
 *                              example: FirstName
 *                          lastName:
 *                              type: string
 *                              example: LastName
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/UserDto'
 *          404:
 *              description: User not found
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/NotFound'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.patch('/profile', requireAuth, userSelfAccessController.updateProfile)

/**
 * @swagger
 * /api/user-self-access/cart:
 *  get:
 *      tags:
 *          - user self access API
 *      summary: get own cart
 *      security:
 *       - bearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/CartDto'
 *          404:
 *              description: User not found
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/NotFound'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.get('/cart', requireAuth, userSelfAccessController.getCart);

/**
 * @swagger
 * /api/user-self-access/orders:
 *  get:
 *      tags:
 *          - user self access API
 *      summary: get own orders
 *      security:
 *       - bearerAuth: []
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Dto/OrderDto'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.get('/orders', requireAuth, userSelfAccessController.getOrders)

//router.use(errorHandler);
export default router;