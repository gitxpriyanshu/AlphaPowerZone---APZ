import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './src/config/env.js';
import { errorMiddleware } from './src/middlewares/error.middleware.js';
import prisma from './src/config/database.js';

import rootRouter from './src/routes/index.js';

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS - Must be early in the stack
app.use(cors({
  origin: true, // Reflect request origin
  credentials: true,
}));

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);
app.disable('x-powered-by');

// Compression
app.use(compression());

// Request Logging
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));


// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Routes
app.use('/api/v1', rootRouter);

// Production Health Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'UP';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = 'DOWN';
  }

  res.status(200).json({
    status: 'HEALTHY',
    uptime: `${Math.floor(process.uptime())}s`,
    dbStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error Handling
app.use(errorMiddleware);

export { app };
