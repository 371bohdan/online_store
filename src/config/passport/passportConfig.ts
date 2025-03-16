import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import passport from 'passport';
import { ENV } from '../dotenv/env';
import User from '../../api/models/users';
import { jwtService } from '../../api/services/auxiliary/jwtService';
import { JwtTokenTypes } from '../../api/models/enums/jwtTokenTypesEnum';
import ApiError from '../../api/errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import mailController from '../mail/mailController';

passport.use(
    new GoogleStrategy(
        {
            clientID: ENV.GOOGLE_CLIENT_ID,
            clientSecret: ENV.GOOGLE_CLIENT_SECRET,
            callbackURL: `${ENV.HOST_URI}/api/auth/google-oauth/callback`,
            scope: ['profile', 'email'],
        },

        async (accessToken: string, refreshToken: string, profile: Profile, done) => {
            if (profile.emails) {
                const email = profile.emails[0].value;
                const isVerified = profile.emails[0].verified
                let user = await User.findOne({ email })

                if (!user) {
                    let firstName;
                    let lastName;

                    if (profile.displayName.search(' ') !== -1) {
                        const firstAndLastNames = profile.displayName.split(' ');
                        firstName = firstAndLastNames[0];
                        lastName = firstAndLastNames[1];

                    } else {
                        firstName = profile.displayName;
                    }

                    user = await User.create({ email, isOAuth: true, isVerified, firstName, lastName });
                    user.isVerified ? mailController.sendRegistrationLetter(user.email) : mailController.sendRegistrAndVerifLetter(user.email, user.verificationCode);
                }

                const token = jwtService.generateJwtToken(user.id, JwtTokenTypes.REFRESH);
                await User.findByIdAndUpdate(user.id, { refreshToken: token });
                return done(null, { user, token });
            }

            throw new ApiError(StatusCodes.BAD_REQUEST, 'The user must to have an email address')
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});