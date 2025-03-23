import express from 'express';
import { stripeController } from './stripeController';
import errorHandler from '../../api/middleware/errors/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/stripe/create-payment:
 *  post:
 *      tags:
 *          - stripe API
 *      summary: Online payment
 *      description: | 
 *          The Stripe working in test mode. <br>
 *          <strong>✅ Successful Payment:</strong>
 *              <ul>
 *                  <li>Visa: 4242 4242 4242 4242</li>
 *                  <li>Mastercard: 5555 5555 5555 4444</li>
 *                  <li>American Express: 3782 822463 10005</li>
 *                  <li>Discover: 6011 1111 1111 1117</li>
 *              </ul>
 * 
 *          <strong>❌ Declined Payment:</strong>
 *              <ul>
 *                  <li>Insufficient funds: 4000 0000 0000 9995</li>
 *                  <li>Card declined: 4000 0000 0000 0002</li>
 *                  <li>Incorrect CVC: 4000 0000 0000 0127</li>
 *                  <li>Expired card: 4000 0000 0000 0069</li>
 *              </ul>
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          productName:
 *                              type: string
 *                              example: Свічка Square (2 pieces)
 *                          price:
 *                              type: number
 *                              example: 1000
 *                          orderId:
 *                              type: string
 *                      required:
 *                          - productName
 *                          - amount
 *                          - orderId
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Stripe/PaymentSession'
 *          400:
 *              description: The body doesn't match the required properties or the email already used
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *          404:
 *              description: The order not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/NotFound'
 *          500:
 *              description: Internal server error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */
router.post('/create-payment', stripeController.createPayment);
router.use(errorHandler);

export default router;