import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import userService from '../services/userServices.js';

const router = express.Router();

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';

const jwtSecret = () =>
    process.env.JWT_SECRET || 'dev-only-change-JWT_SECRET-in-production';

const redirectToClientSuccess = (res, user) => {
    const plain = user.get ? user.get({ plain: true }) : { ...user };
    delete plain.password;
    const payload = {
        id: plain.id,
        email: plain.email,
        firstName: plain.firstName,
        lastName: plain.lastName,
        roleId: plain.roleId
    };
    const token = jwt.sign(payload, jwtSecret(), { expiresIn: '7d' });
    res.redirect(
        `${clientUrl()}/login?oauth=success&token=${encodeURIComponent(token)}`
    );
};

const redirectToClientError = (res, reason = '') => {
    const q = reason ? `&reason=${encodeURIComponent(reason)}` : '';
    res.redirect(`${clientUrl()}/login?oauth=error${q}`);
};

router.get(
    '/auth/facebook',
    (req, res, next) => {
        if (!process.env.FACEBOOK_APP_ID) {
            return redirectToClientError(res, 'facebook_not_configured');
        }
        passport.authenticate('facebook', { scope: ['email'] })(
            req,
            res,
            next
        );
    }
);

router.get(
    '/auth/facebook/callback',
    (req, res, next) => {
        passport.authenticate('facebook', (err, user) => {
            if (err || !user) {
                return redirectToClientError(res, 'facebook_failed');
            }
            req.logIn(user, (e) => {
                if (e) return redirectToClientError(res, 'session_failed');
                redirectToClientSuccess(res, user);
            });
        })(req, res, next);
    }
);

router.get(
    '/auth/github',
    (req, res, next) => {
        if (!process.env.GITHUB_CLIENT_ID) {
            return redirectToClientError(res, 'github_not_configured');
        }
        passport.authenticate('github', { scope: ['user:email'] })(
            req,
            res,
            next
        );
    }
);

router.get(
    '/auth/github/callback',
    (req, res, next) => {
        passport.authenticate('github', (err, user) => {
            if (err || !user) {
                return redirectToClientError(res, 'github_failed');
            }
            req.logIn(user, (e) => {
                if (e) return redirectToClientError(res, 'session_failed');
                redirectToClientSuccess(res, user);
            });
        })(req, res, next);
    }
);

router.get(
    '/auth/google',
    (req, res, next) => {
        const googleStrategy = passport._strategy('google');
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !googleStrategy) {
            return redirectToClientError(res, 'google_not_configured');
        }
        passport.authenticate('google', {
            scope: ['profile', 'email'],
        })(req, res, next);
    }
);

router.get(
    '/auth/google/callback',
    (req, res, next) => {
        const googleStrategy = passport._strategy('google');
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !googleStrategy) {
            return redirectToClientError(res, 'google_not_configured');
        }
        passport.authenticate('google', (err, user) => {
            if (err || !user) {
                return redirectToClientError(res, 'google_failed');
            }
            req.logIn(user, (e) => {
                if (e) return redirectToClientError(res, 'session_failed');
                redirectToClientSuccess(res, user);
            });
        })(req, res, next);
    }
);

router.get('/auth/instagram', (req, res) => {
    if (!process.env.INSTAGRAM_APP_ID) {
        return redirectToClientError(res, 'instagram_not_configured');
    }
    const callback =
        process.env.INSTAGRAM_CALLBACK_URL ||
        'http://localhost:6969/api/auth/instagram/callback';
    const redirectUri = encodeURIComponent(callback);
    const url = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
    res.redirect(url);
});

router.get('/auth/instagram/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return redirectToClientError(res, 'instagram_denied');
    }
    if (
        !process.env.INSTAGRAM_APP_ID ||
        !process.env.INSTAGRAM_APP_SECRET
    ) {
        return redirectToClientError(res, 'instagram_not_configured');
    }
    const callback =
        process.env.INSTAGRAM_CALLBACK_URL ||
        'http://localhost:6969/api/auth/instagram/callback';

    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.INSTAGRAM_APP_ID);
        params.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', callback);
        params.append('code', String(code));

        const tokenRes = await fetch(
            'https://api.instagram.com/oauth/access_token',
            {
                method: 'POST',
                body: params
            }
        );
        const tokenJson = await tokenRes.json();

        const accessToken = tokenJson.access_token;
        const userIdFromToken = tokenJson.user_id;

        if (!accessToken) {
            return redirectToClientError(res, 'instagram_token_failed');
        }

        const meRes = await fetch(
            `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`
        );
        const me = await meRes.json();
        const socialId = me.id || userIdFromToken;
        const username = me.username || 'instagram';

        const result = await userService.findOrCreateOAuthUser({
            provider: 'instagram',
            socialId,
            email: null,
            firstName: username,
            lastName: 'User',
            image: ''
        });

        if (result.errCode !== 0) {
            return redirectToClientError(res, 'instagram_user_failed');
        }

        const u = await db.User.findByPk(result.user.id);
        redirectToClientSuccess(res, u);
    } catch (e) {
        console.error('Instagram OAuth:', e);
        redirectToClientError(res, 'instagram_error');
    }
});

const initAuthRoutes = (app) => {
    app.use('/api', router);
};

export default initAuthRoutes;
