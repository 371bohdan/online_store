import { mailService } from "./mailService";

const mailController = {
    sendMail: (to: String, subject: String, message: String): void => {
        mailService.sendMail(to, subject, message);
    }
}

export default mailController;