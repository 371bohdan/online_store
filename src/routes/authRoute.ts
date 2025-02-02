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
 *          description: | 
 *              <strong>Email:</strong> unique, 10-40 characters, and match to the general email format. <br>
 *              <strong>Password:</strong> 8-20 characters, according to the password format (must contain at least 1 letter in the upper register and at least 1 number)
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
 *                              example: String123
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

/**
 * @swagger
 * /api/auth/verifyEmail/{id}:
 *  get:
 *      tags:
 *          - Auth API
 *      summary: User email confirmation
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: Type a verification code in the line below
 *      responses:
 *          200:
 *              description: Success
 *          404:
 *              description: User not found
 *          500:
 *              description: Internal server error
 */
router.get('/verifyEmail/:id', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/confirm/{id}:
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
 *            description: Type a verification code in the line below
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
router.post('/confirm/:id', authController.confirmAccountRecovery);

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
 *                              example: String123
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