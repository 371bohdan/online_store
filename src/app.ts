import express, { Request, Response } from 'express'
import mongoose, { Model } from 'mongoose';
import homeRoutes from './routes/home' // потім можна змінити на інший котрий потрібен маршрут
import * as dotenv from 'dotenv'; //зберігання необхідних даних (необов'язково але на випадок якщо потрібно сховати конф дані) 
dotenv.config();
import genericCrudRoute from './routes/genericCrudRoute';
import swaggerUIPath from 'swagger-ui-express';
import swaggerOptions from './swagger/swaggerOptions';

//entry point
const app = express();
const port = process.env.PORT || 3000;
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
mongoose.connect(process.env.MONGODB_URI || '');

//user routes
import User, { IUser } from './models/users';
const userRoute: express.Router = genericCrudRoute(User as Model<IUser>, "users");
app.use('/api/users', userRoute);

//auth routes
import authRoute from './routes/authRoute';
app.use('/api/auth', authRoute);

//swagger
app.use('/api/docs', swaggerUIPath.serve, swaggerUIPath.setup(swaggerOptions));