import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {config} from "dotenv"
import connectDB from './config/db.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import doctorRoutes from './routes/doctor.route.js';
import patientRoutes from './routes/patient.route.js';
import aiRoutes from './routes/ai.route.js';
config()


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/auth', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, async() => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`)
});