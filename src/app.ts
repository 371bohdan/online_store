import express from 'express'
import mongoose, { Model } from 'mongoose';
import genericCrudRoute from './api/routes/genericCrudRoute';
import swaggerUIPath from 'swagger-ui-express';
import { swaggerOptions, swaggerUiOptions } from './config/swagger/swaggerOptions';
import { ENV } from './config/dotenv/env';
import cors from 'cors';
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

//cors
app.use(cors({
    origin: 'http://localhost:5173'
}));

//database connection
mongoose.connect(ENV.MONGODB_URI);

//initialise owner
import { initialiseOwnerAccount } from './api/services/authService';
initialiseOwnerAccount();

//user routes
import userRoute from './api/routes/userRoute';
app.use('/api/users', userRoute);

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

//swagger
app.use('/api/docs', swaggerUIPath.serve, swaggerUIPath.setup(swaggerOptions, swaggerUiOptions));