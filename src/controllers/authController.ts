import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import User, { IUser } from "../models/users";
import mailController from "../mail/mailController";
import { randomUUID } from "crypto";
import jwt from 'jsonwebtoken';
import mongoose, { HydratedDocument, isValidObjectId, ObjectId } from "mongoose";
import { ENV } from "../dotenv/env";
import { UserRoles } from "../models/enums/userRolesEnum";
import ms from 'ms';
import { AuthorizationError, NotFoundError } from "../errors/ApiError";

const authController = {
    signUp: async (req: Request, res: Response): Promise<void> => {
        try {
            const password = req.body.password;

            if (isPasswordValid(password, res)) {
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
                    const generatedAccessToken = generateJwtAccessToken(user.id);
                    const generatedRefreshToken = generateJwtRefreshToken(user.id);

                    res.cookie('jwt', generatedRefreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        secure: true,
                        maxAge: JWT_REFRESH_TOKEN_EXPIRES
                    });

                    await User.findByIdAndUpdate(user.id, { refreshToken: generatedRefreshToken });
                    res.send(generatedAccessToken);
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

    refresh: async (req: Request, res: Response): Promise<void> => {
        if (req.cookies?.jwt) {
            const refreshToken = req.cookies.jwt;
            const jwtPayload = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET_KEY);

            if (typeof jwtPayload !== 'string') {
                const userId = jwtPayload.userId;

                if (await User.find({ refreshToken, _id: userId })) {
                    const newRefreshToken = generateJwtRefreshToken(userId);
                    res.cookie('jwt', newRefreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        secure: true,
                        maxAge: JWT_REFRESH_TOKEN_EXPIRES
                    })

                    await User.findByIdAndUpdate(userId, { refreshToken: newRefreshToken });
                    const accessToken = generateJwtAccessToken(userId);
                    res.send(accessToken);
                } else {
                    throw new NotFoundError('User');
                }

            } else {
                res.status(400).send('Invalid token');
            }
        } else {
            res.status(401).send('Unauthorised');
        }
    },

    logout: async (req: Request, res: Response): Promise<void> => {
        if (req.cookies?.jwt) {
            const refreshToken = req.cookies.jwt;
            if (await User.findOneAndUpdate({ refreshToken }, { refreshToken: null })) {
                res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'none' });
                res.status(200).send('Success');
                return;
            }

            res.status(404).send('Not found');
        }
        res.status(401).send('Unauthorized');
    },

    accountRecovery: async (req: Request, res: Response): Promise<void> => {
        const email = req.body.email;
        const recoveryCode = randomUUID();
        await User.findOneAndUpdate({ email }, { recoveryCode, password: null });
        mailController.sendMail(email, 'Lumen Online Store: password recovery', `You need to click on the link to recover your account: ${RECOVER_ACCOUNT_URI}/${recoveryCode}`);
        res.json('Please, check your email for the next steps!')
    },

    confirmAccountRecovery: async (req: Request, res: Response): Promise<void> => {
        const password = req.body.password;

        if (isPasswordValid(password, res)) {
            const encryptedPassword = encryptPassword(password);
            const updatedUser = await User.findOneAndUpdate({ recoveryCode: req.params.id },
                { password: encryptedPassword, recoveryCode: null, verificationCode: null, isVerified: true });

            if (updatedUser) {
                mailController.sendMail(updatedUser?.email, 'Lumen Online Store', 'Your account has been successfully restored and your password changed!');
                res.json('Successfully restored.');
            } else {
                res.status(404).json('User not found');
            }
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

/**
 * Returns an encrypted password
 * @param password A password to be encrypted
 */
function encryptPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

/**
 * Returns newly generated JWT access token (to provide an access to information, taking into account the user's role)
 * @param userId The ID for whom this token is made
 */
function generateJwtAccessToken(userId: ObjectId) {
    const data = {
        time: Date(),
        userId
    };

    const jwtAccessSecretKey = ENV.JWT_ACCESS_SECRET_KEY;
    return jwt.sign(data, jwtAccessSecretKey, { expiresIn: `${ENV.JWT_ACCESS_TOKEN_EXPIRES}m` });
}

/**
 * Returns newly generated JWT refresh token (for automatic user confirmation if token hasn't expired)
 * @param userId The ID for whom this token is made
 */
function generateJwtRefreshToken(userId: ObjectId) {
    const jwtRefreshSecretKey = ENV.JWT_REFRESH_SECRET_KEY;
    return jwt.sign({ userId }, jwtRefreshSecretKey, { expiresIn: `${JWT_REFRESH_TOKEN_EXPIRES}d` })
}

/**
 * Returns JWT token without authentication scheme ('Bearer' part before a token)
 * @param bearerToken Expected raw token from 'Authorization' header
 * @throws The authorization error if token is not presented
 */
export function getJwtTokenWithoutAuthScheme(bearerToken: string | undefined): string {
    if (bearerToken === undefined || bearerToken.length === 0) {
        throw new AuthorizationError("You don't have an auth token");
    }

    return bearerToken.substring(7, bearerToken.length);
}

/**
 * Returns the user id, stored in a payload, encrypted (using a secret key) in the JWT access token
 * @param accessToken The JWT access token
 * @throws The Authorization error if the token isn't a valid 'ObjectId' type
 */
export function getUserIdFromJwtToken(accessToken: string): mongoose.Types.ObjectId {
    const jwtPayload = jwt.verify(accessToken, ENV.JWT_ACCESS_SECRET_KEY);

    if (typeof jwtPayload === 'object') {
        if (!isValidObjectId(jwtPayload.userId)) {
            throw new AuthorizationError('Incorrect auth token');
        }

        return jwtPayload.userId;

    } else {
        if (!isValidObjectId(jwtPayload)) {
            throw new AuthorizationError('Incorrect auth token');
        }

        return new mongoose.Types.ObjectId(jwtPayload);
    }
}

/**
 * Returns truth value ('true') if the token is valid (successfully passed through the jwt.verify method ('jsonwebtoken' library))
 * @param accessToken The JWT access token
 */
export function isValidAccessToken(accessToken: string): boolean {
    jwt.verify(accessToken, ENV.JWT_ACCESS_SECRET_KEY);
    return true;
}

function isPasswordValid(password: String, res: Response): Boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (password.length < 8) {
        res.status(400).send('Password must be at least 8 characters long')
        return false;
    } else if (password.length > 20) {
        res.status(400).send('Password cannot exceed 20 characters');
        return false;
    } else if (!password.match(passwordRegex)) {
        res.status(400).send('Invalid password format');
        return false;
    }

    return true;
}

/**
 * Creates an account without a password (this is necessary to store some data or to perform some action). 
 * When the account is created a mail is sent to the email with the following actions.
 * @param email The email address for user registration
 * @returns Returns created user account
 * @throws An error if this email has already been used
 */
async function forcedRegistration(email: String): Promise<HydratedDocument<IUser>> {
    const recoveryId = randomUUID();
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        const user = new User({ email, recoveryId });
        const createdUser = await user.save({ validateBeforeSave: false });
        mailController.sendMail(email, 'Lumen Online Store: account creation',
            `Your account has been created. Please follow the link to set a password: ${RECOVER_ACCOUNT_URI}/${recoveryId}`);

        return createdUser;
    }

    throw new Error(`The email already used`);
}

