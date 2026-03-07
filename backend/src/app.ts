import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
  })
);

app.use(helmet());
app.use(requestId);
app.use(requestLogger);
app.use(express.json());

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

