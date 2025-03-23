import express from 'express';
import cors from 'cors';
import authRoute from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import instructorRoute from "./routes/instructorRoute";
import adminRoute from "./routes/adminRoute";
import mentorRoute from "./routes/mentorRoute";
const port = process.env.PORT || 9000;
const app = express();
const corsOptions = {
    origin: [
        'https://project-v-seven.vercel.app',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoute);
app.use("/api",userRouter);
app.use("/ins",instructorRoute);
app.use("/mtr",mentorRoute);
app.use("/admin",adminRoute);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});