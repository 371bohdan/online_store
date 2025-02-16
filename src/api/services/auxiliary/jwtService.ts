import mongoose, { isValidObjectId } from "mongoose";
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { ENV } from "../../../config/dotenv/env";
import { JwtTokenTypes } from "../../models/enums/jwtTokenTypesEnum";
import AuthorizationError from "../../errors/auth/AuthorizationError";
import { Response } from "express";
import ms from "ms";
import { IUser } from "../../models/users";
import { getUserByField } from "../userService";

export const jwtService = {
    /**
     * Returns newly generated JWT token. Proceed only 2 types of token ('ACCESS' and 'REFRESH')
     * @param userId The ID for which this token is being created
     * @param jwtTokenType The token type
     * @throws The JsonWebTokenError exception if the given token type can't be processed
     */
    generateJwtToken: (userId: mongoose.Types.ObjectId, jwtTokenType: JwtTokenTypes): string => {
        const jwtSecretKey = getJwtSecretKey(jwtTokenType);
        const expiresIn = jwtService.getExpiresTimeOfJwtToken(jwtTokenType);
        return jwt.sign({ userId }, jwtSecretKey, { expiresIn });
    },

    /**
     * Returns a time, after which the jwt token will expire (from the moment of creation)
     * @param jwtTokenType The token type
     * @throws The JsonWebTokenError exception if the given token type can't be processed
     */
    getExpiresTimeOfJwtToken: (jwtTokenType: JwtTokenTypes): string => {
        if (jwtTokenType === JwtTokenTypes.ACCESS) {
            return `${ENV.JWT_ACCESS_TOKEN_EXPIRES}m`;

        } else if (jwtTokenType === JwtTokenTypes.REFRESH) {
            return `${ENV.JWT_REFRESH_TOKEN_EXPIRES}d`;
        }

        throw new JsonWebTokenError("Sorry, we are unable to process your request");
    },

    /**
    * Returns JWT token without authentication scheme ('Bearer' part before a token)
    * @param bearerToken Expected raw token from 'Authorization' header
    * @throws The authorization error if token is not presented
    */
    getJwtTokenWithoutAuthScheme: (bearerToken: string | undefined): string => {
        if (bearerToken === undefined || bearerToken.length === 0) {
            throw new AuthorizationError("You don't have an auth token");
        }

        return bearerToken.substring(7, bearerToken.length);
    },

    /**
     * Returns the user id, stored in a payload, encrypted (using a secret key) in the JWT token
     * @param token The JWT token
     * @param jwtTokenType The token type
     * @throws The Authorization error if the token isn't a valid 'ObjectId' type
     */
    getUserIdFromJwtToken: (jwtToken: string, jwtTokenType: JwtTokenTypes): mongoose.Types.ObjectId => {
        const secretKey = getJwtSecretKey(jwtTokenType);
        const jwtPayload = jwt.verify(jwtToken, secretKey);

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
    },

    /**
     * Returns truth value ('true') if the token is valid (successfully passed through the jwt.verify method ('jsonwebtoken' library))
     * @param jwtToken The JWT token
     * @param jwtTokenType The token type
     */
    isValidJwtToken: (jwtToken: string, jwtTokenType: JwtTokenTypes): boolean => {
        const secretKey = getJwtSecretKey(jwtTokenType);
        jwt.verify(jwtToken, secretKey);
        return true;
    },

    /**
     * Set a given refresh token in the cookie (in the provided response)
     * @param res The Response (from the 'express' library) to be used as the response for a user
     * @param refreshToken The new JWT refresh token, that must be hidden in cookies
     */
    setRefreshTokenInCookie: (res: Response, refreshToken: string) => {
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: ms(`${ENV.JWT_REFRESH_TOKEN_EXPIRES}d`)
        });
    },

    /**
     * Clearing the 'jwt' cookie in the given response (with a valid CookieOptions was used to set it)
     * @param res The Response (from the 'express' library)
     */
    clearJwtCookie: (res: Response): void => {
        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'none' });
    },

    getUserFromBearerToken: async (bearerToken: string | undefined): Promise<IUser> => {
        const token = jwtService.getJwtTokenWithoutAuthScheme(bearerToken);
        const userId = jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.ACCESS);
        return await getUserByField('_id', userId);
    }
}

/**
 * Returns secret key for requested JWT token type (from .env variables)
 * @param tokenType The token type
 * @throws The JsonWebTokenError exception if the given token type can't be processed
 */
function getJwtSecretKey(tokenType: JwtTokenTypes): string {
    if (tokenType === JwtTokenTypes.ACCESS) {
        return ENV.JWT_ACCESS_SECRET_KEY;

    } else if (tokenType === JwtTokenTypes.REFRESH) {
        return ENV.JWT_REFRESH_SECRET_KEY;
    }

    throw new JsonWebTokenError("Sorry, we are unable to process your request");
}