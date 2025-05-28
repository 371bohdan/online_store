import nodemailer from 'nodemailer';
import { ENV } from '../dotenv/env';
import { UUID } from 'crypto';
import { OrderStatuses } from '../../api/models/enums/orderStatusesEnum';
import { compile } from 'handlebars';
import fs from 'fs';
import path from 'path';


const VERIFY_EMAIL_URI: string = ENV.FRONT_PROD_URI + '/api/auth/verifyEmail';
const RECOVER_PASSWORD_URI: string = ENV.FRONT_PROD_URI + '/api/auth/passwordRecovery';


const loadTemplate = (templateName: string, context: Record<string, any>): string => {
    // const templatePath = path.resolve(__dirname, `./views/${templateName}.html`);
    const templateSource = fs.readFileSync(`src/config/mail/views/order_mail.html`, 'utf8');
    const template = compile(templateSource);
    return template(context, {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    });
  };

export const mailService = {
    sendMail: (to: String, subject: String, message: String): void => {
        const transporter = getTransporter();
        const mailOptions = getMailOptions(to, subject, message);
        transporter.sendMail(mailOptions);
    },

    sendOrderConfirmation: async (email: string, orderDetails: any) => {
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: "Your Order Confirmation",
            // text: `Thank you for your order! Here are the details:\n\n${JSON.stringify(orderDetails, null, 2)}`,
            html: loadTemplate(`order_mail.html`, orderDetails)
        };

        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
    },

    sendRegistrationLetter: (email: string): void => {
        const subject = 'Registration on the Lumen online store';
        const message = "Your account has been successfully created, have a fun! If you haven't created an account, please," +
            `contact with our administration, link: ${ENV.FRONT_PROD_URI}`;
        mailService.sendMail(email, subject, message);
    },

    sendVerificationLetter: (email: string, verificationCode: UUID): void => {
        const subject = 'Account verification in the Lumen online store';
        const message = `Link to verify your account: ${VERIFY_EMAIL_URI}/${verificationCode}.  If you didn't send the request to verify your account, ignore this letter.`;
        mailService.sendMail(email, subject, message);
    },

    sendRegistrAndVerifLetter: (email: string, verificationCode: UUID): void => {
        const subject = 'Registration on the Lumen online store';
        const message = `Your account has been successfully created, but you need to verify it. Follow the link: ${VERIFY_EMAIL_URI}/${verificationCode}`;
        mailService.sendMail(email, subject, message);
    },

    sendPasswordRecoveryLetter: (email: string, recoveryCode: UUID): void => {
        const subject = 'Lumen Online Store: password recovery';
        const message = `You need to click on the link to recover your account: ${RECOVER_PASSWORD_URI}/${recoveryCode}`;
        mailService.sendMail(email, subject, message);
    },

    sendForcedRegistrLetter: (email: string, recoveryCode: UUID): void => {
        const subject = 'Lumen Online Store: account creation';
        const message = `Your account has been created. Please follow the link to set a password: ${RECOVER_PASSWORD_URI}/${recoveryCode}`;
        mailService.sendMail(email, subject, message);
    },

    sendAccountRestoredLetter: (email: string): void => {
        const subject = 'Lumen Online Store';
        const message = 'Your account has been successfully restored and your password changed!';
        mailService.sendMail(email, subject, message);
    },

    sendSuccessfulVerificationLetter: (email: string): void => {
        const subject = 'Lumen Online Store';
        const message = `Your account has been successfully verified. Have fun!`;
        mailService.sendMail(email, subject, message);
    },

    sendOrderStatusChangedLetter: (email: string, status: OrderStatuses): void => {
        const subject = 'Lumen Online Store: the order status changed';
        const message = `The status of your order has been changed to '${status}'. Go to the order page for more details.`;
        mailService.sendMail(email, subject, message);
    },

    sendPasswordChangedLetter: (email: string): void => {
        const subject = 'Lumen Online Store: password changed';
        const message = "Hello, your password has recently been changed. If you didn't change it, please contact our administration." +
            "\n Best Regards \nLumen Online Store Administration";
        mailService.sendMail(email, subject, message);
    }
}

function getMailOptions(to: String, subject: String, message: String, html?: String): Object {
    return {
        from: ENV.MAIL_USER,
        to,
        subject,
        text: message,
        ...(html && { html })
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
