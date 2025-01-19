import express from "express";
import productOptController from "../controllers/productOptController";

const router: express.Router = express.Router();

// GET /api/productopt/title?title=example

/**
 * @swagger
 * /api/productopt/title:
 *   get:
 *     tags:
 *       - Search title API
 *     summary: Search for title products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: The title or part of the title to search for
 *     responses:
 *       200:
 *         description: Success
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
 * /api/productopt/sort:
 *   get:
 *     tags:
 *       - Sort for price
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

export default router;