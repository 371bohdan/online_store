import { Request, Response } from "express";
import ImageUploadError from "../errors/general/ImageUploadError";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../middleware/errors/asyncHandler";
import { productService } from "../services/productService";
import { SortOrder } from "mongoose";

//productFilterSort
const productController = {
    productFilterSort: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        let { title = '', sortPrice, sortDate } = req.query as {
            title?: string,
            sortPrice?: SortOrder,
            sortDate?: SortOrder
        };

        const products = await productService.productFilterSort(title, sortPrice, sortDate);
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