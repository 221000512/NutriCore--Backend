import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectToCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import labelRouter from './routes/labelRouter.js';

// App Config
const app = express();
const port = process.env.PORT || 10000;

connectDB();
connectToCloudinary();

// Middlewares
const allowedOrigins = [
  "https://nutricore-frontend.vercel.app", // deployed frontend
  "http://localhost:5177",                 // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl/Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


// API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/label', labelRouter);

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Listener
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
