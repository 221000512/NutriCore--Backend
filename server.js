// backend/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from "mongoose";

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import labelRouter from './routes/labelRouter.js';
import adminRoutes from "./routes/admin.routes.js";

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MAX_TRIES = 10;

const app = express();

// Middleware

app.use(cors({
  origin: [
    "http://localhost:5177",
    "https://nutri-core-frontend-chax.vercel.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true })); 

// API routes
app.use('/api/user', userRouter);         // user login/register
app.use('/api/product', productRouter);   // product endpoints (user)
app.use('/api/label', labelRouter);       // label analyzer
app.use('/api/admin', adminRoutes);       // admin login & CRUD products

app.get('/', (req, res) => res.send('API Working'));

// Initialize DB and Cloudinary
async function initConnections() {
  try {
    await connectDB();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }

  try {
    await connectCloudinary();
    console.log('Cloudinary configured');
  } catch (err) {
    console.error('Failed to configure Cloudinary:', err);
  }
}

// Dynamic port handling & graceful shutdown
function startServerAttempt(port, triesLeft) {
  const server = app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use.`);
      server.close?.();
      if (triesLeft > 0) {
        const nextPort = port + 1;
        console.log(`Trying port ${nextPort}...`);
        startServerAttempt(nextPort, triesLeft - 1);
      } else {
        console.error(`No free ports found in range ${DEFAULT_PORT}..${DEFAULT_PORT + MAX_TRIES - 1}. Exiting.`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  const graceful = () => {
    console.log('Shutting down server...');
    server.close((closeErr) => {
      if (closeErr) console.error('Error during server close:', closeErr);
      else console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', graceful);
  process.on('SIGTERM', graceful);
}

// Main init
(async () => {
  await initConnections();
  startServerAttempt(DEFAULT_PORT, MAX_TRIES - 1);
})();
