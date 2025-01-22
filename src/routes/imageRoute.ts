import express from "express";
import imageController from "../controllers/imageController";
import upload from '../supabase/uploadMiddleweare'

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/image/upload:
 *  post:
 *      tags:
 *          - Images API
 *      summary: Upload an image to the storage
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          file:
 *                              type: string
 *                              format: binary
 *                              description: The image file to upload
 *                          type:
 *                              type: string
 *                              example: avatar
 *                              description: Type of the image (avatar, post)
 *                          referenceId:
 *                              type: string
 *                              example: 12345
 *                              description: Reference ID related to the image
 *                  required:
 *                      - file
 *                      - type
 *                      - referenceId
 *      responses:
 *          201:
 *              description: Image uploaded successfully
 *          400:
 *              description: Missing required fields or invalid input
 *          500:
 *              description: Internal server error
 */
router.post('/upload', upload.single('file'), imageController.uploadImage);

/**
 * @swagger
 * /api/images/{id}:
 *  delete:
 *      tags:
 *          - Images API
 *      summary: Delete an image by ID
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: ID of the image to delete
 *      responses:
 *          200:
 *              description: Image deleted successfully
 *          404:
 *              description: Image not found
 *          500:
 *              description: Internal server error
 */
router.delete('/:id', imageController.deleteImage);

/**
 * @swagger
 * /api/images/type/{type}:
 *  get:
 *      tags:
 *          - Images API
 *      summary: Retrieve images by type
 *      parameters:
 *          - in: path
 *            name: type
 *            required: true
 *            schema:
 *              type: string
 *            description: Type of the images to retrieve (e.g., avatar, post)
 *      responses:
 *          200:
 *              description: Successfully retrieved images
 *          400:
 *              description: Invalid image type
 *          500:
 *              description: Internal server error
 */
router.get('/type/:type', imageController.getImagesByType);

export default router;