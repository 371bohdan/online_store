import swaggerJsdoc from 'swagger-jsdoc';

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
                            message: { type: 'string', example: "you've missed a required property" },
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
                    }
                }
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