import { Request, Response } from "express";
import Product from "../models/products";

const productOptController = {
    searchForName: async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, sort } = req.query;

            if (!title || typeof title !== "string") {
                res.status(400).json({ message: "Title query is required and must be a string" });
                return;
            }

            // Пошук за назвою та сортуванням, якщо параметр сортування є
            let query = Product.find({
                title: new RegExp(`^${title}`, "i"), // ^ - початок рядка
            });

            if (sort) {
                query = query.sort({
                    price: sort === "asc" ? 1 : -1,
                });
            }


            res.status(200).json(query);
        } catch (error) {
            console.error("Error searching for products by title:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    },
    sortForPrice: async (req: Request, res: Response): Promise<void> => {
        try {
            const { sort } = req.query;

            if (!sort || (sort !== "asc" && sort !== "desc")) {
                res.status(400).json({
                    message: "Sort query is required and must be 'asc' or 'desc'",
                });
                return;
            }

            // Сортування продуктів за полем price
            const products = await Product.find().sort({
                price: sort === "asc" ? 1 : -1, // 1 - за зростанням, -1 - за спаданням
            });

            res.status(200).json(products);
        } catch (error) {
            console.error("Error sorting products by price:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }
};

export default productOptController;
