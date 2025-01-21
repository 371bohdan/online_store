import express from 'express';
import genericCrudController from '../controllers/genericCrudController';
import { Document, Model } from 'mongoose';
import swaggerOptions from '../swagger/swaggerOptions';
import { userSwaggerSchema } from '../models/users';
import { verifyAdminRole } from '../controllers/authController';

const genericCrudRoute = <T extends Document>(Model: Model<T>, modelName: string, methodsToSecure: Array<String>): express.Router => {
    const router: express.Router = express.Router();
    const controller = genericCrudController(Model);

    //swagger
    swagger(modelName, methodsToSecure);

    //routes
    if (methodsToSecure.includes('get')) {
        router.get('/', verifyAdminRole, controller.getAll);
        router.get('/:id', verifyAdminRole, controller.getById);
    } else {
        router.get('/', controller.getAll);
        router.get('/:id', controller.getById);
    }

    if (methodsToSecure.includes('post')) {
        router.post('/', verifyAdminRole, controller.create);
    } else {
        router.post('/', controller.create);
    }


    if (methodsToSecure.includes('post')) {
        router.put('/:id', verifyAdminRole, controller.update);
    } else {
        router.put('/:id', controller.update);
    }

    if (methodsToSecure.includes('post')) {
        router.delete('/', verifyAdminRole, controller.removeAll);
        router.delete('/:id', verifyAdminRole, controller.removeById);
    } else {
        router.delete('/', controller.removeAll);
        router.delete('/:id', controller.removeById);
    }

    return router;
}

function swagger(modelName: String, methodsToSecure: Array<String>): void {
    const modelNameSingular: String = modelName.substring(0, modelName.length - 1);
    const swaggerSchema = getTheSwaggerSchema(modelName);
    delete swaggerSchema.properties._id   //removing _id property for model Object

    // /api/${modelName}
    swaggerOptions.paths[`/api/${modelName}`] = {
        get: {
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
        },

        post: {
            tags: [`${modelName} API`],
            summary: `create the ${modelNameSingular}`,
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
        },

        delete: {
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
    }

    // /api/${modelName}/:id
    swaggerOptions.paths[`/api/${modelName}/{id}`] = {
        get: {
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
        },

        put: {
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
        },

        delete: {
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
    }

    //secure
    if (methodsToSecure.includes('get')) {
        swaggerOptions.paths[`/api/${modelName}`]['get'] = {
            ...swaggerOptions.paths[`/api/${modelName}`]['get'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }

        swaggerOptions.paths[`/api/${modelName}/{id}`]['get'] = {
            ...swaggerOptions.paths[`/api/${modelName}/{id}`]['get'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }

    if (methodsToSecure.includes('post')) {
        swaggerOptions.paths[`/api/${modelName}`]['post'] = {
            ...swaggerOptions.paths[`/api/${modelName}`]['post'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }

    if (methodsToSecure.includes('put')) {
        swaggerOptions.paths[`/api/${modelName}/{id}`]['put'] = {
            ...swaggerOptions.paths[`/api/${modelName}/{id}`]['put'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }
    }

    if (methodsToSecure.includes('delete')) {
        swaggerOptions.paths[`/api/${modelName}`]['delete'] = {
            ...swaggerOptions.paths[`/api/${modelName}`]['delete'],
            security: [
                {
                    bearerAuth: []
                },
            ],
        }

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

function getTheSwaggerSchema(modelName: String) {
    switch (modelName) {
        case 'users':
            delete userSwaggerSchema.properties.recoveryId
            return userSwaggerSchema;
    }
}

export default genericCrudRoute;