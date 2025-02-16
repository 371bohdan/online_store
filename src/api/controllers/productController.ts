import { Request, Response } from "express";
import ImageUploadError from "../errors/general/ImageUploadError";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../middleware/errors/asyncHandler";
import { productService } from "../services/productService";
import MissingParameterError from "../errors/validation/MissingParameterError";
import ApiError from "../errors/ApiError";
//productFilterSort
const productController = {
    productFilterSort: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { title = '', sortBy = '', sort = 'desc' } = req.query as { title?: string, sortBy?: string, sort?: string };
    
        // Перевірка значень sort та sortBy
        const allowedSortBy = ['price', 'createdAt'];
        const allowedSortValues = ['asc', 'desc'];
    
        if (!allowedSortValues.includes(sort)) {
            throw new MissingParameterError(undefined, 'Invalid sort value. Allowed: "asc" or "desc".');
        }
    
        // Перевіряємо, чи всі параметри у sortBy є допустимими
        if (sortBy) {
            const sortFields = sortBy.split(',');
            if (!sortFields.every(field => allowedSortBy.includes(field))) {
                throw new MissingParameterError(undefined, 'Invalid sortBy value. Allowed: "price", "createdAt" or both.');
            }
        }
    
        // Виклик сервісу з параметрами
        const products = await productService.productFilterSort(title, sortBy, sort);
        res.json(products);
    }),


    createProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            title, price, type_candle, size, aroma, appointment, burning_time, 
            short_describe, color, material, shape, features, gift_packaging, stock
        } = req.body;
        const file = req.file;

        if (!file) {
            throw new ImageUploadError(StatusCodes.BAD_REQUEST, 'File is missing');
        }

        const createdProduct = await productService.createProduct(
            title, price, type_candle, size, aroma, appointment, burning_time, 
            short_describe, color, material, shape, features, gift_packaging, stock, file
        );

        res.status(StatusCodes.CREATED).json(createdProduct);
    })
};

export default productController;