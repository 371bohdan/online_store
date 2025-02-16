import { Request, Response } from "express";
import ImageUploadError from "../errors/general/ImageUploadError";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../middleware/errors/asyncHandler";
import { productService } from "../services/productService";
import MissingParameterError from "../errors/validation/MissingParameterError";
import ApiError from "../errors/ApiError";

const productOptController = {
    searchForName: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { title = '', sort = 'asc' } = req.query as { title?: string, sort?: string };
        if (sort !== 'asc' && sort !== 'desc') {
            throw new MissingParameterError(undefined, 'Sort query is required');
        }

        const products = await productService.searchForName(title, sort);
        res.json(products);
    }),

    sortForPrice: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { sort } = req.query;
        if (!sort || (sort !== "asc" && sort !== "desc")) {
            throw new MissingParameterError(undefined, "Sort query is required and must be 'asc' or 'desc'");
        }

        const products = await productService.sortForPrice(sort);
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

export default productOptController;