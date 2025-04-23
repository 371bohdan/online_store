import express from "express";
import productController from "../controllers/productController";
import upload from "../middleware/upload/uploadMiddleweare";
import Product, { IProduct } from "../models/products";
import { Model } from "mongoose";
import genericCrudRoute from "./genericCrudRoute";
import requireAdminOrOwnerRole  from "../middleware/auth/requireAdminOrOwnerRole"
import requireAuth  from "../middleware/auth/requireAdminOrOwnerRole"

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
 *           enum: ["asc", "desc", null]
 *         required: false
 *         description: Сортування за ціною (asc - зростання, desc - спадання)
 *       - in: query
 *         name: sortDate
 *         schema:
 *           type: string
 *           enum: ["asc", "desc", null]
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
 *         content:
 *              application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "Incorrect sort parameters"
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *              application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'     
 */

router.get('/', productController.productFilterSort);



/**
 * @swagger
 * paths:
 *   /api/products:
 *     post:
 *       tags:
 *         - products API
 *       security:
 *         - bearerAuth: []
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
 *                 composition:
 *                   type: string
 *                   example: "Склад: бджолиний віск, лавандовий ефір"
 *                 care:
 *                   type: string
 *                   example: "Термін дії: 2 роки, зберігати в закритому приміщенні"
 *                 gift_packaging:
 *                   type: boolean
 *                   example: true
 *                 season_collection:
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
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Models/Product'
 *         400:
 *           description: Некоректний запит або відсутній файл
 *           content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/ErrorResponse/BadRequest'
 *                              - type: object
 *                                properties:
 *                                  message:
 *                                      example: "Incorrect request or missing file"
 *         500:
 *           description: Внутрішня помилка сервера
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/ErrorResponse/InternalServerError'
 */

router.post('/', requireAdminOrOwnerRole, upload.array('file', 10), productController.createProduct);

/**
 * @swagger
 * paths:
 *   /api/products/{id}:
 *     patch:
 *       summary: Часткове оновлення продукту
 *       tags:
 *         - products API
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             description: ID продукту
 *       requestBody:
 *         required: false
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Назва продукту
 *                   example: undefined
 *                   required: false
 *                 price:
 *                   type: number
 *                   description: Ціна продукту
 *                   example: undefined
 *                   required: false
 *                 type_candle:
 *                   type: string
 *                   description: Тип свічки
 *                   example: undefined
 *                   enum: ["Декоративні", "Набори свічок", "Плаваючі", "Розсипні", "Фігурні", "Свічки в баночках", "Класичні", "Ручна робота", "Бездимні", "Ароматичні свічки"]
 *                   required: false
 *                 size:
 *                   type: number
 *                   description: Розмір свічки
 *                   example: -1
 *                   required: false
 *                 aroma:
 *                   type: string
 *                   example: undefiend
 *                   enum: ["Ранкова кава", "Вечірня хатка", "Після дощу в лісі", "Теплий хліб", "З дерев'яними гнотами", "Медова теплість", "Свічки без аромату", "Тепле молоко", "Золота осінь", "Свіжість садка", "Літній вечір"]
 *                   description: Аромат свічки
 *                   required: false
 *                 appointment:
 *                   type: string
 *                   example: undefiend
 *                   enum: ["Для декору", "Для релаксу", "Для масажу"]
 *                   description: Призначення свічки
 *                   required: false
 *                 burning_time:
 *                   type: string
 *                   description: Час горіння свічки
 *                   example: undefiend
 *                   required: false
 *                 short_describe:
 *                   type: string
 *                   description: Короткий опис продукту
 *                   example: undefiend
 *                   required: false
 *                 color:
 *                   type: string
 *                   description: Колір свічки
 *                   example: undefiend
 *                   enum: ["Зелений", "Червоний", "Чорний", "Кремовий", "Білий", "Золотий", "Пастельні тони"]
 *                   required: false
 *                 material:
 *                   type: string
 *                   description: Матеріал свічки
 *                   example: undefiend
 *                   enum: ["Кокосовий віск", "Бджолиний віск", "Парафін", "Соєвий віск"]
 *                   required: false
 *                 shape:
 *                   type: string
 *                   description: Форма свічки
 *                   example: undefiend
 *                   enum: ["Спіральна", "Квадратна"]
 *                   required: false
 *                 features:
 *                   type: string
 *                   description: Особливості продукту
 *                   example: undefiend
 *                   enum: ["Натуральні інгредієнти", "Еко-дружні", "Антиалергічні", "Для подарунка", "Для особливих моментів"]
 *                   required: false
 *                 composition:
 *                   type: string
 *                   description: Склад свічки
 *                   example: undefiend
 *                   required: false
 *                 care:
 *                   type: string
 *                   description: Догляд за продуктом
 *                   example: undefiend
 *                   required: false
 *                 gift_packaging:
 *                   type: boolean
 *                   description: Наявність подарункової упаковки
 *                   example: undefiend
 *                   required: false
 *                 season_collection:
 *                   type: boolean
 *                   description: Належність до сезонної колекції
 *                   example: undefiend
 *                   required: false
 *                 stock:
 *                   type: number
 *                   description: Кількість в наявності
 *                   example: -1
 *                   required: false
 *                 file:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: undefiend
 *                     format: binary
 *                   description: Завантаження файлів (наприклад, зображень)
 *                   required: false
 *       responses:
 *         202:
 *           description: Продукт успішно змінений
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Models/Product'
 *         404:
 *           description: Продукт не знайдено
 *         500:
 *           description: Внутрішня помилка сервера
 */

router.patch('/:id', requireAdminOrOwnerRole, upload.array('file', 10), productController.updateProduct);


router.use(genericCrudRoute(Product as Model<IProduct>, "products", ['put', 'delete']));
export default router;


