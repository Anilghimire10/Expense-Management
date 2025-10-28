import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/dbConfig';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import routes from './routes/index';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use(loggerMiddleware);

app.use('/api/v1/', routes);

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const MONGO_URI = process.env.MONGO_URI || '';

connectDB(MONGO_URI);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
