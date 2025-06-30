import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import jwt from 'jsonwebtoken';
const { JWT_SECRET } = process.env;
import mongoose from 'mongoose';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) throw createHttpError(401, 'User not found');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) throw createHttpError(401, 'Unauthorized');

  await SessionsCollection.deleteOne({ userId: user._id });

  const sessionId = new mongoose.Types.ObjectId();

  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      sessionId: sessionId.toString(),
    },
    JWT_SECRET,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id.toString(),
      sessionId: sessionId.toString(),
    },
    JWT_SECRET,
    { expiresIn: '30d' },
  );

  const session = await SessionsCollection.create({
    _id: sessionId,
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return session;
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await SessionsCollection.findById(sessionId);

  if (
    !session ||
    session.refreshToken !== refreshToken ||
    session.refreshTokenValidUntil < new Date()
  ) {
    throw createHttpError(403, 'Invalid session');
  }

  await SessionsCollection.findByIdAndDelete(sessionId);

  const newSessionId = new mongoose.Types.ObjectId();

  const newAccessToken = jwt.sign(
    {
      userId: session.userId.toString(),
      sessionId: newSessionId.toString(),
    },
    JWT_SECRET,
    { expiresIn: '15m' },
  );

  const newRefreshToken = jwt.sign(
    {
      userId: session.userId.toString(),
      sessionId: newSessionId.toString(),
    },
    JWT_SECRET,
    { expiresIn: '30d' },
  );

  const newSession = await SessionsCollection.create({
    _id: newSessionId,
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return newSession;
};

export const logoutUser = async (sessionId, refreshToken) => {
  const session = await SessionsCollection.findById(sessionId);

  if (
    !session ||
    session.refreshToken !== refreshToken ||
    session.refreshTokenValidUntil < new Date()
  ) {
    throw createHttpError(403, 'Invalid session');
  }

  await SessionsCollection.findByIdAndDelete(sessionId);
};
