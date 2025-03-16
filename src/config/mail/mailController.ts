import { UUID } from "crypto";
import { mailService } from "./mailService";
import { OrderStatuses } from "../../api/models/enums/orderStatusesEnum";

const mailController = {
    sendMail: (to: string, subject: string, message: string): void => {
        mailService.sendMail(to, subject, message);
    },

    sendOrderConfirmation: (to: string, orderDetails: any): void => {
        mailService.sendOrderConfirmation(to, orderDetails);
    },

    sendRegistrationLetter: (to: string): void => {
        mailService.sendRegistrationLetter(to);
    },

    sendVerificationLetter: (to: string, verificationCode: UUID): void => {
        mailService.sendVerificationLetter(to, verificationCode);
    },

    sendRegistrAndVerifLetter: (to: string, verificationCode: UUID): void => {
        mailService.sendRegistrAndVerifLetter(to, verificationCode);
    },

    sendPasswordRecoveryLetter: (to: string, recoveryCode: UUID): void => {
        mailService.sendPasswordRecoveryLetter(to, recoveryCode);
    },

    sendForcedRegistrLetter: (to: string, recoveryCode: UUID): void => {
        mailService.sendForcedRegistrLetter(to, recoveryCode);
    },

    sendAccountRestoredLetter: (to: string): void => {
        mailService.sendAccountRestoredLetter(to);
    },

    sendSuccessfulVerificationLetter: (to: string): void => {
        mailService.sendSuccessfulVerificationLetter(to);
    },

    sendOrderStatusChangedLetter: (to: string, status: OrderStatuses): void => {
        mailService.sendOrderStatusChangedLetter(to, status);
    },

    sendPasswordChangedLetter: (to: string): void => {
        mailService.sendPasswordChangedLetter(to);
    }
}

export default mailController;