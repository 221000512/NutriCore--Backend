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
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5177",
    "https://nutri-core-frontend-chax.vercel.app"
  ],
  credentials: true
}));

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
