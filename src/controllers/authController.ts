import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcryptjs'
import User, { IUser } from "../models/users";
import mailController from "../mail/mailController";
import { randomUUID } from "crypto";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from "mongoose";
import { ENV } from "../dotenv/env";

const authController = {
    signUp: async (req: Request, res: Response): Promise<void> => {
        try {
            //Custom password validation
            const password: string = req.body.password;
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
            if (password.length < 8) {
                res.status(400).send('Password must be at least 8 characters long');
            } else if (password.length > 20) {
                res.status(400).send('Password cannot exceed 20 characters');
            } else if (password.match(passwordRegex)) {
                res.status(400).send('Invalid password format')
            }

            const encryptedPassword = encryptPassword(password);
            const verificationCode = randomUUID();
            const createdUser = await User.create({
                email: req.body.email,
                password: encryptedPassword,
                verificationCode
            });

            if (createdUser) {
                mailController.sendMail(createdUser.email, 'Registration on the Lumen online store',
                    `Your account has been successfully created, but you need to verify it. Follow the link: ${VERIFY_EMAIL_URI}/${verificationCode}`);
                res.json('We\'ve sent a verification letter to your email');
            }
        } catch (error: any) {
            res.status(400).send(error.message);
        }
    },

    signIn: async (req: Request, res: Response): Promise<void> => {
        const user: IUser | null = await User.findOne({ email: req.body.email });
        if (user) {

            if (bcrypt.compareSync(req.body.password, user.password)) {

                if (user.isVerified) {

                    const generatedToken = generateJwtToken(user.id);
                    res.send(generatedToken);
                } else {
                    res.status(400).send('You need to verify your email.');
                }

            } else {
                res.status(400).send('Incorrect incoming data (email or password).');
            }
        } else {
            res.status(400).send('Incorrect incoming data (email or password).');
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
    },

    verifyEmail: async (req: Request, res: Response): Promise<void> => {
        const user = await User.findOneAndUpdate({ verificationCode: req.params.id }, { verificationCode: null, isVerified: true });

        if (user) {
            mailController.sendMail(user?.email, 'Lumen Online Store', 'Your account has been successfully verified. Have fun!');
            res.json('Successfully verified.');

        } else {
            res.status(404).json('User not found');
        }
    }
}

function encryptPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(userId: ObjectId) {
    const data = {
        time: Date(),
        userId
    };

    const jwtSecretKey = ENV.JWT_SECRET_KEY || '';
    return jwt.sign(data, jwtSecretKey);
}

export const verifyAdminRole = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const bearerToken = req.headers.authorization || '';
    if (bearerToken.length === 0) {
        return res.status(401).send('You don\'t have an auth token');
    }

    const token = bearerToken.substring(7, bearerToken.length) || '';
    const jwtPayload = getJwtPayload(token);

    if (typeof jwtPayload !== 'string') {
        const user = await User.findById(jwtPayload.userId);

        if (user?.role === 'ADMIN') {
            next();
            return;
        }

        return res.status(403).send('You don\'t have access to interact with this route.');
    }

    return res.status(401).send('Incorrect auth token');
}

function getJwtPayload(token: string): JwtPayload | string {
    const jwtSecretKey = ENV.JWT_SECRET_KEY || '';
    return jwt.verify(token, jwtSecretKey);
}

const RECOVER_ACCOUNT_URI: String = ENV.HOST_URI + '/api/auth/accountRecovery';
const VERIFY_EMAIL_URI: String = ENV.HOST_URI + '/api/auth/verifyEmail';

export default authController;