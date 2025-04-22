import { JwtTokenTypes } from '../../../src/api/models/enums/jwtTokenTypesEnum';
import { jwtService } from '../../../src/api/services/auxiliary/jwtService'
import mongoose from 'mongoose';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { ENV } from '../../../src/config/dotenv/env';
import BadRequestError from '../../../src/api/errors/general/BadRequestError';
import AuthorizationError from '../../../src/api/errors/auth/AuthorizationError';
import { Response } from 'express';
import ms from 'ms';
import User from '../../../src/api/models/users';
import NotFoundError from '../../../src/api/errors/general/NotFoundError';

describe("jwtService", () => {

    describe("generateJwtToken", () => {
        let userId: mongoose.Types.ObjectId;

        beforeAll(() => {
            userId = new mongoose.Types.ObjectId();
        })

        test("should return a valid access token containing the provided userId", () => {
            const token = jwtService.generateJwtToken(userId, JwtTokenTypes.ACCESS);
            const res = jwt.verify(token, ENV.JWT_ACCESS_SECRET_KEY) as JwtPayload;

            expect(res.userId).toBe(userId.toString());
        })

        test("should return a valid refresh token containing the provided userId", () => {
            const token = jwtService.generateJwtToken(userId, JwtTokenTypes.REFRESH);
            const res = jwt.verify(token, ENV.JWT_REFRESH_SECRET_KEY) as JwtPayload;

            expect(res.userId).toBe(userId.toString());
        })

        test("should throw the JsonWebTokenError if the jwt token type is invalid", () => {
            expect(() => jwtService.generateJwtToken(userId, "invalid type" as JwtTokenTypes))
                .toThrow(new JsonWebTokenError("Sorry, we are unable to process your request"))
        })
    });

    describe("getJwtTokenWithoutAuthScheme", () => {
        let jwtToken: string;

        beforeAll(() => {
            jwtToken = jwt.sign(new mongoose.Types.ObjectId().toString(), ENV.JWT_ACCESS_SECRET_KEY);
        })

        test("should return a correct jwt token without authentication scheme ('Bearer ')", () => {
            const bearerToken = 'Bearer ' + jwtToken;
            const res = jwtService.getJwtTokenWithoutAuthScheme(bearerToken);

            expect(res).toBe(jwtToken);
        })

        test("should throw the AuthorizationError if the bearer token is undefined", () => {
            const bearerToken = undefined;

            expect(() => jwtService.getJwtTokenWithoutAuthScheme(bearerToken))
                .toThrow(new AuthorizationError("You don't have an auth token"));
        })

        test("should throw the BadRequestError if the authentication scheme is incorrect.", () => {
            const bearerToken = 'Bearer1 ' + jwtToken;

            expect(() => jwtService.getJwtTokenWithoutAuthScheme(bearerToken))
                .toThrow(new BadRequestError("You've passed the bearer token without a correct authentication scheme ('Bearer ')"));
        })
    });

    describe("getUserIdFromJwtToken", () => {
        let userId: mongoose.Types.ObjectId;

        beforeAll(() => {
            userId = new mongoose.Types.ObjectId();
        })

        test("should return the user id, that was used during to sign the jwt access token", () => {
            const token = jwt.sign(userId.toString(), ENV.JWT_ACCESS_SECRET_KEY);
            const res = jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.ACCESS);

            expect(res).toStrictEqual(userId);
        })

        test("should return the user id, that was used during to sign the jwt refresh token", () => {
            const token = jwt.sign(userId.toString(), ENV.JWT_REFRESH_SECRET_KEY);
            const res = jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.REFRESH);

            expect(res).toStrictEqual(userId);
        })

        test("should throw the JsonWebTokenError if the provided jwt token type doesn't match the type " +
            "used when signing the provided jwt token", () => {
                const token = jwt.sign(userId.toString(), ENV.JWT_ACCESS_SECRET_KEY);

                expect(() => jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.REFRESH))
                    .toThrow(new JsonWebTokenError('invalid signature'))
            })

        test("should throw the JsonWebTokenError if the jwt token is empty", () => {
            const token = ''

            expect(() => jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.REFRESH))
                .toThrow(new JsonWebTokenError('jwt must be provided'))
        })

        test("should throw the AuthorizationError if the userId isn't a valid objectId", () => {
            const userId = '1';
            const token = jwt.sign(userId.toString(), ENV.JWT_REFRESH_SECRET_KEY);

            expect(() => jwtService.getUserIdFromJwtToken(token, JwtTokenTypes.REFRESH))
                .toThrow(new AuthorizationError('Incorrect auth token'));
        })

        test("should throw the JsonWebTokenError if the jwt token type is invalid", () => {
            const token = jwt.sign(userId.toString(), ENV.JWT_REFRESH_SECRET_KEY);

            expect(() => jwtService.getUserIdFromJwtToken(token, "invalid type" as JwtTokenTypes))
                .toThrow(new JsonWebTokenError('Sorry, we are unable to process your request'));
        })
    });

    describe("isValidJwtToken", () => {
        let jwtToken: string

        beforeAll(() => {
            jwtToken = jwt.sign({ userId: new mongoose.Types.ObjectId() }, ENV.JWT_ACCESS_SECRET_KEY, { expiresIn: '1h' });
        })

        test("should return a true (boolean) value if all provided parameters are correct (jwt access token)", () => {
            const res = jwtService.isValidJwtToken(jwtToken, JwtTokenTypes.ACCESS);

            expect(res).toStrictEqual(true);
        })

        test("should return a true (boolean) value if all provided parameters are correct (jwt refresh token)", () => {
            const jwtRefreshToken = jwt.sign({ userId: new mongoose.Types.ObjectId() }, ENV.JWT_REFRESH_SECRET_KEY, { expiresIn: '1h' });
            const res = jwtService.isValidJwtToken(jwtRefreshToken, JwtTokenTypes.REFRESH);

            expect(res).toStrictEqual(true);
        })

        test("should throw the JsonWebTokenError if the provided jwt token type doesn't match the type " +
            "used when signing the provided jwt token", () => {
                expect(() => jwtService.isValidJwtToken(jwtToken, JwtTokenTypes.REFRESH))
                    .toThrow(new JsonWebTokenError('invalid signature'));
            })

        test("should throw the JsonWebTokenError if the value of the provided jwt token is empty", () => {
            jwtToken = '';

            expect(() => jwtService.isValidJwtToken(jwtToken, JwtTokenTypes.ACCESS))
                .toThrow(new JsonWebTokenError('jwt must be provided'));
        })

        test("should throw the JsonWebTokenError if the jwt token type is invalid", () => {
            expect(() => jwtService.isValidJwtToken(jwtToken, 'invalid type' as JwtTokenTypes))
                .toThrow(new JsonWebTokenError('Sorry, we are unable to process your request'));
        })
    })

    describe("setRefreshTokenInCookie", () => {
        let response: Response;
        let refreshToken: string;
        const mockCookie = jest.fn();

        beforeAll(() => {
            response = {
                cookie: mockCookie
            } as unknown as Response;

            refreshToken = jwt.sign({ userId: new mongoose.Types.ObjectId() }, ENV.JWT_REFRESH_SECRET_KEY, { expiresIn: '1h' });
        })

        test("should set the 'jwt' cookie with secure options (httpOnly, sameSite, etc)", () => {
            jwtService.setRefreshTokenInCookie(response, refreshToken);

            expect(mockCookie).toHaveBeenCalledWith('jwt', refreshToken,
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true,
                    maxAge: ms(`${ENV.JWT_REFRESH_TOKEN_EXPIRES}d`)
                })
            )
        })
    })

    describe("clearJwtCookie", () => {
        let response: Response;
        const mockClearCookie = jest.fn();

        beforeAll(() => {
            response = {
                clearCookie: mockClearCookie
            } as unknown as Response;
        })

        test("should remove the 'jwt' cookie with secure options (httpOnly, sameSite, secure)", () => {
            jwtService.clearJwtCookie(response);

            expect(mockClearCookie).toHaveBeenCalledWith('jwt',
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                })
            )
        })
    })

    describe("getUserFromBearerToken", () => {
        let userId: mongoose.Types.ObjectId;

        beforeAll(() => {
            userId = new mongoose.Types.ObjectId();
        })

        test("should return the correct User object (with the provided id) if the user exists in the database", async () => {
            jest.spyOn(User, 'exists').mockResolvedValueOnce({ _id: userId });
            jest.spyOn(User, 'findOne').mockResolvedValueOnce({ _id: userId });

            const bearerToken = 'Bearer ' + jwt.sign(userId.toString(), ENV.JWT_ACCESS_SECRET_KEY);
            const res = await jwtService.getUserFromBearerToken(bearerToken);

            expect(res).toMatchObject({ _id: userId });
        })

        test("should return the BadRequestError if bearerToken doesn't have 'Bearer ' authentication scheme", async () => {
            const bearerToken = jwt.sign(userId.toString(), ENV.JWT_ACCESS_SECRET_KEY);

            await expect(() => jwtService.getUserFromBearerToken(bearerToken))
                .rejects.toThrow(new BadRequestError("You've passed the bearer token without a correct authentication scheme ('Bearer ')"));
        })

        test("should return the NotFoundError if user (with provided id) doesn't exists in the database", async () => {
            jest.spyOn(User, 'exists').mockResolvedValueOnce(null);

            const bearerToken = 'Bearer ' + jwt.sign(userId.toString(), ENV.JWT_ACCESS_SECRET_KEY);

            await expect(() => jwtService.getUserFromBearerToken(bearerToken))
                .rejects.toThrow(new NotFoundError(User.modelName));
        })

        test("should return the JsonWebTokenError if bearer refresh token is provided (instead of the access token)", async () => {
            const bearerToken = 'Bearer ' + jwt.sign(userId.toString(), ENV.JWT_REFRESH_SECRET_KEY);

            await expect(() => jwtService.getUserFromBearerToken(bearerToken))
                .rejects.toThrow(new JsonWebTokenError('invalid signature'));
        })

        test("should return the JsonWebTokenError if the undefined value is provided instead of the token", async () => {
            const bearerToken = undefined;

            await expect(() => jwtService.getUserFromBearerToken(bearerToken))
                .rejects.toThrow(new JsonWebTokenError("You don't have an auth token"));
        })
    })
}) 