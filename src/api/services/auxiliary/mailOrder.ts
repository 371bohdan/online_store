import nodemailer from "nodemailer";

class MailOrder {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendOrderConfirmation(email: string, orderDetails: any) {
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: "Your Order Confirmation",
            text: `Thank you for your order! Here are the details:\n\n${JSON.stringify(orderDetails, null, 2)}`,
        };

        await this.transporter.sendMail(mailOptions);
    }
}

export default new MailOrder();