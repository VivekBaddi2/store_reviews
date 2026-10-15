import pool from "../config/db.js";

export const getAllRatings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.store_id, s.name AS store_name, s.address AS store_address,
                    COALESCE(ROUND(AVG(r.ratings) OVER (PARTITION BY s.store_id)::numeric, 2), 0) AS average_rating,
                    r.review_id, r.title, r.description, r.ratings,
                    u.id AS reviewer_id, u.name AS reviewer_name, u.email AS reviewer_email,
                    u.address AS reviewer_address
             FROM stores s
             LEFT JOIN reviews r ON r.store_id = s.store_id
             LEFT JOIN users u ON u.id = r.user_id
             WHERE s.user_id = $1
             ORDER BY s.name, u.name`,
            [req.user.userId]
        );

        return res.status(200).json({
            message: "Store ratings fetched.",
            data: result.rows,
            rowCount: result.rowCount
        });
    } catch (error) {
        console.error("Store ratings fetch failed:", error);
        return res.status(500).json({ message: "Unable to fetch store ratings." });
    }
};
