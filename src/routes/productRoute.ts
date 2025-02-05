import express from "express";
import productController from "../controllers/productController";
import upload from "../supabase/uploadMiddleweare";
import { Model } from 'mongoose';
import Product, { IProduct } from '../models/products';
import genericCrudRoute from './genericCrudRoute';

const router: express.Router = express.Router();

// GET /api/products/title

/**
 * @swagger
 * /api/products/title:
 *   get:
 *     tags:
 *       - products API
 *     summary: Search for products by title
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: true
 *         description: The title or part of the title to search for
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Sort order for the price. Use "asc" for ascending or "desc" for descending.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   price:
 *                     type: number
 *                   description:
 *                     type: string
 *       400:
 *         description: The query parameter is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/title', productController.searchForName);



// GET /api/products/sort?sort=asc
// GET /api/products/sort?sort=desc

/**
 * @swagger
 * /api/products/sort:
 *   get:
 *     tags:
 *       - products API
 *     summary: Sort products by price
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: true
 *         description: Sort order for price (asc or desc)
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: The query parameter is missing or invalid
 *       500:
 *         description: Internal server error
 */


router.get('/sort', productController.sortForPrice);




/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - products API
 *     summary: Create a new product
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Ароматична свічка Лаванда"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 249.99
 *               describe:
 *                 type: object
 *                 properties:
 *                   aroma:
 *                     type: string
 *                     example: "Лаванда"
 *                   burning_time:
 *                     type: string
 *                     example: "40 годин"
 *                   short_describe:
 *                     type: string
 *                     example: "Ароматична свічка з натурального воску"
 *               collections:
 *                 type: string
 *                 enum: [summer, spring, autumn, winter]
 *                 example: "spring"
 *               stock:
 *                 type: number
 *                 minimum: 0
 *                 example: 50
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Масив файлів-зображень продукту
 *     responses:
 *       201:
 *         description: Продукт успішно створений
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65a123abc456def789"
 *                 title:
 *                   type: string
 *                   example: "Ароматична свічка Лаванда"
 *                 price:
 *                   type: number
 *                   example: 249.99
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "https://xyz.supabase.co/storage/v1/object/public/products/1706789123456_image.jpg"
 *                 describe:
 *                   type: object
 *                   properties:
 *                     aroma:
 *                       type: string
 *                       example: "Лаванда"
 *                     burning_time:
 *                       type: string
 *                       example: "40 годин"
 *                     short_describe:
 *                       type: string
 *                       example: "Ароматична свічка з натурального воску"
 *                 collections:
 *                   type: string
 *                   enum: [summer, spring, autumn, winter]
 *                   example: "spring"
 *                 stock:
 *                   type: number
 *                   example: 50
 *       400:
 *         description: Некоректний запит або відсутній файл
 *       500:
 *         description: Внутрішня помилка сервера
 */

router.post('/', upload.single('file'), productController.createProduct);

export default router;


