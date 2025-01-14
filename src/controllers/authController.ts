import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import User from "../models/users";
import mailController from "../mail/mailController";
import { randomUUID } from "crypto";

const authController = {
    signUp: async (req: Request, res: Response): Promise<void> => {
        req.body.password = encryptPassword(req.body.password);
        const isUserExist = await User.findOne({ email: req.body.email });

        if (isUserExist) {
            res.status(400).json("The email already used.")
        } else {
            const createdUser = await User.create(req.body);
            mailController.sendMail(req.body.email, 'Registration on the Lumen online store',
                'Your account has been successfully created. Have fun!');
            res.json(createdUser);
        }
    },

    accountRecovery: async (req: Request, res: Response): Promise<void> => {
        const email = req.body.email;
        const recoveryId = randomUUID();
        await User.findOneAndUpdate({ email: email }, { recoveryId: recoveryId, password: null });
        mailController.sendMail(email, 'Lumen Online Store: password recovery', `You need to click on the link to recover your account: ${RECOVER_ACCOUNT_URI}/${recoveryId}`);
        res.json('Please, check your email for the next steps!')
    },

    verifyAndChangePassword: async (req: Request, res: Response): Promise<void> => {
        const encryptedPassword = encryptPassword(req.body.password);
        const updatedUser = await User.findOneAndUpdate({ recoveryId: req.params.id }, { password: encryptedPassword, recoveryId: null });

        if (updatedUser) {
            mailController.sendMail(updatedUser?.email, 'Lumen Online Store', 'Your account has been successfully restored and your password changed!');
            res.json('Successfully verified.');
        } else {
            res.status(404).json('User not found');
        }
    }
}

function encryptPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

const RECOVER_ACCOUNT_URI: String = process.env.HOST_URI + '/api/auth/accountRecovery';

export default authController;