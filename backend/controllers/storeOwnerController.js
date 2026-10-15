import pool from "../config/db.js";

export const getAllRatings = async (req, res) => {
    const storeId = req.query.storeId;

    try {
        const query = 'select * from reviews r join users u on r.user_id = u.id where r.store_id = ($1)';
        const values = [storeId];
        const result = await pool.query(query,values);

        return res.status(200).json({ 'message': 'Reviews Fetched', 'data': result.rows, 'rowCount':result.rowCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 'message': 'Internal Server Error', 'error': error });
    }
}
