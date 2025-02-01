import express from 'express'
import mongoose, { Model } from 'mongoose';
import homeRoutes from './routes/home' // потім можна змінити на інший котрий потрібен маршрут
import genericCrudRoute from './routes/genericCrudRoute';
import swaggerUIPath from 'swagger-ui-express';
import swaggerOptions from './swagger/swaggerOptions';
import { ENV } from './dotenv/env';
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
//inital home routes
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use('/', homeRoutes);

//database connection
mongoose.connect(ENV.MONGODB_URI);

// Operations with cart
import cartOptRoute from './routes/cartRoute';
app.use('/api/carts', cartOptRoute);

//Operations with order
import orderOptRoute from './routes/orderRoute';
app.use('/api/orders', orderOptRoute)


//user routes
import User, { IUser } from './models/users';
const userRoute: express.Router = genericCrudRoute(User as Model<IUser>, "users", ['post', 'put', 'delete']);
app.use('/api/users', userRoute);

//product general routes
import Product, { IProduct } from './models/products';
const productRoute: express.Router = genericCrudRoute(Product as Model<IProduct>, "products", ['put', 'delete']);
app.use('/api/products', productRoute);

//initialise owner
import { initialiseOwnerAccount } from './controllers/authController';
initialiseOwnerAccount();

import productsRoute from './routes/productRoute';
app.use('/api/products', productsRoute as express.Router);

//devlivery general routes
import Delivery, {IDelivery} from './models/deliveries';
const deviveryRoute: express.Router = genericCrudRoute(Delivery as Model<IDelivery>, "deliveries", ['get', 'post', 'put', 'delete']);
app.use('/api/deliveries', deviveryRoute);

//order general routes
import Order, {IOrder} from './models/orders';
const orderRoute: express.Router = genericCrudRoute(Order as Model<IOrder>, "orders", ['get', 'post', 'put', 'delete']);
app.use('/api/orders', orderRoute);

//carts general routes
import Cart, { ICart } from './models/carts';
const cartRoute: express.Router = genericCrudRoute(Cart as Model<ICart>, "carts", ['get', 'post', 'put', 'delete']);
app.use('/api/carts', cartRoute);

//auth routes
import authRoute from './routes/authRoute';
app.use('/api/auth', authRoute);



//swagger
app.use('/api/docs', swaggerUIPath.serve, swaggerUIPath.setup(swaggerOptions));