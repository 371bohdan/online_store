"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const genericCrudController_1 = __importDefault(require("../controllers/genericCrudController"));
const swaggerOptions_1 = __importDefault(require("../swagger/swaggerOptions"));
const users_1 = require("../models/users");
const products_1 = require("../models/products");
const genericCrudRoute = (Model, modelName) => {
    const router = express_1.default.Router();
    const controller = (0, genericCrudController_1.default)(Model);
    //swagger
    swagger(modelName);
    //routes
    router.get('/', controller.getAll);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.delete('/', controller.removeAll);
    router.delete('/:id', controller.removeById);
    return router;
};
function swagger(modelName) {
    const modelNameSingular = modelName.substring(0, modelName.length - 1);
    const swaggerSchema = getTheSwaggerSchema(modelName);
    delete swaggerSchema.properties._id; //removing _id property for model Object
    // /api/${modelName}
    swaggerOptions_1.default.paths[`/api/${modelName}`] = {
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
    };
    // /api/${modelName}/:id
    swaggerOptions_1.default.paths[`/api/${modelName}/{id}`] = {
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
    };
}
function getTheSwaggerSchema(modelName) {
    switch (modelName) {
        case 'users':
            delete users_1.userSwaggerSchema.properties.recoveryId;
            return users_1.userSwaggerSchema;
        case 'products':
            delete products_1.productSwaggerSchema.properties._id; // Видаляємо _id, якщо не потрібно в схемі
            return products_1.productSwaggerSchema;
    }
}
exports.default = genericCrudRoute;
