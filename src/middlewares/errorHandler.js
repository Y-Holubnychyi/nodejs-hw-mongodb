import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (isHttpError(err)) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      data: err.expose ? err : undefined,
    });
  }
  const status = err.status || 500;

  res.status(status).json({
    status,
    message: 'Something went wrong',
    data: err.message,
  });
};
