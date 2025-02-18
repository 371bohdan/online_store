import { swaggerOptions } from "../../../config/swagger/swaggerOptions";
import { cartSwaggerSchema } from "../../models/carts";
import { deliverySwaggerSchema } from "../../models/deliveries";
import { orderSwaggerSchema } from "../../models/orders";
import { productSwaggerSchema } from "../../models/products";
import { userSwaggerSchema } from "../../models/users";

export const swaggerService = {
    /**
     * Adds dynamic Swagger comments (docs) for generic CRUD methods
     * @param modelName The name of a model, for use in comments
     * @param methodsToSecure The array of method names (such as: 'get', 'post', etc.) that must be secured by the application authorisation (bearer token)
     */
    addDynamicSwaggerDocs: (modelName: string, methodsToSecure: Array<string>): void => {
        const modelNameSingular: string = modelName.substring(0, modelName.length - 1);
        const swaggerSchema = swaggerService.getTheSwaggerSchema(modelName);
        delete swaggerSchema.properties._id   //removing _id property for model Object

        // /api/${modelName}
        if (swaggerOptions.paths[`/api/${modelName}`]) {
            const overriddenMethods = Object.keys(swaggerOptions.paths[`/api/${modelName}`]);

            if (!overriddenMethods.includes('get')) {
                addSwaggerToGetMethod(modelName, methodsToSecure.includes('get'));
            }

            if (!overriddenMethods.includes('post')) {
                addSwaggerToPostMethod(modelName, modelNameSingular, swaggerSchema, methodsToSecure.includes('post'));
            }

            if (!overriddenMethods.includes('delete')) {
                addSwaggerToDeleteMethod(modelName, methodsToSecure.includes('delete'));
            }

        } else {
            swaggerOptions.paths[`/api/${modelName}`] = {};
            addSwaggerToGetMethod(modelName, methodsToSecure.includes('get'));
            addSwaggerToPostMethod(modelName, modelNameSingular, swaggerSchema, methodsToSecure.includes('post'));
            addSwaggerToDeleteMethod(modelName, methodsToSecure.includes('delete'));
        }

        // /api/${modelName}/:id
        if (swaggerOptions.paths[`/api/${modelName}/{id}`]) {
            const overriddenMethods = Object.keys(swaggerOptions.paths[`/api/${modelName}/{id}`]);

            if (!overriddenMethods.includes('get')) {
                addSwaggerToGetByIdMethod(modelName, modelNameSingular, methodsToSecure.includes('get'));
            }

            if (!overriddenMethods.includes('put')) {
                addSwaggerToPutMethod(modelName, modelNameSingular, swaggerSchema, methodsToSecure.includes('put'));
            }

            if (!overriddenMethods.includes('delete')) {
                addSwaggerToDeleteByIdMethod(modelName, modelNameSingular, methodsToSecure.includes('delete'));
            }

        } else {
            swaggerOptions.paths[`/api/${modelName}/{id}`] = {};
            addSwaggerToGetByIdMethod(modelName, modelNameSingular, methodsToSecure.includes('get'));
            addSwaggerToPutMethod(modelName, modelNameSingular, swaggerSchema, methodsToSecure.includes('put'));
            addSwaggerToDeleteByIdMethod(modelName, modelNameSingular, methodsToSecure.includes('delete'));
        }
    },

    /**
     * Returns a Swagger schema of the given model (by model name)
     * @param modelName The name of a model
     * @throws Error exception if the provided model name doesn't match
     */
    getTheSwaggerSchema: (modelName: String) => {
        switch (modelName) {
            case 'users':
                delete userSwaggerSchema.properties.recoveryCode;
                delete userSwaggerSchema.properties.role;
                delete userSwaggerSchema.properties.verificationCode;
                delete userSwaggerSchema.properties.refreshToken;
                delete userSwaggerSchema.properties.isVerified;
                return userSwaggerSchema;
            case 'products':
                return productSwaggerSchema;
            case 'carts':
                return cartSwaggerSchema;
            case 'deliveries':
                return deliverySwaggerSchema;
            case 'orders':
                return orderSwaggerSchema;
            default:
                throw new Error(`Swagger schema not defined for model: ${modelName}`);
        }
    }
}

/**
 * Adds a dynamic comment to the GET method (on the given model (by modelName))
 * @param modelName The name of a model
 * @param isSecured The boolean property indicates whether this method must be protected or not
 */
