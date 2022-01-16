import express, { Router } from 'express';
import coursesRoute from './courses';

const app = express();

const api = Router();

api.use('/courses', coursesRoute)
api.use('*', (_, res) => {
    res.status(404).send('Not Found');
});

app.use('/api', api);

app.use('*', express.static('dist'))

app.listen(3010);