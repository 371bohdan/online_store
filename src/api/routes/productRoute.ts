import express from "express";
import productController from "../controllers/productController";
import upload from "../middleware/upload/uploadMiddleweare";
import errorHandler from "../middleware/errors/errorHandler";
import Product, { IProduct } from "../models/products";
import { Model } from "mongoose";
import genericCrudRoute from "./genericCrudRoute";

const router: express.Router = express.Router();

// GET /api/products


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Отримати список продуктів з фільтрацією та сортуванням
 *     description: Дозволяє отримати список продуктів з можливістю фільтрації за назвою та сортуванням за ціною або датою створення.
 *     tags:
 *       - products API
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Пошук за назвою продукту (нечіткий пошук)
 *       - in: query
 *         name: sortPrice
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Сортування за ціною (asc - зростання, desc - спадання)
 *       - in: query
 *         name: sortDate
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Сортування за датою створення (asc - старіші перші, desc - новіші перші)
 *     responses:
 *       200:
 *         description: Successful response with filtered and sorted products
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
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   description:
 *                     type: string
 *       400:
 *         description: Невірні параметри сортування
 *       500:
 *         description: Внутрішня помилка сервера
 */

router.get('/', productController.productFilterSort);



/**
 * @swagger
 * paths:
 *   /api/products:
 *     post:
 *       tags:
 *         - products API
 *       summary: Створення нового продукту
 *       consumes:
 *         - multipart/form-data
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Ароматична свічка Лаванда"
 *                 price:
 *                   type: number
 *                   example: 249.99
 *                 stock:
 *                   type: number
 *                   example: 50
 *                 size:
 *                   type: number
 *                   example: 10
 *                 type_candle:
 *                   type: string
 *                   example: "Ароматичні свічки"
 *                   enum: ["Декоративні", "Набори свічок", "Плаваючі", "Розсипні", "Фігурні", "Свічки в баночках", "Класичні", "Ручна робота", "Бездимні", "Ароматичні свічки"]
 *                 aroma:
 *                   type: string
 *                   example: "Ранкова кава"
 *                   enum: ["Ранкова кава", "Вечірня хатка", "Після дощу в лісі", "Теплий хліб", "З дерев'яними гнотами", "Медова теплість", "Свічки без аромату", "Тепле молоко", "Золота осінь", "Свіжість садка", "Літній вечір"]
 *                 appointment:
 *                   type: string
 *                   example: "Для релаксу"
 *                   enum: ["Для декору", "Для релаксу", "Для масажу"]
 *                 burning_time:
 *                   type: string
 *                   example: "40 годин"
 *                 short_describe:
 *                   type: string
 *                   example: "Ароматична свічка з натурального воску"
 *                 color:
 *                   type: string
 *                   example: "Білий"
 *                   enum: ["Зелений", "Червоний", "Чорний", "Кремовий", "Білий", "Золотий", "Пастельні тони"]
 *                 material:
 *                   type: string
 *                   example: "Соєвий віск"
 *                   enum: ["Кокосовий віск", "Бджолиний віск", "Парафін", "Соєвий віск"]
 *                 shape:
 *                   type: string
 *                   example: "Спіральна"
 *                   enum: ["Спіральна", "Квадратна"]
 *                 features:
 *                   type: string
 *                   example: "Еко-дружні"
 *                   enum: ["Натуральні інгредієнти", "Еко-дружні", "Антиалергічні", "Для подарунка", "Для особливих моментів"]
 *                 gift_packaging:
 *                   type: boolean
 *                   example: true
 *                 file:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: binary
 *                   description: Масив файлів-зображень продукту
 *       responses:
 *         201:
 *           description: Продукт успішно створений
 *         400:
 *           description: Некоректний запит або відсутній файл
 *         500:
 *           description: Внутрішня помилка сервера
 */

router.post('/', upload.single('file'), productController.createProduct);

router.use(genericCrudRoute(Product as Model<IProduct>, "products", []));
export default router;


