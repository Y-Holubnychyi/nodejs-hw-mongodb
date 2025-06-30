import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

const { JWT_SECRET } = process.env;

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.trim().split(' ');

    if (type?.toLowerCase() !== 'bearer' || !token) {
      return next(createHttpError(401, 'Not authorized'));
    }

    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createHttpError(401, 'Access token expired'));
      }
      return next(createHttpError(401, 'Invalid access token'));
    }

    const session = await SessionsCollection.findById(payload.sessionId);

    if (!session || session.accessToken !== token) {
      return next(createHttpError(401, 'Invalid session'));
    }

    if (session.accessTokenValidUntil < new Date()) {
      return next(createHttpError(401, 'Access token expired'));
    }

    const user = await UsersCollection.findById(payload.userId);

    if (!user) {
      return next(createHttpError(403, 'User not found'));
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
