import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (isHttpError(err)) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      data: err.expose ? err : undefined, // за бажанням можна додати деталі помилки, якщо потрібно
    });
  }
  // для інших неочікуваних помилок
  const status = err.status || 500;

  res.status(status).json({
    status,
    message: 'Something went wrong',
    data: err.message,
  });
};
