import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import jwt from 'jsonwebtoken';
const { JWT_SECRET } = process.env;
import mongoose from 'mongoose';
import { sendEmail } from '../utils/sendMail.js';
import path from 'path';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import { SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';

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

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id.toString(),
      email,
    },
    JWT_SECRET,
    { expiresIn: '5m' },
  );

  const templatePath = path.join(
    process.cwd(),
    'src',
    'templates',
    'reset-password-email.html',
  );
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const compiled = handlebars.compile(templateSource);

  const html = compiled({
    name: user.name || 'User',
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