/**
 * Creates an account for the owner of the application (for the email specified in the env variables) if it doesn't already exist.
 * It also provides a control for an 'owner' role (removes this role if a user isn't specified as the owner in the env variables, 
 * and sets this role for the specified user).
 */
export async function initialiseOwnerAccount(): Promise<void> {
    const ownerEmail = ENV.OWNER_EMAIL;
    let owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
        owner = await forcedRegistration(ownerEmail);
    }

    const usersWithOwnerRole = await User.find({ role: UserRoles.OWNER, email: { $ne: ownerEmail } });
    if (usersWithOwnerRole.length !== 0) {
        await User.updateMany({ role: UserRoles.OWNER, email: { $ne: ownerEmail } }, { role: UserRoles.USER })
    }

    if (owner.role !== UserRoles.OWNER) {
        await User.findOneAndUpdate({ _id: owner._id }, { role: UserRoles.OWNER })
    }
}

const RECOVER_ACCOUNT_URI: String = ENV.HOST_URI + '/api/auth/accountRecovery';
const VERIFY_EMAIL_URI: String = ENV.HOST_URI + '/api/auth/verifyEmail';
const JWT_REFRESH_TOKEN_EXPIRES = ms(`${ENV.JWT_REFRESH_TOKEN_EXPIRES}d`);

export default authController;