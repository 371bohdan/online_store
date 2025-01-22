import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Lumen Online Store',
            version: '1.0.0'
        }
    },
    apis: ['./src/routes/*.ts']
}

const swaggerOptions = swaggerJsdoc(options);
export default swaggerOptions;