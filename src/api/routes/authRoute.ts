import express from "express";
import { authController } from "../controllers/authController";
import errorHandler from "../middleware/errors/errorHandler";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/auth/signUp:
 *  post:
 *      tags:
 *          - auth API
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
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Message'
 *          400:
 *              description: The body doesn't match the required properties or the email already used
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *          500:
 *              description: Internal server error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/signUp', authController.signUp);

/**
 * @swagger
 * /api/auth/passwordRecovery:
 *  post:
 *      tags:
 *          - auth API
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
 *              description: Success or wrong email (decided to hide this error for more users safety)
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Message'
 *          500:
 *              description: Internal server error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/passwordRecovery', authController.passwordRecovery);

/**
 * @swagger
 * /api/auth/verifyEmail/{id}:
 *  get:
 *      tags:
 *          - auth API
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
 *              description: Success or wrong verification code (decided to hide this error for more users safety)
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Message'
 *          400:
 *              description: The verification code has expired (its duration - 10m)
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "The time of the given activation code has expired. Please, request a new one"
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.get('/verifyEmail/:id', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification-letter:
 *  post:
 *      tags:
 *          - auth API
 *      summary: Regenerate a verification code and send it to a given email
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
 *              description: Success or wrong email address (decided to hide this error for more users safety)
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Message'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/resend-verification-letter', authController.resendVerificationLetter);

/**
 * @swagger
 * /api/auth/confirm/{id}:
 *  post:
 *      tags:
 *          - auth API
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
 *              description: Success or wrong recovery code (decided to hide this error for more users safety)
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Message'
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
 *                                      example: "password: invalid format"
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/confirm/:id', authController.confirmPasswordRecovery);

/**
 * @swagger
 * /api/auth/signIn:
 *  post:
 *      tags:
 *          - auth API
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
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Token'
 *          401:
 *              description: Incorrect incoming data (email or password).
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/Unauthorised'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "Incorrect incoming data (email or password)"
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/signIn', authController.signIn);

/**
 * @swagger
 * /api/auth/refresh:
 *  post:
 *      tags:
 *          - auth API
 *      summary: Refresh existing token (re-create refresh token and return access token)
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AuthApi/Token'
 *          401:
 *              description: Unauthorised
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/Unauthorised'
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *  post:
 *      tags:
 *          - auth API
 *      summary: Log out from current account
 *      responses:
 *          204:
 *              description: Success
 *          500:
 *              description: Internal server error
 *              content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/logout', authController.logout);
router.use(errorHandler);

export default router;