import nodemailer from 'nodemailer';

const mailController = {
    sendMail: (to: String, subject: String, message: String): void => {
        const transporter = getTransporter();
        const mailOptions = getMailOptions(to, subject, message);
        transporter.sendMail(mailOptions);
    }
}

function getTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });
}

function getMailOptions(to: String, subject: String, message: String): Object {
    return {
        from: process.env.MAIL_USER,
        to,
        subject,
        text: message
    }
}

export default mailController;