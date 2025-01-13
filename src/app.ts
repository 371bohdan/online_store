import express, { Request, Response } from 'express'
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

import homeRoutes from './routes/home' // потім можна змінити на інший котрий потрібен маршрут

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/', homeRoutes);

// mongoose.connect(process.env.MONGODB_URI || '');

const run = () => {
    app.listen(port, () => {
        console.log(`This server runs on http://localhost:${port}`);
    });
}


run();






// // Налаштування транспорту для nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Функція для відправки листа
// const sendEmail = async (to: string, subject: string, text: string) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// // Виклик функції для відправки листа на певну пошту
// sendEmail('bohdanmagpie@gmail.com', 'Test Subject', 'This is a test email.')
//   .then(() => console.log('Email successfully sent'))
//   .catch((error) => console.log('Failed to send email:', error));

