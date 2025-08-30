import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import labelRouter from './routes/labelRouter.js';
import adminRoutes from './routes/admin.routes.js';

const PORT = process.env.PORT || 10000;

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(origin.endsWith('.vercel.app') || origin === 'http://localhost:5177'){
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use('/api/user', userRouter);         // user login/register/profile
app.use('/api/product', productRouter);   // product endpoints
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

// Start server
(async () => {
  await initConnections();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
