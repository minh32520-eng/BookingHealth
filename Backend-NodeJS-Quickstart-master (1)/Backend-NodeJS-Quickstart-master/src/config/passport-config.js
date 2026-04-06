import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GitHubStrategy from 'passport-github2';
import GoogleStrategy from 'passport-google-oauth20';
import db from '../models/index.js';
import userService from '../services/userServices.js';

const configurePassport = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport.use(
            new FacebookStrategy(
                {
                    clientID: process.env.FACEBOOK_APP_ID,
                    clientSecret: process.env.FACEBOOK_APP_SECRET,
                    callbackURL:
                        process.env.FACEBOOK_CALLBACK_URL ||
                        'http://localhost:6969/api/auth/facebook/callback',
                    profileFields: [
                        'id',
                        'displayName',
                        'emails',
                        'name',
                        'photos'
                    ],
                    proxy: true
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email =
                            profile.emails &&
                            profile.emails[0] &&
                            profile.emails[0].value;
                        const result = await userService.findOrCreateOAuthUser({
                            provider: 'facebook',
                            socialId: profile.id,
                            email: email || null,
                            firstName:
                                profile.name?.givenName ||
                                profile.displayName?.split(' ')[0] ||
                                'Facebook',
                            lastName:
                                profile.name?.familyName ||
                                profile.displayName
                                    ?.split(' ')
                                    .slice(1)
                                    .join(' ') ||
                                'User',
                            image:
                                profile.photos &&
                                profile.photos[0] &&
                                profile.photos[0].value
                        });
                        if (result.errCode !== 0) {
                            return done(null, false);
                        }
                        const u = await db.User.findByPk(result.user.id);
                        return done(null, u);
                    } catch (e) {
                        return done(e);
                    }
                }
            )
        );
    }

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: process.env.GITHUB_CLIENT_ID,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET,
                    callbackURL:
                        process.env.GITHUB_CALLBACK_URL ||
                        'http://localhost:6969/api/auth/github/callback',
                    scope: ['user:email']
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        let email =
                            profile.emails &&
                            profile.emails[0] &&
                            profile.emails[0].value;
                        if (!email && profile.username) {
                            email = `${profile.username}@users.noreply.github.com`;
                        }
                        const result = await userService.findOrCreateOAuthUser({
                            provider: 'github',
                            socialId: profile.id,
                            email,
                            firstName: profile.displayName || profile.username || 'GitHub',
                            lastName: 'User',
                            image: profile.photos?.[0]?.value || profile._json?.avatar_url
                        });
                        if (result.errCode !== 0) {
                            return done(null, false);
                        }
                        const u = await db.User.findByPk(result.user.id);
                        return done(null, u);
                    } catch (e) {
                        return done(e);
                    }
                }
            )
        );
    }

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL:
                        process.env.GOOGLE_CALLBACK_URL ||
                        'http://localhost:6969/api/auth/google/callback',
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email =
                            profile.emails &&
                            profile.emails[0] &&
                            profile.emails[0].value;
                        const result = await userService.findOrCreateOAuthUser({
                            provider: 'google',
                            socialId: profile.id,
                            email: email || null,
                            firstName:
                                profile.name?.givenName ||
                                profile.displayName?.split(' ')[0] ||
                                'Google',
                            lastName:
                                profile.name?.familyName ||
                                profile.displayName
                                    ?.split(' ')
                                    .slice(1)
                                    .join(' ') ||
                                'User',
                            image:
                                profile.photos &&
                                profile.photos[0] &&
                                profile.photos[0].value,
                        });
                        if (result.errCode !== 0) {
                            return done(null, false);
                        }
                        const u = await db.User.findByPk(result.user.id);
                        return done(null, u);
                    } catch (e) {
                        return done(e);
                    }
                }
            )
        );
    }
};

export default configurePassport;
