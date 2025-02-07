import express from 'express';
import genericCrudController from '../controllers/genericCrudController';
import { Document, Model } from 'mongoose';
import { swaggerOptions } from '../swagger/swaggerOptions';
import { userSwaggerSchema } from '../models/users';
import { productSwaggerSchema } from '../models/products';
import { cartSwaggerSchema } from '../models/carts';
import { deliverySwaggerSchema } from '../models/deliveries';
import { orderSwaggerSchema } from '../models/orders';
import errorHandler from '../middleware/errors/errorHandler';
import asyncHandler from '../middleware/errors/asyncHandler';
import requireAuth from '../middleware/auth/requireAuth';
import requireAdminOrOwnerRole from '../middleware/auth/requireAdminOrOwnerRole';

const genericCrudRoute = <T extends Document>(Model: Model<T>, modelName: string, methodsToSecure: Array<string>): express.Router => {
    const router: express.Router = express.Router();
    const controller = genericCrudController(Model);

    //swagger
    swagger(modelName, methodsToSecure);

    //routes
    if (methodsToSecure.includes('get')) {
        router.get('/', requireAuth, requireAdminOrOwnerRole, asyncHandler(controller.getAll));
        router.get('/:id', requireAuth, requireAdminOrOwnerRole, asyncHandler(controller.getById));
    } else {
        router.get('/', asyncHandler(controller.getAll));
        router.get('/:id', asyncHandler(controller.getById));
    }

    if (methodsToSecure.includes('post')) {
        router.post('/', requireAuth, requireAdminOrOwnerRole, asyncHandler(controller.create));
    } else {
        router.post('/', asyncHandler(controller.create));
    }

    if (methodsToSecure.includes('put')) {
        router.put('/:id', requireAuth, requireAdminOrOwnerRole, asyncHandler(controller.update));
    } else {
        router.put('/:id', asyncHandler(controller.update));
    }

    if (methodsToSecure.includes('delete')) {
        router.delete('/', requireAuth, requireAdminOrOwnerRole, asyncHandler(controller.removeAll));
        router.delete('/:id', requireAuth, requireAdminOrOwnerRole, asyncHandler(controller.removeById));
    } else {
        router.delete('/', asyncHandler(controller.removeAll));
        router.delete('/:id', asyncHandler(controller.removeById));
    }

    //global error handler
    router.use(errorHandler)
    return router;
}

function swagger(modelName: string, methodsToSecure: Array<string>): void {
    const modelNameSingular: string = modelName.substring(0, modelName.length - 1);
    const swaggerSchema = getTheSwaggerSchema(modelName);
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
}

export function getTheSwaggerSchema(modelName: String) {
    switch (modelName) {
        case 'users':
            delete userSwaggerSchema.properties.recoveryCode;
            delete userSwaggerSchema.properties.role;
            delete userSwaggerSchema.properties.verificationCode;
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

export default genericCrudRoute;