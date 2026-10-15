import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';
import cors from 'cors';

const app = express();

app.use(express.json());

const allowedOrigins = [
	'http://localhost:5173',
	'https://store-reviews-seven.vercel.app'
]
app.use(cors({
	origin: allowedOrigins,
	credentials: true
}))

app.get('/health', (req, res) => {
	res.json({ status: '200', message: 'Server is healthy' });
})

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
})
