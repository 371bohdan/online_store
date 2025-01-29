import express from "express";
import productOptController from "../controllers/productOptController";
import upload from "../supabase/uploadMiddleweare";

const router: express.Router = express.Router();

// GET /api/productopt/title

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
router.get('/title', productOptController.searchForName);



// GET /api/productopt/sort?sort=asc
// GET /api/productopt/sort?sort=desc

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


router.get('/sort', productOptController.sortForPrice);



// /**
//  * @swagger
//  * /api/productopt/upload:
//  *   get:
//  *     tags:
//  *       - Products API
//  *     summary: completed download to Supabase bucket
//  *     parameters:
//  *       - in: query
//  *         name: sort
//  *         schema:
//  *           type: string
//  *           enum: [asc, desc]
//  *         required: true
//  *         description: Sort order for price (asc or desc)
//  *     responses:
//  *       200:
//  *         description: Success
//  *       400:
//  *         description: The query parameter is missing or invalid
//  *       500:
//  *         description: Internal server error
//  */

export default router;

// Завантаження зображення
// router.post('/upload', upload.single('file'), productOptController.uploadImage);