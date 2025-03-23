import { Response } from "express";
import AccessDeniedError from "../errors/auth/AccessDeniedError";
import AuthorizationError from "../errors/auth/AuthorizationError";
import User, { IUser } from "../models/users";
import bcrypt from 'bcryptjs';
import mailController from "../../config/mail/mailController";
import { ENV } from "../../config/dotenv/env";
import NotFoundError from "../errors/general/NotFoundError";
import { randomUUID } from "crypto";
import { jwtService } from "./auxiliary/jwtService";
import { JwtTokenTypes } from "../models/enums/jwtTokenTypesEnum";
import { HydratedDocument } from "mongoose";
import { UserRoles } from "../models/enums/userRolesEnum";
import ms from "ms";
import { ActivationCodeExpiredError } from "../errors/auth/ActivationCodeExpiredError";
import { ErrorResponse, getErrorResponse } from "../errors/ErrorResponse";
import { StatusCodes } from "http-status-codes";
import { ensureItemExists, getItemByField } from "./genericCrudService";
//import { logger } from "../../config/winston/winstonConfig";
import qs from 'qs';
import { OAuth2Client } from "google-auth-library";
import BadRequestError from "../errors/general/BadRequestError";

const MESSAGE_TO_INTERACT_WITH_EMAIL: string = 'Please, check your email for the next steps!';
/*const AUTH_LOGGER = logger.child({
    service: 'auth-service'
});*/

const GOOGLE_CALLBACK_URI = `${ENV.HOST_URI}/api/auth/google-oauth/callback`;
const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID, ENV.GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URI);

