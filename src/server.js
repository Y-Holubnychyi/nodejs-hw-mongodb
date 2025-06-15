import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import { getEnvVar } from './utils/getEnvVar.js';

export const startServer = () => {
  const app = express();

  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({ message: 'Start Work' });
  });

  // Підключення маршруту /contacts
  app.use('/contacts', contactsRouter);

  // Обробка 404
  app.use((req, res) => {
    res.status(404).json({
      message: `${req.url} not found`,
    });
  });

  // Загальний error handler
  app.use((error, req, res, next) => {
    res.status(500).json({
      message: 'Server error!',
      error: error.message,
    });
  });

  const port = Number(getEnvVar('PORT', 3000));
  app.listen(port, () => console.log(`Server running on ${port} port`));
};
