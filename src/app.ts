import express, { Request, Response } from 'express'
import mongoose from 'mongoose';

import homeRoutes from './routes/home' // потім можна змінити на інший котрий потрібен маршрут

import * as dotenv from 'dotenv'; //зберігання необхідних даних (необов'язково але на випадок якщо потрібно сховати конф дані) 
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/', homeRoutes);

mongoose.connect(process.env.MONGODB_URI || '');

const run = () => {
    app.listen(port, () => {
        console.log(`This server runs on http://localhost:${port}`);
    });
}


run();