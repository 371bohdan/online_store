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
 *          400:
 *              description: The body doesn't match the required properties
 *          500:
 *              description: Internal server error
 */
router.patch('/:id/role', requireAuth, requireOwnerRole, userController.changeRole);

router.use(genericCrudRoute(User as Model<IUser>, "users", ['get', 'post', 'put', 'delete']));
router.use(errorHandler);
export default router;