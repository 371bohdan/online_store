"use strict";
// import { Request, Response } from "express";
// import { Document, Model } from "mongoose";
// const genericCrudController = <T extends Document>(Model: Model<T>) => ({
//     getAll: async (req: Request, res: Response): Promise<void> => {
//         const items = await Model.find();
//         res.json(items);
//     },
//     getById: async (req: Request, res: Response): Promise<void> => {
//         const { id } = req.params;
//         const item = await Model.findById(id);
//         res.json(item);
//     },
//     create: async (req: Request, res: Response): Promise<void> => {
//         const item = new Model(req.body);
//         res.json(await Model.create(item));
//     },
//     update: async (req: Request, res: Response): Promise<void> => {
//         const { id } = req.params;
//         const updatedItem = await Model.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
//         res.json(updatedItem);
//     },
//     removeById: async (req: Request, res: Response): Promise<void> => {
//         const { id } = req.params;
//         await Model.findByIdAndDelete(id);
//         res.send(`The '${id}' object was successfully removed.`)
//     },
//     removeAll: async (req: Request, res: Response): Promise<void> => {
//         await Model.deleteMany({});
//         res.send('success');
//     }
// })
// export default genericCrudController;
