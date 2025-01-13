import express from "express";
import authController from "../controllers/authController";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/auth/signUp:
 *  post:
 *      tags:
 *          - Auth API
 *      summary: Registration with email and password
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: example@gmail.com
 *                          password:
 *                              type: string
 *                  required:
 *                      - email
 *                      - password
 *      responses:
 *          200:
 *              description: Success
 *          400:
 *              description: The body doesn't match the required properties
 *          500:
 *              description: Internal server error
 */
router.post('/signUp', authController.signUp);

export default router;