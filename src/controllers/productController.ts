import { Request, Response } from "express";
import Product from "../models/products";
import supabase from "../supabase/supabaseService";
import { ENV } from '../dotenv/env';



const uploadAndGetUrl = async (req: Request, res: Response): Promise<string | null> => {
    if (!req.file) {
        res.status(400).json({ error: 'File is missing' });
        return null;
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;

    const { data, error } = await supabase
        .storage
        .from(ENV.SUPABASE_BUCKET_NAME)
        .upload(fileName, req.file.buffer, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error upon upload to Supabase:', error);
        res.status(500).json({ error: 'Error upload file' });
        return null;
    }

    const { data: publicUrlData } = supabase.storage.from(ENV.SUPABASE_BUCKET_NAME).getPublicUrl(fileName);

    return publicUrlData.publicUrl;
};



// default title = "", sort="asc";
const productOptController = {
    searchForName: async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, sort } = req.query;

            if (!title || typeof title !== "string") {
                res.status(400).json({ message: "Search query is required and must be a string" });
                return;
            }

            
            let query = Product.find({
                title: new RegExp(`^${title}`, "i"), // ^ - початок рядка
            });

            if (sort) {
                query = query.sort({
                    price: sort === "asc" ? 1 : -1,
                });
            }

            const products = await query;
            res.status(200).json(products);
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

            
            const products = await Product.find().sort({
                price: sort === "asc" ? 1 : -1, // 1 - за зростанням, -1 - за спаданням
            });

            res.status(200).json(products);
        } catch (error) {
            console.error("Error sorting products by price:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    },createProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, price, describe, collections, stock } = req.body;
    
            if (!req.file) {
                res.status(400).json({ message: 'Файл для завантаження відсутній' });
                return;
            }
    
            const imageUrl = await uploadAndGetUrl(req, res);
            if (!imageUrl) return;
    

            let parsedDescribe = describe;
            if (typeof describe === 'string') {
                try {
                    parsedDescribe = JSON.parse(describe); 
                } catch (e) {
                    res.status(400).json({ message: 'Невірний формат опису продукту' });
                    return;
                }
            }
    
            const data = new Product({
                title,
                price,
                describe: parsedDescribe, 
                collections,
                stock,
                image: imageUrl
            });
    
            const newProduct = await Product.create(data);
            res.status(201).json(newProduct);
    
        } catch (e) {
            console.error('Помилка при збереженні продукту в базі:', e);
            res.status(500).json({ message: 'Internal server error', error: e });
        }
    }
};

export default productOptController;