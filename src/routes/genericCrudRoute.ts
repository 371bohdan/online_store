import express from 'express'
import multer from 'multer';
import genericCrudController from '../controllers/genericCrudController';
import { Document, Model } from 'mongoose';
import swaggerOptions from '../swagger/swaggerOptions';
import { userSwaggerSchema } from '../models/users';
import { productSwaggerSchema } from '../models/products';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genericCrudRoute = <T extends Document>(Model: Model<T>, modelName: string): express.Router => {
    const router: express.Router = express.Router();
    const controller = genericCrudController(Model);

    //swagger
    swagger(modelName);

    //routes
    router.get('/', controller.getAll);
    router.get('/:id', controller.getById);
    // Створення з підтримкою завантаження файлів
    router.post('/', upload.single('file'), controller.create);

    // Оновлення з підтримкою завантаження файлів
    router.put('/:id', upload.single('file'), controller.update);
    router.delete('/', controller.removeAll);
    router.delete('/:id', controller.removeById);
    return router;
}

function swagger(modelName: String): void {
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
}

function getTheSwaggerSchema(modelName: String) {
    switch (modelName) {
        case 'users':
            delete userSwaggerSchema.properties.recoveryId
            return userSwaggerSchema;
        case 'products': 
            delete productSwaggerSchema.properties._id;  // Видаляємо _id, якщо не потрібно в схемі
            return productSwaggerSchema;
    }

}


export default genericCrudRoute;