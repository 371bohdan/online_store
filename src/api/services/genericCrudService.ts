import { Document, HydratedDocument, Model } from "mongoose";
import NotFoundError from "../errors/general/NotFoundError";
import { swaggerService } from "./auxiliary/swaggerService";

export const genericCrudService = <T extends Document>(Model: Model<T>) => ({

    getAll: async (): Promise<Array<HydratedDocument<T>>> => {
        return await Model.find();
    },

    getById: async (itemId: string): Promise<HydratedDocument<T>> => {
        const item = await Model.findById(itemId);
        if (!item) {
            throw new NotFoundError(Model.modelName);
        }

        return item;
    },

    create: async (body: Array<String>): Promise<HydratedDocument<T>> => {
        const filteredData = getFilteredData(Model.modelName, body);
        return await Model.create(filteredData);
    },

    update: async (itemId: string, body: Array<String>): Promise<HydratedDocument<T> | null> => {
        // const item = genericCrudService(Model).getById(itemId);
        await ensureItemExists(itemId, Model);
        return await Model.findOneAndUpdate({ _id: itemId }, body, { returnDocument: 'after' });
    },

    removeById: async (itemId: string): Promise<string> => {
        await ensureItemExists(itemId, Model);
        await Model.findByIdAndDelete(itemId);
        return `${Model.modelName} with id '${itemId}' was successfully removed.`
    },

    removeAll: async (): Promise<void> => {
        await Model.deleteMany({});
    }
})

/**
 * Removes superfluous fields, that aren't pointed to in a Swagger schema (by model).
 * @param modelName The name of a model, used to find the right swagger scheme
 * @param body Fields that need to be sorted
 * @returns Object containing permitted fields (as specified in the corresponding Swagger schema)
 */
function getFilteredData(modelName: string, body: any): Object {
    if (modelName.endsWith('y', modelName.length)) {
        modelName = modelName.substring(0, modelName.length - 1).concat('ie');
    }

    modelName = modelName.toLowerCase().concat('s');
    const swaggerSchema = swaggerService.getTheSwaggerSchema(modelName);
    const allowedFields = Object.keys(swaggerSchema.properties);
    return Object.fromEntries(
        Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );
}

/**
 * Checks if an item with the given ID exists 
 * @param itemId The ID of an item to be checked
 * @throws The NotFoundError if an item with the given ID doesn't exist
 */
async function ensureItemExists(itemId: string, model: Model<any>): Promise<void> {
    if (!await model.exists({ _id: itemId })) {
        throw new NotFoundError(Model.modelName);
    }
}