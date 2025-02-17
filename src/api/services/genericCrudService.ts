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
        await ensureItemExists(Model, '_id', itemId);
        return await Model.findOneAndUpdate({ _id: itemId }, body, { returnDocument: 'after' });
    },

    removeById: async (itemId: string): Promise<string> => {
        await ensureItemExists(Model, '_id', itemId);
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
 * Returns a model item found by the given field and value. Throws a NotFoundError exception if the item doesn't exist with provided field and value (from 'ensureItemExists' method)
 * @param model The model in which the search is performed
 * @param field The field from the model scheme
 * @param value The value of the given field
 */
export async function getItemByField<T>(model: Model<T>, field: keyof T, value: any): Promise<T> {
    await ensureItemExists(model, field, value);
    return await model.findOne({ [field]: value } as Record<string, any>) as T;
}

/**
 * Checks if an item exists with the given field and value
 * @param model The model in which the search is performed
 * @param field The field from the model scheme
 * @param value The value of the given field
 */
export async function ensureItemExists<T>(model: Model<T>, field: keyof T, value: any): Promise<void> {
    if (!await model.exists({ [field]: value } as Partial<T>)) {
        throw new NotFoundError(Model.modelName);
    }
}