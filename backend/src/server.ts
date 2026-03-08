import app from './app';
import { prisma } from './lib/prisma';

const port = Number(process.env.PORT ?? 3000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development to allow debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(port, () => {
      console.log(`Backend server is running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void startServer();

