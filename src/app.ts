import express, { NextFunction, Request, Response } from 'express'
import mongoose, { Model } from 'mongoose';
import genericCrudRoute from './api/routes/genericCrudRoute';
import swaggerUIPath from 'swagger-ui-express';
import { swaggerOptions, swaggerUiOptions } from './config/swagger/swaggerOptions';
import { ENV } from './config/dotenv/env';
import cookieParser from "cookie-parser";
import cors from 'cors'

//entry point
const app = express();
const port = ENV.PORT;
const run = () => {
    app.listen(port, () => {
        console.log(`This server runs on http://localhost:${port}`);
    });
}
run();

//Для coockie
app.use(cookieParser());

app.use(express.json());

//logging
/* import { morganMiddleware } from './config/morgan/morganMiddleware';
app.use(morganMiddleware); */

//cors
app.use(cors({
    origin: ['http://localhost:5173', ENV.FRONT_PROD_URI],
    credentials: true
}));

//database connection
mongoose.connect(ENV.MONGODB_URI, {
    maxPoolSize: 5,
    autoIndex: false
});

//initialise owner
import { initialiseOwnerAccount } from './api/services/authService';
initialiseOwnerAccount();

//user routes
import userRoute from './api/routes/userRoute';
app.use('/api/users', userRoute);

import userSelfAccessRoute from './api/routes/userSelfAccessRoute';
app.use('/api/user-self-access', userSelfAccessRoute);

//product routes
import productRoute from './api/routes/productRoute';
app.use('/api/products', productRoute);

//order routes
import orderRoute from './api/routes/orderRoute';
app.use('/api/orders', orderRoute);

//carts routes
import cartRoute from './api/routes/cartRoute';
app.use('/api/carts', cartRoute);

//auth routes
import authRoute from './api/routes/authRoute';
app.use('/api/auth', authRoute);

//stripe
import stripeRoute from './config/stripe/stripeRoute';
app.use('/api/stripe', stripeRoute);

//swagger
app.use('/api/docs', swaggerUIPath.serve, swaggerUIPath.setup(swaggerOptions, swaggerUiOptions));
