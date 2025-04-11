import path from 'path';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { existsSync, mkdirSync } from 'fs';
import * as db from './db/connection.js';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import { decodeJWT } from './middleware/auth.js';

const app = express();

const staticDir = path.join(process.cwd(), 'static');
const uploadDir = path.join(process.cwd(), 'uploadDir');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

app.use(cookieParser());
app.use(morgan('tiny'));
app.use(express.static(staticDir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRouter);

app.use(decodeJWT);

app.use('/api', apiRouter);

db.createTableUsers()
  .then(() => db.createTableCourses())
  .then(() => db.createTableMaterials())
  .then(() => db.createTableMembers())
  .then(() => db.createTableCourseMaterials())
  .then(() => db.createTableHours())
  .then(() => db.createTableDays())
  .then(() => db.createTableCalendar())
  .then(() => db.createTableSuggestions())
  .then(() => app.listen(8888, () => {
    console.log('Server listening on http://localhost:8888/ ...');
  }));