function addSwaggerToGetMethod(modelName: string, isSecured: boolean) {
    swaggerOptions.paths[`/api/${modelName}`]['get'] = {
        tags: [`${modelName} API`],
        summary: `Get the list of ${modelName}`,
        responses: {
            200: {
                description: "Success"
            },
            500: {
                description: 'Internal server error'
            }
        }
    }

    if (isSecured) {
        swaggerOptions.paths[`/api/${modelName}`]['get'] = {
            ...swaggerOptions.paths[`/api/${modelName}`]['get'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }
}

/**
 * Adds a dynamic comment to the POST method (on the given model (by modelName))
 * @param modelName The name of a model
 * @param modelNameSingular The name of a model in the singular
 * @param swaggerSchema The schema showing which fields are required for a current model
 * @param isSecured The boolean property indicates whether this method must be protected or not
 */
function addSwaggerToPostMethod(modelName: string, modelNameSingular: string, swaggerSchema: object, isSecured: boolean) {
    swaggerOptions.paths[`/api/${modelName}`]['post'] = {
        tags: [`${modelName} API`],
        summary: `Create the ${modelNameSingular}`,
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: swaggerSchema
                }
            }
        },
        responses: {
            201: {
                description: "Success"
            },
            400: {
                description: `The body doesn't match the ${modelNameSingular} schema`
            },
            500: {
                description: 'Internal server error'
            }
        }
    }

    if (isSecured) {
        swaggerOptions.paths[`/api/${modelName}`]['post'] = {
            ...swaggerOptions.paths[`/api/${modelName}`]['post'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }
}

/**
 * Adds a dynamic comment to the DELETE method (on the given model (by modelName))
 * @param modelName The name of a model
 * @param isSecured The boolean property indicates whether this method must be protected or not
 */
function addSwaggerToDeleteMethod(modelName: string, isSecured: boolean) {
    swaggerOptions.paths[`/api/${modelName}`]['delete'] = {
        tags: [`${modelName} API`],
        summary: `Delete all ${modelName}`,
        responses: {
            200: {
                description: "Success"
            },
            500: {
                description: 'Internal server error'
            }
        }
    }

    if (isSecured) {
        swaggerOptions.paths[`/api/${modelName}`]['delete'] = {
            ...swaggerOptions.paths[`/api/${modelName}`]['delete'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }
}

/**
 * Adds a dynamic comment to the GET method (on the given model (by modelName)) to be used with ID
 * @param modelName The name of a model
 * @param modelNameSingular The name of a model in the singular
 * @param isSecured The boolean property indicates whether this method must be protected or not
 */
function addSwaggerToGetByIdMethod(modelName: string, modelNameSingular: string, isSecured: boolean) {
    swaggerOptions.paths[`/api/${modelName}/{id}`]['get'] = {
        tags: [`${modelName} API`],
        summary: `Get the ${modelNameSingular} by id`,
        parameters: [{
            in: 'path',
            name: 'id',
            required: true,
            schema: {
                type: "string"
            },
            description: `You need to paste a ${modelNameSingular} id in the line below to get more information about the selected ${modelNameSingular}.`
        }],
        responses: {
            200: {
                description: "Success"
            },
            404: {
                description: `The ${modelNameSingular} not found`
            },
            500: {
                description: 'Internal server error'
            }
        }

    }

    if (isSecured) {
        swaggerOptions.paths[`/api/${modelName}/{id}`]['get'] = {
            ...swaggerOptions.paths[`/api/${modelName}/{id}`]['get'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }
}

/**
 * Adds a dynamic comment to the PUT method (on the given model (by modelName))
 * @param modelName The name of a model
 * @param modelNameSingular The name of a model in the singular
 * @param swaggerSchema The schema showing which fields are required for a current model
 * @param isSecured The boolean property indicates whether this method must be protected or not
 */
function addSwaggerToPutMethod(modelName: string, modelNameSingular: string, swaggerSchema: object, isSecured: boolean) {
    swaggerOptions.paths[`/api/${modelName}/{id}`]['put'] = {
        tags: [`${modelName} API`],
        summary: `Update the ${modelNameSingular} by id`,
        parameters: [{
            in: 'path',
            name: 'id',
            required: true,
            schema: {
                type: "string"
            },
            description: `You need to paste a ${modelNameSingular} id in the line below.`
        }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: swaggerSchema
                }
            }
        },
        responses: {
            200: {
                description: "Success"
            },
            400: {
                description: `The body doesn't match the ${modelNameSingular} schema`
            },
            404: {
                description: `The ${modelNameSingular} not found`
            },
            500: {
                description: 'Internal server error'
            }
        }
    }

    if (isSecured) {
        swaggerOptions.paths[`/api/${modelName}/{id}`]['put'] = {
            ...swaggerOptions.paths[`/api/${modelName}/{id}`]['put'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }
}

/**
 * Adds a dynamic comment to the DELETE method (on the given model (by modelName)) to be used with ID
 * @param modelName The name of a model
 * @param modelNameSingular The name of a model in the singular
 * @param isSecured The boolean property indicates whether this method must be protected or not
 */
function addSwaggerToDeleteByIdMethod(modelName: string, modelNameSingular: string, isSecured: boolean) {
    swaggerOptions.paths[`/api/${modelName}/{id}`]['delete'] = {
        tags: [`${modelName} API`],
        summary: `Delete the ${modelNameSingular} by id`,
        parameters: [{
            in: 'path',
            name: 'id',
            required: true,
            schema: {
                type: "string"
            },
            description: `You need to paste a ${modelNameSingular} id in the line below to successfully delete the selected ${modelNameSingular}.`
        }],
        responses: {
            200: {
                description: "Success"
            },
            404: {
                description: `The ${modelNameSingular} not found`
            },
            500: {
                description: 'Internal server error'
            }
        }
    }

    if (isSecured) {
        swaggerOptions.paths[`/api/${modelName}/{id}`]['delete'] = {
            ...swaggerOptions.paths[`/api/${modelName}/{id}`]['delete'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }
}