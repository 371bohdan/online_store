import express, { NextFunction, Request, Response } from 'express'
import mongoose, { Model } from 'mongoose';
import genericCrudRoute from './api/routes/genericCrudRoute';
import swaggerUIPath from 'swagger-ui-express';
import { swaggerOptions, swaggerUiOptions } from './config/swagger/swaggerOptions';
import { ENV } from './config/dotenv/env';
import cookieParser from "cookie-parser";

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
import { morganMiddleware } from './config/morgan/morganMiddleware';
app.use(morganMiddleware);

//cors
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', ['http://localhost:5173', ENV.FRONT_PROD_URI]);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    next();
});

//database connection
mongoose.connect(ENV.MONGODB_URI, {
    maxPoolSize: 5,
    autoIndex: false
});

//initialise owner
import { initialiseOwnerAccount } from './api/services/authService';
initialiseOwnerAccount();

//passport
import './config/passport/passportConfig';
import session from 'express-session';
import passport from 'passport';

app.use(session({ secret: ENV.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

//user routes
import userRoute from './api/routes/userRoute';
app.use('/api/users', userRoute);

import userSelfAccessRoute from './api/routes/userSelfAccessRoute';
app.use('/api/user-self-access', userSelfAccessRoute);

//product routes
import productRoute from './api/routes/productRoute';
app.use('/api/products', productRoute);

//devlivery crud routes
import Delivery, { IDelivery } from './api/models/deliveries';
const deviveryRoute: express.Router = genericCrudRoute(Delivery as Model<IDelivery>, "deliveries", ['post', 'put', 'delete']);
app.use('/api/deliveries', deviveryRoute);

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
import Stripe from 'stripe';
import stripeRoute from './config/stripe/stripeRoute';

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
app.use('/api/stripe', stripeRoute);

//swagger
app.use('/api/docs', swaggerUIPath.serve, swaggerUIPath.setup(swaggerOptions, swaggerUiOptions));