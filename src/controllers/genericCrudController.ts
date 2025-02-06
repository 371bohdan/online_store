import { Request, Response } from "express";
import { Document, Model } from "mongoose";
import { NotFoundError } from "../errors/ApiError";
import { getTheSwaggerSchema } from "../routes/genericCrudRoute";

const genericCrudController = <T extends Document>(Model: Model<T>) => ({
    getAll: async (req: Request, res: Response): Promise<void> => {
        const items = await Model.find();
        res.json(items);
    },

    getById: async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!await Model.exists({ _id: id })) {
            throw new NotFoundError(Model.modelName);
        }

        const item = await Model.findById(id);
        res.json(item);
    },

    create: async (req: Request, res: Response): Promise<void> => {
        const item = new Model(req.body);
        const filteredData = getFilteredData(Model.modelName, req.body);
        res.status(201).json(await Model.create(filteredData));
    },

    update: async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!await Model.exists({ _id: id })) {
            throw new NotFoundError(Model.modelName);
        }

        const updatedItem = await Model.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
        res.json(updatedItem);
    },

    removeById: async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!await Model.exists({ _id: id })) {
            throw new NotFoundError(Model.modelName);
        }

        await Model.findByIdAndDelete(id);
        res.send(`${Model.modelName} with id '${id}' was successfully removed.`)
    },

    removeAll: async (req: Request, res: Response): Promise<void> => {
        await Model.deleteMany({});
        res.send('success');
    }
})

function getFilteredData(modelName: string, body: any): Object {
    if (modelName.endsWith('y', modelName.length)) {
        modelName = modelName.substring(0, modelName.length - 1).concat('ie');
    }

    modelName = modelName.toLowerCase().concat('s');
    const swaggerSchema = getTheSwaggerSchema(modelName);
    const allowedFields = Object.keys(swaggerSchema.properties);
    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );
}

export default genericCrudController;