import swaggerJsdoc from 'swagger-jsdoc';
import { orderSwaggerSchema } from '../../api/models/orders';
import Product, { productSwaggerSchema } from '../../api/models/products';
import { userSwaggerSchema } from '../../api/models/users';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Lumen Online Store',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },

            schemas: {
                ErrorResponse: {
                    BadRequest: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: 'Bad request' },
                            statusCode: { type: 'number', example: 400 },
                            message: { type: 'string', example: "you've missed a required property (or other error message)" },
                            date: { type: 'string', example: 'dd.mm.yyyy, hh:mm:ss' }
                        }
                    },

                    Unauthorised: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: 'Unauthorised' },
                            statusCode: { type: 'number', example: 401 },
                            message: { type: 'string', example: "jwt must be provided (or other error message)" },
                            date: { type: 'string', example: 'dd.mm.yyyy, hh:mm:ss' }
                        }
                    },

                    NotFound: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: 'Not found' },
                            statusCode: { type: 'number', example: 401 },
                            message: { type: 'string', example: "the model not found." },
                            date: { type: 'string', example: 'dd.mm.yyyy, hh:mm:ss' }
                        }
                    },

                    InternalServerError: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: 'Internal Server Error' },
                            statusCode: { type: 'number', example: 500 },
                            message: { type: 'string', example: "Sorry, your request cannot be processed" },
                            date: { type: 'string', example: 'dd.mm.yyyy, hh:mm:ss' }
                        }
                    }
                },

                AuthApi: {
                    Message: {
                        type: 'object',
                        properties: {
                            message: { type: 'string', example: 'Please, check your email for the next steps!' },
                        }
                    },

                    Token: {
                        type: 'object',
                        properties: {
                            token: { type: 'string', example: '<access_token>' },
                        }
                    }
                },

                Enum: {
                    type: 'object',
                    properties: {
                        array: { type: 'string[]', example: "['first element', 'second', ...]" }
                    }
                },

                Order: orderSwaggerSchema,

                Product: productSwaggerSchema,

                User: userSwaggerSchema
            }
        },
    },

    apis: ['./src/api/routes/*.ts']
}

export const swaggerUiOptions = {
    swaggerOptions: {
        docExpansion: 'none'
    },
}

export const swaggerOptions: swaggerJsdoc.Options = swaggerJsdoc(options);