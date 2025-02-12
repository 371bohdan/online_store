import nodemailer from 'nodemailer';
import { ENV } from '../../../config/dotenv/env';

export const mailService = {
    sendMail: (to: String, subject: String, message: String): void => {
        const transporter = getTransporter();
        const mailOptions = getMailOptions(to, subject, message);
        transporter.sendMail(mailOptions);
    },
}

function getMailOptions(to: String, subject: String, message: String): Object {
    return {
        from: ENV.MAIL_USER,
        to,
        subject,
        text: message
    }
}

function getTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: ENV.MAIL_USER,
            pass: ENV.MAIL_PASSWORD
        }
    });
}