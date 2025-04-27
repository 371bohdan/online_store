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
        const files = req.files as Express.Multer.File[];
        const productData = req.body;

        if (!files || files.length === 0) {
            throw new ImageUploadError(StatusCodes.BAD_REQUEST, 'Files are missing');
        }

        const createdProduct = await productService.createProduct(productData, files);
        res.status(StatusCodes.CREATED).json(createdProduct);
    }),

    getProductById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const productId = req.params.id;
        const gettedProduct = await productService.getProductById(productId);
        res.status(StatusCodes.OK).json(gettedProduct)
    }),
    updateProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const productId = req.params.id;
        const updateData = req.body;
        const files = req.files as Express.Multer.File[] | undefined;
        
        const updatedProduct = await productService.updateProduct(productId, updateData, files);
        res.status(StatusCodes.ACCEPTED).json(updatedProduct)
    }),
    deleteProduct: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const productId = req.params.id;
        await productService.deleteProduct(productId);
        res.sendStatus(StatusCodes.NO_CONTENT); 
    })
};

export default productController;