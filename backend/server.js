import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ status: '200', message: 'Server is healthy' });
})

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
})
