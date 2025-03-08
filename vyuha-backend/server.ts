import express from 'express';
import cors from 'cors';
import authRoute from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import instructorRoute from "./routes/instructorRoute";
import adminRoute from "./routes/adminRoute";
const port = 9000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoute);
app.use("/api",userRouter);
app.use("/ins",instructorRoute);
app.use("/admin",adminRoute);
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});