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
 *                      required:
 *                          - email
 *                          - password
 *      responses:
 *          200:
 *              description: Success
 *          400:
 *              description: The body doesn't match the required properties
 *          500:
 *              description: Internal server error
 */
router.post('/signUp', authController.signUp);

/**
 * @swagger
 * /api/auth/accountRecovery:
 *  post:
 *      tags:
 *          - Auth API
 *      summary: Sending the email with the URI to restore the user account
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
 *                  required:
 *                      - email
 *      responses:
 *          200:
 *              description: Success
 *          400:
 *              description: The body doesn't match the required properties
 *          500:
 *              description: Internal server error
 */
router.post('/accountRecovery', authController.accountRecovery);

//working all (registr) except verify method (doesn't work properly)

/**
 * @swagger
 * /api/auth/verify/{id}:
 *  post:
 *      tags:
 *          - Auth API
 *      summary: Checking the recovery code and changing the password
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: Type a new password in the line below
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          password:
 *                              type: string
 *                  required:
 *                      - password
 *      responses:
 *          200:
 *              description: Success
 *          400:
 *              description: The body doesn't match the required properties
 *          404:
 *              description: User not found
 *          500:
 *              description: Internal server error
 */
router.post('/verify/:id', authController.verifyAndChangePassword);

/**
 * @swagger
 * /api/auth/signIn:
 *  post:
 *      tags:
 *          - Auth API
 *      summary: account login
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
 *              description: Incorrect incoming data (email or password).
 *          500:
 *              description: Internal server error
 */
router.post('/signIn', authController.signIn);

export default router;