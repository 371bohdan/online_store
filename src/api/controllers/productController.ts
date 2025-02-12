import { Request, Response } from "express";
import ImageUploadError from "../errors/general/ImageUploadError";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../middleware/errors/asyncHandler";
import { productService } from "../services/productService";
import MissingParameterError from "../errors/validation/MissingParameterError";
import ApiError from "../errors/ApiError";

const productOptController = {
    searchForName: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { title, sort } = req.query as { title?: string, sort?: string };
        if (!title || !sort) {
            throw new MissingParameterError(undefined, 'Search query is required');
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
        const { title, price, describe, collections, stock } = req.body;
        const file = req.file;

        if (!file) {
            throw new ImageUploadError(StatusCodes.BAD_REQUEST, 'File is missing');
        }

        if (typeof describe !== 'string') {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Невірний формат опису продукту');
        }

        const createdProduct = await productService.createProduct(title, price, describe, collections, stock, file);
        res.status(StatusCodes.CREATED).json(createdProduct);
    })
};

export default productOptController;