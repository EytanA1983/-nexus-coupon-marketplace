import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiDocument } from '../config/openapi';

export function setupSwagger(app: Express) {
  const doc = createOpenApiDocument();

  app.get('/api/openapi.json', (_req, res) => {
    res.json(doc);
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(doc, { explorer: true }));
}

