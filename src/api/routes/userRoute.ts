import express from 'express';
import { requireOwnerRole } from '../middleware/auth/requireOwnerRole';
import { userController } from '../controllers/userConroller';
import errorHandler from '../middleware/errors/errorHandler';
import genericCrudRoute from './genericCrudRoute';
import User, { IUser } from '../models/users';
import { Model } from 'mongoose';
import requireAuth from '../middleware/auth/requireAuth';

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/users/{id}/role:
 *  patch:
 *      tags:
 *          - users API
 *      summary: Change the user role
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: Enter a user ID, whose role you want to change
 *      requestBody:
 *          required: true
 *          description: | 
 *              <strong>Role:</strong> 'user', 'admin' <br>
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          role:
 *                              type: string
 *                              example: user
 *                  required:
 *                      - role
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/User'
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
 *                                      example: "Incorrect role name"
 *          404:
 *              descriptionn: The user not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/NotFound'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "The user not found"
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.patch('/:id/role', requireAuth, requireOwnerRole, userController.changeRole);

/**
 * @swagger
 * /api/users/roles:
 *  get:
 *      tags:
 *          - users API
 *      summary: Get all available user roles
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
router.get('/roles', requireAuth, requireOwnerRole, userController.getAllRoles);

router.use(genericCrudRoute(User as Model<IUser>, "users", ['get', 'post', 'put', 'delete']));
router.use(errorHandler);
export default router;