export const authService = {
    signUp: async (email: string, password: string): Promise<string> => {
        const user = new User({ email, password });
        const createdUser = await user.save({ validateBeforeSave: true });

        mailController.sendRegistrAndVerifLetter(createdUser.email, createdUser.verificationCode);
        return MESSAGE_TO_INTERACT_WITH_EMAIL;
    },

    signIn: async (email: string, password: string, res: Response): Promise<string> => {
        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            throw new AuthorizationError('Incorrect incoming data (email or password)');
        }

        if (!user.isVerified) {
            throw new AccessDeniedError('You need to verify your email');
        }

        const accessToken = jwtService.generateJwtToken(user.id, JwtTokenTypes.ACCESS);
        const refreshToken = jwtService.generateJwtToken(user.id, JwtTokenTypes.REFRESH);

        await User.findByIdAndUpdate(user.id, { refreshToken: refreshToken });
        jwtService.setRefreshTokenInCookie(res, refreshToken);
        return accessToken;
    },

    refreshToken: async (oldRefreshToken: string, res: Response): Promise<string> => {
        const userId = jwtService.getUserIdFromJwtToken(oldRefreshToken, JwtTokenTypes.REFRESH);

        if (await User.find({ oldRefreshToken, _id: userId })) {
            const newRefreshToken = jwtService.generateJwtToken(userId, JwtTokenTypes.REFRESH);
            jwtService.setRefreshTokenInCookie(res, newRefreshToken);

            await User.findByIdAndUpdate(userId, { refreshToken: newRefreshToken });
            return jwtService.generateJwtToken(userId, JwtTokenTypes.ACCESS);
        } else {
            throw new NotFoundError(User.modelName);
        }
    },

    logout: async (refreshToken: string, res: Response): Promise<void> => {
        if (!await User.findOneAndUpdate({ refreshToken }, { refreshToken: null })) {
            throw new NotFoundError(User.modelName);
        }

        jwtService.clearJwtCookie(res);
    },

    passwordRecovery: async (email: string): Promise<string> => {
        try {
            const recoveryCode = randomUUID();
            await User.findOneAndUpdate({ email }, { recoveryCode, password: null, recoveryCodeCreatedAt: new Date() })
            mailController.sendPasswordRecoveryLetter(email, recoveryCode);
            return MESSAGE_TO_INTERACT_WITH_EMAIL;

        } catch (error: any) {
            /* if (error instanceof NotFoundError) {
                AUTH_LOGGER.warn(`Failed due to non-existent email: ${email}`, {
                    method: 'passwordRecovery'
                });

            } else {
                AUTH_LOGGER.warn(error.message, {
                    method: 'passwordRecovery',
                    stack: error.stack
                });
            } */

            return MESSAGE_TO_INTERACT_WITH_EMAIL;
        }
    },

    confirmPasswordRecovery: async (recoveryCode: string, password: string): Promise<string | ErrorResponse> => {
        const message = 'Successfully restored'
        try {
            await ensureMailCodeIsActive(recoveryCode, 'recovery');

            const user = await getItemByField(User, 'recoveryCode', recoveryCode);
            Object.assign(user, { password, recoveryCode: null, verificationCode: null, isVerified: true, recoveryCodeCreatedAt: null })
            await user.save();

            mailController.sendAccountRestoredLetter(user.email);
            return message;

        } catch (error: any) {
            if (error.message.startsWith('User validation failed') || error instanceof ActivationCodeExpiredError) {
                /* AUTH_LOGGER.warn(error.message, {
                    method: 'confirmPasswordRecovery'
                });  */

                return getErrorResponse(StatusCodes.BAD_REQUEST, error.message);
            }

            /* if (error instanceof NotFoundError) {
               AUTH_LOGGER.warn(`Failed due to non-existent recovery code: ${recoveryCode}`, {
                   method: 'confirmPasswordRecovery'
               });

           } else {
               AUTH_LOGGER.warn(error.message, {
                   method: 'confirmPasswordRecovery',
                   stack: error.stack
               });
           }  */

            return message;
        }
    },

    verifyEmail: async (verificationCode: string, res: Response): Promise<string | ErrorResponse> => {
        const message = 'Successfully verified';
        try {
            await ensureItemExists(User, 'verificationCode', verificationCode);
            await ensureMailCodeIsActive(verificationCode, 'verification');
            const user = await User.findOneAndUpdate({ verificationCode }, { verificationCode: null, isVerified: true, verificationCodeCreatedAt: null }) as IUser;

            const refreshToken = jwtService.generateJwtToken(user.id, JwtTokenTypes.REFRESH);
            await User.findOneAndUpdate({ _id: user.id }, { refreshToken });
            jwtService.setRefreshTokenInCookie(res, refreshToken);

            mailController.sendSuccessfulVerificationLetter(user.email);
            return message;

        } catch (error: any) {
            if (error instanceof ActivationCodeExpiredError) {
                /* AUTH_LOGGER.warn(`Failed because the verification code has expired: ${verificationCode}`, {
                    method: 'verifyEmail'
                }); */

                return getErrorResponse(error.statusCode, error.message);
            }

            /*  if (error instanceof NotFoundError) {
                 AUTH_LOGGER.warn(`Failed due to non-existent verification code: ${verificationCode}`, {
                     method: 'verifyEmail'
                 });
 
             } else {
                 AUTH_LOGGER.warn(error.message, {
                     method: 'verifyEmail',
                     stack: error.stack
                 });
             }
  */
            return message;
        }
    },

    resendVerificationLetter: async (email: string): Promise<String> => {
        try {
            await ensureItemExists(User, 'email', email);
            const newVerificationCode = randomUUID();
            await User.findOneAndUpdate({ email }, { verificationCode: newVerificationCode, verificationCodeCreatedAt: new Date() });

            mailController.sendVerificationLetter(email, newVerificationCode);
            return MESSAGE_TO_INTERACT_WITH_EMAIL;

        } catch (error: any) {
            /* if (error instanceof NotFoundError) {
                AUTH_LOGGER.warn(`Failed due to non-existent email: ${email}`, {
                    method: 'verifyEmail'
                });

            } else {
                AUTH_LOGGER.warn(error.message, {
                    method: 'verifyEmail',
                    stack: error.stack
                });
            } */

            return MESSAGE_TO_INTERACT_WITH_EMAIL;
        }
    },

    getGoogleOauthURI: () => {

        return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${ENV.GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URI}&scope=openid email profile`;
    },

    googleCallback: async (code: (string | qs.ParsedQs) | (string | qs.ParsedQs)[], res: Response) => {
        const { tokens } = await client.getToken({
            code: code as string,
        });

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: ENV.GOOGLE_CLIENT_ID!
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new BadRequestError('Invalid ID token');
        }

        const email = payload.email;
        const isVerified = payload.email_verified;
        const displayName = payload.name;

        let user = await User.findOne({ email })

        if (!user) {
            let firstName;
            let lastName;

            if (displayName && displayName.search(' ') !== -1) {

                const firstAndLastNames = displayName.split(' ');
                firstName = firstAndLastNames[0];
                lastName = firstAndLastNames[1];

            } else {
                firstName = displayName;
            }

            user = await User.create({ email, isOAuth: true, isVerified, firstName, lastName });
            user.isVerified ? mailController.sendRegistrationLetter(user.email) : mailController.sendRegistrAndVerifLetter(user.email, user.verificationCode);
        }

        const token = jwtService.generateJwtToken(user.id, JwtTokenTypes.REFRESH);
        await User.findByIdAndUpdate(user.id, { refreshToken: token });
        jwtService.setRefreshTokenInCookie(res, token);
        return ENV.FRONT_PROD_URI;
    }
}

/**
 * Creates an account without a password (this is necessary to store some data or to perform some action). 
 * When the account is created a mail is sent to the email with the following actions.
 * @param email The email address for user registration
 * @returns Returns created user account
 * @throws An error if this email has already been used
 */
async function forcedRegistration(email: string): Promise<HydratedDocument<IUser>> {
    const recoveryCode = randomUUID();
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        const user = new User({ email, recoveryCode });
        const createdUser = await user.save({ validateBeforeSave: false });
        mailController.sendForcedRegistrLetter(email, recoveryCode);

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

/**
 * Checks that the mail code (verification/recovery) hasn't expired
 * @param code The code to check
 * @param type The type of code used to retrieve the corresponding creation date from the database
 * @throws ActivationCodeExpiredError if code has expired
 */
async function ensureMailCodeIsActive(code: string, type: 'verification' | 'recovery'): Promise<void> {
    let createdAt;
    if (type === 'verification') {
        const user = await getItemByField(User, 'verificationCode', code);
        createdAt = user.verificationCodeCreatedAt;

    } else {
        const user = await getItemByField(User, 'recoveryCode', code);
        createdAt = user.recoveryCodeCreatedAt;
    }

    if (!isMailCodeActive(createdAt)) {
        throw new ActivationCodeExpiredError();
    }
}

/**
 * Returns true if mail (verification/recovery) code still active (not expired)
 * @param createdAt The date of creation
 */
function isMailCodeActive(createdAt: Date): boolean {
    return Date.now() - new Date(createdAt).getTime() <= ms(`${ENV.MAIL_CODES_EXPIRY_TIME}m`);
}