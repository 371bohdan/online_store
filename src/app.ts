import express, { Request, Response } from 'express'
import mongoose, { Model } from 'mongoose';
import homeRoutes from './routes/home' // потім можна змінити на інший котрий потрібен маршрут
import genericCrudRoute from './routes/genericCrudRoute';
import swaggerUIPath from 'swagger-ui-express';
import swaggerOptions from './swagger/swaggerOptions';
import { ENV } from './dotenv/env';

//entry point
const app = express();
const port = ENV.PORT;
const run = () => {
    app.listen(port, () => {
        console.log(`This server runs on http://localhost:${port}`);
    });
}
run();

//inital home routes
app.use(express.json());
app.use('/', homeRoutes);

//database connection
mongoose.connect(ENV.MONGODB_URI);

//user routes

//user routes
import User, { IUser } from './models/users';
const userRoute: express.Router = genericCrudRoute(User as Model<IUser>, "users", ['get', 'post', 'put', 'delete']);
app.use('/api/users', userRoute);

//product general routes
import Product, { IProduct } from './models/products';
const productRoute: express.Router = genericCrudRoute(Product as Model<IProduct>, "products", ['get', 'post', 'put', 'delete']);
app.use('/api/products', productRoute);


//auth routes
import authRoute from './routes/authRoute';
app.use('/api/auth', authRoute);

// Oprations with product
import productOptRoute from './routes/productOptRoute';
app.use('/api/productopt', productOptRoute);

import imageRoute from './routes/imageRoute';
app.use('/api/image', imageRoute);

//swagger
app.use('/api/docs', swaggerUIPath.serve, swaggerUIPath.setup(swaggerOptions));



