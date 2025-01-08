import express, {Request, Response} from 'express'

import homeRoutes from './routes/home' // потім можна змінити на інший котрий потрібен маршрут

import * as dotenv from 'dotenv'; //зберігання необхідних даних (необов'язково але на випадок якщо потрібно сховати конф дані) 
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/', homeRoutes);


const run = () => {
    app.listen(port, () => {
        console.log(`This server runs on http://localhost:${port}`);
      });
}


run();













// const express = require('express');

// const app = express();

// app.get('/', (req, res)=> {
//     res.status(200).json({message: 'success'});
// });



// const PORT = 3000;



// app.listen(PORT, () => {
//     console.log(`This server run on http://localhost:${PORT}`);
// });



