import pkg from 'pg';
const {Pool} = pkg;
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DB_STRING,
    ssl: {rejectUnauthorized: false}
})

export default pool;