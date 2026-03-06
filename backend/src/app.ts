import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { getHealth } from './controllers/health.controller';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
  })
);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health endpoint (before /api routes)
app.get('/health', getHealth);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

